import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/repositories/auth_repository.dart';
import '../domain/models/user_model.dart';
import 'auth_state.dart';

/// Auth state notifier for managing authentication state
class AuthStateNotifier extends StateNotifier<AuthState> {
  final IAuthRepository _authRepository;

  AuthStateNotifier(this._authRepository) : super(const AuthState.initial()) {
    _initialize();
  }

  /// Initialize auth state by checking current user
  Future<void> _initialize() async {
    try {
      state = const AuthState.loading();
      
      final user = await _authRepository.getCurrentUser();
      
      if (user != null) {
        state = AuthState.authenticated(user);
      } else {
        state = const AuthState.unauthenticated();
      }
      
      // Listen to auth state changes
      _authRepository.authStateChanges.listen((user) {
        if (user != null) {
          state = AuthState.authenticated(user);
        } else {
          state = const AuthState.unauthenticated();
        }
      });
    } catch (e) {
      state = AuthState.error(e.toString());
    }
  }

  /// Sign in with email and password
  Future<void> signInWithEmail(String email, String password) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      
      final user = await _authRepository.signInWithEmail(email, password);
      
      state = AuthState.authenticated(user);
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
      
      final user = await _authRepository.signUpWithEmail(email, password, name);
      
      state = AuthState.authenticated(user);
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
      await _authRepository.signOut();
      state = const AuthState.unauthenticated();
    } catch (e) {
      state = state.copyWith(error: e.toString().replaceAll('Exception: ', ''));
    }
  }

  /// Reset password
  Future<void> resetPassword(String email) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      
      await _authRepository.resetPassword(email);
      
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
