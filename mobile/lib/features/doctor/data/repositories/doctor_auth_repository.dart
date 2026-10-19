import '../../../../services/api_client.dart';
import '../../../../services/google_auth_service.dart';
import '../models/doctor_model.dart';

/// Repository for doctor authentication operations
class DoctorAuthRepository {
  final ApiClient _apiClient = ApiClient();
  final GoogleAuthService _googleAuth = GoogleAuthService();

  /// Login with email and password
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post(
      '/auth/login',
      body: {
        'email': email,
        'password': password,
        'role': 'DOCTOR',
      },
    );

    final token = response['token'] ?? response['data']?['token'];
    if (token != null) {
      await _apiClient.setAuthToken(token);
    }

    return response;
  }

  /// Login with Google
  Future<Map<String, dynamic>> loginWithGoogle() async {
    return await _googleAuth.signInWithGoogle();
  }

  /// Get current authenticated doctor
  Future<DoctorModel> getCurrentDoctor() async {
    final response = await _apiClient.get('/auth/me');
    return DoctorModel.fromJson(response);
  }

  /// Check session validity
  Future<bool> checkSession() async {
    try {
      final token = await _apiClient.getAuthToken();
      if (token == null) return false;

      await _apiClient.get('/auth/me');
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Change password (first login)
  Future<void> changePassword({
    required String oldPassword,
    required String newPassword,
  }) async {
    await _apiClient.post(
      '/auth/change-password-first-login',
      body: {
        'oldPassword': oldPassword,
        'newPassword': newPassword,
      },
    );
  }

  /// Request device verification OTP
  Future<void> requestDeviceOtp() async {
    await _apiClient.post('/auth/request-device-otp');
  }

  /// Verify device with OTP
  Future<void> verifyDevice({required String otp}) async {
    await _apiClient.post(
      '/auth/verify-device',
      body: {'otp': otp},
    );
  }

  /// Logout
  Future<void> logout() async {
    await _apiClient.clearAuthToken();
    await _googleAuth.signOut();
  }
}
