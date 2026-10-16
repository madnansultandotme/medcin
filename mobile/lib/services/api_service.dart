import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

/// API Service for Mobile Backend (v1)
/// Base URL: https://medcin.vercel.app/api/mobile/v1
class ApiService {
  final AuthService _authService = AuthService();
  
  // Mobile API Base URL - Production
  static const String baseUrl = 'https://medcin.vercel.app/api/mobile/v1';
  
  // For local development, uncomment this:
  // static const String baseUrl = 'http://localhost:3000/api/mobile/v1';

  /// Helper: Get authorization headers with token
  Future<Map<String, String>> _getHeaders() async {
    final token = await _authService.getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  /// Helper: Parse response with standard format
  Map<String, dynamic> _parseResponse(http.Response response) {
    final data = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }
    throw Exception(data['error'] ?? 'Request failed');
  }

  // ==================== HEALTH CHECK ====================
  
  /// Check API health status
  Future<Map<String, dynamic>> checkHealth() async {
    final response = await http.get(Uri.parse('$baseUrl/health'));
    return _parseResponse(response);
  }

  /// Check API version and app requirements
  Future<Map<String, dynamic>> checkVersion() async {
    final response = await http.get(Uri.parse('$baseUrl/version'));
    return _parseResponse(response);
  }

  // ==================== DOCTORS ====================
  
  /// Get list of doctors with optional filters
  Future<List<dynamic>> getDoctors({
    bool? featured,
    int? limit,
  }) async {
    final queryParams = <String, String>{};
    if (featured != null) queryParams['featured'] = featured.toString();
    if (limit != null) queryParams['limit'] = limit.toString();

    final uri = Uri.parse('$baseUrl/doctors').replace(queryParameters: queryParams);
    final response = await http.get(uri);
    final data = _parseResponse(response);
    return data['data']['doctors'] ?? [];
  }

  /// Search doctors with advanced filters
  Future<Map<String, dynamic>> searchDoctors({
    String? query,
    String? category,
    double? minPrice,
    double? maxPrice,
    double? minRating,
    String? city,
    String? country,
    double? latitude,
    double? longitude,
    int? radius,
    int? page,
    int? limit,
  }) async {
    final queryParams = <String, String>{};
    if (query != null) queryParams['q'] = query;
    if (category != null) queryParams['category'] = category;
    if (minPrice != null) queryParams['minPrice'] = minPrice.toString();
    if (maxPrice != null) queryParams['maxPrice'] = maxPrice.toString();
    if (minRating != null) queryParams['rating'] = minRating.toString();
    if (city != null) queryParams['city'] = city;
    if (country != null) queryParams['country'] = country;
    if (latitude != null) queryParams['latitude'] = latitude.toString();
    if (longitude != null) queryParams['longitude'] = longitude.toString();
    if (radius != null) queryParams['radius'] = radius.toString();
    if (page != null) queryParams['page'] = page.toString();
    if (limit != null) queryParams['limit'] = limit.toString();

    final uri = Uri.parse('$baseUrl/doctors/search').replace(queryParameters: queryParams);
    final response = await http.get(uri);
    final data = _parseResponse(response);
    return data['data'];
  }

  /// Get doctor by ID with full details
  Future<Map<String, dynamic>> getDoctorById(String id) async {
    final response = await http.get(Uri.parse('$baseUrl/doctors/$id'));
    final data = _parseResponse(response);
    return data['data'];
  }

  /// Get doctor categories
  Future<List<dynamic>> getDoctorCategories() async {
    final response = await http.get(Uri.parse('$baseUrl/doctors/categories'));
    final data = _parseResponse(response);
    return data['data']['categories'] ?? [];
  }

  // ==================== CENTERS ====================
  
  /// Search medical centers
  Future<Map<String, dynamic>> searchCenters({
    String? query,
    String? category,
    String? city,
    String? country,
    double? latitude,
    double? longitude,
    int? radius,
    int? page,
    int? limit,
  }) async {
    final queryParams = <String, String>{};
    if (query != null) queryParams['q'] = query;
    if (category != null) queryParams['category'] = category;
    if (city != null) queryParams['city'] = city;
    if (country != null) queryParams['country'] = country;
    if (latitude != null) queryParams['latitude'] = latitude.toString();
    if (longitude != null) queryParams['longitude'] = longitude.toString();
    if (radius != null) queryParams['radius'] = radius.toString();
    if (page != null) queryParams['page'] = page.toString();
    if (limit != null) queryParams['limit'] = limit.toString();

    final uri = Uri.parse('$baseUrl/centers').replace(queryParameters: queryParams);
    final response = await http.get(uri);
    final data = _parseResponse(response);
    return data['data'];
  }

  /// Get center by ID with full details
  Future<Map<String, dynamic>> getCenterById(String id) async {
    final response = await http.get(Uri.parse('$baseUrl/centers/$id'));
    final data = _parseResponse(response);
    return data['data'];
  }

  /// Get center categories
  Future<List<dynamic>> getCenterCategories() async {
    final response = await http.get(Uri.parse('$baseUrl/centers/categories'));
    final data = _parseResponse(response);
    return data['data']['categories'] ?? [];
  }

  // ==================== SLOTS ====================
  
  /// Get available time slots for a doctor
  Future<Map<String, dynamic>> getSlots({
    required String doctorId,
    String? date,
  }) async {
    final queryParams = {'doctorId': doctorId};
    if (date != null) queryParams['date'] = date;

    final uri = Uri.parse('$baseUrl/slots').replace(queryParameters: queryParams);
    final response = await http.get(uri);
    final data = _parseResponse(response);
    return data['data'];
  }

  // ==================== BOOKINGS ====================
  
  /// Get user's bookings (authenticated)
  Future<List<dynamic>> getBookings({
    String? status,
    int? limit,
  }) async {
    final headers = await _getHeaders();
    final queryParams = <String, String>{};
    if (status != null) queryParams['status'] = status;
    if (limit != null) queryParams['limit'] = limit.toString();

    final uri = Uri.parse('$baseUrl/bookings').replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: headers);
    final data = _parseResponse(response);
    return data['data']['bookings'] ?? [];
  }

  /// Create a booking (authenticated)
  Future<Map<String, dynamic>> createBooking({
    required String doctorId,
    required String slotId,
    required String date,
    required String time,
    required double price,
    String? serviceId,
    String? notes,
    String? paymentMethod,
  }) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/bookings'),
      headers: headers,
      body: jsonEncode({
        'doctorId': doctorId,
        'slotId': slotId,
        'date': date,
        'time': time,
        'price': price,
        if (serviceId != null) 'serviceId': serviceId,
        if (notes != null) 'notes': notes,
        if (paymentMethod != null) 'paymentMethod': paymentMethod,
      }),
    );
    final data = _parseResponse(response);
    return data['data']['booking'];
  }

  /// Get booking details by ID (authenticated)
  Future<Map<String, dynamic>> getBookingById(String id) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/bookings/$id'),
      headers: headers,
    );
    final data = _parseResponse(response);
    return data['data']['booking'];
  }

  /// Cancel booking (authenticated)
  Future<Map<String, dynamic>> cancelBooking({
    required String bookingId,
    String? cancellationReason,
  }) async {
    final headers = await _getHeaders();
    final response = await http.patch(
      Uri.parse('$baseUrl/bookings/$bookingId'),
      headers: headers,
      body: jsonEncode({
        'action': 'cancel',
        if (cancellationReason != null) 'cancellationReason': cancellationReason,
      }),
    );
    final data = _parseResponse(response);
    return data['data']['booking'];
  }

  // ==================== PROFILE ====================
  
  /// Get user profile (authenticated)
  Future<Map<String, dynamic>> getProfile() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/profile'),
      headers: headers,
    );
    final data = _parseResponse(response);
    return data['data'];
  }

  /// Update user profile (authenticated)
  Future<Map<String, dynamic>> updateProfile({
    String? name,
    String? phone,
    String? photoUrl,
    String? location,
    String? emergencyName,
    String? emergencyRelation,
    String? emergencyPhone,
    String? medicalNotes,
    String? insuranceProvider,
    String? insurancePolicy,
    String? preferredLanguage,
  }) async {
    final headers = await _getHeaders();
    final body = <String, dynamic>{};
    if (name != null) body['name'] = name;
    if (phone != null) body['phone'] = phone;
    if (photoUrl != null) body['photoUrl'] = photoUrl;
    if (location != null) body['location'] = location;
    if (emergencyName != null) body['emergencyName'] = emergencyName;
    if (emergencyRelation != null) body['emergencyRelation'] = emergencyRelation;
    if (emergencyPhone != null) body['emergencyPhone'] = emergencyPhone;
    if (medicalNotes != null) body['medicalNotes'] = medicalNotes;
    if (insuranceProvider != null) body['insuranceProvider'] = insuranceProvider;
    if (insurancePolicy != null) body['insurancePolicy'] = insurancePolicy;
    if (preferredLanguage != null) body['preferredLanguage'] = preferredLanguage;

    final response = await http.patch(
      Uri.parse('$baseUrl/profile'),
      headers: headers,
      body: jsonEncode(body),
    );
    final data = _parseResponse(response);
    return data['data'];
  }

  // ==================== REVIEWS ====================
  
  /// Get reviews for a doctor
  Future<List<dynamic>> getReviews({
    required String doctorId,
    int? limit,
  }) async {
    final queryParams = {'doctorId': doctorId};
    if (limit != null) queryParams['limit'] = limit.toString();

    final uri = Uri.parse('$baseUrl/reviews').replace(queryParameters: queryParams);
    final response = await http.get(uri);
    final data = _parseResponse(response);
    return data['data']['reviews'] ?? [];
  }

  /// Create a review for completed booking (authenticated)
  Future<Map<String, dynamic>> createReview({
    required String bookingId,
    required String doctorId,
    required int rating,
    String? comment,
  }) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/reviews'),
      headers: headers,
      body: jsonEncode({
        'bookingId': bookingId,
        'doctorId': doctorId,
        'rating': rating,
        if (comment != null) 'comment': comment,
      }),
    );
    final data = _parseResponse(response);
    return data['data']['review'];
  }

  // ==================== NOTIFICATIONS ====================
  
  /// Get user notifications (authenticated)
  Future<Map<String, dynamic>> getNotifications({
    bool? unreadOnly,
    int? limit,
  }) async {
    final headers = await _getHeaders();
    final queryParams = <String, String>{};
    if (unreadOnly != null) queryParams['unreadOnly'] = unreadOnly.toString();
    if (limit != null) queryParams['limit'] = limit.toString();

    final uri = Uri.parse('$baseUrl/notifications').replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: headers);
    final data = _parseResponse(response);
    return data['data'];
  }

  /// Mark all notifications as read (authenticated)
  Future<void> markAllNotificationsRead() async {
    final headers = await _getHeaders();
    await http.patch(
      Uri.parse('$baseUrl/notifications'),
      headers: headers,
    );
  }

  /// Mark notification as read (authenticated)
  Future<void> markNotificationRead(String notificationId) async {
    final headers = await _getHeaders();
    await http.patch(
      Uri.parse('$baseUrl/notifications/$notificationId'),
      headers: headers,
    );
  }

  /// Delete notification (authenticated)
  Future<void> deleteNotification(String notificationId) async {
    final headers = await _getHeaders();
    await http.delete(
      Uri.parse('$baseUrl/notifications/$notificationId'),
      headers: headers,
    );
  }

  // ==================== SUBSCRIPTION ====================
  
  /// Get subscription status (authenticated)
  Future<Map<String, dynamic>> getSubscriptionStatus() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/subscription'),
      headers: headers,
    );
    final data = _parseResponse(response);
    return data['data'];
  }

  /// Activate subscription after in-app purchase (authenticated)
  Future<Map<String, dynamic>> activateSubscription({
    required String tier, // 'BASIC' or 'PREMIUM'
    required String platform, // 'GOOGLE_PLAY' or 'APP_STORE'
    required String purchaseToken,
    required int duration, // Duration in months
  }) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/subscription'),
      headers: headers,
      body: jsonEncode({
        'tier': tier,
        'platform': platform,
        'purchaseToken': purchaseToken,
        'duration': duration,
      }),
    );
    final data = _parseResponse(response);
    return data['data'];
  }

  /// Cancel subscription (authenticated)
  Future<void> cancelSubscription() async {
    final headers = await _getHeaders();
    await http.delete(
      Uri.parse('$baseUrl/subscription'),
      headers: headers,
    );
  }
}
