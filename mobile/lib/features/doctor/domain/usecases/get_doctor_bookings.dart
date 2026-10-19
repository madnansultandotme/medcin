import '../../data/repositories/doctor_booking_repository.dart';
import '../../data/models/booking_model.dart';

/// Use case for getting doctor bookings
class GetDoctorBookings {
  final DoctorBookingRepository _repository = DoctorBookingRepository();

  Future<List<BookingModel>> call({
    String? status,
    String? date,
  }) async {
    return await _repository.getBookings(
      status: status,
      date: date,
    );
  }

  Future<Map<String, dynamic>> getStats() async {
    return await _repository.getBookingStats();
  }
}
