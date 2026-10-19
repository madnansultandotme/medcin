import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/booking_model.dart';
import '../../data/repositories/doctor_booking_repository.dart';
import '../../domain/usecases/checkin_patient.dart';
import '../../domain/usecases/checkout_patient.dart';

/// Booking state
class BookingState {
  final List<BookingModel> bookings;
  final bool isLoading;
  final String? error;
  final Map<String, dynamic>? stats;

  const BookingState({
    this.bookings = const [],
    this.isLoading = false,
    this.error,
    this.stats,
  });

  BookingState copyWith({
    List<BookingModel>? bookings,
    bool? isLoading,
    String? error,
    Map<String, dynamic>? stats,
  }) {
    return BookingState(
      bookings: bookings ?? this.bookings,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      stats: stats ?? this.stats,
    );
  }
}

/// Doctor bookings notifier
class DoctorBookingsNotifier extends StateNotifier<BookingState> {
  final DoctorBookingRepository _repository = DoctorBookingRepository();
  final CheckinPatient _checkinUseCase = CheckinPatient();
  final CheckoutPatient _checkoutUseCase = CheckoutPatient();

  DoctorBookingsNotifier() : super(const BookingState());

  /// Load bookings
  Future<void> loadBookings({String? status, String? date}) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final bookings = await _repository.getBookings(
        status: status,
        date: date,
      );

      state = state.copyWith(
        bookings: bookings,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Load booking statistics
  Future<void> loadStats() async {
    try {
      final stats = await _repository.getBookingStats();
      state = state.copyWith(stats: stats);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  /// Check in patient
  Future<void> checkIn(String bookingId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final updatedBooking = await _checkinUseCase.call(bookingId);

      // Update booking in list
      final updatedBookings = state.bookings.map((b) {
        return b.id == bookingId ? updatedBooking : b;
      }).toList();

      state = state.copyWith(
        bookings: updatedBookings,
        isLoading: false,
      );

      // Reload stats
      await loadStats();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Check out patient
  Future<void> checkOut(String bookingId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final updatedBooking = await _checkoutUseCase.call(bookingId);

      // Update booking in list
      final updatedBookings = state.bookings.map((b) {
        return b.id == bookingId ? updatedBooking : b;
      }).toList();

      state = state.copyWith(
        bookings: updatedBookings,
        isLoading: false,
      );

      // Reload stats
      await loadStats();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Refresh bookings
  Future<void> refresh() async {
    await loadBookings();
    await loadStats();
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }
}

/// Doctor bookings provider
final doctorBookingsProvider = StateNotifierProvider<DoctorBookingsNotifier, BookingState>((ref) {
  return DoctorBookingsNotifier();
});
