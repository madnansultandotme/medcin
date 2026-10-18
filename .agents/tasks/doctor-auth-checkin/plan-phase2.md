# Implementation Plan: Phase 2 - Google OAuth, Device Tracking, and Flutter Mobile

This plan implements the THREE remaining partial/pending items from the doctor authentication system:
1. Google OAuth Integration (Backend + Web UI)
2. Device Tracking Integration into Login Flow  
3. Flutter Mobile Doctor Features

## Current State

**Completed (~80%):**
- ✅ Database schema with `userDevices`, `passwordResetRequired`, `googleId`, `appleId` fields
- ✅ Doctor provisioning API (`app/api/center/doctors/provision/route.ts`)
- ✅ First-login password change API and UI
- ✅ Device tracking utilities: `lib/device-id.ts`, `lib/middleware/device-tracking.ts`
- ✅ Device verification APIs: `app/api/auth/verify-device/route.ts`, `app/api/auth/request-device-otp/route.ts`
- ✅ Doctor check-in/checkout APIs
- ✅ Doctor dashboard and bookings pages

**Pending:**
- ❌ Google OAuth callback route and account linking logic
- ❌ Device tracking NOT wired into actual login flow
- ❌ `Continue with Google` buttons NOT added to UI
- ❌ Flutter mobile doctor screens and features

**Dependencies Already Installed:**
- `better-auth` (v1.7.7) with Google OAuth config in `lib/auth-config.ts`
- `bcrypt`, `zod`, `drizzle-orm` installed per verification.md

**Database Status:**
- Schema changes defined but MAY need `npm run db:push` (per verification.md warning)

## Implementation Order

Phase 1: Backend APIs (Google OAuth + Device Tracking Integration)
Phase 2: Web UI (Login buttons + Device Verification UI)
Phase 3: Flutter Mobile (Full doctor feature suite)

---

# FEAT Decomposition Decision

This work decomposes into 3 clear, separable features aligned with the 3 remaining items:
1. **FEAT-001**: Google OAuth Integration (backend callback + web UI)
2. **FEAT-002**: Device Tracking Integration (wire into login flow + verification UI)
3. **FEAT-003**: Flutter Mobile Doctor Implementation

Each can be verified independently and leaves the codebase in a working state.

---

## Feature 1: Google OAuth Integration

### Dependencies
- Requires Feature 2 (device tracking) to be wired in, so device tracking happens on OAuth logins too
- Can be developed in parallel with Feature 2, integrated after both complete

### Files to Create

**Backend:**
1. `app/api/auth/callback/google/route.ts` - OAuth callback handler with manual account linking
2. `lib/auth/google-oauth-helper.ts` - Helper functions for Google token verification and account linking

**Web UI:**
3. Modify `app/login/page.tsx` - Add "Continue with Google" button (already has placeholder)
4. Modify `app/doctor/page.tsx` - Add Google sign-in option if unauthenticated

### Files to Modify

1. **`app/login/page.tsx`**
   - Current: Has placeholder `handleGoogleSignIn` that shows "not yet implemented" error
   - Change: Wire button to redirect to `/api/auth/signin/google` (Better Auth's initiation endpoint)
   
2. **`lib/auth-config.ts`**
   - Current: Already has `socialProviders.google` configured with client ID and secret
   - Change: None needed - config is complete

### Implementation Steps

1. **Create Google OAuth callback route** (`app/api/auth/callback/google/route.ts`):
   - Receive `code` and `state` params from Google redirect
   - Exchange code for tokens using Better Auth's `auth.api.socialAuth()` method
   - Extract Google user info (email, sub/googleId, name, picture)
   - Check DB for existing user by email using `db.select().from(users).where(eq(users.email, email))`
   - If user exists AND doctor role: Check doctor profile exists, link googleId, set emailVerified=true
   - If user exists AND other role: Link googleId, set emailVerified=true
   - If new user AND doctor role: Return error "Doctor account must be provisioned by center admin"
   - If new user AND patient/center: Create account via Better Auth (existing flow)
   - Create session and set cookie
   - Return redirect to role-appropriate dashboard

2. **Create OAuth helper utilities** (`lib/auth/google-oauth-helper.ts`):
   - `linkGoogleAccount(userId: string, googleId: string, tokens: GoogleTokens)`: Update users table, create account record
   - `validateDoctorProfile(userId: string)`: Check doctors table for profile
   - `createOAuthSession(userId: string)`: Use Better Auth's `auth.api.createSession()`

3. **Update login page** (`app/login/page.tsx`):
   - Modify `handleGoogleSignIn` function:
     ```typescript
     const handleGoogleSignIn = async () => {
       window.location.href = '/api/auth/signin/google';
     };
     ```
   - Button already exists, just needs to remove "not yet implemented" error

4. **Add Google sign-in to doctor page** (`app/doctor/page.tsx`):
   - Only show if user not authenticated (check session)
   - Redirect unauthenticated users to login or show "Sign in with Google" button inline

### Verification

Run the web app and test:
1. Click "Sign in with Google" on login page → redirects to Google → redirects back → creates session
2. Existing patient with email@gmail.com signs in with Google → account linked, no duplicate created
3. Provisioned doctor with email@gmail.com signs in with Google → account linked, redirected to `/doctor`
4. Non-provisioned email tries Google OAuth → error "Doctor account must be provisioned by center admin"

Command: `npm run dev`, manually test OAuth flow with real Google account

---

## Feature 2: Device Tracking Integration into Login Flow

### Dependencies
- None - uses existing utilities (`lib/device-id.ts`, `lib/middleware/device-tracking.ts`)
- Integrates with Better Auth's existing login flow

### Files to Create

**Backend:**
1. `lib/auth/track-device.ts` - Wrapper around device tracking that calls email alert
2. `lib/utils/authenticated-fetch.ts` - Client-side fetch wrapper with device headers

**Web UI:**
3. `app/doctor/verify-device/page.tsx` - OTP verification form for new devices
4. `components/device-verification-modal.tsx` - Modal component for device OTP input (optional, can be inline on page)

### Files to Modify

1. **`app/api/better-auth/[...all]/route.ts`** (Better Auth catch-all route)
   - Current: Handles all Better Auth requests including login
   - Change: Add custom logic after successful email/password login to call `trackDeviceLogin()`
   - Note: Better Auth uses plugin hooks - use `onSession` hook to track device after session created

2. **`lib/auth-config.ts`**
   - Current: Better Auth config with bearer plugin
   - Change: Add custom `hooks.after.session` callback to track device

3. **Doctor login flow**
   - After login success, check response for `requiresDeviceVerification: true` flag
   - If true, redirect to `/doctor/verify-device` with deviceId in query params

### Implementation Steps

1. **Create device tracking helper** (`lib/auth/track-device.ts`):
   - Function `trackDeviceLogin(userId: string, deviceId: string, deviceName: string)`:
     - Call `trackDevice(userId)` from existing middleware
     - If `isNewDevice === true`, generate 6-digit OTP (crypto random)
     - Hash OTP (SHA-256) and store in `verifications` table with identifier `device-verify:${deviceId}`
     - Call `sendNewDeviceAlertEmail(userId, deviceName, otp)` (use existing email service from `lib/email.ts`)
     - Return `{ trusted: false, requiresVerification: true, deviceId }`
   - If known device, return `{ trusted: true, requiresVerification: false }`

2. **Wire into Better Auth login**:
   - Modify `lib/auth-config.ts` to add `hooks` config:
     ```typescript
     hooks: {
       after: {
         signIn: async ({ session, request }) => {
           const deviceId = request.headers.get('x-device-id');
           const deviceName = request.headers.get('x-device-name');
           if (deviceId && session?.user?.id) {
             const result = await trackDeviceLogin(session.user.id, deviceId, deviceName);
             // Store result in session or return in response
           }
         }
       }
     }
     ```
   - Note: Better Auth hooks have specific signature, verify in Better Auth docs

3. **Create authenticated fetch wrapper** (`lib/utils/authenticated-fetch.ts`):
   - Wrap `fetch()` to auto-inject X-Device-ID and X-Device-Name headers
   - Read from `getOrCreateDeviceId()` and `getDeviceName()` in `lib/device-id.ts`
   - Export as `authenticatedFetch()` for use in all client-side API calls
   ```typescript
   export async function authenticatedFetch(url: string, options?: RequestInit) {
     const deviceId = getOrCreateDeviceId();
     const deviceName = getDeviceName();
     return fetch(url, {
       ...options,
       headers: {
         ...options?.headers,
         'X-Device-ID': deviceId,
         'X-Device-Name': deviceName,
       },
     });
   }
   ```

4. **Create device verification page** (`app/doctor/verify-device/page.tsx`):
   - Form with single input for 6-digit OTP code
   - Read `deviceId` from URL query params or session
   - On submit: POST to `/api/auth/verify-device` with `{ deviceId, otp }`
   - On success (200): Mark device as trusted, redirect to `/doctor`
   - On error (401): Show "Invalid OTP" message, allow retry (max 3 attempts tracked by existing API)
   - Rate limiting already implemented in `/api/auth/verify-device` route

5. **Update login flow to redirect for device verification**:
   - After successful login, check if device needs verification
   - Better Auth hooks return result via session or custom response data
   - If `requiresDeviceVerification === true`, redirect to `/doctor/verify-device?deviceId=${deviceId}`
   - Existing routes already support device verification, just need to wire the redirect

6. **Update all doctor dashboard API calls to use authenticated fetch**:
   - Find all `fetch()` calls in doctor pages (`app/doctor/page.tsx`, `app/doctor/bookings/page.tsx`)
   - Replace with `authenticatedFetch()` from new utility
   - This ensures device headers are sent on every request

### Verification

1. Run `npm run dev`
2. Login as doctor from a NEW browser (clear localStorage to force new device ID)
3. Verify email received with 6-digit OTP
4. Redirected to `/doctor/verify-device` page
5. Enter correct OTP → redirected to `/doctor` dashboard
6. Check database: `userDevices` table has new record with `trusted = true`
7. Logout and login again from same browser → NO OTP prompt (device recognized)

Command: `npm run dev`, test with cleared localStorage

---

## Feature 3: Flutter Mobile Doctor Implementation

### Dependencies
- Backend APIs already exist (doctor bookings, check-in/checkout)
- Device tracking backend already exists
- Google OAuth backend will be completed in Feature 1

### Mobile Directory Structure

Current: `mobile/lib/` has incomplete structure per `mobile/MOBILE_APP.md`
Create under `mobile/lib/features/doctor/`:

### Files to Create

**Data Layer (15 files):**
1. `mobile/lib/features/doctor/data/models/doctor_model.dart`
2. `mobile/lib/features/doctor/data/models/booking_model.dart`
3. `mobile/lib/features/doctor/data/models/device_model.dart`
4. `mobile/lib/features/doctor/data/repositories/doctor_auth_repository.dart`
5. `mobile/lib/features/doctor/data/repositories/doctor_booking_repository.dart`
6. `mobile/lib/features/doctor/data/datasources/doctor_remote_datasource.dart`
7. `mobile/lib/features/doctor/data/datasources/doctor_local_datasource.dart`

**Domain Layer (6 files):**
8. `mobile/lib/features/doctor/domain/entities/doctor.dart`
9. `mobile/lib/features/doctor/domain/entities/doctor_booking.dart`
10. `mobile/lib/features/doctor/domain/usecases/login_doctor.dart`
11. `mobile/lib/features/doctor/domain/usecases/checkin_patient.dart`
12. `mobile/lib/features/doctor/domain/usecases/checkout_patient.dart`
13. `mobile/lib/features/doctor/domain/usecases/get_doctor_bookings.dart`

**Presentation Layer (10 files):**
14. `mobile/lib/features/doctor/presentation/screens/doctor_login_screen.dart`
15. `mobile/lib/features/doctor/presentation/screens/doctor_dashboard_screen.dart`
16. `mobile/lib/features/doctor/presentation/screens/doctor_bookings_screen.dart`
17. `mobile/lib/features/doctor/presentation/screens/patient_checkin_screen.dart`
18. `mobile/lib/features/doctor/presentation/screens/first_login_password_screen.dart`
19. `mobile/lib/features/doctor/presentation/screens/device_verification_screen.dart`
20. `mobile/lib/features/doctor/presentation/widgets/booking_card.dart`
21. `mobile/lib/features/doctor/presentation/widgets/checkin_button.dart`
22. `mobile/lib/features/doctor/presentation/widgets/commission_display.dart`
23. `mobile/lib/features/doctor/presentation/providers/doctor_auth_provider.dart`
24. `mobile/lib/features/doctor/presentation/providers/doctor_bookings_provider.dart`

**Services (3 files):**
25. `mobile/lib/services/device_service.dart` - Device ID management
26. `mobile/lib/services/api_client.dart` - HTTP client with device headers (MODIFY if exists)
27. `mobile/lib/services/google_auth_service.dart` - Google Sign-In wrapper

**Router (1 file):**
28. Modify existing router file (likely `mobile/lib/router.dart` or `mobile/lib/core/router.dart`) to add doctor routes

### Files to Modify

1. **`mobile/pubspec.yaml`**
   - Current: Has basic dependencies (flutter_secure_storage, http, riverpod, go_router)
   - Add:
     ```yaml
     device_info_plus: ^9.1.0
     google_sign_in: ^6.2.1
     uuid: ^4.0.0
     shared_preferences: ^2.2.2
     ```

2. **Existing API client or create new** (`mobile/lib/services/api_client.dart`)
   - Add method to inject X-Device-ID and X-Device-Name headers on every request
   - Read from DeviceService

3. **Router configuration**
   - Add role-based routing for doctor role
   - Routes: `/doctor/login`, `/doctor/dashboard`, `/doctor/bookings`, `/doctor/checkin/:bookingId`, `/doctor/verify-device`, `/doctor/change-password`
   - Redirect logic: if `passwordResetRequired === true`, redirect to change password
   - Redirect logic: if device not trusted, redirect to verify device

### Implementation Steps

1. **Update pubspec.yaml**:
   - Add 4 new dependencies listed above
   - Run `flutter pub get`

2. **Create device service** (`mobile/lib/services/device_service.dart`):
   - `Future<String> getOrCreateDeviceId()`: Check shared_preferences for existing ID, generate UUID if none
   - `Future<String> getDeviceName()`: Use device_info_plus to get OS + model (e.g., "iPhone 14 Pro", "Samsung Galaxy S23")
   - `Future<String> getDeviceType()`: Return 'MOBILE_IOS' or 'MOBILE_ANDROID'

3. **Create/modify API client** (`mobile/lib/services/api_client.dart`):
   - If exists, modify to add device headers
   - If not exists, create with Dio or http package
   - Add interceptor to inject headers:
     ```dart
     final deviceId = await deviceService.getOrCreateDeviceId();
     final deviceName = await deviceService.getDeviceName();
     headers['X-Device-ID'] = deviceId;
     headers['X-Device-Name'] = deviceName;
     headers['Authorization'] = 'Bearer $token'; // From secure storage
     ```

4. **Create Google Auth service** (`mobile/lib/services/google_auth_service.dart`):
   - Wrap GoogleSignIn package
   - Method `Future<String?> signInWithGoogle()`: Get Google ID token, send to backend `/api/auth/google/mobile` (NOTE: This endpoint doesn't exist yet, needs to be created in Feature 1)
   - Backend returns Bearer token, store in flutter_secure_storage

5. **Create data models** (3 files):
   - `doctor_model.dart`: Parse JSON from `/api/auth/me` (doctor user object)
   - `booking_model.dart`: Parse JSON from `/api/doctor/bookings`
   - `device_model.dart`: Device info structure

6. **Create domain entities** (2 files):
   - `doctor.dart`: Domain entity for doctor
   - `doctor_booking.dart`: Domain entity for booking

7. **Create repositories** (2 files):
   - `doctor_auth_repository.dart`: Login, logout, check session, change password
   - `doctor_booking_repository.dart`: Get bookings, check-in, check-out

8. **Create datasources** (2 files):
   - `doctor_remote_datasource.dart`: All API calls (POST /api/auth/login, GET /api/doctor/bookings, POST /api/doctor/checkin, POST /api/doctor/checkout)
   - `doctor_local_datasource.dart`: Cache bookings in local storage (Hive or shared_preferences)

9. **Create use cases** (4 files):
   - `login_doctor.dart`: Call auth repository
   - `checkin_patient.dart`: Call booking repository POST /api/doctor/checkin
   - `checkout_patient.dart`: Call booking repository POST /api/doctor/checkout
   - `get_doctor_bookings.dart`: Call booking repository GET /api/doctor/bookings

10. **Create Riverpod providers** (2 files):
    - `doctor_auth_provider.dart`: Manages auth state, exposes login/logout methods
    - `doctor_bookings_provider.dart`: Manages bookings list, exposes check-in/check-out actions

11. **Create screens** (6 files):
    - `doctor_login_screen.dart`: Email/password form + "Sign in with Google" button
    - `first_login_password_screen.dart`: Form to change password (old password, new password, confirm) → POST to `/api/auth/change-password-first-login`
    - `device_verification_screen.dart`: OTP input form → POST to `/api/auth/verify-device`
    - `doctor_dashboard_screen.dart`: Show today's stats (bookings count, pending check-ins, completed)
    - `doctor_bookings_screen.dart`: List of bookings with BookingCard widgets
    - `patient_checkin_screen.dart`: Detail view of single booking with check-in and check-out buttons

12. **Create widgets** (3 files):
    - `booking_card.dart`: Card showing booking date, time, patient name, status, check-in/out buttons
    - `checkin_button.dart`: Button that calls check-in API, shows loading state
    - `commission_display.dart`: Widget showing calculated commission after checkout

13. **Update router**:
    - Add doctor routes to Go Router configuration
    - Add redirect logic:
      - On app start: Check auth token, get user role from `/api/auth/me`
      - If doctor + `passwordResetRequired === true` → `/doctor/change-password`
      - If doctor + device not trusted → `/doctor/verify-device`
      - Else if doctor → `/doctor/dashboard`
    - Example route:
      ```dart
      GoRoute(
        path: '/doctor/dashboard',
        builder: (context, state) => DoctorDashboardScreen(),
      ),
      ```

### Verification

1. Build mobile app: `cd mobile && flutter build apk` (Android) or `flutter build ios` (iOS simulator)
2. Run on emulator: `flutter run`
3. Test doctor login flow:
   - Enter email/password → successful login
   - If first login → redirected to change password screen
   - Change password → redirected to device verification screen
   - Enter OTP from email → redirected to dashboard
4. Test dashboard: Shows today's booking stats
5. Test bookings list: Shows bookings with check-in/check-out buttons
6. Test check-in: Click check-in → booking status updates, timestamp recorded
7. Test check-out: Click check-out → commission calculated and displayed
8. Test Google Sign-In: Click Google button → redirects to Google → returns to app → logged in

Command: `cd mobile && flutter run`

**Note:** Mobile implementation requires:
- Android emulator or physical device with Google Play Services (for Google Sign-In)
- iOS simulator or physical device with Apple Sign-In configured
- Backend server accessible from mobile (localhost won't work on physical device, use ngrok or deploy to staging)

---

## Database Migration Required

**Before starting implementation:**

Run: `npm run db:push`

This applies schema changes to Neon database (users table extensions, userDevices table, doctors table extensions).

Per verification.md: Schema changes are defined but NOT pushed to database yet.

---

## Environment Variables

**Already configured:**
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (per `lib/auth-config.ts`)
- `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`
- SMTP credentials for email service

**No new environment variables needed.**

---

## Gotchas and Dependencies

1. **Google OAuth requires domain verification:**
   - Localhost works for development
   - Production requires verified domain in Google Cloud Console
   - Redirect URIs must be added: `https://yourdomain.com/api/auth/callback/google`

2. **Device tracking requires client-side headers:**
   - Web: Use `authenticatedFetch()` wrapper on ALL authenticated requests
   - Mobile: API client must inject headers on EVERY request
   - Server-side routes must read X-Device-ID header (already handled in `lib/middleware/device-tracking.ts`)

3. **Better Auth hooks signature:**
   - Better Auth 1.7.7 has specific hook signatures
   - Verify `hooks.after.signIn` signature in Better Auth docs before implementing
   - May need to use middleware approach instead of hooks if signature incompatible

4. **Flutter Google Sign-In setup:**
   - Android: Requires SHA-1 fingerprint added to Firebase project
   - iOS: Requires URL scheme added to Info.plist
   - Both: Require OAuth client IDs in Google Cloud Console (Web client ID for backend, iOS/Android client IDs for mobile)

5. **Mobile API base URL:**
   - Development: Use ngrok or local IP address (not `localhost` from mobile device)
   - Staging/Production: Use actual domain
   - Configure in `mobile/lib/core/config/env.dart` or similar

6. **Commission calculation on checkout:**
   - Already implemented in `lib/utils/commission.ts`
   - Mobile just calls `/api/doctor/checkout`, commission auto-calculated
   - Display commission in UI after successful checkout response

7. **Existing device OTP APIs:**
   - `/api/auth/verify-device` and `/api/auth/request-device-otp` already exist
   - Mobile and web just need to call these endpoints
   - Rate limiting already implemented (3 attempts per device)

---

## Success Criteria

**Feature 1 (Google OAuth):**
- [ ] Existing user can sign in with Google, no duplicate account created
- [ ] New doctor cannot self-register via Google, gets error message
- [ ] New patient can sign up via Google, account created
- [ ] Doctor provisioned by center can sign in with Google on first try

**Feature 2 (Device Tracking):**
- [ ] New device triggers email with OTP
- [ ] Device verification page accepts valid OTP and marks device trusted
- [ ] Known device login skips OTP flow
- [ ] Invalid OTP shows error, allows retry up to 3 times
- [ ] All authenticated API calls include device headers

**Feature 3 (Flutter Mobile):**
- [ ] Doctor can login via email/password from mobile app
- [ ] Doctor can login via Google Sign-In from mobile app
- [ ] First-login password reset flow works on mobile
- [ ] Device verification flow works on mobile (OTP from email)
- [ ] Doctor dashboard shows today's booking stats
- [ ] Bookings list displays all appointments
- [ ] Check-in and check-out buttons work, update booking status
- [ ] Commission displayed after successful checkout

---

## Estimated Effort

- **Feature 1 (Google OAuth):** 3-4 hours (backend route, helper functions, UI button wiring)
- **Feature 2 (Device Tracking):** 4-5 hours (hooks integration, fetch wrapper, verification page, testing)
- **Feature 3 (Flutter Mobile):** 12-16 hours (28 new files, data layer, UI screens, testing on emulator)

**Total:** 19-25 hours of implementation + testing

---

## Notes

- Follow existing patterns from codebase: Drizzle ORM queries, Better Auth session handling, Next.js App Router conventions
- Reuse existing email service (`lib/email.ts`) for device alerts
- Commission calculation already exists in `lib/utils/commission.ts`, just needs to be called
- Flutter app follows clean architecture (data/domain/presentation layers) per `mobile/MOBILE_APP.md`
- Device tracking is security-critical: ensure headers are sent on EVERY authenticated request
- Google OAuth account linking prevents duplicate accounts by checking email before creating user

---

**End of Plan**
