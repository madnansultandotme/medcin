import '../../data/repositories/doctor_booking_repository.dart';
import '../../data/models/booking_model.dart';

/// Use case for checking in a patient
class CheckinPatient {
  final DoctorBookingRepository _repository = DoctorBookingRepository();

  Future<BookingModel> call(String bookingId) async {
    return await _repository.checkIn(bookingId);
  }
}
