# Implementation Plan: Doctor Authentication & Patient Check-In System

This plan implements secure doctor authentication with Google OAuth, device tracking, mandatory first-login password reset, and patient check-in/checkout with automated commission calculation across web and mobile platforms.

## Execution Strategy

This work decomposes into 5 separable features executed sequentially. Each feature leaves the codebase in a buildable, testable state. Features are ordered by dependency.

---

## FEAT-001: Database Schema & Dependencies

**Foundation layer: Add required schema fields and install OAuth library**

- [ ] 1. Update db/schema.ts users table: Add `passwordResetRequired: boolean('password_reset_required').default(false).notNull()`, `lastPasswordChangeAt: timestamp('last_password_change_at')`, `tempPasswordExpiresAt: timestamp('temp_password_expires_at')`, `googleId: text('google_id').unique()`
      Files: db/schema.ts
      Verify: Run `npm run db:push` and check Neon dashboard to confirm columns added to users table

- [ ] 2. Update db/schema.ts doctors table: Add `provisioned: boolean('provisioned').default(false).notNull()`, `provisionedBy: text('provisioned_by').references(() => users.id, { onDelete: 'set null' })`, `provisionedAt: timestamp('provisioned_at')`
      Files: db/schema.ts
      Verify: Check Neon dashboard to confirm columns added to doctors table

- [ ] 3. Create user_devices table in db/schema.ts with full schema: Create deviceTypeEnum pgEnum with values ['WEB', 'MOBILE_IOS', 'MOBILE_ANDROID']. Create user_devices pgTable with fields: id (text primary key, UUID default), userId (text references users.id with cascade delete), deviceId (text, client-provided UUID), deviceName (text), deviceType (deviceTypeEnum), userAgent (text), ipAddress (text), lastUsedAt (timestamp with defaultNow), firstUsedAt (timestamp with defaultNow), trusted (boolean default false), createdAt (timestamp with defaultNow). Add userDevicesRelations linking to users table.
      Files: db/schema.ts
      Verify: Run `npm run db:push`, check Neon dashboard for user_devices table with all columns and deviceTypeEnum

- [ ] 4. Install Google OAuth library: Run `npm install google-auth-library` to add OAuth token verification for web and mobile Google Sign-In
      Files: package.json (auto-updated)
      Verify: Run `npm list google-auth-library` and confirm package appears in output

---

## FEAT-002: Doctor Provisioning & First-Login Password Reset

**Center admin doctor creation with mandatory password change and device tracking**

- [ ] 5. Create lib/device-id.ts with client-side device utilities: `getOrCreateDeviceId()` generates or retrieves UUID from localStorage, `getDeviceName()` parses user-agent to return friendly device name (Chrome Browser, Safari Browser, etc.)
      Files: lib/device-id.ts
      Verify: Import in browser console, run getOrCreateDeviceId() twice, confirm same UUID returned

- [ ] 6. Create lib/middleware/device-tracking.ts with `trackDevice(userId)`: Reads X-Device-ID and X-Device-Name from headers, validates deviceId as UUID format, queries user_devices table for existing device record, creates new record if device not found (trusted=false), updates lastUsedAt if existing, returns {isNewDevice: boolean, deviceId: string}. Throws error if deviceId missing or invalid format.
      Files: lib/middleware/device-tracking.ts
      Verify: Call from test API route with X-Device-ID header, check user_devices table for new record

- [ ] 7. Create lib/middleware/first-login-check.ts with `checkFirstLogin()`: Calls getAuthenticatedUser(), queries users table for passwordResetRequired flag, returns {requiresReset: boolean, user: AuthenticatedUser | null}
      Files: lib/middleware/first-login-check.ts
      Verify: Import and call with test user having passwordResetRequired=true, confirm returns requiresReset=true

- [ ] 8. Add `sendNewDeviceAlertEmail(userEmail, userName, deviceId, otp)` to lib/email.ts: Follow existing email template pattern from sendCenterApprovalEmail. Subject: "🔐 Security Alert: New Device Login". Body includes device ID, timestamp, OTP code (6 digits), expiration (10 minutes), instructions to verify or contact support if unauthorized. Returns boolean for success/failure.
      Files: lib/email.ts
      Verify: Call function with test data, check email logs or sent email for proper formatting

- [ ] 9. Create app/api/center/doctors/provision/route.ts: requireCenter() auth, get centerId via getUserCenterId(), validate request body with provisionDoctorSchema (create schema inline if lib/validations/doctor.ts doesn't exist yet), check email uniqueness in users table, generate 16-byte base64url temp password with crypto.randomBytes(16), set tempPasswordExpiresAt to 24h from now, create user record (role='DOCTOR', passwordResetRequired=true, emailVerified=false), create account via Better Auth (use auth.api or manual hash), create doctor record (provisioned=true, provisionedBy=user.id, provisionedAt=now, centerId=centerId, active=true), send verification email via sendEmail(), if sendEmail() returns false log error and create notification for center admin, return {doctor: {id, userId, name, email, tempPassword}, message}
      Files: app/api/center/doctors/provision/route.ts
      Verify: Login as CENTER, POST with doctor data, confirm 200 with tempPassword, check users/doctors/accounts tables, check email logs

- [ ] 10. Create app/api/auth/change-password-first-login/route.ts: getAuthenticatedUser(), verify passwordResetRequired=true, check tempPasswordExpiresAt not expired (401 if expired), fetch account record from accounts table (providerId='credential'), verify oldPassword matches via Better Auth password utility, validate newPassword (min 8 chars, regex for uppercase, lowercase, digit), ensure newPassword != oldPassword, update account.password via Better Auth hash, update users table set passwordResetRequired=false, lastPasswordChangeAt=now, tempPasswordExpiresAt=null, send confirmation email, return {success: true, message}
      Files: app/api/auth/change-password-first-login/route.ts
      Verify: Login with temp password, POST to endpoint with old/new passwords, confirm 200 and passwordResetRequired=false in DB

- [ ] 11. Create app/api/auth/verify-device/route.ts: getAuthenticatedUser(), extract {deviceId, otp} from body, implement rate limiting with in-memory Map (3 attempts per deviceId per 10min window), fetch verification record from verifications table (identifier=`device-verify:${deviceId}`), check expiresAt, hash submitted OTP with SHA-256 and compare with stored value, update user_devices set trusted=true where deviceId and userId match, delete verification record, clear rate limit on success, return {success: true, message}
      Files: app/api/auth/verify-device/route.ts
      Verify: Manually insert OTP verification record, POST with deviceId and correct OTP, confirm device trusted=true in DB

- [ ] 12. Create middleware.ts in project root: Export Next.js middleware function that adds x-pathname header from request.nextUrl.pathname, apply to all /doctor/* routes via config matcher
      Files: middleware.ts
      Verify: Add console.log in middleware, access /doctor/test route, confirm pathname logged

- [ ] 13. Create app/doctor/layout.tsx: Server component calling checkFirstLogin(), read pathname from headers().get('x-pathname'), define allowedPaths=['/doctor/change-password', '/api/auth/change-password-first-login', '/auth/signout'], if requiresReset=true and pathname not in allowedPaths redirect('/doctor/change-password'), render children
      Files: app/doctor/layout.tsx
      Verify: Set test doctor passwordResetRequired=true, login, access /doctor/dashboard, confirm redirect to /doctor/change-password

- [ ] 14. Create app/doctor/change-password/page.tsx: requireDoctor() server-side, client form with oldPassword, newPassword, confirmNewPassword inputs, password strength indicator (color-coded bar), validate newPassword matches confirmNewPassword client-side, POST to /api/auth/change-password-first-login on submit, redirect to /doctor/dashboard on 200, display error toast on failure
      Files: app/doctor/change-password/page.tsx, components/doctor/ChangePasswordForm.tsx (optional)
      Verify: Access page with passwordResetRequired=true user, submit form with valid passwords, confirm redirect and DB update

---

## FEAT-003: Google OAuth Integration

**Google Sign-In with manual account linking to prevent unauthorized doctor access**

- [ ] 15. Modify lib/auth-config.ts (or lib/auth/server.ts if that's the Better Auth config location): Add socialProviders config with google provider: {clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, redirectURI: `${baseURL}/api/auth/callback/google`}. Import google-auth-library OAuth2Client if needed.
      Files: lib/auth-config.ts
      Verify: Check export includes socialProviders.google, no syntax errors

- [ ] 16. Create app/api/auth/callback/google/route.ts: GET handler, extract code from query params, exchange code for tokens via fetch to Google token endpoint, verify ID token with OAuth2Client.verifyIdToken(), extract {email, sub: googleId, name, picture} from payload, query users by email, if user.role=DOCTOR verify doctor profile exists in doctors table (reject if missing), check accounts table for existing Google link, if not linked create account record (providerId='google', accountId=googleId, accessToken, refreshToken, idToken, accessTokenExpiresAt), update user.googleId=googleId and emailVerified=true, create session via auth.api.createSession(), set session cookie (better-auth.session_token, httpOnly, secure in prod, sameSite lax, maxAge 24h), redirect to /doctor/dashboard. If user doesn't exist redirect to /auth/signin?error=account_not_found.
      Files: app/api/auth/callback/google/route.ts
      Verify: Set GOOGLE_CLIENT_ID/SECRET in .env.local, provision doctor, click Google Sign-In, verify redirect to Google OAuth consent, callback creates session and redirects to dashboard

- [ ] 17. Create app/api/auth/google/mobile/route.ts: POST handler accepting {idToken}, verify token with OAuth2Client, extract email/googleId, run same doctor authorization checks as web callback, create or link account, create session via Better Auth, return {token: session.token} as Bearer token for mobile
      Files: app/api/auth/google/mobile/route.ts
      Verify: POST with valid Google idToken, confirm 200 with token, verify token works in Authorization: Bearer header

- [ ] 18. Create lib/auth/client.ts: Export authClient = createAuthClient({baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}) from better-auth/client for frontend OAuth usage
      Files: lib/auth/client.ts
      Verify: Import in component, confirm no errors, can call authClient.signIn.social()

- [ ] 19. Add Google Sign-In button to login page: Find existing login page (app/login/page.tsx or app/auth/signin/page.tsx), add button with onClick redirecting to /api/auth/signin/google (Better Auth's OAuth start endpoint), use Google icon from lucide-react, style to match existing buttons
      Files: app/login/page.tsx (or app/auth/signin/page.tsx)
      Verify: Visit login page, see Google button, click and redirect to Google OAuth consent screen

- [ ] 20. Document environment variables: Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.example (create if doesn't exist) or add comments in .env.local with placeholder values and instructions to obtain from Google Cloud Console
      Files: .env.example or .env.local
      Verify: Check file contains Google OAuth env var documentation

---

## FEAT-004: Patient Check-In/Out System

**Doctor and center check-in/out with commission calculation**

- [ ] 21. Create lib/utils/commission.ts with `calculateCommission(price: number, center)`: If center.commissionType='PERCENTAGE' calculate commissionAmount = (price * center.commissionRate / 100), if 'FIXED' use center.fixedCommissionAmount, calculate centerEarnings = price - commissionAmount, return {commissionAmount, centerEarnings}. Add JSDoc explaining commission model (platform takes commission FROM booking, center receives remainder).
      Files: lib/utils/commission.ts
      Verify: Import and test with mock data (price=100, rate=15%), confirm commissionAmount=15, centerEarnings=85

- [ ] 22. Add getUserDoctorId(userId) helper to lib/middleware/permissions.ts: Query doctors table where userId=userId, return doctor.id or null, mirror pattern of getUserCenterId()
      Files: lib/middleware/permissions.ts
      Verify: Call with test doctor userId, confirm returns doctor.id

- [ ] 23. Create app/api/doctor/checkin/route.ts: POST handler, requireDoctor(), get doctorId via getUserDoctorId(), parse {bookingId} from body, query booking by id, validate exists, validate doctorId matches booking.doctorId (403 if not), validate status='CONFIRMED' (400 if not), validate checkedInAt is null (400 if already checked in), validate booking.date equals today (YYYY-MM-DD format, 400 if wrong date), optional: validate time within 2 hours of booking.time, update booking set checkedInAt=now, checkedInBy=user.id, updatedAt=now, return {booking, message}
      Files: app/api/doctor/checkin/route.ts
      Verify: Create CONFIRMED booking for today, POST with bookingId, confirm 200 and checkedInAt populated in DB

- [ ] 24. Create app/api/doctor/checkout/route.ts: POST handler, requireDoctor(), get doctorId and query doctor with center join, parse {bookingId, actualPrice?} from body, validate booking belongs to doctor, validate checkedInAt not null (400 if not checked in), validate checkedOutAt is null (400 if already checked out), calculate finalPrice = actualPrice || booking.price, call calculateCommission(finalPrice, center), update booking set checkedOutAt=now, checkedOutBy=user.id, status='COMPLETED', price=finalPrice, commissionAmount, centerEarnings, commissionStatus='CALCULATED', updatedAt=now, create notification for center admin (query center.userId) with type='info', title='Booking completed', message=`SGD ${commissionAmount.toFixed(2)} commission`, return {booking, commission: {commissionAmount, centerEarnings, commissionRate, commissionType}, message}
      Files: app/api/doctor/checkout/route.ts
      Verify: Check in booking, POST checkout with optional actualPrice, confirm booking status=COMPLETED, commission fields populated, notification created

- [ ] 25. Create app/api/doctor/bookings/route.ts: GET handler, requireDoctor(), get doctorId, parse query params (status?, date?), build conditions array [eq(bookings.doctorId, doctorId)], add optional filters, query bookings with leftJoin to patientProfiles and services, order by date/time descending, return {bookings: [...], count}
      Files: app/api/doctor/bookings/route.ts
      Verify: GET /api/doctor/bookings, confirm returns array of bookings with nested patient and service data

- [ ] 26. Review and update app/api/center/checkin/route.ts: Verify it validates booking.date equals today (add check if missing), confirm error messages match design
      Files: app/api/center/checkin/route.ts
      Verify: Existing route tested with today's date validation, rejects wrong date with appropriate error

- [ ] 27. Review and update app/api/center/checkout/route.ts: Ensure uses calculateCommission() utility from lib/utils/commission.ts (replace inline calculation if present), verify commission fields updated same as doctor checkout
      Files: app/api/center/checkout/route.ts
      Verify: Test checkout with PERCENTAGE and FIXED commission types, confirm calculation matches utility

- [ ] 28. Create app/doctor/page.tsx: Server component, requireDoctor(), get doctorId, query today's stats (todayBookings: count where doctorId and date=today, pendingCheckIns: count where doctorId, status=CONFIRMED, checkedInAt=null, completedToday: count where doctorId, date=today, status=COMPLETED), render dashboard with StatCard components showing each metric, add Link to /doctor/bookings
      Files: app/doctor/page.tsx, components/doctor/StatCard.tsx (optional reusable component)
      Verify: Login as doctor, access /doctor, see stats displayed, click link to bookings

- [ ] 29. Create app/doctor/bookings/page.tsx: Server component, requireDoctor(), fetch bookings via DB query with joins to patientProfiles, services, slots, render table with columns (Patient Name, Service, Date, Time, Status, Actions), Actions column: Check In button (if status=CONFIRMED and checkedInAt=null), Check Out button (if checkedInAt not null and checkedOutAt=null), Completed badge (if status=COMPLETED). Make action buttons client components that POST to APIs and revalidate page.
      Files: app/doctor/bookings/page.tsx, components/doctor/BookingActions.tsx (client component)
      Verify: Access /doctor/bookings, see list, click Check In and Check Out buttons, confirm state updates

- [ ] 30. Create components/doctor/CheckOutModal.tsx: Client component, accepts booking prop, displays booking details (patient, service, original price), optional actualPrice number input (default to booking.price), fetch center data to show commission preview (read-only calc), on confirm POST to /api/doctor/checkout with {bookingId, actualPrice}, show success toast, emit onSuccess callback to refresh parent
      Files: components/doctor/CheckOutModal.tsx
      Verify: Click Check Out button on booking, modal opens, change price, see commission preview update, submit and confirm booking updated

- [ ] 31. Create mobile doctor screens: mobile/lib/features/doctor/screens/doctor_dashboard_screen.dart with StatCard widgets for today's stats and navigation button to bookings list, mobile/lib/features/doctor/screens/bookings_list_screen.dart with ListView of BookingCard widgets, mobile/lib/features/doctor/widgets/booking_card.dart with Check In/Out buttons calling APIs with http package and Bearer token in Authorization header and X-Device-ID header, handle responses and show SnackBar feedback
      Files: mobile/lib/features/doctor/screens/doctor_dashboard_screen.dart, bookings_list_screen.dart, mobile/lib/features/doctor/widgets/booking_card.dart
      Verify: Run mobile app with doctor login, navigate to dashboard and bookings, test check-in/out with real API calls

---

## FEAT-005: Admin Commission & Independent Doctor Registration

**Admin tools and self-service doctor signup**

- [ ] 32. Review app/api/admin/centers/commission/route.ts: Confirm it accepts PUT with {centerId, commissionType, commissionRate?, fixedCommissionAmount?}, validates PERCENTAGE has commissionRate 0-100, FIXED has positive fixedCommissionAmount, updates centers table, sends email notification to center admin (query user email via center.userId)
      Files: app/api/admin/centers/commission/route.ts
      Verify: Existing route tested with PUT requests for both commission types, center admin receives email

- [ ] 33. Create lib/validations/doctor.ts with Zod schemas: provisionDoctorSchema (name: string.min(2).max(100), email: string.email(), phone: string.optional(), category: string.min(1), specialization: string.optional(), licenseNumber: string.min(5), price: number.positive(), consultationFee: number.positive().optional(), bio: string.max(500).optional(), imageUrl: string.url().optional()), checkInSchema (bookingId: string.uuid()), checkOutSchema (bookingId: string.uuid(), actualPrice: number.positive().optional()), commissionSchema (centerId: string.uuid(), commissionType: enum PERCENTAGE/FIXED, commissionRate: number.min(0).max(100).optional(), fixedCommissionAmount: number.positive().optional(), with refinement to ensure rate present for PERCENTAGE and amount for FIXED)
      Files: lib/validations/doctor.ts
      Verify: Import schemas, test safeParse() with valid/invalid data, confirm validation works

- [ ] 34. Apply validation schemas to existing routes: Update app/api/center/doctors/provision/route.ts to use provisionDoctorSchema.safeParse() and return 400 with errors on validation failure, update checkin/checkout routes to use checkInSchema/checkOutSchema, update commission route to use commissionSchema
      Files: app/api/center/doctors/provision/route.ts, app/api/doctor/checkin/route.ts, app/api/doctor/checkout/route.ts, app/api/center/checkin/route.ts, app/api/center/checkout/route.ts, app/api/admin/centers/commission/route.ts
      Verify: POST with invalid data to each route, confirm 400 responses with detailed error arrays

- [ ] 35. Create app/api/doctors/register/route.ts (public): POST handler (no auth), parse request body, validate with provisionDoctorSchema (reuse or extend), check email uniqueness in users table (409 if exists), check licenseNumber uniqueness in doctors table (409 if exists), create user (role='DOCTOR', emailVerified=false, passwordResetRequired=true), create account via Better Auth (hash password), create doctor (centerId=null, isIndependent=true, active=false, provisioned=false, map all fields from request), send verification email to doctor, create notification for ADMIN users (query where role=ADMIN) about new doctor registration pending approval, return {doctor: {id, name, email}, message: 'Registration successful, verification email sent'}
      Files: app/api/doctors/register/route.ts
      Verify: POST with unique email/license, confirm 200, check users/doctors tables, verify emailVerified=false, active=false, admin notification created

- [ ] 36. Create app/signup/doctor/page.tsx: Public page, form with sections (Personal: name, email, password, phone; Professional: category dropdown, specialization, licenseNumber; Pricing: consultationFee, price; Bio: textarea), validate with provisionDoctorSchema on client side, POST to /api/doctors/register, redirect to /auth/verify-email-sent on success, show toast errors on failure
      Files: app/signup/doctor/page.tsx
      Verify: Visit /signup/doctor logged out, fill form, submit, confirm redirect and database records created

- [ ] 37. Create or update center doctors management page: Find app/center/doctors/page.tsx (create if doesn't exist), add ProvisionDoctorModal component (can be inline or separate file), modal has form with all provisionDoctorSchema fields, on submit POST to /api/center/doctors/provision, on success show tempPassword in alert or modal (one-time display with copy button and security warning 'Share securely, will not be shown again'), refresh doctors list
      Files: app/center/doctors/page.tsx, components/center/ProvisionDoctorModal.tsx (optional)
      Verify: Login as CENTER, navigate to doctors page, click Add Doctor, fill form, submit, see temp password displayed once, confirm doctor created

- [ ] 38. Create or update admin center detail page: Find app/admin/centers/[id]/page.tsx (create if doesn't exist), add commission settings section, radio buttons for PERCENTAGE/FIXED, conditional inputs (commissionRate slider 0-100 for PERCENTAGE, fixedCommissionAmount number input for FIXED), on submit POST to /api/admin/centers/commission with centerId from URL param, show success message and refresh
      Files: app/admin/centers/[id]/page.tsx, components/admin/CommissionSettings.tsx (optional)
      Verify: Login as ADMIN, navigate to center detail, change commission settings, submit, confirm DB updated and center admin email sent

- [ ] 39. Create mobile/lib/features/doctor/screens/change_password_screen.dart: Stateful widget, form with TextFields (oldPassword, newPassword, confirmPassword, all obscureText), password strength indicator (linear progress bar with color based on strength regex checks), validate confirmPassword matches newPassword, on submit POST to /api/auth/change-password-first-login with Authorization: Bearer token, on 200 navigate to DoctorDashboard with Navigator.pushReplacement (no back), on error show SnackBar
      Files: mobile/lib/features/doctor/screens/change_password_screen.dart
      Verify: In mobile app, set test doctor passwordResetRequired=true, login, confirm navigation to change password with no back button, submit form, verify redirect to dashboard

- [ ] 40. Update mobile auth flow for password reset enforcement: In login success handler (likely mobile/lib/services/auth_service.dart or provider), check user.passwordResetRequired in response, if true navigate to ChangePasswordScreen before any other screen, add logic to block navigation until password reset complete
      Files: mobile/lib/services/auth_service.dart or mobile/lib/features/auth/providers/auth_provider.dart
      Verify: Login via mobile with passwordResetRequired=true user, confirm immediate navigation to change password screen

- [ ] 41. Add device tracking to mobile: Create getDeviceId() function using device_info_plus package (import, call DeviceInfoPlugin, for Android return androidInfo.androidId, for iOS return iosInfo.identifierForVendor, handle nulls with fallback UUID), create getDeviceName() (return '{brand} {model}' for Android, '{name}' for iOS), update http client or interceptor to add X-Device-ID and X-Device-Name headers to all authenticated requests, add device_info_plus: ^10.0.0 to pubspec.yaml
      Files: mobile/lib/services/device_service.dart (new), mobile/lib/services/http_client.dart (or wherever API calls are made), mobile/pubspec.yaml
      Verify: Run mobile app, make authenticated API call, check server logs to confirm X-Device-ID header received, check user_devices table for new mobile device record

---

## Post-Implementation Verification

After all features complete:

1. **Full Flow Test - Doctor Provisioning:**
   - Login as CENTER, provision new doctor
   - Check email for verification link
   - Login as new doctor with temp password
   - Verify redirect to change-password page
   - Change password successfully
   - Access doctor dashboard

2. **Full Flow Test - Google OAuth:**
   - Provision doctor with Google email
   - Logout, click Google Sign-In
   - Verify account linking and redirect to dashboard
   - Check database for googleId and account record

3. **Full Flow Test - Check-In/Out:**
   - Create booking for doctor (status=CONFIRMED, date=today)
   - Login as doctor, navigate to bookings
   - Check in patient
   - Check out patient with commission calculation
   - Verify commission amounts in database match expected values
   - Verify center admin notification created

4. **Full Flow Test - Commission Management:**
   - Login as ADMIN
   - Update center commission (test PERCENTAGE and FIXED)
   - Verify center admin receives email
   - Create new booking and check out
   - Verify new commission rate applied

5. **Full Flow Test - Mobile:**
   - Open Flutter app, login as doctor
   - If first login, verify password reset screen
   - Navigate to bookings
   - Perform check-in and check-out
   - Verify device tracking created mobile device record

6. **Schema Verification:**
   - Run `npm run db:push` one final time
   - Confirm no pending migrations
   - Check all new tables and columns exist in Neon dashboard

**Estimated Timeline:** 6-8 weeks with 1-2 full-stack developers

**Dependencies Installed:** google-auth-library, device_info_plus (mobile), google_sign_in (mobile if not present)
