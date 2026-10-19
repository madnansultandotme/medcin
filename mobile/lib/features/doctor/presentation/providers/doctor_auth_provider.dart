import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/doctor_model.dart';
import '../../data/repositories/doctor_auth_repository.dart';

/// Auth state for doctor
class DoctorAuthState {
  final DoctorModel? doctor;
  final bool isAuthenticated;
  final bool isLoading;
  final String? error;
  final bool needsPasswordReset;
  final bool needsDeviceVerification;

  const DoctorAuthState({
    this.doctor,
    this.isAuthenticated = false,
    this.isLoading = false,
    this.error,
    this.needsPasswordReset = false,
    this.needsDeviceVerification = false,
  });

  DoctorAuthState copyWith({
    DoctorModel? doctor,
    bool? isAuthenticated,
    bool? isLoading,
    String? error,
    bool? needsPasswordReset,
    bool? needsDeviceVerification,
  }) {
    return DoctorAuthState(
      doctor: doctor ?? this.doctor,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      needsPasswordReset: needsPasswordReset ?? this.needsPasswordReset,
      needsDeviceVerification: needsDeviceVerification ?? this.needsDeviceVerification,
    );
  }
}

/// Doctor auth state notifier
class DoctorAuthNotifier extends StateNotifier<DoctorAuthState> {
  final DoctorAuthRepository _repository = DoctorAuthRepository();

  DoctorAuthNotifier() : super(const DoctorAuthState()) {
    checkSession();
  }

  /// Check if session is valid
  Future<void> checkSession() async {
    state = state.copyWith(isLoading: true);

    try {
      final isValid = await _repository.checkSession();
      
      if (isValid) {
        final doctor = await _repository.getCurrentDoctor();
        state = state.copyWith(
          doctor: doctor,
          isAuthenticated: true,
          isLoading: false,
          needsPasswordReset: doctor.passwordResetRequired,
        );
      } else {
        state = state.copyWith(
          isAuthenticated: false,
          isLoading: false,
        );
      }
    } catch (e) {
      state = state.copyWith(
        isAuthenticated: false,
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Login with email and password
  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _repository.login(
        email: email,
        password: password,
      );

      // Check if device verification is required
      if (response['requiresDeviceVerification'] == true) {
        state = state.copyWith(
          isLoading: false,
          needsDeviceVerification: true,
        );
        return;
      }

      // Get doctor profile
      final doctor = await _repository.getCurrentDoctor();
      
      state = state.copyWith(
        doctor: doctor,
        isAuthenticated: true,
        isLoading: false,
        needsPasswordReset: doctor.passwordResetRequired,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Login with Google
  Future<void> loginWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await _repository.loginWithGoogle();

      // Get doctor profile
      final doctor = await _repository.getCurrentDoctor();
      
      state = state.copyWith(
        doctor: doctor,
        isAuthenticated: true,
        isLoading: false,
        needsPasswordReset: doctor.passwordResetRequired,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Change password on first login
  Future<void> changePassword({
    required String oldPassword,
    required String newPassword,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await _repository.changePassword(
        oldPassword: oldPassword,
        newPassword: newPassword,
      );

      // Refresh doctor profile
      final doctor = await _repository.getCurrentDoctor();
      
      state = state.copyWith(
        doctor: doctor,
        isLoading: false,
        needsPasswordReset: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Request device verification OTP
  Future<void> requestDeviceOtp() async {
    try {
      await _repository.requestDeviceOtp();
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  /// Verify device with OTP
  Future<void> verifyDevice(String otp) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await _repository.verifyDevice(otp: otp);
      
      // Get doctor profile after verification
      final doctor = await _repository.getCurrentDoctor();
      
      state = state.copyWith(
        doctor: doctor,
        isAuthenticated: true,
        isLoading: false,
        needsDeviceVerification: false,
        needsPasswordReset: doctor.passwordResetRequired,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Logout
  Future<void> logout() async {
    await _repository.logout();
    state = const DoctorAuthState();
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }
}

/// Doctor auth provider
final doctorAuthProvider = StateNotifierProvider<DoctorAuthNotifier, DoctorAuthState>((ref) {
  return DoctorAuthNotifier();
});
