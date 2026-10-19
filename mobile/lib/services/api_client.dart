import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'device_service.dart';

/// Enhanced API Client with device tracking and authentication
class ApiClient {
  static const String baseUrl = 'https://medcin.vercel.app/api';
  // For local development:
  // static const String baseUrl = 'http://localhost:3000/api';

  final DeviceService _deviceService = DeviceService();
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  /// Get authorization headers with token and device info
  Future<Map<String, String>> _getHeaders() async {
    final token = await _secureStorage.read(key: 'auth_token');
    final deviceHeaders = await _deviceService.getDeviceHeaders();

    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...deviceHeaders,
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  /// Parse response with error handling
  Map<String, dynamic> _parseResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    }

    final data = jsonDecode(response.body);
    final errorMessage = data['error'] ?? data['message'] ?? 'Request failed';
    throw ApiException(
      message: errorMessage,
      statusCode: response.statusCode,
    );
  }

  /// GET request
  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, String>? queryParameters,
  }) async {
    final headers = await _getHeaders();
    final uri = Uri.parse('$baseUrl$path').replace(
      queryParameters: queryParameters,
    );

    final response = await http.get(uri, headers: headers);
    return _parseResponse(response);
  }

  /// POST request
  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final headers = await _getHeaders();
    final uri = Uri.parse('$baseUrl$path');

    final response = await http.post(
      uri,
      headers: headers,
      body: body != null ? jsonEncode(body) : null,
    );

    return _parseResponse(response);
  }

  /// PUT request
  Future<Map<String, dynamic>> put(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final headers = await _getHeaders();
    final uri = Uri.parse('$baseUrl$path');

    final response = await http.put(
      uri,
      headers: headers,
      body: body != null ? jsonEncode(body) : null,
    );

    return _parseResponse(response);
  }

  /// PATCH request
  Future<Map<String, dynamic>> patch(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final headers = await _getHeaders();
    final uri = Uri.parse('$baseUrl$path');

    final response = await http.patch(
      uri,
      headers: headers,
      body: body != null ? jsonEncode(body) : null,
    );

    return _parseResponse(response);
  }

  /// DELETE request
  Future<Map<String, dynamic>> delete(String path) async {
    final headers = await _getHeaders();
    final uri = Uri.parse('$baseUrl$path');

    final response = await http.delete(uri, headers: headers);
    return _parseResponse(response);
  }

  /// Store authentication token
  Future<void> setAuthToken(String token) async {
    await _secureStorage.write(key: 'auth_token', value: token);
  }

  /// Get stored authentication token
  Future<String?> getAuthToken() async {
    return await _secureStorage.read(key: 'auth_token');
  }

  /// Clear authentication token
  Future<void> clearAuthToken() async {
    await _secureStorage.delete(key: 'auth_token');
  }
}

/// Custom exception for API errors
class ApiException implements Exception {
  final String message;
  final int statusCode;

  ApiException({required this.message, required this.statusCode});

  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}
