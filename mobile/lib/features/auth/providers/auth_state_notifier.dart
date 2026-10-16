import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../services/auth_service.dart';
import '../domain/models/user_model.dart';
import 'auth_state.dart';

part 'auth_state_notifier.g.dart';

/// Auth service provider
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

/// Auth state notifier for managing authentication state
@riverpod
class AuthStateNotifier extends _$AuthStateNotifier {
  @override
  AuthState build() {
    _initialize();
    return const AuthState.initial();
  }

  /// Initialize auth state by checking current user
  Future<void> _initialize() async {
    try {
      state = const AuthState.loading();
      
      final authService = ref.read(authServiceProvider);
      final session = await authService.refreshSession();
      
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
      
      final authService = ref.read(authServiceProvider);
      final result = await authService.signIn(email: email, password: password);
      
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
        if (mounted) {
          state = state.copyWith(error: null);
        }
      });
    }
  }

  /// Sign up with email, password, and name
  Future<void> signUpWithEmail(String email, String password, String name) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      
      final authService = ref.read(authServiceProvider);
      final result = await authService.signUp(
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
        if (mounted) {
          state = state.copyWith(error: null);
        }
      });
    }
  }

  /// Sign out
  Future<void> signOut() async {
    try {
      final authService = ref.read(authServiceProvider);
      await authService.signOut();
      state = const AuthState.unauthenticated();
    } catch (e) {
      state = state.copyWith(error: e.toString().replaceAll('Exception: ', ''));
    }
  }

  /// Reset password
  Future<void> resetPassword(String email) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      
      final authService = ref.read(authServiceProvider);
      await authService.forgotPassword(email: email);
      
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
      
      // Clear error after 3 seconds
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) {
          state = state.copyWith(error: null);
        }
      });
    }
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }
}
