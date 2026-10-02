import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/repositories/auth_repository.dart';
import '../data/repositories/local_auth_repository.dart';
import '../domain/models/user_model.dart';
import 'auth_state.dart';
import 'auth_state_notifier.dart';

/// Auth repository provider
final authRepositoryProvider = Provider<IAuthRepository>((ref) {
  return LocalAuthRepository();
});

/// Auth state provider
final authStateProvider = StateNotifierProvider<AuthStateNotifier, AuthState>((ref) {
  return AuthStateNotifier(ref.read(authRepositoryProvider));
});

/// Current user provider
final currentUserProvider = Provider<UserModel?>((ref) {
  return ref.watch(authStateProvider).user;
});

/// Is authenticated provider
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authStateProvider).isAuthenticated;
});

/// Is loading provider
final isAuthLoadingProvider = Provider<bool>((ref) {
  return ref.watch(authStateProvider).isLoading;
});

/// Auth error provider
final authErrorProvider = Provider<String?>((ref) {
  return ref.watch(authStateProvider).error;
});

/// Is initialized provider
final isAuthInitializedProvider = Provider<bool>((ref) {
  return ref.watch(authStateProvider).isInitialized;
});
