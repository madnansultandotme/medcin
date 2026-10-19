# Google OAuth Integration - Flutter Mobile App with Better Auth

## Overview

This guide explains how to integrate Google Sign-In with your Flutter mobile app using Better Auth's native Flutter SDK. The backend uses Better Auth with the `bearer` plugin enabled for token-based mobile authentication.

## Architecture

- **Backend:** Better Auth (TypeScript) with Bearer plugin
- **Frontend:** Flutter with `better_auth_flutter` + `google_sign_in`
- **Flow:** Native ID Token Handoff (Google SDK → Better Auth backend)

---

## Backend Configuration (Already Configured ✅)

Your Better Auth backend already has the required configuration:

**File:** `lib/auth/server.ts` and `lib/auth-config.ts`

```typescript
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [bearer()], // ✅ Enables mobile token authentication
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  baseURL: "https://medcin.vercel.app",
  trustedOrigins: ["https://medcin.vercel.app", "myapp://auth-callback"],
});
```

**Environment Variables (`.env.local`):**
```env
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
BETTER_AUTH_URL=https://medcin.vercel.app
```

---

## Flutter Implementation

### Step 1: Add Dependencies

Add to `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  better_auth_flutter: ^0.1.1  # Official Better Auth Flutter SDK
  google_sign_in: ^6.2.1       # Google's official Flutter SDK
```

Run: `flutter pub get`

---

### Step 2: Configure Google Sign-In

#### Android (`android/app/src/main/AndroidManifest.xml`)

```xml
<manifest ...>
  <application ...>
    <meta-data
      android:name="com.google.android.gms.auth.api.signin.GOOGLE_CLIENT_ID"
      android:value="YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com" />
  </application>
</manifest>
```

#### iOS (`ios/Runner/Info.plist`)

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_REVERSED_CLIENT_ID</string>
    </array>
  </dict>
</array>

<key>GIDClientID</key>
<string>YOUR_IOS_CLIENT_ID.apps.googleusercontent.com</string>
```

**Important:** Use the **Web Client ID** (from Google Cloud Console) as the `serverClientId` in Flutter code.

---

### Step 3: Initialize Better Auth in Flutter

**File:** `lib/main.dart`

```dart
import 'package:flutter/material.dart';
import 'package:better_auth_flutter/better_auth_flutter.dart';

const String authUrl = "https://medcin.vercel.app"; // Your backend URL

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Better Auth singleton
  await BetterAuthFlutter.initialize(
    url: authUrl,
    enableLogging: true, // Useful for debugging
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Wrap app in BetterAuthProvider for reactive state
    return BetterAuthProvider(
      child: MaterialApp(
        title: 'Medcin',
        home: const AuthGate(),
      ),
    );
  }
}
```

---

### Step 4: Create Auth Gate (Reactive State)

**File:** `lib/screens/auth_gate.dart`

```dart
import 'package:flutter/material.dart';
import 'package:better_auth_flutter/better_auth_flutter.dart';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    // Listen to authentication state changes reactively
    final authState = BetterAuthProvider.of(context);

    if (authState.isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (authState.isAuthenticated) {
      // User is logged in
      return const HomeScreen();
    }

    // User is not logged in
    return const SignInScreen();
  }
}
```

---

### Step 5: Implement Google Sign-In Service

**File:** `lib/services/google_auth_service.dart`

```dart
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:better_auth_flutter/better_auth_flutter.dart';

class GoogleAuthService {
  // Use your Web Client ID from Google Cloud Console
  static final GoogleSignIn _googleSignIn = GoogleSignIn(
    serverClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
    scopes: ['email', 'profile'],
  );

  /// Sign in with Google using Better Auth
  static Future<void> signInWithGoogle(BuildContext context) async {
    try {
      // Step 1: Trigger native Google Sign-In on device
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        // User cancelled the sign-in
        return;
      }

      // Step 2: Get authentication tokens from Google
      final GoogleSignInAuthentication googleAuth = 
          await googleUser.authentication;
      
      final String? idToken = googleAuth.idToken;

      if (idToken == null) {
        throw Exception("Failed to retrieve Google ID Token");
      }

      // Step 3: Send ID token to Better Auth backend
      // This automatically:
      // - Signs up new users OR
      // - Logs in existing users
      // - Links Google account to existing email/password account
      await BetterAuthFlutter.client.signInSocial(
        body: {
          "provider": "google",
          "idToken": {
            "token": idToken,
          },
        },
      );

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✓ Successfully signed in with Google!'),
            backgroundColor: Colors.green,
          ),
        );
      }

    } catch (error) {
      print("Google Sign-In Error: $error");
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Sign-in failed: $error"),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  /// Sign out from Google and Better Auth
  static Future<void> signOut() async {
    await _googleSignIn.signOut();
    await BetterAuthFlutter.client.signOut();
  }
}
```

---

### Step 6: Create Sign-In UI

**File:** `lib/screens/signin_screen.dart`

```dart
import 'package:flutter/material.dart';
import '../services/google_auth_service.dart';

class SignInScreen extends StatelessWidget {
  const SignInScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // App Logo
              Image.asset(
                'assets/logo.png',
                height: 100,
              ),
              const SizedBox(height: 48),
              
              // Title
              const Text(
                'Welcome to Medcin',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              
              // Subtitle
              Text(
                'Book healthcare services easily',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 64),
              
              // Google Sign-In Button
              ElevatedButton.icon(
                onPressed: () => GoogleAuthService.signInWithGoogle(context),
                icon: Image.asset(
                  'assets/google_logo.png',
                  height: 24,
                ),
                label: const Text('Continue with Google'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    vertical: 16,
                    horizontal: 24,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              
              // Divider
              Row(
                children: [
                  Expanded(child: Divider(color: Colors.grey[300])),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'or',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ),
                  Expanded(child: Divider(color: Colors.grey[300])),
                ],
              ),
              const SizedBox(height: 24),
              
              // Email/Password Sign-In Button
              OutlinedButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/login-email');
                },
                child: const Text('Sign in with Email'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

### Step 7: Making Authenticated API Calls

Better Auth automatically handles Bearer token authentication. Access the session:

```dart
final authState = BetterAuthProvider.of(context);

if (authState.isAuthenticated) {
  final user = authState.user;
  print('Logged in as: ${user?.name}');
  print('Email: ${user?.email}');
  print('Role: ${user?.role}');
}
```

For manual API calls with the token:

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> makeAuthenticatedRequest() async {
  // Better Auth stores the token automatically
  // It's included in requests via the bearer plugin
  
  final response = await http.get(
    Uri.parse('https://medcin.vercel.app/api/mobile/v1/profile'),
    headers: {
      'Content-Type': 'application/json',
      // Token is automatically included by better_auth_flutter
    },
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    print('Profile data: $data');
  }
}
```

---

## How It Works

1. **User clicks "Sign in with Google"**
2. **Native Google SDK** shows system sign-in dialog (iOS/Android)
3. **Google returns ID token** after successful authentication
4. **Flutter sends ID token** to Better Auth backend via `signInSocial()`
5. **Better Auth verifies token** with Google's servers
6. **Better Auth:**
   - Creates new user if email doesn't exist (registers)
   - Links Google account if email exists (account linking)
   - Returns Bearer session token
7. **Flutter stores token** securely (handled by better_auth_flutter)
8. **All API calls** automatically include Bearer token

---

## Doctor Account Flow

**Important:** Doctor accounts have special handling:

- ✅ **Existing Doctor:** Can link Google account and sign in
- ❌ **New Doctor:** Cannot register via Google (must be provisioned by center admin first)

The backend validates doctor profiles during sign-in. If a doctor tries to sign up via Google without being provisioned, they'll receive an error.

---

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select or create project "Medcin"
3. **Enable APIs:**
   - Google+ API
   - Google Identity Toolkit API
4. **Create OAuth 2.0 Credentials:**
   - **Web application** (for backend verification)
     - Copy Client ID → `.env.local` as `GOOGLE_CLIENT_ID`
     - Copy Client Secret → `.env.local` as `GOOGLE_CLIENT_SECRET`
   - **Android** (for Flutter Android app)
     - Package name: `com.medcin.app`
     - SHA-1 certificate fingerprint (get from Flutter)
   - **iOS** (for Flutter iOS app)
     - Bundle ID: `com.medcin.app`

**Get SHA-1 for Android:**
```bash
cd android
./gradlew signingReport
```

---

## Testing Checklist

- [ ] New user can sign up with Google (creates account)
- [ ] Existing user can sign in with Google (links account)
- [ ] Token is stored and persists across app restarts
- [ ] Authenticated API calls work with Bearer token
- [ ] Sign out clears token and returns to login screen
- [ ] Doctor accounts are enforced (new doctors rejected)
- [ ] Session expiry handled gracefully (401 → re-login)

---

## Troubleshooting

### "Invalid token" error
- Verify `serverClientId` in Flutter matches Web Client ID from Google Cloud Console
- Check backend `GOOGLE_CLIENT_ID` matches Web Client ID

### "Platform not supported" error
- Ensure you configured `AndroidManifest.xml` and `Info.plist`
- Run `flutter clean` and rebuild

### "Session expired" on API calls
- Verify `bearer()` plugin is enabled in backend
- Check backend `trustedOrigins` includes your app URL

### Doctor sign-up rejected
- This is expected! Doctors must be provisioned by center admin first
- Have center admin create doctor account, then doctor can link Google

---

## Security Notes

1. **ID Token Verification:** Backend verifies Google tokens server-side
2. **Bearer Tokens:** Stored securely by better_auth_flutter
3. **Session Expiry:** 24 hours (configurable in backend)
4. **Account Linking:** Email-based matching prevents duplicate accounts
5. **Doctor Enforcement:** Backend validates doctor profiles exist before allowing Google sign-in

---

## API Reference

### Better Auth Flutter Client Methods

```dart
// Sign in with Google
await BetterAuthFlutter.client.signInSocial(
  body: {
    "provider": "google",
    "idToken": {"token": idToken},
  },
);

// Sign out
await BetterAuthFlutter.client.signOut();

// Get current user
final user = authState.user;

// Check authentication status
final isLoggedIn = authState.isAuthenticated;
```

---

## Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [better_auth_flutter Package](https://pub.dev/packages/better_auth_flutter)
- [google_sign_in Package](https://pub.dev/packages/google_sign_in)
- [Google Cloud Console](https://console.cloud.google.com)

---

**Implementation Status:** ✅ Backend configured and ready  
**Next Step:** Implement Flutter code following this guide
