import 'package:google_sign_in/google_sign_in.dart';
import 'api_client.dart';

/// Service for Google Sign-In integration
class GoogleAuthService {
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  final ApiClient _apiClient = ApiClient();

  /// Sign in with Google and exchange token with backend
  /// Returns the Bearer token from backend
  Future<Map<String, dynamic>> signInWithGoogle() async {
    try {
      // Trigger Google Sign-In flow
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        throw Exception('Google Sign-In cancelled by user');
      }

      // Get Google authentication
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      
      if (googleAuth.idToken == null) {
        throw Exception('Failed to get Google ID token');
      }

      // Send ID token to backend for verification and token exchange
      // NOTE: This endpoint should be created in FEAT-001
      final response = await _apiClient.post(
        '/auth/google/mobile',
        body: {
          'idToken': googleAuth.idToken,
          'role': 'DOCTOR', // For doctor authentication
        },
      );

      // Extract token from backend response
      final token = response['token'] ?? response['data']?['token'];
      
      if (token == null) {
        throw Exception('No token received from backend');
      }

      // Store token in secure storage
      await _apiClient.setAuthToken(token);

      return {
        'token': token,
        'user': response['user'] ?? response['data']?['user'],
      };
    } catch (e) {
      // Sign out on error to clean up state
      await _googleSignIn.signOut();
      rethrow;
    }
  }

  /// Sign out from Google
  Future<void> signOut() async {
    await _googleSignIn.signOut();
  }

  /// Check if user is currently signed in with Google
  Future<bool> isSignedIn() async {
    return await _googleSignIn.isSignedIn();
  }

  /// Get current Google user (if signed in)
  Future<GoogleSignInAccount?> getCurrentUser() async {
    return _googleSignIn.currentUser;
  }
}
