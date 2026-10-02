/// App route constants
class AppRoutes {
  // Auth routes
  static const String splash = '/splash';
  static const String login = '/login';
  static const String signup = '/signup';
  static const String forgotPassword = '/forgot-password';
  
  // Main app routes (protected)
  static const String home = '/home';
  static const String search = '/search';
  static const String appointments = '/appointments';
  static const String profile = '/profile';
  
  // Doctor/Center detail routes
  static const String doctorDetail = '/doctor/:id';
  static const String centerDetail = '/center/:id';
  
  // Booking flow routes
  static const String booking = '/booking';
  static const String bookingService = '/booking/service';
  static const String bookingSlot = '/booking/slot';
  static const String bookingDetails = '/booking/details';
  static const String bookingConfirmation = '/booking/confirmation';
  
  // Appointment detail route
  static const String appointmentDetail = '/appointment/:id';
  
  // Profile routes
  static const String editProfile = '/profile/edit';
  static const String settings = '/profile/settings';
  static const String notifications = '/profile/notifications';
  
  // Helper methods to build routes with parameters
  static String doctorDetailWithId(String id) => '/doctor/$id';
  static String centerDetailWithId(String id) => '/center/$id';
  static String appointmentDetailWithId(String id) => '/appointment/$id';
}
