import '../models/user_model.dart';

/// Repository interface for authentication
abstract class IAuthRepository {
  /// Get current user if authenticated
  Future<UserModel?> getCurrentUser();
  
  /// Sign in with email and password
  Future<UserModel> signInWithEmail(String email, String password);
  
  /// Sign up with email, password, and name
  Future<UserModel> signUpWithEmail(String email, String password, String name);
  
  /// Sign out
  Future<void> signOut();
  
  /// Reset password
  Future<void> resetPassword(String email);
  
  /// Stream of auth state changes
  Stream<UserModel?> get authStateChanges;
}
