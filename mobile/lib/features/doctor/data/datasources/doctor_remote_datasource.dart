import '../../../../services/api_client.dart';

/// Remote datasource for doctor-specific API calls
class DoctorRemoteDatasource {
  final ApiClient _apiClient = ApiClient();

  /// Fetch doctor profile
  Future<Map<String, dynamic>> fetchDoctorProfile() async {
    return await _apiClient.get('/auth/me');
  }

  /// Fetch doctor bookings
  Future<List<dynamic>> fetchBookings({
    String? status,
    String? date,
  }) async {
    final queryParams = <String, String>{};
    if (status != null) queryParams['status'] = status;
    if (date != null) queryParams['date'] = date;

    final response = await _apiClient.get(
      '/doctor/bookings',
      queryParameters: queryParams,
    );

    return response['bookings'] ?? response['data']?['bookings'] ?? [];
  }

  /// Check in patient
  Future<Map<String, dynamic>> checkInPatient(String bookingId) async {
    return await _apiClient.post(
      '/doctor/checkin',
      body: {'bookingId': bookingId},
    );
  }

  /// Check out patient
  Future<Map<String, dynamic>> checkOutPatient(String bookingId) async {
    return await _apiClient.post(
      '/doctor/checkout',
      body: {'bookingId': bookingId},
    );
  }

  /// Verify device with OTP
  Future<void> verifyDevice(String otp) async {
    await _apiClient.post(
      '/auth/verify-device',
      body: {'otp': otp},
    );
  }

  /// Request device OTP
  Future<void> requestDeviceOtp() async {
    await _apiClient.post('/auth/request-device-otp');
  }

  /// Change password on first login
  Future<void> changePasswordFirstLogin({
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
}
