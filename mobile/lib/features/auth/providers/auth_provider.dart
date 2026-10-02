import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/models/user_model.dart';
import 'auth_state.dart';
import 'auth_state_notifier.dart';

export 'auth_state_notifier.dart';

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
