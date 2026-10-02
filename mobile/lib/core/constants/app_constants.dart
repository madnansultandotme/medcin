/// App-wide constants
class AppConstants {
  // App Info
  static const String appName = 'Medcin';
  static const String appVersion = '1.0.0';
  static const String appTagline = 'Connecting ASEAN to Quality Healthcare';
  
  // Demo User Credentials
  static const String demoEmail = 'demo@medcin.health';
  static const String demoPassword = 'password123';
  
  // Booking Reference Prefix
  static const String bookingPrefix = 'MED-SG';
  
  // Time Slots
  static const List<String> morningSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  ];
  
  static const List<String> afternoonSlots = [
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  ];
  
  // Validation
  static const int minPasswordLength = 6;
  static const int maxNotesLength = 500;
  
  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 400);
  static const Duration longAnimation = Duration(milliseconds: 800);
  
  // Debounce Duration
  static const Duration searchDebounce = Duration(milliseconds: 300);
  
  // Pagination
  static const int itemsPerPage = 20;
  
  // Support Contact
  static const String supportEmail = 'support@medcin.health';
  static const String supportPhone = '+65 6123 4567';
  
  // Links
  static const String privacyPolicyUrl = 'https://medcin.health/privacy';
  static const String termsUrl = 'https://medcin.health/terms';
  static const String websiteUrl = 'https://medcin.health';
}

/// Cancellation Reasons
class CancellationReasons {
  static const List<String> reasons = [
    'Schedule conflict',
    'Found another provider',
    'Feeling better',
    'Emergency came up',
    'Changed my mind',
    'Other',
  ];
}

/// Notification Types
class NotificationTypes {
  static const String appointmentReminder = 'appointment_reminder';
  static const String bookingConfirmed = 'booking_confirmed';
  static const String appointmentRescheduled = 'appointment_rescheduled';
  static const String appointmentCancelled = 'appointment_cancelled';
}
