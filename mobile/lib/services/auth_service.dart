import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Authentication Service for Mobile API (v1)
/// Handles user authentication, registration, and session management
class AuthService {
  // Mobile API Base URL - Production
  static const String baseUrl = 'https://medcin.vercel.app/api/mobile/v1';
  
  // For local development, uncomment this:
  // static const String baseUrl = 'http://localhost:3000/api/mobile/v1';
  
  final _storage = const FlutterSecureStorage();
  
  // Storage keys
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';

  /// Parse API response
  Map<String, dynamic> _parseResponse(http.Response response) {
    final data = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }
    throw Exception(data['error'] ?? 'Request failed');
  }

  // ==================== AUTHENTICATION ====================

  /// Register new user
  Future<Map<String, dynamic>> signUp({
    required String email,
    required String password,
    required String name,
    String? phone,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
          'name': name,
          if (phone != null) 'phone': phone,
        }),
      );

      final data = _parseResponse(response);
      
      // Save token and user data
      if (data['data']['token'] != null) {
        await _storage.write(key: _tokenKey, value: data['data']['token']);
      }
      if (data['data']['user'] != null) {
        await _storage.write(key: _userKey, value: jsonEncode(data['data']['user']));
      }

      return data['data'];
    } catch (e) {
      throw Exception('Sign up failed: $e');
    }
  }

  /// Login user
  Future<Map<String, dynamic>> signIn({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      final data = _parseResponse(response);
      
      // Save token and user data
      if (data['data']['token'] != null) {
        await _storage.write(key: _tokenKey, value: data['data']['token']);
      }
      if (data['data']['user'] != null) {
        await _storage.write(key: _userKey, value: jsonEncode(data['data']['user']));
      }

      return data['data'];
    } catch (e) {
      throw Exception('Sign in failed: $e');
    }
  }

  /// Logout user
  Future<void> signOut() async {
    try {
      final token = await _storage.read(key: _tokenKey);
      
      if (token != null) {
        // Call backend logout endpoint
        await http.post(
          Uri.parse('$baseUrl/auth/logout'),
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
        );
      }
    } catch (e) {
      print('Sign out request failed: $e');
    } finally {
      // Always clear local storage
      await _storage.delete(key: _tokenKey);
      await _storage.delete(key: _userKey);
    }
  }

  /// Refresh session token
  Future<Map<String, dynamic>?> refreshSession() async {
    try {
      final token = await _storage.read(key: _tokenKey);
      if (token == null) return null;

      final response = await http.post(
        Uri.parse('$baseUrl/auth/refresh'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = _parseResponse(response);
        
        // Update stored user data
        if (data['data']['user'] != null) {
          await _storage.write(key: _userKey, value: jsonEncode(data['data']['user']));
        }
        
        return data['data'];
      }

      // Token invalid, clear storage
      await signOut();
      return null;
    } catch (e) {
      print('Session refresh failed: $e');
      await signOut();
      return null;
    }
  }

  /// Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final token = await _storage.read(key: _tokenKey);
    if (token == null) return false;

    // Validate token by refreshing
    final session = await refreshSession();
    return session != null;
  }

  // ==================== PASSWORD MANAGEMENT ====================

  /// Request password reset
  Future<void> forgotPassword(String email) async {
    try {
      await http.post(
        Uri.parse('$baseUrl/auth/forgot-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );
    } catch (e) {
      throw Exception('Password reset request failed: $e');
    }
  }

  /// Reset password with token
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      await http.post(
        Uri.parse('$baseUrl/auth/reset-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'token': token,
          'newPassword': newPassword,
        }),
      );
    } catch (e) {
      throw Exception('Password reset failed: $e');
    }
  }

  /// Change password (authenticated)
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final token = await _storage.read(key: _tokenKey);
      if (token == null) throw Exception('Not authenticated');

      await http.post(
        Uri.parse('$baseUrl/auth/change-password'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        }),
      );
    } catch (e) {
      throw Exception('Password change failed: $e');
    }
  }

  // ==================== STORAGE HELPERS ====================

  /// Get stored user data
  Future<Map<String, dynamic>?> getStoredUser() async {
    final userData = await _storage.read(key: _userKey);
    if (userData != null) {
      return jsonDecode(userData);
    }
    return null;
  }

  /// Get stored authentication token
  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  /// Update stored user data
  Future<void> updateStoredUser(Map<String, dynamic> userData) async {
    await _storage.write(key: _userKey, value: jsonEncode(userData));
  }

  /// Clear all stored auth data
  Future<void> clearStorage() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _userKey);
  }
}
