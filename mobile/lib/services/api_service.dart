import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

/// API Service for all backend calls
/// This service calls the Next.js API routes, NOT Neon directly
class ApiService {
  final AuthService _authService = AuthService();
  
  // Backend URL - TODO: Change to deployed URL in production
  static const String baseUrl = 'http://localhost:3000/api';

  /// Helper: Get authorization headers with token
  Future<Map<String, String>> _getHeaders() async {
    final token = await _authService.getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
      if (token != null) 'Cookie': 'session=$token',
    };
  }

  // ==================== DOCTORS ====================
  
  /// Get list of doctors (public endpoint)
  Future<List<dynamic>> getDoctors({
    String? search,
    String? category,
    String? centerId,
  }) async {
    final queryParams = <String, String>{};
    if (search != null) queryParams['search'] = search;
    if (category != null) queryParams['category'] = category;
    if (centerId != null) queryParams['centerId'] = centerId;

    final uri = Uri.parse('$baseUrl/doctors').replace(queryParameters: queryParams);
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['doctors'] ?? [];
    }
    throw Exception('Failed to fetch doctors');
  }

  /// Get doctor by ID
  Future<Map<String, dynamic>> getDoctorById(String id) async {
    final doctors = await getDoctors();
    return doctors.firstWhere(
      (doctor) => doctor['id'] == id,
      orElse: () => throw Exception('Doctor not found'),
    );
  }

  // ==================== CENTERS ====================
  
  /// Get list of centers (public endpoint)
  Future<List<dynamic>> getCenters({
    String? search,
    String? category,
    String? status,
  }) async {
    final queryParams = <String, String>{};
    if (search != null) queryParams['search'] = search;
    if (category != null) queryParams['category'] = category;
    if (status != null) queryParams['status'] = status;

    final uri = Uri.parse('$baseUrl/centers').replace(queryParameters: queryParams);
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['centers'] ?? [];
    }
    throw Exception('Failed to fetch centers');
  }

  // ==================== SERVICES ====================
  
  /// Get services for a doctor (public endpoint)
  Future<List<dynamic>> getServices(String doctorId) async {
    final uri = Uri.parse('$baseUrl/services').replace(
      queryParameters: {'doctorId': doctorId},
    );
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['services'] ?? [];
    }
    throw Exception('Failed to fetch services');
  }

  // ==================== SLOTS ====================
  
  /// Get available slots for a doctor (public endpoint)
  Future<List<dynamic>> getSlots({
    required String doctorId,
    String? date,
    String? status,
  }) async {
    final queryParams = {'doctorId': doctorId};
    if (date != null) queryParams['date'] = date;
    if (status != null) queryParams['status'] = status;

    final uri = Uri.parse('$baseUrl/slots').replace(queryParameters: queryParams);
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['slots'] ?? [];
    }
    throw Exception('Failed to fetch slots');
  }

  // ==================== BOOKINGS ====================
  
  /// Get user's bookings (authenticated)
  Future<List<dynamic>> getBookings() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/bookings'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['bookings'] ?? [];
    } else if (response.statusCode == 401) {
      throw Exception('Unauthorized - please login');
    }
    throw Exception('Failed to fetch bookings');
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
      }),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return data['booking'];
    } else if (response.statusCode == 401) {
      throw Exception('Unauthorized - please login');
    }
    throw Exception('Failed to create booking');
  }

  /// Update booking status (authenticated)
  Future<Map<String, dynamic>> updateBooking({
    required String bookingId,
    String? status,
    String? notes,
    String? cancellationReason,
  }) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/bookings'),
      headers: headers,
      body: jsonEncode({
        'id': bookingId,
        if (status != null) 'status': status,
        if (notes != null) 'notes': notes,
        if (cancellationReason != null) 'cancellationReason': cancellationReason,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['booking'];
    } else if (response.statusCode == 401) {
      throw Exception('Unauthorized - please login');
    }
    throw Exception('Failed to update booking');
  }

  // ==================== PATIENT PROFILE ====================
  
  /// Get current user's patient profile (authenticated)
  Future<Map<String, dynamic>?> getPatientProfile() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/patient/profile'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['profile'];
    } else if (response.statusCode == 404) {
      return null; // Profile doesn't exist yet
    } else if (response.statusCode == 401) {
      throw Exception('Unauthorized - please login');
    }
    throw Exception('Failed to fetch profile');
  }

  /// Create patient profile (authenticated)
  Future<Map<String, dynamic>> createPatientProfile({
    String? location,
    String? photoUrl,
    String? emergencyName,
    String? emergencyRelation,
    String? emergencyPhone,
    String? medicalNotes,
    String? insuranceProvider,
    String? insurancePolicy,
    String? preferredLanguage,
  }) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/patient/profile'),
      headers: headers,
      body: jsonEncode({
        if (location != null) 'location': location,
        if (photoUrl != null) 'photoUrl': photoUrl,
        if (emergencyName != null) 'emergencyName': emergencyName,
        if (emergencyRelation != null) 'emergencyRelation': emergencyRelation,
        if (emergencyPhone != null) 'emergencyPhone': emergencyPhone,
        if (medicalNotes != null) 'medicalNotes': medicalNotes,
        if (insuranceProvider != null) 'insuranceProvider': insuranceProvider,
        if (insurancePolicy != null) 'insurancePolicy': insurancePolicy,
        if (preferredLanguage != null) 'preferredLanguage': preferredLanguage,
      }),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return data['profile'];
    } else if (response.statusCode == 401) {
      throw Exception('Unauthorized - please login');
    }
    throw Exception('Failed to create profile');
  }

  /// Update patient profile (authenticated)
  Future<Map<String, dynamic>> updatePatientProfile({
    required String profileId,
    String? location,
    String? photoUrl,
    String? emergencyName,
    String? emergencyRelation,
    String? emergencyPhone,
    String? medicalNotes,
    String? insuranceProvider,
    String? insurancePolicy,
    String? preferredLanguage,
  }) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/patient/profile'),
      headers: headers,
      body: jsonEncode({
        'id': profileId,
        if (location != null) 'location': location,
        if (photoUrl != null) 'photoUrl': photoUrl,
        if (emergencyName != null) 'emergencyName': emergencyName,
        if (emergencyRelation != null) 'emergencyRelation': emergencyRelation,
        if (emergencyPhone != null) 'emergencyPhone': emergencyPhone,
        if (medicalNotes != null) 'medicalNotes': medicalNotes,
        if (insuranceProvider != null) 'insuranceProvider': insuranceProvider,
        if (insurancePolicy != null) 'insurancePolicy': insurancePolicy,
        if (preferredLanguage != null) 'preferredLanguage': preferredLanguage,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['profile'];
    } else if (response.statusCode == 401) {
      throw Exception('Unauthorized - please login');
    }
    throw Exception('Failed to update profile');
  }

  // ==================== DISPUTES ====================
  
  /// Get user's disputes (authenticated)
  Future<List<dynamic>> getDisputes() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/disputes'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['disputes'] ?? [];
    } else if (response.statusCode == 401) {
      throw Exception('Unauthorized - please login');
    }
    throw Exception('Failed to fetch disputes');
  }

  /// Create a dispute (authenticated)
  Future<Map<String, dynamic>> createDispute({
    required String bookingId,
    required String title,
    required String description,
    required double amount,
  }) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/disputes'),
      headers: headers,
      body: jsonEncode({
        'bookingId': bookingId,
        'title': title,
        'description': description,
        'amount': amount,
      }),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return data['dispute'];
    } else if (response.statusCode == 401) {
      throw Exception('Unauthorized - please login');
    }
    throw Exception('Failed to create dispute');
  }
}
