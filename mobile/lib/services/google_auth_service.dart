import 'package:google_sign_in/google_sign_in.dart';
import 'package:better_auth_flutter/better_auth_flutter.dart';

/// Service for Google Sign-In integration with Better Auth
class GoogleAuthService {
  // Use the Web Client ID from Google Cloud Console
  // This is used for ID token verification on the backend
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    serverClientId: "636314858545-1omn2cq7mtlp137rs5vtsm89albf9n23.apps.googleusercontent.com",
    scopes: ['email', 'profile'],
  );

  /// Sign in with Google using Better Auth
  /// This automatically:
  /// - Signs up new users
  /// - Logs in existing users
  /// - Links Google account to existing email/password accounts
  Future<Map<String, dynamic>> signInWithGoogle() async {
    try {
      // Step 1: Trigger native Google Sign-In flow
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        throw Exception('Google Sign-In cancelled by user');
      }

      // Step 2: Get authentication tokens from Google
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      
      final String? idToken = googleAuth.idToken;
      
      if (idToken == null) {
        throw Exception('Failed to retrieve Google ID Token');
      }

      // Step 3: Send ID token to Better Auth backend
      // This automatically handles:
      // - Token verification with Google
      // - User creation or login
      // - Account linking if email exists
      // - Session token generation
      await BetterAuthFlutter.client.signInSocial(
        body: {
          "provider": "google",
          "idToken": {
            "token": idToken,
          },
        },
      );

      // Step 4: Get user data from Better Auth state
      // Better Auth automatically stores the session token
      final authState = BetterAuthFlutter.client.session;
      
      return {
        'success': true,
        'user': authState?.user,
        'message': 'Successfully signed in with Google',
      };

    } catch (e) {
      // Sign out from Google on error to clean up state
      await _googleSignIn.signOut();
      
      // Re-throw with more context
      if (e.toString().contains('doctor')) {
        throw Exception('Doctor accounts must be created by a center administrator. Please contact your center.');
      } else if (e.toString().contains('inactive')) {
        throw Exception('Your account is inactive. Please contact your administrator.');
      } else {
        throw Exception('Google Sign-In failed: ${e.toString()}');
      }
    }
  }

  /// Sign out from Google and Better Auth
  Future<void> signOut() async {
    try {
      // Sign out from Better Auth (clears session token)
      await BetterAuthFlutter.client.signOut();
      
      // Sign out from Google
      await _googleSignIn.signOut();
    } catch (e) {
      print('Sign out error: $e');
      // Still try to sign out from Google even if Better Auth fails
      await _googleSignIn.signOut();
    }
  }

  /// Check if user is currently signed in with Google
  Future<bool> isSignedIn() async {
    return await _googleSignIn.isSignedIn();
  }

  /// Get current Google user (if signed in)
  Future<GoogleSignInAccount?> getCurrentUser() async {
    return _googleSignIn.currentUser;
  }

  /// Disconnect Google account (revokes access)
  Future<void> disconnect() async {
    await _googleSignIn.disconnect();
  }
}
