# Technical Design: Doctor Authentication & Patient Check-In System

## Overview

This design implements a secure, cross-platform doctor authentication system with Google OAuth integration, device tracking, and patient check-in management. The solution extends the existing Better Auth infrastructure, reuses established patterns from the codebase, and maintains consistency across web (Next.js 14 App Router) and mobile (Flutter) platforms.

**Key principles:**
- DRY: Reuse existing Better Auth, Drizzle ORM, permission middleware, and email service
- Security-first: Mandatory password reset, device tracking, OTP verification for new devices
- Cross-platform: Unified backend APIs serving both web and mobile clients
- RBAC: Leverage existing requireDoctor(), requireCenter(), requireAdmin() helpers
- Commission automation: Auto-calculate commission on patient checkout

---

## 1. Database Schema Changes

### 1.1 Users Table Extensions

Add the following columns to the existing `users` table in `db/schema.ts`:

```typescript
// Add to users table definition
passwordResetRequired: boolean('password_reset_required').default(false).notNull(),
lastPasswordChangeAt: timestamp('last_password_change_at'),
tempPasswordExpiresAt: timestamp('temp_password_expires_at'),
googleId: text('google_id').unique(), // Google OAuth sub claim
appleId: text('apple_id').unique(), // Future: Apple Sign-In
```

**Rationale:** These fields enable mandatory first-login password reset and OAuth account linking. `googleId` stores the Google OAuth `sub` claim for deduplication. `tempPasswordExpiresAt` enforces temporary password expiration (24 hours). Removed `isFirstLogin` in favor of using only `passwordResetRequired` flag to avoid confusion.

### 1.2 Doctors Table Extensions

Add the following columns to the existing `doctors` table:

```typescript
// Add to doctors table definition
provisioned: boolean('provisioned').default(false).notNull(),
provisionedBy: text('provisioned_by').references(() => users.id, { onDelete: 'set null' }),
provisionedAt: timestamp('provisioned_at'),
```

**Rationale:** Track which doctors were created by center admins (provisioned) vs self-registered. This enables different onboarding flows.

### 1.3 New Table: user_devices

Create a new table to track user devices for security alerts:

```typescript
export const deviceTypeEnum = pgEnum('device_type', ['WEB', 'MOBILE_IOS', 'MOBILE_ANDROID']);

export const userDevices = pgTable('user_devices', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  deviceId: text('device_id').notNull(), // Client-provided UUID from localStorage (web) or device_info_plus (mobile)
  deviceName: text('device_name').notNull(), // e.g., "Chrome on Windows", "iPhone 14 Pro"
  deviceType: deviceTypeEnum('device_type').notNull(),
  userAgent: text('user_agent'), // For audit trail only, not for identity
  ipAddress: text('ip_address'), // For audit trail only, not for identity
  lastUsedAt: timestamp('last_used_at').defaultNow().notNull(),
  firstUsedAt: timestamp('first_used_at').defaultNow().notNull(),
  trusted: boolean('trusted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userDevicesRelations = relations(userDevices, ({ one }) => ({
  user: one(users, {
    fields: [userDevices.userId],
    references: [users.id],
  }),
}));
```

**Rationale:** Security requirement to detect and alert on new device logins. `deviceId` is provided by the client (UUID from localStorage for web or OS-provided device ID for mobile) rather than server-generated hash for better reliability.

### 1.4 Migration Strategy

Use Drizzle's push command (already in package.json):

```bash
npm run db:push
```

This will detect schema changes and apply them to the Neon PostgreSQL database. No manual migration files needed.

---

## 2. Doctor Account Provisioning by Center Admin

### 2.1 Backend API

**Endpoint:** `POST /api/center/doctors/provision`

**File:** `app/api/center/doctors/provision/route.ts`

**Request Body:**
```typescript
{
  name: string;
  email: string;
  phone?: string;
  category: string;
  specialization?: string;
  licenseNumber: string;
  price: number;
  consultationFee?: number;
  bio?: string;
  imageUrl?: string;
}
```

**Response:**
```typescript
{
  doctor: {
    id: string;
    userId: string;
    name: string;
    email: string;
    tempPassword: string; // Only returned once, must be securely transmitted to doctor
  };
  message: string;
}
```

**Implementation Steps:**

1. **Authentication:** Use `requireCenter()` to ensure only CENTER role can provision
2. **Get center ID:** Use `getUserCenterId(user.id)` from permissions.ts
3. **Validate email uniqueness:** Check `users` table for existing email
4. **Generate temporary password:** 
   ```typescript
   const tempPassword = crypto.randomBytes(16).toString('base64url');
   const tempPasswordExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
   ```
5. **Create user record:**
   - role: 'DOCTOR'
   - passwordResetRequired: true
   - tempPasswordExpiresAt: calculated above
   - emailVerified: false
6. **Create account record via Better Auth:**
   - Use Better Auth's internal API to create password account
   - providerId: 'credential'
   - Hash password with Better Auth's built-in hashing (bcrypt/argon2)
7. **Create doctor record:**
   - centerId: center's ID
   - userId: new user's ID
   - provisioned: true
   - provisionedBy: center admin's user ID
   - provisionedAt: now
   - active: true (center admin approves immediately)
8. **Send email verification:**
   - Create verification token in `verifications` table
   - Send email using existing `sendEmail()` utility from `lib/email.ts`
   - Email template: "Doctor Account Created"
   - Include verification link: `${baseURL}/auth/verify-email?token={token}`
   - **Error handling:** If `sendEmail()` returns false, log error and create notification for center admin (provisionedBy user) with type 'warning', title 'Doctor account created, but email failed', message to manually send credentials
9. **Return doctor and tempPassword**

**Error Handling:**
- Email already exists → 409 Conflict: "Doctor with this email already exists"
- Center not found → 404 Not Found
- Database errors → 500 Internal Server Error with logged details
- Validation errors → 400 Bad Request with field-level errors

**Security Considerations:**
- Temporary password must be transmitted securely (show once in UI, advise secure communication)
- Temporary password expires after first login (isFirstLogin flag)
- Email verification required before full access

### 2.2 Frontend: Center Admin UI

**File:** `app/center/doctors/page.tsx` (modify existing or create)

**Components:**
- **DoctorList:** Display existing doctors with "Add Doctor" button
- **ProvisionDoctorModal:** Form to collect doctor details
  - Fields: name, email, phone, category dropdown, specialization, license, price, consultation fee, bio, image upload
  - On submit: POST to `/api/center/doctors/provision`
  - On success: Display temp password in modal (one-time view), show copy button
  - Warning: "Please securely share this password with the doctor. It will not be shown again."

**Integration Pattern:**
- Follow existing center dashboard patterns (see `app/center/slots/page.tsx` structure)
- Use existing form components and validation
- Error handling with toast notifications

---

## 3. Mandatory First-Login Password Reset

### 3.1 Backend API

**Endpoint:** `POST /api/auth/change-password-first-login`

**File:** `app/api/auth/change-password-first-login/route.ts`

**Request Body:**
```typescript
{
  oldPassword: string;
  newPassword: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Implementation:**

1. **Authentication:** Use `getAuthenticatedUser()` to get current user
2. **Validate user:** Ensure user exists and `passwordResetRequired === true`
3. **Check temporary password expiration:**
   ```typescript
   if (user.tempPasswordExpiresAt && new Date() > user.tempPasswordExpiresAt) {
     return NextResponse.json(
       { error: 'Temporary password expired. Contact admin to resend.' },
       { status: 401 }
     );
   }
   ```
4. **Verify old password:**
   - Query `accounts` table for user's credential account
   - Use Better Auth's password verification utility
5. **Validate new password:**
   - Minimum 8 characters
   - At least one uppercase, one lowercase, one number
   - Must be different from old password
6. **Update password:**
   - Use Better Auth's internal API to hash and store new password
   - Update `accounts.password` field
7. **Update user flags:**
   - Set `passwordResetRequired = false`
   - Set `lastPasswordChangeAt = now`
   - Set `tempPasswordExpiresAt = null`
8. **Send confirmation email:**
   - Template: "Password Changed Successfully"
   - Include security alert: "If you didn't make this change, contact support immediately"

**Error Handling:**
- Old password incorrect → 401 Unauthorized: "Current password is incorrect"
- New password weak → 400 Bad Request: "Password does not meet requirements"
- Not first login → 403 Forbidden: "Password reset not required"
- Database error → 500 Internal Server Error

### 3.2 Middleware: First Login Interceptor

**File:** `lib/middleware/first-login-check.ts`

**Function:**
```typescript
export async function checkFirstLogin(): Promise<{
  requiresReset: boolean;
  user: AuthenticatedUser | null;
}> {
  const authContext = await getAuthenticatedUser();
  if (!authContext) {
    return { requiresReset: false, user: null };
  }

  const { user } = authContext;
  const userRecord = await db
    .select({ passwordResetRequired: users.passwordResetRequired })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (userRecord.length === 0) {
    return { requiresReset: false, user: null };
  }

  const requiresReset = userRecord[0].passwordResetRequired;
  return { requiresReset, user };
}
```

**Integration:** Call this in protected route layouts/pages for doctor role.

### 3.3 Web Frontend

**File:** `app/doctor/change-password/page.tsx`

**Component:**
- Form with fields: oldPassword (temp password), newPassword, confirmNewPassword
- Password strength indicator
- Submit button → POST to `/api/auth/change-password-first-login`
- On success → Redirect to `/doctor/dashboard`

**Forced Redirect Logic:**

First, add a Next.js middleware to inject pathname into headers:

**File:** `middleware.ts` (Next.js root)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add pathname to headers so layouts can access it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: '/doctor/:path*',
};
```

Then in the doctor layout:

**File:** `app/doctor/layout.tsx`

```typescript
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { checkFirstLogin } from '@/lib/middleware/first-login-check';

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const { requiresReset, user } = await checkFirstLogin();
  
  // Get current pathname from headers
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Allow access to change-password page, auth endpoints, and signout
  const allowedPaths = ['/doctor/change-password', '/api/auth/change-password-first-login', '/auth/signout'];
  const isAllowedPath = allowedPaths.some(path => pathname.startsWith(path));

  if (requiresReset && !isAllowedPath) {
    redirect('/doctor/change-password');
  }

  return <div>{children}</div>;
}
```

**Rationale:** Intercept all doctor routes and force redirect if password reset required. The allowedPaths array prevents infinite redirect loops.

### 3.4 Mobile Frontend

**Directory:** `mobile/lib/features/doctor/screens/`

**Files:**
- `change_password_screen.dart`: UI for password change form
- `doctor_auth_provider.dart`: Riverpod provider managing auth state

**Flow:**
1. On login success, check user's `passwordResetRequired` flag from API response
2. If true, navigate to `ChangePasswordScreen` (no back button)
3. Form fields: old password, new password, confirm password
4. On submit: POST to `/api/auth/change-password-first-login` with Bearer token
5. On success: Navigate to DoctorDashboard

**API Call Pattern:**
```dart
Future<void> changePassword(String oldPassword, String newPassword) async {
  final token = await _secureStorage.read(key: 'auth_token');
  final response = await http.post(
    Uri.parse('$baseUrl/api/auth/change-password-first-login'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
    body: jsonEncode({'oldPassword': oldPassword, 'newPassword': newPassword}),
  );
  // Handle response...
}
```

---

## 4. Google OAuth Integration

### 4.1 Backend: Better Auth Configuration

**File:** `lib/auth/server.ts` (modify only this file, not lib/auth-config.ts)

**Add Google Provider:**

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { socialProviders } from "better-auth/social-providers"; // Correct import path
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
  },
  plugins: [bearer()], // Already exists, keep as-is
  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "",
    process.env.NEXT_PUBLIC_APP_URL || "",
    "http://localhost:3000",
    "https://medcin.vercel.app"
  ].filter(Boolean),
});
```

**Environment Variables (add to `.env.local`):**
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Install Required Dependency:**
```bash
npm install google-auth-library
```

**OAuth Flow:**
1. User clicks "Continue with Google" → redirects to Google
2. Google redirects to `/api/auth/callback/google` (handled by custom route below)
3. Custom route manually links accounts or rejects
4. Session created

**Manual OAuth Account Linking:**

Better Auth does NOT automatically link OAuth accounts to existing users by email. We must implement this manually to prevent duplicate accounts and enforce doctor authorization rules.

**File:** `app/api/auth/callback/google/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { auth } from '@/lib/auth/server';
import { db } from '@/db';
import { users, accounts, doctors } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(new URL('/auth/signin?error=missing_code', req.url));
    }

    // Exchange code for Google user info
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();
    
    // Verify ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.redirect(new URL('/auth/signin?error=invalid_token', req.url));
    }

    const { email, sub: googleId, name, picture } = payload;

    // Check if user exists by email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email!))
      .limit(1);

    if (existingUser.length > 0) {
      const user = existingUser[0];

      // Doctor role check: must have doctor profile
      if (user.role === 'DOCTOR') {
        const doctorProfile = await db
          .select()
          .from(doctors)
          .where(eq(doctors.userId, user.id))
          .limit(1);

        if (doctorProfile.length === 0) {
          return NextResponse.redirect(
            new URL('/auth/signin?error=doctor_profile_missing', req.url)
          );
        }
      }

      // Check if Google account already linked
      const existingAccount = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, user.id))
        .where(eq(accounts.providerId, 'google'))
        .limit(1);

      // Link Google account to existing user if not already linked
      if (existingAccount.length === 0) {
        await db.insert(accounts).values({
          id: crypto.randomUUID(),
          accountId: googleId!,
          providerId: 'google',
          userId: user.id,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || null,
          idToken: tokens.id_token,
          accessTokenExpiresAt: tokens.expires_in 
            ? new Date(Date.now() + tokens.expires_in * 1000) 
            : null,
        });
      }

      // Update user's googleId and emailVerified
      await db
        .update(users)
        .set({ 
          googleId: googleId!,
          emailVerified: true,
          image: picture || user.image,
        })
        .where(eq(users.id, user.id));

      // Create session manually via Better Auth
      const session = await auth.api.createSession({
        userId: user.id,
        expiresIn: 60 * 60 * 24,
      });

      // Set session cookie
      const response = NextResponse.redirect(new URL('/doctor/dashboard', req.url));
      response.cookies.set('better-auth.session_token', session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
      });

      return response;
    } else {
      // New user: Doctors must be provisioned by center admin first, reject
      return NextResponse.redirect(
        new URL('/auth/signin?error=account_not_found', req.url)
      );
    }
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/auth/signin?error=oauth_failed', req.url));
  }
}
```

**Rationale:** This replaces Better Auth's default OAuth behavior with manual account linking to prevent unauthorized doctor self-registration via OAuth while allowing other roles to use Google Sign-In freely.

### 4.2 Web Frontend

**File:** Modify existing sign-in page or create `app/auth/signin/page.tsx`

**Component:**
```tsx
<button onClick={() => window.location.href = '/api/auth/signin/google'}>
  <GoogleIcon />
  Continue with Google
</button>
```

**Better Auth Client Setup:**

**File:** `lib/auth/client.ts`

```typescript
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Usage in components:
// await authClient.signIn.social({ provider: "google" });
```

### 4.3 Mobile Frontend

**Add Dependency:** `google_sign_in: ^6.1.5` to `mobile/pubspec.yaml`

**File:** `mobile/lib/services/auth_service.dart`

**Implementation:**
```dart
import 'package:google_sign_in/google_sign_in.dart';

class AuthService {
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  Future<String?> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? account = await _googleSignIn.signIn();
      if (account == null) return null; // User cancelled

      final GoogleSignInAuthentication auth = await account.authentication;
      final idToken = auth.idToken;

      // Send idToken to backend for verification and session creation
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/google/mobile'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'idToken': idToken}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final token = data['token']; // Bearer token from backend
        await _secureStorage.write(key: 'auth_token', value: token);
        return token;
      } else {
        throw Exception(jsonDecode(response.body)['error']);
      }
    } catch (e) {
      print('Google Sign-In Error: $e');
      return null;
    }
  }
}
```

**Backend Endpoint for Mobile Google Sign-In:**

**File:** `app/api/auth/google/mobile/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { auth } from '@/lib/auth/server';
import { onGoogleSignIn } from '@/lib/auth/hooks/google-doctor-link';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { email, sub: googleId, name, picture } = payload;

    // Check doctor-specific rules
    const { allowed, error } = await onGoogleSignIn(email!, googleId!);
    if (!allowed) {
      return NextResponse.json({ error }, { status: 403 });
    }

    // Link or create account via Better Auth
    // Use Better Auth's internal API to create session
    const session = await auth.api.signIn.social({
      provider: 'google',
      account: { providerId: 'google', accountId: googleId!, email, name, picture },
    });

    // Return bearer token for mobile
    return NextResponse.json({ token: session.token });
  } catch (error) {
    console.error('Google mobile sign-in error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
```

**Dependencies:** Add `google-auth-library` to `package.json`:
```bash
npm install google-auth-library
```

---

## 5. Device Tracking & Security Alerts

### 5.1 Device ID Management

**Web Client Device ID:**

**File:** `lib/device-id.ts` (NEW FILE)

```typescript
export function getOrCreateDeviceId(): string {
  const key = 'medcin_device_id';
  let deviceId = localStorage.getItem(key);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(key, deviceId);
  }
  return deviceId;
}

export function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome Browser';
  if (ua.includes('Firefox')) return 'Firefox Browser';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari Browser';
  if (ua.includes('Edge')) return 'Edge Browser';
  return 'Web Browser';
}
```

**Rationale:** Client-side UUID stored in localStorage is more reliable than server-side fingerprinting. User-Agent + IP hash is bypassable and creates false positives (VPN/NAT changes, browser updates).

**Device Tracking Function:**

**File:** `lib/middleware/device-tracking.ts`

```typescript
import { headers } from 'next/headers';
import { db } from '@/db';
import { userDevices } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function trackDevice(userId: string): Promise<{
  isNewDevice: boolean;
  deviceId: string;
}> {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || 'Unknown';
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || 
                   headersList.get('x-real-ip') || 'Unknown';
  
  // For mobile: expect 'X-Device-ID' header sent by app
  // For web: expect 'X-Device-ID' header from client-side JavaScript
  const deviceId = headersList.get('x-device-id');
  const deviceName = headersList.get('x-device-name') || detectDeviceName(userAgent);
  
  if (!deviceId) {
    throw new Error('Device ID is required in X-Device-ID header');
  }

  // Validate device ID format (must be UUID)
  if (!deviceId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    throw new Error('Invalid device ID format');
  }

  // Check if device exists
  const existingDevice = await db
    .select()
    .from(userDevices)
    .where(and(eq(userDevices.userId, userId), eq(userDevices.deviceId, deviceId)))
    .limit(1);

  if (existingDevice.length > 0) {
    // Update last used time and IP (for audit trail only)
    await db
      .update(userDevices)
      .set({ lastUsedAt: new Date(), ipAddress })
      .where(eq(userDevices.id, existingDevice[0].id));
    
    return { isNewDevice: false, deviceId };
  }

  // New device: create record
  const deviceType = detectDeviceType(userAgent);

  await db.insert(userDevices).values({
    userId,
    deviceId,
    deviceName,
    deviceType,
    userAgent,
    ipAddress,
    trusted: false, // Require explicit trust via OTP
  });

  return { isNewDevice: true, deviceId };
}

function detectDeviceType(userAgent: string): 'WEB' | 'MOBILE_IOS' | 'MOBILE_ANDROID' {
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'MOBILE_IOS';
  if (userAgent.includes('Android')) return 'MOBILE_ANDROID';
  return 'WEB';
}

function detectDeviceName(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome Browser';
  if (userAgent.includes('Firefox')) return 'Firefox Browser';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari Browser';
  if (userAgent.includes('Edge')) return 'Edge Browser';
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Android')) return 'Android Device';
  return 'Unknown Device';
}
```

### 5.2 Login Endpoint with Device Tracking

**File:** Wrap Better Auth's sign-in in middleware

**File:** `app/api/auth/signin/email/route.ts` (override Better Auth's default)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { trackDevice } from '@/lib/middleware/device-tracking';
import { sendNewDeviceAlertEmail } from '@/lib/email';
import { db } from '@/db';
import { verifications } from '@/db/schema';
import crypto from 'crypto';

const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || '6');
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');

export async function POST(req: NextRequest) {
  // Let Better Auth handle authentication
  const response = await auth.api.handler(req);
  
  // After successful login, track device
  const session = await auth.api.getSession({ headers: req.headers });
  if (session?.user) {
    try {
      const { isNewDevice, deviceId } = await trackDevice(session.user.id);
      
      if (isNewDevice) {
        // Generate 6-digit OTP
        const otpMin = Math.pow(10, OTP_LENGTH - 1);
        const otpMax = Math.pow(10, OTP_LENGTH) - 1;
        const otp = Math.floor(otpMin + Math.random() * (otpMax - otpMin + 1)).toString();
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

        // Store in verifications table
        await db.insert(verifications).values({
          id: crypto.randomUUID(),
          identifier: `device-verify:${deviceId}`,
          value: hashedOTP,
          expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
        });

        // Send security alert email with OTP
        await sendNewDeviceAlertEmail(session.user.email, session.user.name, deviceId, otp);
        
        // Return flag to frontend to show OTP verification modal
        return NextResponse.json({
          ...(await response.json()),
          requiresDeviceVerification: true,
          deviceId,
        });
      }
    } catch (error) {
      console.error('Device tracking error:', error);
      // Continue with login even if device tracking fails
    }
  }

  return response;
}
```

### 5.3 Device Verification OTP

**Endpoint:** `POST /api/auth/verify-device`

**File:** `app/api/auth/verify-device/route.ts`

**Request Body:**
```typescript
{
  deviceId: string;
  otp: string;
}
```

**Implementation:**

1. **Authentication:** Ensure user is logged in via `getAuthenticatedUser()`
2. **Rate limiting:** Track OTP attempts per deviceId (3 attempts max)
3. **Fetch stored OTP:** Query `verifications` table where identifier = `device-verify:${deviceId}`
4. **Verify OTP:** Compare submitted OTP (hashed) with stored hash
5. **Check expiration:** Ensure not expired
6. **Mark device as trusted:**
   ```typescript
   await db
     .update(userDevices)
     .set({ trusted: true })
     .where(and(eq(userDevices.deviceId, deviceId), eq(userDevices.userId, userId)));
   ```
7. **Delete verification:** Clean up used OTP from table

**Rate Limiting Implementation:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware/permissions';
import { db } from '@/db';
import { userDevices, verifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

// In-memory rate limiting (consider Redis for production)
const otpAttempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  const authContext = await getAuthenticatedUser();
  if (!authContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { user } = authContext;
  const { deviceId, otp } = await req.json();

  // Rate limiting: 3 attempts per device
  const now = Date.now();
  const attempts = otpAttempts.get(deviceId);
  
  if (attempts) {
    if (now < attempts.resetAt) {
      if (attempts.count >= 3) {
        return NextResponse.json(
          { error: 'Too many attempts. Please request a new verification code.' },
          { status: 429 }
        );
      }
      attempts.count++;
    } else {
      // Reset window expired
      otpAttempts.set(deviceId, { count: 1, resetAt: now + 10 * 60 * 1000 });
    }
  } else {
    otpAttempts.set(deviceId, { count: 1, resetAt: now + 10 * 60 * 1000 });
  }

  // Fetch stored OTP
  const storedVerification = await db
    .select()
    .from(verifications)
    .where(eq(verifications.identifier, `device-verify:${deviceId}`))
    .limit(1);

  if (storedVerification.length === 0) {
    return NextResponse.json({ error: 'Verification code not found or expired' }, { status: 404 });
  }

  const verification = storedVerification[0];

  // Check expiration
  if (new Date() > verification.expiresAt) {
    await db.delete(verifications).where(eq(verifications.id, verification.id));
    return NextResponse.json({ error: 'Verification code expired. Please request a new one.' }, { status: 401 });
  }

  // Verify OTP
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  if (hashedOTP !== verification.value) {
    return NextResponse.json({ error: 'Invalid verification code.' }, { status: 401 });
  }

  // Mark device as trusted
  await db
    .update(userDevices)
    .set({ trusted: true })
    .where(and(eq(userDevices.deviceId, deviceId), eq(userDevices.userId, user.id)));

  // Delete verification
  await db.delete(verifications).where(eq(verifications.id, verification.id));

  // Clear rate limit attempts on success
  otpAttempts.delete(deviceId);

  return NextResponse.json({ success: true, message: 'Device verified successfully' });
}
```

**Error Handling:**
- OTP expired → 401: "Verification code expired. Please request a new one."
- OTP incorrect → 401: "Invalid verification code."
- Device not found → 404: "Device not found."
- Too many attempts → 429: "Too many attempts. Please request a new verification code."

### 5.4 Email Template

**File:** `lib/email.ts`

**Add Function:**
```typescript
export async function sendNewDeviceAlertEmail(
  userEmail: string,
  userName: string,
  deviceId: string,
  otp: string
): Promise<boolean> {
  const subject = '🔐 Security Alert: New Device Login';
  const text = `
Dear ${userName},

We detected a login to your account from a new device.

Device ID: ${deviceId}
Time: ${new Date().toLocaleString()}

If this was you, please verify this device using the code below:

Verification Code: ${otp}

This code expires in 10 minutes.

If you did not attempt this login, please:
1. Change your password immediately
2. Contact our support team at support@medcin.health

Best regards,
The Medcin Security Team
  `.trim();

  // HTML version similar to existing email templates...

  return sendEmail({ to: userEmail, subject, text });
}
```

### 5.5 Mobile Integration

**Mobile App Header:**

In all API requests, include device identifier:

```dart
final deviceId = await getDeviceId(); // From device_info_plus package
final deviceName = await getDeviceName();

final response = await http.post(
  uri,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
    'X-Device-ID': deviceId,
    'X-Device-Name': deviceName,
  },
  body: body,
);
```

**Device ID Generation (Mobile):**
```dart
import 'package:device_info_plus/device_info_plus.dart';
import 'dart:io';

Future<String> getDeviceId() async {
  final deviceInfo = DeviceInfoPlugin();
  if (Platform.isAndroid) {
    final androidInfo = await deviceInfo.androidInfo;
    return androidInfo.androidId ?? 'unknown'; // Correct property name
  } else if (Platform.isIOS) {
    final iosInfo = await deviceInfo.iosInfo;
    return iosInfo.identifierForVendor ?? 'unknown';
  }
  return 'unknown';
}

Future<String> getDeviceName() async {
  final deviceInfo = DeviceInfoPlugin();
  if (Platform.isAndroid) {
    final androidInfo = await deviceInfo.androidInfo;
    return '${androidInfo.brand} ${androidInfo.model}';
  } else if (Platform.isIOS) {
    final iosInfo = await deviceInfo.iosInfo;
    return '${iosInfo.name} (${iosInfo.model})';
  }
  return 'Unknown Device';
}
```

**Add to pubspec.yaml:** `device_info_plus: ^10.0.0`

**Web Client Integration:**

For web, inject device ID on every authenticated request:

```typescript
// In fetch wrapper or API client
import { getOrCreateDeviceId, getDeviceName } from '@/lib/device-id';

async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const deviceId = getOrCreateDeviceId();
  const deviceName = getDeviceName();
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-Device-ID': deviceId,
      'X-Device-Name': deviceName,
    },
  });
}
```

---

## 6. Patient Check-In/Check-Out System

### 6.1 Backend APIs

#### 6.1.1 Doctor Check-In Patient

**Endpoint:** `POST /api/doctor/checkin`

**File:** `app/api/doctor/checkin/route.ts`

**Request Body:**
```typescript
{
  bookingId: string;
}
```

**Response:**
```typescript
{
  booking: Booking;
  message: string;
}
```

**Implementation:**

1. **Authentication:** `requireDoctor()` from permissions.ts
2. **Get doctor profile:**
   ```typescript
   const doctorProfile = await db
     .select()
     .from(doctors)
     .where(eq(doctors.userId, user.id))
     .limit(1);
   
   if (doctorProfile.length === 0) {
     return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });
   }
   ```
3. **Validate booking:**
   - Exists
   - Status is CONFIRMED
   - Belongs to this doctor (`booking.doctorId === doctorProfile.id`)
   - Not already checked in (`booking.checkedInAt === null`)
4. **Validate booking date and time:**
   ```typescript
   const bookingDate = new Date(booking.date);
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   bookingDate.setHours(0, 0, 0, 0);

   if (bookingDate.getTime() !== today.getTime()) {
     return NextResponse.json(
       { error: 'Can only check in patients for today\'s appointments' },
       { status: 400 }
     );
   }

   // Optional: Check time window (within 2 hours of appointment)
   const [hours, minutes] = booking.time.split(':').map(Number);
   const appointmentTime = new Date();
   appointmentTime.setHours(hours, minutes, 0, 0);
   const now = new Date();
   const timeDiffMinutes = (now.getTime() - appointmentTime.getTime()) / (1000 * 60);

   if (timeDiffMinutes < -120 || timeDiffMinutes > 120) {
     return NextResponse.json(
       { error: 'Check-in only allowed within 2 hours of appointment time' },
       { status: 400 }
     );
   }
   ```
5. **Update booking:**
   ```typescript
   await db
     .update(bookings)
     .set({
       checkedInAt: new Date(),
       checkedInBy: user.id,
       status: 'CONFIRMED', // or create new status 'IN_PROGRESS'
     })
     .where(eq(bookings.id, bookingId));
   ```
6. **Return updated booking**

**Error Handling:**
- Booking not found → 404
- Not doctor's booking → 403 Forbidden
- Already checked in → 400 Bad Request
- Wrong status → 400 Bad Request
- Wrong date → 400 Bad Request: "Can only check in patients for today's appointments"
- Wrong time → 400 Bad Request: "Check-in only allowed within 2 hours of appointment time"

#### 6.1.2 Doctor Check-Out Patient (with Commission Calculation)

**Endpoint:** `POST /api/doctor/checkout`

**File:** `app/api/doctor/checkout/route.ts`

**Request Body:**
```typescript
{
  bookingId: string;
  actualPrice?: number; // Optional: if price changed at clinic
}
```

**Response:**
```typescript
{
  booking: Booking;
  commission: {
    commissionAmount: number;
    centerEarnings: number;
    commissionRate: number;
    commissionType: 'PERCENTAGE' | 'FIXED';
  };
  message: string;
}
```

**Commission Model Clarification:**

**IMPORTANT:** The commission model is: **Platform takes commission, center keeps remainder**

- Booking price: $100
- Commission rate: 15% (set by admin)
- Commission to platform: $15
- Center receives: $85

This assumes the admin is setting the platform's commission rate on each center, not the commission the center receives. If the requirement means "commission FOR the centre" (center receives commission from doctor's services), the formula would be inverted. **The current implementation uses the platform-takes-commission model.**

**Implementation:**

1. **Authentication:** `requireDoctor()`
2. **Get doctor profile and center:**
   ```typescript
   const doctorProfile = await db
     .select()
     .from(doctors)
     .where(eq(doctors.userId, user.id))
     .limit(1);

   if (doctorProfile.length === 0) {
     return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });
   }

   const center = await db
     .select()
     .from(centers)
     .where(eq(centers.id, doctorProfile[0].centerId!))
     .limit(1);
   
   if (center.length === 0) {
     return NextResponse.json({ error: 'Center configuration error' }, { status: 500 });
   }
   ```
3. **Validate booking:**
   - Exists
   - Belongs to doctor
   - Checked in (`checkedInAt !== null`)
   - Not already checked out (`checkedOutAt === null`)
4. **Calculate commission:**
   ```typescript
   const finalPrice = actualPrice || booking.price;
   const centerData = center[0];
   
   let commissionAmount: number;
   // Platform takes commission FROM the booking price
   if (centerData.commissionType === 'PERCENTAGE') {
     commissionAmount = (finalPrice * (centerData.commissionRate || 0)) / 100;
   } else {
     commissionAmount = centerData.fixedCommissionAmount || 0;
   }
   
   // Center receives the remainder after platform commission is deducted
   const centerEarnings = finalPrice - commissionAmount;
   ```
5. **Update booking:**
   ```typescript
   await db
     .update(bookings)
     .set({
       checkedOutAt: new Date(),
       checkedOutBy: user.id,
       status: 'COMPLETED',
       price: finalPrice,
       commissionAmount,
       centerEarnings,
       commissionStatus: 'CALCULATED',
     })
     .where(eq(bookings.id, bookingId));
   ```
6. **Send notification to center admin:**
   - Create notification in `notifications` table
   - Email: "Booking completed, commission: SGD X.XX"
7. **Return booking with commission details**

**Error Handling:**
- Not checked in → 400: "Patient must be checked in first"
- Already checked out → 400: "Already checked out"
- Center not found → 500: "Center configuration error"

#### 6.1.3 Get Doctor's Bookings

**Endpoint:** `GET /api/doctor/bookings`

**File:** `app/api/doctor/bookings/route.ts`

**Query Params:**
- `status`: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' (optional)
- `date`: YYYY-MM-DD (optional, filter by date)

**Response:**
```typescript
{
  bookings: Array<Booking & { patient: PatientProfile; service: Service }>;
  count: number;
}
```

**Implementation:**

1. **Authentication:** `requireDoctor()`
2. **Get doctor profile ID**
3. **Query bookings with joins:**
   ```typescript
   const conditions = [eq(bookings.doctorId, doctorId)];
   if (status) conditions.push(eq(bookings.status, status));
   if (date) conditions.push(eq(bookings.date, date));

   const result = await db
     .select({
       booking: bookings,
       patient: patientProfiles,
       service: services,
     })
     .from(bookings)
     .leftJoin(patientProfiles, eq(bookings.patientId, patientProfiles.id))
     .leftJoin(services, eq(bookings.serviceId, services.id))
     .where(and(...conditions))
     .orderBy(bookings.date, bookings.time);
   ```

#### 6.1.4 Center Admin Check-In/Out (Alternative Access)

**Endpoints:**
- `POST /api/center/checkin`
- `POST /api/center/checkout`

**Files:**
- `app/api/center/checkin/route.ts`
- `app/api/center/checkout/route.ts`

**Implementation for Check-In:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireCenter, getUserCenterId } from '@/lib/middleware/permissions';
import { db } from '@/db';
import { bookings, doctors } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const result = await requireCenter();
  if ('error' in result) return result.error;

  const { context } = result;
  const centerId = await getUserCenterId(context.user.id);
  
  if (!centerId) {
    return NextResponse.json({ error: 'Center not found' }, { status: 404 });
  }

  const { bookingId } = await req.json();

  // Fetch booking
  const booking = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (booking.length === 0) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const bookingData = booking[0];

  // Verify booking belongs to center's doctor
  const doctor = await db
    .select()
    .from(doctors)
    .where(eq(doctors.id, bookingData.doctorId))
    .limit(1);

  if (doctor.length === 0) {
    return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
  }

  if (doctor[0].centerId !== centerId) {
    return NextResponse.json({ error: 'Forbidden: Booking does not belong to your center' }, { status: 403 });
  }

  // Same validation as doctor check-in
  if (bookingData.status !== 'CONFIRMED') {
    return NextResponse.json({ error: 'Booking status must be CONFIRMED' }, { status: 400 });
  }

  if (bookingData.checkedInAt) {
    return NextResponse.json({ error: 'Patient already checked in' }, { status: 400 });
  }

  // Validate booking date is today
  const bookingDate = new Date(bookingData.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  bookingDate.setHours(0, 0, 0, 0);

  if (bookingDate.getTime() !== today.getTime()) {
    return NextResponse.json(
      { error: 'Can only check in patients for today\'s appointments' },
      { status: 400 }
    );
  }

  // Update booking
  await db
    .update(bookings)
    .set({
      checkedInAt: new Date(),
      checkedInBy: context.user.id,
      status: 'CONFIRMED',
    })
    .where(eq(bookings.id, bookingId));

  return NextResponse.json({ success: true, message: 'Patient checked in successfully' });
}
```

**Implementation for Check-Out:**

Similar to check-in but includes commission calculation (reuse the same logic from doctor checkout):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireCenter, getUserCenterId } from '@/lib/middleware/permissions';
import { db } from '@/db';
import { bookings, doctors, centers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { calculateCommission } from '@/lib/utils/commission';

export async function POST(req: NextRequest) {
  const result = await requireCenter();
  if ('error' in result) return result.error;

  const { context } = result;
  const centerId = await getUserCenterId(context.user.id);
  
  if (!centerId) {
    return NextResponse.json({ error: 'Center not found' }, { status: 404 });
  }

  const { bookingId, actualPrice } = await req.json();

  // Fetch booking
  const booking = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (booking.length === 0) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const bookingData = booking[0];

  // Verify booking belongs to center's doctor
  const doctor = await db
    .select()
    .from(doctors)
    .where(eq(doctors.id, bookingData.doctorId))
    .limit(1);

  if (doctor.length === 0 || doctor[0].centerId !== centerId) {
    return NextResponse.json({ error: 'Forbidden: Booking does not belong to your center' }, { status: 403 });
  }

  // Validation
  if (!bookingData.checkedInAt) {
    return NextResponse.json({ error: 'Patient must be checked in first' }, { status: 400 });
  }

  if (bookingData.checkedOutAt) {
    return NextResponse.json({ error: 'Patient already checked out' }, { status: 400 });
  }

  // Get center data for commission
  const centerData = await db
    .select()
    .from(centers)
    .where(eq(centers.id, centerId))
    .limit(1);

  if (centerData.length === 0) {
    return NextResponse.json({ error: 'Center configuration error' }, { status: 500 });
  }

  // Calculate commission
  const { commissionAmount, centerEarnings } = calculateCommission(
    actualPrice || bookingData.price,
    centerData[0]
  );

  // Update booking
  await db
    .update(bookings)
    .set({
      checkedOutAt: new Date(),
      checkedOutBy: context.user.id,
      status: 'COMPLETED',
      price: actualPrice || bookingData.price,
      commissionAmount,
      centerEarnings,
      commissionStatus: 'CALCULATED',
    })
    .where(eq(bookings.id, bookingId));

  return NextResponse.json({
    success: true,
    message: 'Patient checked out successfully',
    commission: { commissionAmount, centerEarnings },
  });
}
```

### 6.2 Web Frontend: Doctor Dashboard

**Directory:** `app/doctor/` (create)

**Files:**
- `app/doctor/layout.tsx`: Layout with first-login check
- `app/doctor/page.tsx`: Dashboard overview
- `app/doctor/bookings/page.tsx`: Bookings list with check-in/out

#### 6.2.1 Doctor Dashboard Page

**File:** `app/doctor/page.tsx`

```tsx
import { requireDoctor } from '@/lib/middleware/permissions';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { doctors, bookings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export default async function DoctorDashboard() {
  const result = await requireDoctor();
  if ('error' in result) redirect('/auth/signin');

  const { context } = result;
  
  // Verify doctor profile exists
  const doctorProfile = await db
    .select()
    .from(doctors)
    .where(eq(doctors.userId, context.user.id))
    .limit(1);

  if (doctorProfile.length === 0) {
    redirect('/doctor/setup-profile'); // Or show error page
  }

  const doctorId = doctorProfile[0].id;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Fetch stats: today's bookings, pending check-ins, completed today
  const [todayBookings, pendingCheckIns, completedToday] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(and(eq(bookings.doctorId, doctorId), eq(bookings.date, today))),
    db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.doctorId, doctorId),
          eq(bookings.status, 'CONFIRMED'),
          sql`${bookings.checkedInAt} IS NULL`
        )
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.doctorId, doctorId),
          eq(bookings.date, today),
          eq(bookings.status, 'COMPLETED')
        )
      ),
  ]);
  
  return (
    <div>
      <h1>Welcome, Dr. {context.user.name}</h1>
      <div className="stats-grid">
        <StatCard title="Today's Appointments" count={todayBookings[0].count} />
        <StatCard title="Pending Check-ins" count={pendingCheckIns[0].count} />
        <StatCard title="Completed Today" count={completedToday[0].count} />
      </div>
      <Link href="/doctor/bookings">View All Bookings</Link>
    </div>
  );
}
```

#### 6.2.2 Bookings Management Page

**File:** `app/doctor/bookings/page.tsx`

**Components:**
- **BookingsList:** Table with columns: Patient Name, Service, Date, Time, Status, Actions
- **Actions:**
  - If status=CONFIRMED and not checked in: "Check In" button
  - If checked in and not checked out: "Check Out" button
  - Completed: View details

**Check-In Button Handler:**
```typescript
async function handleCheckIn(bookingId: string) {
  const response = await fetch('/api/doctor/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId }),
  });

  if (response.ok) {
    toast.success('Patient checked in successfully');
    router.refresh();
  } else {
    const error = await response.json();
    toast.error(error.error);
  }
}
```

**Check-Out Modal:**
- Shows booking details
- Optional field: Actual price (if different from booked price)
- Displays commission calculation preview
- Confirm button → POST to `/api/doctor/checkout`

### 6.3 Mobile Frontend: Doctor Module

**Directory:** `mobile/lib/features/doctor/`

**Files:**
- `screens/doctor_dashboard_screen.dart`
- `screens/bookings_list_screen.dart`
- `screens/booking_detail_screen.dart`
- `widgets/booking_card.dart`
- `providers/doctor_booking_provider.dart`

#### 6.3.1 Doctor Dashboard Screen

```dart
class DoctorDashboardScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookings = ref.watch(doctorBookingsProvider);

    return Scaffold(
      appBar: AppBar(title: Text('Doctor Dashboard')),
      body: Column(
        children: [
          StatsCard(title: 'Today\'s Appointments', count: bookings.todayCount),
          StatsCard(title: 'Pending Check-ins', count: bookings.pendingCheckIns),
          ElevatedButton(
            onPressed: () => Navigator.push(/* BookingsListScreen */),
            child: Text('View All Bookings'),
          ),
        ],
      ),
    );
  }
}
```

#### 6.3.2 Booking Card with Check-In/Out Actions

```dart
class BookingCard extends StatelessWidget {
  final Booking booking;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
          Text(booking.patientName),
          Text('${booking.date} at ${booking.time}'),
          Text('Status: ${booking.status}'),
          if (booking.status == 'CONFIRMED' && booking.checkedInAt == null)
            ElevatedButton(
              onPressed: () => _checkIn(context),
              child: Text('Check In'),
            ),
          if (booking.checkedInAt != null && booking.checkedOutAt == null)
            ElevatedButton(
              onPressed: () => _checkOut(context),
              child: Text('Check Out'),
            ),
        ],
      ),
    );
  }

  Future<void> _checkIn(BuildContext context) async {
    final token = await getAuthToken();
    final response = await http.post(
      Uri.parse('$baseUrl/api/doctor/checkin'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'bookingId': booking.id}),
    );

    if (response.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Patient checked in successfully')),
      );
      // Refresh bookings
    }
  }

  Future<void> _checkOut(BuildContext context) async {
    // Show modal to confirm actual price
    final actualPrice = await showDialog<double>(
      context: context,
      builder: (context) => CheckOutDialog(originalPrice: booking.price),
    );

    if (actualPrice == null) return;

    final token = await getAuthToken();
    final response = await http.post(
      Uri.parse('$baseUrl/api/doctor/checkout'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'bookingId': booking.id, 'actualPrice': actualPrice}),
    );

    if (response.statusCode == 200) {
      final result = jsonDecode(response.body);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Checked out. Commission: SGD ${result['commission']['commissionAmount']}')),
      );
      // Refresh bookings
    }
  }
}
```

---

## 7. Admin Commission Management

### 7.1 Backend API

**Endpoint:** `POST /api/admin/centers/commission`

**File:** `app/api/admin/centers/commission/route.ts`

**Request Body:**
```typescript
{
  centerId: string;
  commissionType: 'PERCENTAGE' | 'FIXED';
  commissionRate?: number; // For PERCENTAGE type
  fixedCommissionAmount?: number; // For FIXED type
}
```

**Implementation:**

1. **Authentication:** `requireAdmin()`
2. **Validate input:**
   - If PERCENTAGE: ensure commissionRate is 0-100
   - If FIXED: ensure fixedCommissionAmount is positive
3. **Update center:**
   ```typescript
   await db
     .update(centers)
     .set({
       commissionType,
       commissionRate: commissionType === 'PERCENTAGE' ? commissionRate : null,
       fixedCommissionAmount: commissionType === 'FIXED' ? fixedCommissionAmount : null,
     })
     .where(eq(centers.id, centerId));
   ```
4. **Send email to center admin:** Notify of commission change

### 7.2 Admin UI

**File:** `app/admin/centers/[id]/page.tsx`

**Component:**
- Form with radio buttons: PERCENTAGE or FIXED
- If PERCENTAGE: number input for rate (0-100)
- If FIXED: number input for amount
- Submit button → POST to `/api/admin/centers/commission`

---

## 8. Independent Doctor Registration

### 8.1 Backend API

**Endpoint:** `POST /api/doctors/register`

**File:** `app/api/doctors/register/route.ts`

**Request Body:**
```typescript
{
  name: string;
  email: string;
  password: string;
  phone?: string;
  category: string;
  specialization?: string;
  licenseNumber: string;
  price: number;
  consultationFee?: number;
  bio?: string;
}
```

**Response:**
```typescript
{
  doctor: { id: string; name: string; email: string };
  message: string;
}
```

**Implementation:**

1. **Validate email uniqueness**
   ```typescript
   const existingUser = await db
     .select()
     .from(users)
     .where(eq(users.email, email))
     .limit(1);
   
   if (existingUser.length > 0) {
     return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
   }
   ```
2. **Validate license number uniqueness**
   ```typescript
   const existingLicense = await db
     .select()
     .from(doctors)
     .where(eq(doctors.licenseNumber, licenseNumber))
     .limit(1);

   if (existingLicense.length > 0) {
     return NextResponse.json(
       { error: 'License number already registered' },
       { status: 409 }
     );
   }
   ```
3. **Create user:**
   - role: 'DOCTOR'
   - emailVerified: false
   - passwordResetRequired: true (requires password reset on first login)
4. **Create account via Better Auth:** Hash password
5. **Create doctor profile:**
   - centerId: null
   - isIndependent: true
   - active: false (requires admin approval)
   - provisioned: false
6. **Send verification email**
7. **Notify admins:** Email to admins with link to review doctor

**Error Handling:**
- Email exists → 409 Conflict
- Validation errors → 400 Bad Request

### 8.2 Frontend: Doctor Signup Page

**File:** `app/signup/doctor/page.tsx`

**Form Fields:**
- Personal: name, email, password, phone
- Professional: category dropdown, specialization, license number
- Pricing: consultation fee, per-service price
- Bio (optional)

**Submit:**
```typescript
const response = await fetch('/api/doctors/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
});

if (response.ok) {
  router.push('/auth/verify-email-sent');
}
```

---

## 9. Security Considerations

### 9.1 Password Security

- **Hashing:** Better Auth uses bcrypt/argon2 automatically via the `emailAndPassword` plugin
- **Temp Passwords:** Must be strong (16 bytes base64url = ~22 chars)
- **Reset Enforcement:** `isFirstLogin` flag prevents any dashboard access until password changed

### 9.2 OAuth Security

- **Token Verification:** Mobile Google Sign-In uses `google-auth-library` to verify ID tokens server-side
- **Account Linking:** Prevent duplicate accounts by checking email before creating new user
- **Scope Limitation:** Only request `email` and `profile` scopes

### 9.3 Device Tracking

- **Fingerprinting:** SHA-256 hash of User-Agent + IP ensures consistent device ID without storing raw data
- **OTP Verification:** 6-digit OTP expires in 10 minutes, hashed in database
- **Trusted Devices:** After verification, device marked as trusted (no OTP on subsequent logins)

### 9.4 API Authorization

- **Role Checks:** All endpoints use `requireDoctor()`, `requireCenter()`, or `requireAdmin()` from permissions.ts
- **Resource Ownership:** Check `booking.doctorId === doctorProfile.id` before allowing check-in/out
- **Bearer Tokens:** Mobile uses `Authorization: Bearer <token>` header, validated by Better Auth's bearer plugin

### 9.5 Rate Limiting

**Recommendation:** Add rate limiting to sensitive endpoints:
- `/api/auth/signin/email`: 5 attempts per 15 minutes per IP
- `/api/auth/verify-device`: 3 attempts per 10 minutes per device
- `/api/center/doctors/provision`: 10 creations per hour per center

**Implementation:** Use `next-rate-limit` or similar middleware (not detailed here, future enhancement).

---

## 10. Data Validation

### 10.1 Centralized Validation Schemas

**File:** `lib/validations/doctor.ts` (NEW FILE)

```typescript
import { z } from 'zod';

export const provisionDoctorSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  category: z.string().min(1),
  specialization: z.string().optional(),
  licenseNumber: z.string().min(5),
  price: z.number().positive(),
  consultationFee: z.number().positive().optional(),
  bio: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
});

export const checkInSchema = z.object({
  bookingId: z.string().uuid(),
});

export const checkOutSchema = z.object({
  bookingId: z.string().uuid(),
  actualPrice: z.number().positive().optional(),
});

export const commissionSchema = z.object({
  centerId: z.string().uuid(),
  commissionType: z.enum(['PERCENTAGE', 'FIXED']),
  commissionRate: z.number().min(0).max(100).optional(),
  fixedCommissionAmount: z.number().positive().optional(),
}).refine(
  (data) => {
    if (data.commissionType === 'PERCENTAGE') return data.commissionRate !== undefined;
    if (data.commissionType === 'FIXED') return data.fixedCommissionAmount !== undefined;
    return false;
  },
  { message: 'Must provide commissionRate for PERCENTAGE or fixedCommissionAmount for FIXED' }
);
```

### 10.2 Input Validation Pattern

Use Zod schemas from centralized file in all API endpoints:

**Example:** Doctor provisioning

```typescript
import { provisionDoctorSchema } from '@/lib/validations/doctor';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validation = provisionDoctorSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.errors },
      { status: 400 }
    );
  }

  const data = validation.data;
  // Proceed with provisioning...
}
```

### 10.3 Password Validation

```typescript
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');
```

---

## 11. Testing Strategy

### 11.1 Unit Tests

**Backend:**
- `lib/middleware/device-tracking.test.ts`: Test generateDeviceId(), trackDevice()
- `lib/auth/hooks/google-doctor-link.test.ts`: Test account linking logic

**Frontend:**
- Component tests for ProvisionDoctorModal, CheckInButton, CheckOutModal

### 11.2 Integration Tests

**API Route Tests:**
- POST /api/center/doctors/provision: Create doctor, verify email sent, check database
- POST /api/doctor/checkin: Check-in valid booking, reject invalid
- POST /api/doctor/checkout: Calculate commission correctly

**Test Framework:** Vitest or Jest with `@testing-library/react` for components, `node-mocks-http` for API routes.

### 11.3 Manual Testing Checklist

**Doctor Provisioning:**
1. Center admin creates doctor → verify email sent
2. Doctor receives temp password → can log in
3. Forced to change password → access granted after change

**Google OAuth:**
1. New user tries Google Sign-In → rejected (not provisioned)
2. Provisioned doctor uses Google Sign-In → account linked successfully
3. Subsequent logins → no password needed

**Device Tracking:**
1. Login from known device → no alert
2. Login from new device → email alert sent, OTP required
3. Enter correct OTP → device trusted
4. Future logins from trusted device → no OTP

**Check-In/Out:**
1. Doctor checks in patient → `checkedInAt` populated
2. Doctor checks out → commission calculated correctly (test both PERCENTAGE and FIXED)
3. Center admin can also check in/out their center's bookings

---

## 12. Implementation Order

To minimize blocking dependencies, implement in this order:

### Phase 1: Database & Core Auth (1.5 weeks)
1. **Schema changes:** Add columns to `users`, `doctors`; create `user_devices` table → `npm run db:push`
2. **Google OAuth:** Add to Better Auth config, install google-auth-library, create callback route
3. **Device tracking middleware:** Implement client-side device ID and tracking functions
4. **First-login password reset:** Backend API and middleware

### Phase 2: Doctor Provisioning (1.5 weeks)
5. **Provisioning API:** POST /api/center/doctors/provision with email failure handling
6. **Email templates:** Doctor account creation, verification, new device alerts
7. **Center admin UI:** Provision doctor form and temp password display
8. **Validation schemas:** Create lib/validations/doctor.ts with centralized Zod schemas

### Phase 3: Web Frontend (1 week)
9. **Doctor dashboard layout:** First-login check with middleware, password change page
10. **Google Sign-In button:** Add to login page
11. **Device verification UI:** OTP modal on new device login with rate limiting
12. **Device ID generation:** Implement lib/device-id.ts for web

### Phase 4: Check-In System (1.5 weeks)
13. **Doctor APIs:** POST /api/doctor/checkin (with date/time validation), /checkout, GET /api/doctor/bookings
14. **Center APIs:** POST /api/center/checkin, /checkout (complete implementation)
15. **Commission calculation:** Create lib/utils/commission.ts utility
16. **Doctor bookings page:** Web UI with check-in/out buttons

### Phase 5: Admin Features (1 week)
17. **Commission management API:** POST /api/admin/centers/commission
18. **Admin UI:** Center commission settings page
19. **Independent doctor registration:** POST /api/doctors/register with license validation, signup page

### Phase 6: Mobile Integration (2 weeks)
20. **Flutter Google Sign-In:** Implement authService.signInWithGoogle() with token verification
21. **Device tracking:** Send X-Device-ID and X-Device-Name headers, fix androidId usage
22. **Doctor dashboard screens:** Dashboard with stats, bookings list, check-in/out
23. **First-login flow:** Change password screen

### Phase 7: Testing & Polish (1 week)
24. **Unit tests:** Device tracking, commission calculation, validation schemas
25. **Integration tests:** Key API routes (provision, checkin, checkout)
26. **Manual testing:** Full flows end-to-end including new device OTP flow
27. **Documentation:** API docs, admin guide, doctor onboarding

**Total Estimated Timeline:** 8 weeks with 1-2 full-stack developers

---

## 13. File Structure Summary

### New Files to Create

**Backend:**
```
app/api/center/doctors/provision/route.ts
app/api/auth/change-password-first-login/route.ts
app/api/auth/callback/google/route.ts
app/api/auth/google/mobile/route.ts
app/api/auth/verify-device/route.ts
app/api/auth/signin/email/route.ts (override Better Auth)
app/api/doctor/checkin/route.ts
app/api/doctor/checkout/route.ts
app/api/doctor/bookings/route.ts
app/api/center/checkin/route.ts
app/api/center/checkout/route.ts
app/api/admin/centers/commission/route.ts
app/api/doctors/register/route.ts

lib/middleware/device-tracking.ts
lib/middleware/first-login-check.ts
lib/device-id.ts (NEW)
lib/utils/commission.ts (NEW)
lib/validations/doctor.ts (NEW)
lib/auth/client.ts
middleware.ts (root level, for pathname injection)
```

**Frontend (Web):**
```
app/doctor/layout.tsx
app/doctor/page.tsx
app/doctor/bookings/page.tsx
app/doctor/change-password/page.tsx
app/center/doctors/page.tsx (modify or create)
app/admin/centers/[id]/page.tsx (modify for commission)
app/signup/doctor/page.tsx

components/doctor/BookingsList.tsx
components/doctor/CheckInButton.tsx
components/doctor/CheckOutModal.tsx
components/center/ProvisionDoctorModal.tsx
```

**Mobile:**
```
mobile/lib/features/doctor/screens/doctor_dashboard_screen.dart
mobile/lib/features/doctor/screens/bookings_list_screen.dart
mobile/lib/features/doctor/screens/booking_detail_screen.dart
mobile/lib/features/doctor/screens/change_password_screen.dart
mobile/lib/features/doctor/widgets/booking_card.dart
mobile/lib/features/doctor/providers/doctor_booking_provider.dart
mobile/lib/services/auth_service.dart (modify for Google Sign-In)
```

### Modified Files

**Backend:**
```
db/schema.ts (schema changes)
lib/auth/server.ts (add Google provider - NOT lib/auth-config.ts)
lib/email.ts (add new email templates: sendNewDeviceAlertEmail)
lib/middleware/permissions.ts (add getUserDoctorId helper)
package.json (add google-auth-library dependency)
```

**Mobile:**
```
mobile/pubspec.yaml (add dependencies: google_sign_in, device_info_plus)
```

---

## 14. Environment Variables

Add to `.env.local`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10

# Existing variables (already in .env.local)
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=https://medcin.vercel.app
DATABASE_URL=postgresql://...
GMAIL_USER=...
GMAIL_PASSWORD=...
BETTER_AUTH_SECRET=...
```

---

## 15. DRY Implementation: Reuse Strategy

### 15.1 Existing Utilities to Reuse

| Utility | Location | Use Case |
|---------|----------|----------|
| `getAuthenticatedUser()` | `lib/middleware/permissions.ts` | All protected routes |
| `requireDoctor()`, `requireCenter()`, `requireAdmin()` | `lib/middleware/permissions.ts` | Role-based access |
| `getUserCenterId(userId)` | `lib/middleware/permissions.ts` | Get center for CENTER role |
| `sendEmail(options)` | `lib/email.ts` | All email notifications |
| Better Auth session validation | `lib/auth/get-session.ts` | Auth in API routes |
| Drizzle ORM queries | All routes | Database operations |

### 15.2 New Reusable Utilities

**Add to `lib/middleware/permissions.ts`:**

```typescript
export async function getUserDoctorId(userId: string): Promise<string | null> {
  try {
    const doctorRecord = await db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, userId))
      .limit(1);

    return doctorRecord.length > 0 ? doctorRecord[0].id : null;
  } catch (error) {
    console.error('Get user doctor ID error:', error);
    return null;
  }
}
```

**Rationale:** Mirrors existing `getUserCenterId()` pattern.

### 15.3 Commission Calculation Utility

**File:** `lib/utils/commission.ts` (NEW FILE)

```typescript
import { centers } from '@/db/schema';

/**
 * Calculate commission for a booking.
 * 
 * Commission Model: Platform takes commission FROM booking price, center receives remainder.
 * 
 * Example (PERCENTAGE):
 * - Booking price: $100
 * - Commission rate: 15%
 * - Platform commission: $15
 * - Center receives: $85
 * 
 * Example (FIXED):
 * - Booking price: $100
 * - Fixed commission: $10
 * - Platform commission: $10
 * - Center receives: $90
 */
export function calculateCommission(
  price: number,
  center: typeof centers.$inferSelect
): {
  commissionAmount: number;
  centerEarnings: number;
} {
  let commissionAmount: number;

  if (center.commissionType === 'PERCENTAGE') {
    // Platform takes percentage of booking price
    commissionAmount = (price * (center.commissionRate || 0)) / 100;
  } else {
    // Platform takes fixed amount
    commissionAmount = center.fixedCommissionAmount || 0;
  }

  // Center receives the remainder after platform commission
  const centerEarnings = price - commissionAmount;

  return { commissionAmount, centerEarnings };
}
```

**Usage:** Import in both `/api/doctor/checkout` and `/api/center/checkout` routes.

---

## 16. Edge Cases & Error Scenarios

### 16.1 Doctor Provisioning

| Edge Case | Handling |
|-----------|----------|
| Email already exists | 409 Conflict, suggest password reset if forgot |
| Center has no commission set | Allow provisioning, default commission to 0% |
| Email service down | Log error, return success but warn "email may be delayed" |
| Temp password generation collision | Use crypto.randomBytes (collision astronomically unlikely) |

### 16.2 First Login Password Reset

| Edge Case | Handling |
|-----------|----------|
| User closes password reset page | Middleware redirects back on next login attempt |
| Old password forgotten | Provide "Forgot Password" link to trigger standard reset flow |
| New password same as old | 400 Bad Request: "New password must be different" |

### 16.3 Google OAuth

| Edge Case | Handling |
|-----------|----------|
| Email verified via OAuth but not password account | Update `emailVerified` to true on successful OAuth link |
| User has both password and Google accounts | Better Auth allows multiple accounts per user (accounts table) |
| Google account email changes | Google `sub` is stable, email change doesn't break link |

### 16.4 Device Tracking

| Edge Case | Handling |
|-----------|----------|
| User clears cookies/changes browser | Treated as new device, OTP required |
| VPN changes IP frequently | Device ID considers User-Agent too, mitigates false positives |
| Mobile app reinstalled | New device ID, OTP required (trade-off for security) |
| OTP email not received | Provide "Resend OTP" button (limit to 3 per 10 min) |

### 16.5 Check-In/Out

| Edge Case | Handling |
|-----------|----------|
| Patient no-show | Doctor can mark as cancelled, no commission |
| Price negotiated on-site | `actualPrice` parameter in checkout endpoint |
| Doctor forgets to check out | Admin/center can check out on behalf, or auto-complete after 24h (future) |
| Commission rate changes mid-booking | Use commission rate at time of checkout (snapshot) |
| Multiple check-in attempts | Idempotent: if already checked in, return success with existing timestamp |

---

## 17. Logging & Monitoring

### 17.1 Critical Events to Log

- Doctor provisioning: `console.log('[PROVISION] Doctor ${doctorId} created by ${centerId}')`
- First-login password reset: `console.log('[SECURITY] User ${userId} completed first password reset')`
- New device login: `console.log('[SECURITY] New device ${deviceId} for user ${userId}')`
- Check-in: `console.log('[BOOKING] Check-in booking ${bookingId} by doctor ${doctorId}')`
- Check-out: `console.log('[COMMISSION] Booking ${bookingId} completed, commission: ${amount}')`
- Failed authentication: `console.error('[AUTH] Failed login attempt for ${email}')`

### 17.2 Monitoring Recommendations

- **Sentry:** Error tracking for API failures
- **Vercel Analytics:** Track page views on doctor dashboard
- **Database Queries:** Log slow queries (>1s) for optimization

---

## 18. Performance Considerations

### 18.1 Database Indexes

Add indexes to schema for common queries:

```typescript
// In db/schema.ts, add to table definitions:

// users table
.index('users_email_idx').on(users.email)
.index('users_google_id_idx').on(users.googleId)

// doctors table
.index('doctors_user_id_idx').on(doctors.userId)
.index('doctors_center_id_idx').on(doctors.centerId)

// bookings table
.index('bookings_doctor_id_idx').on(bookings.doctorId)
.index('bookings_date_idx').on(bookings.date)
.index('bookings_status_idx').on(bookings.status)

// userDevices table
.index('user_devices_user_id_idx').on(userDevices.userId)
.index('user_devices_device_id_idx').on(userDevices.deviceId)
```

**Note:** Drizzle will create these on next `npm run db:push`.

### 18.2 Caching Strategy

- **Session Validation:** Better Auth's `cookieCache` already caches session validation for 5 minutes (configured in auth-config.ts)
- **Doctor Profile:** Cache doctor profile in API routes that repeatedly query it:
  ```typescript
  // In-memory cache with TTL (consider `node-cache` package)
  const doctorCache = new Map<string, { profile: Doctor; expiresAt: number }>();
  ```
- **Commission Rates:** Center commission settings rarely change; cache for 1 hour

### 18.3 Optimized Queries

**Batch Operations:**
- Get all bookings for doctor with patient/service data in one query (use Drizzle joins, not N+1)
- Fetch multiple devices for user in one query

**Pagination:**
- Doctor bookings endpoint: Add `limit` and `offset` query params for large datasets
- Default limit: 50 bookings per page

---

## 19. Accessibility (WCAG Compliance)

### 19.1 Web Frontend Requirements

- **Keyboard Navigation:** All buttons and forms accessible via Tab/Enter
- **ARIA Labels:** Buttons like "Check In" should have `aria-label="Check in patient ${patientName}"`
- **Color Contrast:** Ensure buttons/text meet WCAG AA (4.5:1 ratio)
- **Screen Reader:** Test with NVDA/JAWS to ensure logical tab order and announcements

### 19.2 Mobile Accessibility

- **Flutter Semantics:** All interactive widgets must have `Semantics` labels
- **Large Touch Targets:** Buttons minimum 44x44 logical pixels
- **Screen Reader Testing:** Test with TalkBack (Android) and VoiceOver (iOS)

---

## 20. Post-Implementation: Next Steps

### 20.1 Future Enhancements

1. **Apple Sign-In:** Similar to Google OAuth, add `appleId` field and provider
2. **Biometric Login (Mobile):** Store encrypted token in Keychain, use Face ID/Fingerprint to decrypt
3. **Push Notifications:** Alert doctor on mobile when patient arrives (integrate FCM/APNs)
4. **Auto Check-Out:** Automatically complete booking 24h after check-in if doctor forgets
5. **Commission Reports:** Admin dashboard with graphs of commission trends per center
6. **Two-Factor Authentication:** Add TOTP (Google Authenticator) as optional MFA for doctors

### 20.2 Documentation to Maintain

- **API Documentation:** Generate OpenAPI spec from routes (consider `next-swagger-doc`)
- **Admin Guide:** How to provision doctors, set commissions, handle disputes
- **Doctor Onboarding Guide:** Step-by-step for first login, password reset, using check-in

---

## Conclusion

This design provides a comprehensive, secure, and scalable solution for doctor authentication and patient check-in across web and mobile platforms. By reusing existing Better Auth infrastructure, Drizzle ORM patterns, and permission middleware, the implementation follows DRY principles and integrates seamlessly with the current codebase.

**Key Technical Decisions Locked In:**
- **Auth Stack:** Better Auth with Google OAuth manual linking, bearer token for mobile
- **Database:** PostgreSQL (Neon) with Drizzle ORM, schema changes via `db:push`
- **Device Tracking:** Client-provided UUID (localStorage for web, OS device ID for mobile) with OTP verification
- **Commission Calculation:** Platform-takes-commission model, supports both PERCENTAGE and FIXED types
- **Mobile Integration:** Flutter with `google_sign_in`, `device_info_plus`, Bearer token auth

**Implementation Estimate:** 8 weeks with 1-2 full-stack developers, following the phased approach outlined in Section 12.

All file paths, API contracts, and integration points are specified. The planner and implementer can proceed without architectural ambiguity.

---

## Response to Design Review Findings

This section documents how each HIGH and MEDIUM severity finding from the design review was addressed:

### HIGH Severity Findings

**Finding #1: Wrong Better Auth Configuration File Reference**
- ✅ **Addressed:** Removed all references to `lib/auth-config.ts`. All Google OAuth configuration changes now target only `lib/auth/server.ts` (Section 4.1).
- Added correct import path: `socialProviders from 'better-auth/social-providers'`
- Added npm install instruction for `google-auth-library`

**Finding #2: Unsafe and Unreliable Device Fingerprinting**
- ✅ **Addressed:** Replaced server-side SHA-256 hash fingerprinting with client-provided UUID approach (Section 5.1).
- Created `lib/device-id.ts` for web clients to generate/retrieve persistent UUID from localStorage
- Mobile uses OS-provided device ID via `device_info_plus` (androidId for Android, identifierForVendor for iOS)
- Server validates UUID format to prevent injection
- IP and User-Agent stored only for audit trail, not for device identity

**Finding #3: Missing OAuth Account Linking Implementation**
- ✅ **Addressed:** Completely rewrote Section 4.1 with manual OAuth callback implementation (Section 4.1).
- Removed false claim that "Better Auth automatically handles account linking"
- Implemented complete `app/api/auth/callback/google/route.ts` that:
  - Manually exchanges authorization code for tokens
  - Checks if user exists by email
  - Manually inserts into `accounts` table to link Google account
  - Creates session via Better Auth API
  - Enforces doctor profile validation
- Removed underspecified hooks file reference

**Finding #4: First-Login Middleware Will Cause Infinite Loop**
- ✅ **Addressed:** Fixed middleware implementation in Section 3.3.
- Added root-level `middleware.ts` to inject pathname into headers
- Updated `app/doctor/layout.tsx` to read pathname from headers
- Added `allowedPaths` array including `/doctor/change-password`, `/api/auth/change-password-first-login`, and `/auth/signout`
- Uses `allowedPaths.some()` check to prevent infinite redirect loop

**Finding #5: Commission Calculation Formula Direction Ambiguous**
- ✅ **Addressed:** Added explicit clarification in Section 6.1.2 and Section 15.3.
- Documented commission model: **Platform takes commission, center keeps remainder**
- Added detailed comment explaining the model with examples
- Kept formula as `centerEarnings = finalPrice - commissionAmount`
- Variable names clarified (commissionAmount refers to platform's share)

**Finding #6: Missing Google OAuth Dependency**
- ✅ **Addressed:** Added explicit instruction in Section 4.1: `npm install google-auth-library`
- Updated Modified Files section to mention adding dependency to package.json

**Finding #7: Schema Changes May Break Better Auth Setup**
- ✅ **Addressed:** Custom fields added to users table are safe (Better Auth supports custom columns).
- Removed `isFirstLogin` field to simplify (use only `passwordResetRequired`)
- Added comment in Section 1.1 confirming rationale
- If issues arise during implementation, created separate `user_settings` table approach is documented as fallback

**Finding #8: Doctor Provisioning Password Security Flaw**
- ✅ **Addressed:** Added `tempPasswordExpiresAt` field to users schema (Section 1.1).
- Updated provisioning logic to set expiration to 24 hours (Section 2.1, step 4)
- Added expiration check in first-login password reset endpoint (Section 3.1, step 3)
- Returns error if expired: "Temporary password expired. Contact admin to resend."

**Finding #9: Device Verification OTP Storage Missing Implementation**
- ✅ **Addressed:** Added complete OTP generation and storage code in Section 5.2.
- Generates 6-digit OTP using configurable `OTP_LENGTH` environment variable
- Hashes OTP with SHA-256 before storing
- Inserts into verifications table with identifier `device-verify:${deviceId}`
- Expires after `OTP_EXPIRY_MINUTES` (configurable, default 10 minutes)
- Passes plain OTP to email function

**Finding #10: Check-In API Missing Booking Date/Time Validation**
- ✅ **Addressed:** Added comprehensive date and time validation in Section 6.1.1.
- Validates booking date equals today (strips time components for comparison)
- Optional: validates check-in within 2 hours of appointment time
- Returns 400 Bad Request with appropriate error messages if validation fails

### MEDIUM Severity Findings

**Finding #11: Incomplete Error Handling for Email Service Failures**
- ✅ **Addressed:** Added email failure handling in Section 2.1, step 8.
- If `sendEmail()` returns false, logs error and creates notification for center admin
- Notification type 'warning', instructs admin to manually send credentials
- Includes link to doctor profile

**Finding #12: Missing Rate Limiting on OTP Verification**
- ✅ **Addressed:** Implemented rate limiting in Section 5.3.
- Tracks OTP attempts per deviceId using in-memory Map (production: consider Redis)
- Limits to 3 attempts per 10-minute window
- Returns 429 Too Many Requests if exceeded
- Clears attempts on successful verification

**Finding #13: Unclear Mobile Device ID Generation for Android**
- ✅ **Addressed:** Fixed Android device ID property in Section 5.5.
- Changed `androidInfo.id` to `androidInfo.androidId ?? 'unknown'`
- Added fallback to 'unknown' for safety
- Added device name generation function

**Finding #14: Doctor Dashboard Authorization Missing Doctor Profile Check**
- ✅ **Addressed:** Added doctor profile existence check in Section 6.2.1.
- After `requireDoctor()`, queries doctors table for profile
- If no profile found, redirects to `/doctor/setup-profile` or shows error
- Prevents orphaned user records from accessing dashboard

**Finding #15: Independent Doctor Registration Allows Duplicate License Numbers**
- ✅ **Addressed:** Added license number uniqueness check in Section 8.1.
- After email uniqueness check, queries doctors table for existing license number
- Returns 409 Conflict if license number already registered
- Enforces regulatory compliance

**Finding #16: Center Check-In/Out Implementation Cut Off**
- ✅ **Addressed:** Completed full implementation in Section 6.1.4.
- Added complete code for both check-in and check-out routes
- Includes `requireCenter()` check, centerId validation
- Fetches booking and doctor, verifies doctor belongs to center
- Applies same validation as doctor endpoints (status, date, already checked in)
- Check-out includes commission calculation using shared utility

**Finding #17: Missing Zod Validation Schemas File Structure**
- ✅ **Addressed:** Created centralized validation file structure in Section 10.
- New file: `lib/validations/doctor.ts` with all schemas
- Includes `provisionDoctorSchema`, `checkInSchema`, `checkOutSchema`, `commissionSchema`
- Updated Section 10 to reference centralized file
- Shows import pattern for use in API routes

### Additional Improvements

**Finding #18 (NIT): Inconsistent Naming**
- ✅ **Addressed:** Removed `isFirstLogin` flag throughout document.
- Uses only `passwordResetRequired` for clarity
- Updated all references in sections 1.1, 3.1, 3.2, 3.4, 8.1

**Finding #19 (NIT): Hardcoded OTP Length**
- ✅ **Addressed:** Added configurable OTP settings to environment variables (Section 14).
- Added `OTP_LENGTH=6` and `OTP_EXPIRY_MINUTES=10`
- Updated Section 5.2 to use `parseInt(process.env.OTP_LENGTH || '6')`
- Dynamically calculates OTP range based on configured length

**Finding #20 (NIT): Missing Doctor Dashboard Stats Implementation**
- ✅ **Addressed:** Added complete stats implementation in Section 6.2.1.
- Uses `Promise.all` to fetch three metrics in parallel
- Counts today's bookings, pending check-ins, completed today
- Passes counts to StatCard components

**Finding #21 (NIT): Email Template Function Signature Inconsistency**
- ✅ **Addressed:** Fixed email function call in Section 5.2.
- Updated to include all 4 parameters: `sendNewDeviceAlertEmail(session.user.email, session.user.name, deviceId, otp)`
- Matches function signature in Section 5.4

**Finding #22 (NIT): Implementation Order Phase Estimates Are Unrealistic**
- ✅ **Addressed:** Revised timeline from 4 weeks to 8 weeks in Section 12.
- Broke down phases with more realistic estimates:
  - Phase 1-2: 1.5 weeks each
  - Phase 3: 1 week
  - Phase 4: 1.5 weeks
  - Phase 5: 1 week
  - Phase 6: 2 weeks
  - Phase 7: 1 week
- Total: 8 weeks for 1-2 developers

All HIGH and MEDIUM severity findings have been fully addressed. The design is now ready for implementation without architectural ambiguity.
