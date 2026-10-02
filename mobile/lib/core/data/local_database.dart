import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:hive_flutter/hive_flutter.dart';

/// Local database using Hive for storing mock data
class LocalDatabase {
  // Box names
  static const String doctorsBox = 'doctors';
  static const String centersBox = 'centers';
  static const String bookingsBox = 'bookings';
  static const String profileBox = 'profile';
  static const String slotsBox = 'slots';
  
  /// Initialize Hive and load mock data
  static Future<void> init() async {
    // Initialize Hive
    await Hive.initFlutter();
    
    // Open boxes
    await Hive.openBox(doctorsBox);
    await Hive.openBox(centersBox);
    await Hive.openBox(bookingsBox);
    await Hive.openBox(profileBox);
    await Hive.openBox(slotsBox);
    
    // Load mock data on first launch
    await _loadMockDataIfNeeded();
  }
  
  /// Load mock data from JSON file if boxes are empty
  static Future<void> _loadMockDataIfNeeded() async {
    final doctorsBoxData = Hive.box(doctorsBox);
    
    // Only load if empty (first launch)
    if (doctorsBoxData.isEmpty) {
      try {
        // Load JSON from assets
        final jsonString = await rootBundle.loadString('assets/data/mock_data.json');
        final jsonData = json.decode(jsonString) as Map<String, dynamic>;
        
        // Store doctors
        final doctors = jsonData['medcin_doctors'] as List;
        for (var doctor in doctors) {
          await doctorsBoxData.put(doctor['id'], doctor);
        }
        
        // Store centers
        final centersBoxData = Hive.box(centersBox);
        final centers = jsonData['medcin_centers'] as List;
        for (var center in centers) {
          await centersBoxData.put(center['id'], center);
        }
        
        // Store bookings
        final bookingsBoxData = Hive.box(bookingsBox);
        final bookings = jsonData['medcin_bookings'] as List;
        for (var booking in bookings) {
          await bookingsBoxData.put(booking['id'], booking);
        }
        
        // Store profile
        final profileBoxData = Hive.box(profileBox);
        await profileBoxData.put('profile', jsonData['medcin_patient_profile']);
        
        // Store slots
        final slotsBoxData = Hive.box(slotsBox);
        final slots = jsonData['medcin_slots'] as Map<String, dynamic>;
        await slotsBoxData.putAll(slots);
        
        print('✅ Mock data loaded successfully');
      } catch (e) {
        print('❌ Error loading mock data: $e');
      }
    } else {
      print('✅ Data already exists in Hive');
    }
  }
  
  /// Clear all data (useful for testing)
  static Future<void> clearAll() async {
    await Hive.box(doctorsBox).clear();
    await Hive.box(centersBox).clear();
    await Hive.box(bookingsBox).clear();
    await Hive.box(profileBox).clear();
    await Hive.box(slotsBox).clear();
    print('✅ All data cleared');
  }
}
