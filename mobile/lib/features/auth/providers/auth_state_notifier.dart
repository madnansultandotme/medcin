import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../domain/repositories/auth_repository.dart';
import '../data/repositories/local_auth_repository.dart';
import '../domain/models/user_model.dart';
import 'auth_state.dart';

part 'auth_state_notifier.g.dart';

/// Auth repository provider - Keep it simple to avoid circular dependencies
final authRepositoryProvider = Provider<IAuthRepository>((ref) {
  return LocalAuthRepository();
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
      
      final authRepo = ref.read(authRepositoryProvider);
      final user = await authRepo.getCurrentUser();
      
      if (user != null) {
        state = AuthState.authenticated(user);
      } else {
        state = const AuthState.unauthenticated();
      }
      
      // Listen to auth state changes
      authRepo.authStateChanges.listen((user) {
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
      
      final authRepo = ref.read(authRepositoryProvider);
      final user = await authRepo.signInWithEmail(email, password);
      
      state = AuthState.authenticated(user);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
      
      // Clear error after 3 seconds
      Future.delayed(const Duration(seconds: 3), () {
        state = state.copyWith(error: null);
      });
    }
  }

  /// Sign up with email, password, and name
  Future<void> signUpWithEmail(String email, String password, String name) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      
      final authRepo = ref.read(authRepositoryProvider);
      final user = await authRepo.signUpWithEmail(email, password, name);
      
      state = AuthState.authenticated(user);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
      
      // Clear error after 3 seconds
      Future.delayed(const Duration(seconds: 3), () {
        state = state.copyWith(error: null);
      });
    }
  }

  /// Sign out
  Future<void> signOut() async {
    try {
      final authRepo = ref.read(authRepositoryProvider);
      await authRepo.signOut();
      state = const AuthState.unauthenticated();
    } catch (e) {
      state = state.copyWith(error: e.toString().replaceAll('Exception: ', ''));
    }
  }

  /// Reset password
  Future<void> resetPassword(String email) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      
      final authRepo = ref.read(authRepositoryProvider);
      await authRepo.resetPassword(email);
      
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
      
      // Clear error after 3 seconds
      Future.delayed(const Duration(seconds: 3), () {
        state = state.copyWith(error: null);
      });
    }
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }
}
