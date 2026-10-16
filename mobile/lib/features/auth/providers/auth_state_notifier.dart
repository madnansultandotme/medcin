import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../services/auth_service.dart';
import '../domain/models/user_model.dart';
import 'auth_state.dart';

/// Auth service provider
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

/// Auth state notifier for managing authentication state using modern Notifier API
class AuthStateNotifier extends Notifier<AuthState> {
  AuthService get _authService => ref.read(authServiceProvider);

  @override
  AuthState build() {
    // Initialize auth state by checking current user
    _initialize();
    return const AuthState.initial();
  }

  /// Initialize auth state by checking current user
  Future<void> _initialize() async {
    try {
      state = const AuthState.loading();
      
      final session = await _authService.refreshSession();
      
      if (session != null && session['user'] != null) {
        final userMap = session['user'] as Map<String, dynamic>;
        final user = UserModel.fromJson(userMap);
        state = AuthState.authenticated(user);
      } else {
        state = const AuthState.unauthenticated();
      }
    } catch (e) {
      state = const AuthState.unauthenticated();
    }
  }

  /// Sign in with email and password
  Future<void> signInWithEmail(String email, String password) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      
      final result = await _authService.signIn(email: email, password: password);
      
      if (result['user'] != null) {
        final userMap = result['user'] as Map<String, dynamic>;
        final user = UserModel.fromJson(userMap);
        state = AuthState.authenticated(user);
      } else {
        throw Exception('Invalid response from server');
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
      
      // Clear error after 3 seconds
      Future.delayed(const Duration(seconds: 3), () {
        try {
          state = state.copyWith(error: null);
        } catch (_) {
          // Notifier might be disposed, ignore error
        }
      });
    }
  }

  /// Sign up with email, password, and name
  Future<void> signUpWithEmail(String email, String password, String name) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      
      final result = await _authService.signUp(
        email: email,
        password: password,
        name: name,
      );
      
      if (result['user'] != null) {
        final userMap = result['user'] as Map<String, dynamic>;
        final user = UserModel.fromJson(userMap);
        state = AuthState.authenticated(user);
      } else {
        throw Exception('Invalid response from server');
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
      
      // Clear error after 3 seconds
      Future.delayed(const Duration(seconds: 3), () {
        try {
          state = state.copyWith(error: null);
        } catch (_) {
          // Notifier might be disposed, ignore error
        }
      });
    }
  }

  /// Sign out
  Future<void> signOut() async {
    try {
      await _authService.signOut();
      state = const AuthState.unauthenticated();
    } catch (e) {
      state = state.copyWith(error: e.toString().replaceAll('Exception: ', ''));
    }
  }

  /// Reset password
  Future<void> resetPassword(String email) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      
      await _authService.forgotPassword(email);
      
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
      
      // Clear error after 3 seconds
      Future.delayed(const Duration(seconds: 3), () {
        try {
          state = state.copyWith(error: null);
        } catch (_) {
          // Notifier might be disposed, ignore error
        }
      });
    }
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }
}

/// Auth state provider using modern NotifierProvider API
final authStateProvider = NotifierProvider<AuthStateNotifier, AuthState>(
  AuthStateNotifier.new,
);
