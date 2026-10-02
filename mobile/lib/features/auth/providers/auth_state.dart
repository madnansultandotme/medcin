import '../domain/models/user_model.dart';

/// Authentication state
class AuthState {
  final UserModel? user;
  final bool isLoading;
  final String? error;
  final bool isInitialized;

  const AuthState({
    this.user,
    this.isLoading = false,
    this.error,
    this.isInitialized = false,
  });

  /// Initial state
  const AuthState.initial()
      : user = null,
        isLoading = false,
        error = null,
        isInitialized = false;

  /// Loading state
  const AuthState.loading()
      : user = null,
        isLoading = true,
        error = null,
        isInitialized = false;

  /// Authenticated state
  const AuthState.authenticated(UserModel user)
      : user = user,
        isLoading = false,
        error = null,
        isInitialized = true;

  /// Unauthenticated state
  const AuthState.unauthenticated()
      : user = null,
        isLoading = false,
        error = null,
        isInitialized = true;

  /// Error state
  const AuthState.error(String error)
      : user = null,
        isLoading = false,
        error = error,
        isInitialized = true;

  /// Copy with
  AuthState copyWith({
    UserModel? user,
    bool? isLoading,
    String? error,
    bool? isInitialized,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isInitialized: isInitialized ?? this.isInitialized,
    );
  }

  /// Check if user is authenticated
  bool get isAuthenticated => user != null;
}
