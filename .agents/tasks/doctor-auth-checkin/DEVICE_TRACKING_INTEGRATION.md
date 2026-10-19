# Device Tracking Integration

## Overview

Device tracking is **FULLY INTEGRATED** into the authentication flow via the `/api/auth/check-device` endpoint.

## How It Works

### 1. Login Flow Integration

When a user logs in (web or mobile), the client calls:
```
POST /api/auth/check-device
Headers:
  X-Device-ID: <uuid>
  X-Device-Name: <optional-device-name>
```

### 2. Backend Processing

The endpoint (`app/api/auth/check-device/route.ts`):
1. Calls `trackDeviceLogin(userId, deviceId, deviceName)` from `lib/auth/track-device.ts`
2. `trackDeviceLogin` calls `trackDevice()` from `lib/middleware/device-tracking.ts`
3. If new device detected:
   - Creates device record in `user_devices` table (trusted=false)
   - Generates 6-digit OTP
   - Sends email with OTP via `sendNewDeviceAlertEmail()`
   - Returns `requiresVerification: true`

### 3. Device Verification Flow

If `requiresVerification: true`, client redirects to OTP verification:
```
POST /api/auth/verify-device
Body:
  {
    "deviceId": "<uuid>",
    "otp": "123456"
  }
```

The endpoint (`app/api/auth/verify-device/route.ts`):
1. Validates OTP against hashed value in `verifications` table
2. Marks device as trusted in `user_devices` table
3. Allows continued access

### 4. Trusted Device Behavior

On subsequent logins from the same device:
- `trackDevice()` finds existing device record
- Returns `trusted: true, isNewDevice: false`
- No OTP verification required
- User proceeds directly to dashboard

## Files Involved

- `app/api/auth/check-device/route.ts` - Entry point for device checking
- `app/api/auth/verify-device/route.ts` - OTP verification endpoint
- `lib/auth/track-device.ts` - Device login tracking logic
- `lib/middleware/device-tracking.ts` - Core device tracking middleware
- `db/schema.ts` - `user_devices` and `verifications` tables

## Client Implementation

### Web
Client-side JavaScript must:
1. Generate/retrieve device UUID from localStorage
2. Send `X-Device-ID` header on every authenticated request
3. Call `/api/auth/check-device` after successful login
4. Handle OTP verification flow if `requiresVerification: true`

### Mobile
Flutter app must:
1. Use `device_info_plus` to generate device UUID
2. Send `X-Device-ID` header on every authenticated request
3. Call `/api/auth/check-device` after successful login
4. Show OTP input screen if `requiresVerification: true`

## Security Notes

- Device IDs are client-provided UUIDs (not cryptographically verified)
- System provides notification-based security (email alerts on new devices)
- NOT a security boundary - attackers can spoof device IDs
- Primary benefit: alerts legitimate users of suspicious activity
