# Doctor authentication and patient check-in system

Backend implementation complete with temporary password provisioning, first-login password reset, device tracking, OTP verification, patient check-in/checkout workflows, and automated commission calculation for center bookings. Web UI, mobile implementation, and Google OAuth integration not implemented.

The system adds doctor role provisioning by center admins, enforces mandatory password change on first login with 7-day expiration, tracks devices for security monitoring with OTP verification, allows doctors to check in and check out patients with automatic commission calculation supporting both percentage and fixed commission types, and provides admin endpoints to configure center commission settings. Commission is deducted from booking price with the remainder going to the center.

**Watch for:** (confirmed) Web UI missing — no doctor dashboard, change password page, or first-login redirect. Doctors cannot actually log in and change their temporary password through the UI. (confirmed) Google OAuth callback not implemented despite OAuth config present. (confirmed) Center check-in missing today's date validation while doctor check-in enforces it, creating inconsistent behavior. (confirmed) Device tracking relies on server-generated fingerprints for web users rather than client-provided device IDs, making it bypassable. (likely) Mobile implementation completely missing — no Flutter screens created.

**Verdict**: NEEDS_CHANGES

## High-level view

Schema changes applied successfully with all required fields for password reset tracking, OAuth linking, doctor provisioning metadata, device tracking, and commission calculation. Database migration executed on production branch.

Password hashing uses Node.js scrypt matching Better Auth's algorithm, with salt:hexKey format and parameters N=16384, r=16, p=1, dkLen=64. Passwords stored in Better Auth's accounts table with providerId='credential'. Temporary passwords expire in 7 days and are sent via email.

RBAC middleware reuses existing requireDoctor, requireCenter, requireAdmin pattern. All doctor and center endpoints enforce role checks and verify ownership. Doctor can only check in/out their own bookings, center can only access bookings from their doctors.

Commission calculation supports PERCENTAGE (rate applied to booking price) and FIXED (flat amount per booking) models. Center earnings = booking price minus commission. Calculation logic centralized in lib/utils/commission.ts and reused across doctor and center checkout routes.

Device tracking creates fingerprints from user-agent + IP for web browsers, but accepts X-Device-ID header from mobile apps. New devices trigger OTP email with 6-digit code valid for 10 minutes. OTP verification marks device as trusted. Rate limiting allows 3 attempts per device per 10 minutes.

First-login check reads passwordResetRequired and isFirstLogin flags from database. Check-in validates booking status is CONFIRMED and belongs to requesting doctor/center. Checkout validates check-in completed, updates status to COMPLETED, calculates commission, and sends notification to center admin.

Web UI not implemented — no pages created for doctor dashboard, bookings list, change password flow, or first-login redirect logic. Mobile screens not created. Google OAuth callback route missing despite Better Auth configured with Google provider.

<details>
<summary>Issues (12)</summary>

1. **No web UI for first-login password reset** — Doctor provisioned with temporary password cannot change it. Create app/doctor/change-password/page.tsx with form submitting to /api/auth/change-password-first-login, create app/doctor/layout.tsx with checkFirstLogin() redirect logic, and create middleware.ts to inject pathname into headers. (confirmed)

2. **No doctor dashboard or bookings UI** — Doctors cannot view appointments or perform check-in/out. Create app/doctor/page.tsx with today's stats, app/doctor/bookings/page.tsx with booking list table, and CheckInButton/CheckOutButton client components calling /api/doctor/checkin and /api/doctor/checkout. (confirmed)

3. **Google OAuth callback route missing** — OAuth configured in lib/auth-config.ts but no app/api/auth/callback/google/route.ts. Doctor cannot sign in with Google despite design requiring it. Create callback route with manual account linking to prevent unauthorized doctor self-registration, verify doctor profile exists, and reject if email not pre-provisioned. (confirmed)

4. **Center check-in missing today's date validation** — Doctor check-in validates booking.date equals today, but center check-in (/api/center/checkin/route.ts) allows check-in for any date. Add today validation to center route matching doctor route: `if (booking.date !== new Date().toISOString().split('T')[0])` with 400 error. (confirmed)

5. **Web device tracking bypassable** — Device fingerprint generated server-side from user-agent + IP in device-tracking.ts. User behind VPN or NAT creates false positives. Browser updates change fingerprint. Client should generate UUID in localStorage and send via X-Device-ID header like mobile. Update device-tracking.ts to expect X-Device-ID from web clients. Create lib/device-id.ts with getOrCreateDeviceId(). (confirmed)

6. **Device OTP can be bypassed** — trackDevice() returns trusted=true on error (device-tracking.ts line 116). Authentication succeeds even if device tracking fails. Change error handler to return trusted=false to force OTP verification on tracking errors. (confirmed)

7. **Commission calculation not rounded consistently** — commission.ts rounds to 2 decimal places but center checkout route (app/api/center/checkout/route.ts lines 128-135) recalculates inline without rounding. Use calculateCommission() utility in center checkout to ensure consistency. (confirmed)

8. **Temporary password exposure in response** — provision route returns tempPassword in JSON response if email fails (route.ts line 157). Logged in server logs and potentially cached. Only return tempPassword in email failure case, and log warning instead of including in response. Response already conditionally includes it only on email failure. (likely)

9. **No mobile implementation** — Design requires Flutter screens for doctor dashboard, bookings, change password, and device tracking. No files created in mobile/lib/features/doctor/. Mobile doctors cannot check in/out patients. (confirmed)

10. **Password validation regex incomplete** — changePasswordSchema requires uppercase, lowercase, digit but doesn't check minimum complexity or block common passwords. Current validation sufficient for enterprise use. No change needed. (possible)

11. **No rate limiting on password change endpoint** — change-password-first-login route allows unlimited attempts to guess currentPassword. Add rate limiting with exponential backoff after 5 failed attempts per user per hour. (likely)

12. **Commission notification has no fallback** — Doctor checkout creates notification for center admin (app/api/doctor/checkout/route.ts line 123) but doesn't check if insert succeeds. If notification table insert fails, commission calculated but center not notified. Wrap notification insert in try-catch and log error if it fails. (likely)

</details>

<details>
<summary>Details</summary>

## Schema and database migrations

Schema updates applied via Neon MCP tool on production branch (migration ID a59f9856-0318-49b6-acb1-488db05d82d3). Added device_type enum, extended users table with isFirstLogin, passwordResetRequired, lastPasswordChangeAt, tempPasswordExpiresAt, googleId, appleId fields. Extended doctors table with provisioned, provisionedBy, provisionedAt. Created user_devices table with deviceId, deviceName, deviceType, userAgent, ipAddress, trusted flag, and timestamps.

## Password hashing and Better Auth integration

Password hashing (lib/utils/password.ts) uses Node.js crypto.scrypt with parameters matching Better Auth's defaults: N=16384, r=16, p=1, dkLen=64, salt 16 bytes hex-encoded. Output format: `salt:hexKey`. Provisioning route (app/api/center/doctors/provision/route.ts) hashes temporary password and stores in accounts table with providerId='credential'. Change-password endpoint (app/api/auth/change-password-first-login/route.ts) fetches account record, verifies old password with verifyPassword(), hashes new password, updates accounts.password, and clears passwordResetRequired and isFirstLogin flags.

OAuth config added to lib/auth-config.ts with Google provider, but callback route not implemented. Google Sign-In would fail with 404.

## Doctor provisioning by center admin

Provisioning route (app/api/center/doctors/provision/route.ts) enforces CENTER role via requireCenter(), validates request body with provisionDoctorSchema, checks email and licenseNumber uniqueness, generates 16-byte base64url temporary password, sets tempPasswordExpiresAt to 7 days from now, creates user with passwordResetRequired=true and isFirstLogin=true, creates credential account via hashPassword(), creates doctor record with provisioned=true and provisionedBy=user.id, sends email with sendDoctorProvisioningEmail(), returns tempPassword only if email fails.

Email template includes temporary password, login link, and security warning about mandatory password change. If email delivery fails, route returns tempPassword in response for manual delivery. Temporary password expiration enforced in change-password-first-login route (checks tempPasswordExpiresAt and returns 401 if expired).

## First-login password reset

Change-password endpoint (app/api/auth/change-password-first-login/route.ts) requires authentication via getAuthenticatedUser(), validates request body with changePasswordSchema (min 8 chars, uppercase, lowercase, digit, passwords match), checks passwordResetRequired or isFirstLogin flags, checks tempPasswordExpiresAt not expired, fetches credential account from accounts table, verifies currentPassword matches stored hash, ensures newPassword differs from currentPassword, hashes newPassword, updates accounts.password, clears passwordResetRequired, isFirstLogin, and tempPasswordExpiresAt flags, sets lastPasswordChangeAt to now.

Validation schema (lib/validations/doctor.ts) enforces password complexity: min 8 characters, one uppercase, one lowercase, one digit. Does not check for common passwords, sequential characters, or username inclusion. For enterprise healthcare application this may be insufficient — HIPAA recommends 12+ character minimum and checking against breach databases.

Web UI missing: no app/doctor/change-password/page.tsx, no app/doctor/layout.tsx with redirect logic, no middleware.ts to inject pathname into headers. Design specifies doctor layout should call checkFirstLogin() and redirect to /doctor/change-password if requiresReset=true, allowing access only to change-password page, auth endpoints, and signout to prevent infinite loops. Without this implementation, provisioned doctors receive temporary password via email but have no UI to change it and gain access to the system.

## Device tracking and OTP verification

Device tracking (lib/middleware/device-tracking.ts) extracts device info from request headers. Mobile apps send X-Device-ID and X-Device-Name headers. Web browsers get fingerprint generated from SHA-256 hash of userAgent + ipAddress (first 32 characters). Queries user_devices table for existing device matching userId and deviceId. If found, updates lastUsedAt and returns trusted flag. If not found, creates new device with trusted=false and returns isNew=true.

Web device fingerprinting approach has reliability issues. User-agent changes with browser updates, IP changes with VPN or network switches, NAT makes multiple users appear as same device. Design specifies client-provided UUID from localStorage for web (matching mobile pattern) but implementation uses server fingerprint instead. This creates false positives (legitimate user forced to verify after IP change) and false negatives (attacker bypasses detection by spoofing fingerprint).

OTP request route (app/api/auth/request-device-otp/route.ts) generates 6-digit numeric OTP, hashes with SHA-256, stores in verifications table with identifier `device-verify:${deviceId}` and 10-minute expiration, sends email with sendNewDeviceAlertEmail() including OTP code. OTP verification route (app/api/auth/verify-device/route.ts) implements rate limiting with in-memory Map (3 attempts per device per 10 minutes), fetches verification record, checks expiration, hashes submitted OTP and compares with stored value, marks device as trusted on success, deletes verification record, clears rate limit.

Device tracking error handling (device-tracking.ts line 116) returns trusted=true on error, allowing authentication to proceed even if device tracking fails. This defeats the security monitoring purpose.

## Patient check-in and check-out

Doctor check-in route (app/api/doctor/checkin/route.ts) enforces DOCTOR role via requireDoctor(), gets doctorId with getUserDoctorId(), validates bookingId with checkInSchema, fetches booking, verifies booking.doctorId matches authenticated doctor (403 if not), verifies status='CONFIRMED' (400 if not), verifies booking.date equals today in YYYY-MM-DD format (400 if not), verifies checkedInAt is null (400 if already checked in), updates booking set checkedInAt=now and checkedInBy=user.id.

Center check-in route (app/api/center/checkin/route.ts) follows same pattern but enforces CENTER role, gets centerId with getUserCenterId(), verifies booking.doctorId belongs to center's doctor by querying doctors table and checking doctor.centerId matches authenticated center. Validates status='CONFIRMED' and checkedInAt is null, but does NOT validate booking.date equals today. This inconsistency allows centers to check in patients for past or future appointments while doctors cannot.

Doctor checkout route (app/api/doctor/checkout/route.ts) validates checkInSchema with optional actualPrice, verifies booking checked in (checkedInAt not null), verifies not already checked out (checkedOutAt null), queries doctor with center join, calculates commission with calculateCommission() utility if doctor has center, sets finalPrice to actualPrice || booking.price, updates booking with checkedOutAt=now, checkedOutBy=user.id, status='COMPLETED', price=finalPrice, commissionAmount, centerEarnings, commissionStatus='CALCULATED', creates notification for center admin with commission amount.

Center checkout route (app/api/center/checkout/route.ts) recalculates commission inline (lines 128-135) instead of using calculateCommission() utility. Commission calculation duplicated with slight differences: utility rounds to 2 decimal places, inline calculation doesn't round.

Independent doctors (centerId=null) handled in doctor checkout: commission calculation skipped, centerEarnings set to full price, no notification created.

## Commission calculation

Commission utility (lib/utils/commission.ts) accepts booking price and center commission settings (commissionType, commissionRate, fixedCommissionAmount). For PERCENTAGE type, calculates commissionAmount = price * rate / 100 rounded to 2 decimal places. For FIXED type, uses fixedCommissionAmount directly. Returns commissionAmount and centerEarnings where centerEarnings = price - commissionAmount rounded to 2 decimal places.

Commission model is platform-takes-commission-from-booking with center receiving remainder. Center earnings can be negative if fixed commission exceeds booking price (utility doesn't prevent this edge case).

Admin commission update route (app/api/admin/centers/commission/route.ts) enforces ADMIN role, validates request body with commissionSchema (ensures PERCENTAGE has rate 0-100, FIXED has positive amount), updates center commission settings, sends notification and email to center admin. Changes apply to future bookings only.

Doctor checkout route uses calculateCommission() correctly. Center checkout route recalculates inline without rounding. Commission notification created for center admin in doctor checkout (line 123) but not wrapped in error handling. If notification insert fails, commission calculated and booking updated but center not alerted.

## API route security

All doctor endpoints enforce requireDoctor() which calls requireRole('DOCTOR'). All center endpoints enforce requireCenter(). All admin endpoints enforce requireAdmin(). RBAC middleware (lib/middleware/permissions.ts) calls getAuthenticatedUser() which fetches user from session and queries database, returns 401 if no session, 403 if wrong role.

getUserDoctorId(), getUserCenterId() helpers query respective profile tables to get ID from userId. Routes use these IDs to verify ownership: doctor check-in verifies booking.doctorId matches authenticated doctor's ID, center check-in verifies booking's doctor belongs to authenticated center.

SQL injection protected via Drizzle ORM parameterized queries. All .where() calls use eq(), and(), or other Drizzle operators with bound parameters. No string concatenation or raw SQL observed in new routes.

Password hashing via scrypt with 16384 iterations, not stored plain text. Passwords stored in Better Auth accounts table, not users table. Temporary passwords sent only via email, not logged in cleartext (provisioning route returns tempPassword only on email failure for manual delivery, not for normal flow).

OAuth doctor restriction not implemented. Design specifies manual account linking in Google OAuth callback to prevent unauthorized doctor self-registration: if email exists, link OAuth account; if email doesn't exist and role=DOCTOR, reject; if role=PATIENT/CENTER, allow. No callback route created despite OAuth config present in lib/auth-config.ts. Google Sign-In button in UI would redirect to /api/auth/callback/google returning 404.

Device OTP verification has rate limiting (3 attempts per 10 minutes) but password change endpoint does not. Attacker could brute-force currentPassword on change-password-first-login route. Should add rate limiting to password change endpoint.

## Validation and error handling

All routes validate request body with Zod schemas from lib/validations/doctor.ts: provisionDoctorSchema, checkInSchema, checkOutSchema, commissionSchema, changePasswordSchema. Validation failures return 400 with detailed error array from validation.error.issues.

Commission calculation doesn't validate centerEarnings >= 0. If fixed commission exceeds booking price, centerEarnings becomes negative.

Temporary password expiration checked in change-password-first-login route (returns 401 if expired with message to contact admin). Expired verification OTP records deleted and route returns 401. Rate-limited OTP verification returns 429 with attempts remaining count.

## Email notifications

Email service (lib/email.ts) uses nodemailer with SMTP config from environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD). sendEmail() wrapper returns boolean indicating success/failure.

sendDoctorProvisioningEmail() sends temporary password, login link, security warning about mandatory password change, and list of doctor capabilities. sendNewDeviceAlertEmail() sends device details (name, type, IP, timestamp), 6-digit OTP code, expiration time (10 minutes), and security instructions to change password if unauthorized.

Provisioning route checks email send result and conditionally returns tempPassword if email fails. Does not create notification for center admin to manually deliver credentials (design specifies this but not implemented). Device OTP request route returns 500 error if email fails, blocking OTP flow.

## Missing implementation

Web UI not created: no app/doctor/page.tsx (dashboard with today's stats), no app/doctor/bookings/page.tsx (booking list with check-in/out buttons), no app/doctor/change-password/page.tsx (password change form), no app/doctor/layout.tsx (first-login redirect), no middleware.ts (pathname injection for layout), no center provisioning UI (design specifies modal in center dashboard to create doctors).

Mobile implementation not created: no mobile/lib/features/doctor/ directory, no doctor_dashboard_screen.dart, no bookings_list_screen.dart, no change_password_screen.dart, no device_service.dart for X-Device-ID header injection. Mobile doctors cannot access any functionality.

Google OAuth integration incomplete: Better Auth configured with Google provider (lib/auth-config.ts lines 23-27), but no app/api/auth/callback/google/route.ts to handle OAuth callback. Design specifies manual account linking to prevent unauthorized doctor self-registration (reject if email not pre-provisioned), but this logic not implemented. Clicking Google Sign-In would result in 404 error.

Doctor self-registration endpoint specified in design (app/api/doctors/register/route.ts) but not implemented. Independent doctors cannot create accounts without being provisioned by center admin.

Verification document states 65% complete. API routes (FEAT-002, FEAT-004, FEAT-005) implemented. Schema and dependencies (FEAT-001) complete. Web UI (FEAT-002 steps 12-14) and Google OAuth (FEAT-003) not started. Mobile (FEAT-002 steps 31, 39-41) not started.

</details>

---

<details>
<summary>File map</summary>

**Schema and migrations:**
- `db/schema.ts` — Extended users table with password reset tracking and OAuth fields, extended doctors table with provisioning metadata, created user_devices table with device tracking fields

**Utilities:**
- `lib/utils/password.ts` — Password hashing and verification using scrypt matching Better Auth
- `lib/utils/commission.ts` — Commission calculation for PERCENTAGE and FIXED commission types
- `lib/middleware/device-tracking.ts` — Device tracking middleware with fingerprinting and trusted device management
- `lib/middleware/first-login-check.ts` — First-login password reset detection
- `lib/validations/doctor.ts` — Zod schemas for provisioning, check-in, check-out, commission, password change
- `lib/email.ts` — Added sendDoctorProvisioningEmail() and sendNewDeviceAlertEmail() templates

**Configuration:**
- `lib/auth-config.ts` — Added Google OAuth provider configuration

**API routes:**
- `app/api/center/doctors/provision/route.ts` — Center admin doctor provisioning with temporary password generation
- `app/api/auth/change-password-first-login/route.ts` — Mandatory password change for first-time login
- `app/api/auth/request-device-otp/route.ts` — OTP generation for new device verification
- `app/api/auth/verify-device/route.ts` — OTP verification with rate limiting
- `app/api/doctor/checkin/route.ts` — Doctor check-in with today validation and ownership checks
- `app/api/doctor/checkout/route.ts` — Doctor check-out with commission calculation and center notification
- `app/api/doctor/bookings/route.ts` — Doctor bookings list with date and status filters
- `app/api/center/checkin/route.ts` — Center check-in (missing today validation)
- `app/api/center/checkout/route.ts` — Center check-out with inline commission calculation
- `app/api/admin/centers/commission/route.ts` — Admin commission settings update with notifications

**Missing:**
- Web UI: doctor dashboard, bookings page, change password page, doctor layout with first-login redirect, middleware.ts
- Mobile: Flutter screens for doctor dashboard, bookings, change password, device tracking
- Google OAuth callback route
- Doctor self-registration endpoint

Full diff: Run `git diff main` in project directory to see complete changes.

</details>
