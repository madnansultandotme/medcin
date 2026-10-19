import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/booking_model.dart';

/// Local datasource for caching doctor data
class DoctorLocalDatasource {
  static const String _bookingsCacheKey = 'doctor_bookings_cache';
  static const String _bookingsCacheTimeKey = 'doctor_bookings_cache_time';
  static const Duration _cacheValidity = Duration(minutes: 5);

  /// Cache bookings locally
  Future<void> cacheBookings(List<BookingModel> bookings) async {
    final prefs = await SharedPreferences.getInstance();
    
    final bookingsJson = bookings.map((b) => b.toJson()).toList();
    await prefs.setString(_bookingsCacheKey, jsonEncode(bookingsJson));
    await prefs.setInt(_bookingsCacheTimeKey, DateTime.now().millisecondsSinceEpoch);
  }

  /// Get cached bookings if valid
  Future<List<BookingModel>?> getCachedBookings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      final cachedTime = prefs.getInt(_bookingsCacheTimeKey);
      if (cachedTime == null) return null;

      final cacheAge = DateTime.now().millisecondsSinceEpoch - cachedTime;
      if (cacheAge > _cacheValidity.inMilliseconds) {
        // Cache expired
        return null;
      }

      final cachedJson = prefs.getString(_bookingsCacheKey);
      if (cachedJson == null) return null;

      final bookingsJson = jsonDecode(cachedJson) as List;
      return bookingsJson
          .map((json) => BookingModel.fromJson(json))
          .toList();
    } catch (e) {
      return null;
    }
  }

  /// Clear bookings cache
  Future<void> clearBookingsCache() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_bookingsCacheKey);
    await prefs.remove(_bookingsCacheTimeKey);
  }

  /// Update a single booking in cache
  Future<void> updateBookingInCache(BookingModel updatedBooking) async {
    final cachedBookings = await getCachedBookings();
    if (cachedBookings == null) return;

    final index = cachedBookings.indexWhere((b) => b.id == updatedBooking.id);
    if (index != -1) {
      cachedBookings[index] = updatedBooking;
      await cacheBookings(cachedBookings);
    }
  }
}
