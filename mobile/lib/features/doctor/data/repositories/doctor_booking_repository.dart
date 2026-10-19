import '../../../../services/api_client.dart';
import '../models/booking_model.dart';

/// Repository for doctor booking operations
class DoctorBookingRepository {
  final ApiClient _apiClient = ApiClient();

  /// Get all bookings for the doctor
  Future<List<BookingModel>> getBookings({
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

    final bookings = response['bookings'] ?? response['data']?['bookings'] ?? [];
    return (bookings as List)
        .map((json) => BookingModel.fromJson(json))
        .toList();
  }

  /// Get booking by ID
  Future<BookingModel> getBookingById(String bookingId) async {
    final response = await _apiClient.get('/doctor/bookings/$bookingId');
    final booking = response['booking'] ?? response['data']?['booking'];
    return BookingModel.fromJson(booking);
  }

  /// Check in a patient
  Future<BookingModel> checkIn(String bookingId) async {
    final response = await _apiClient.post(
      '/doctor/checkin',
      body: {'bookingId': bookingId},
    );

    final booking = response['booking'] ?? response['data']?['booking'];
    return BookingModel.fromJson(booking);
  }

  /// Check out a patient (calculates commission)
  Future<BookingModel> checkOut(String bookingId) async {
    final response = await _apiClient.post(
      '/doctor/checkout',
      body: {'bookingId': bookingId},
    );

    final booking = response['booking'] ?? response['data']?['booking'];
    return BookingModel.fromJson(booking);
  }

  /// Get booking statistics for dashboard
  Future<Map<String, dynamic>> getBookingStats() async {
    final today = DateTime.now().toIso8601String().split('T')[0];
    final bookings = await getBookings(date: today);

    final confirmed = bookings.where((b) => b.status == 'CONFIRMED').length;
    final checkedIn = bookings.where((b) => b.isCheckedIn && !b.isCheckedOut).length;
    final completed = bookings.where((b) => b.isCheckedOut).length;

    return {
      'todayTotal': bookings.length,
      'confirmed': confirmed,
      'checkedIn': checkedIn,
      'completed': completed,
    };
  }
}
