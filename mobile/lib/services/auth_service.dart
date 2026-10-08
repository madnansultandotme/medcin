import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  // Neon Auth URL
  static const String neonAuthUrl =
      'https://ep-nameless-dust-b4ojh274.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth';
  
  // Backend API URL (for user sync and profile data)
  static const String backendUrl = 'http://localhost:3000'; // TODO: Change to deployed URL in production
  
  final _storage = const FlutterSecureStorage();
  
  // Storage keys
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';

  // Sign Up
  Future<Map<String, dynamic>> signUp({
    required String email,
    required String password,
    required String name,
  }) async {
    try {
      // Step 1: Create account with Neon Auth
      final signupResponse = await http.post(
        Uri.parse('$neonAuthUrl/sign-up/email'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
          'name': name,
        }),
      );

      if (signupResponse.statusCode != 200 && signupResponse.statusCode != 201) {
        final error = jsonDecode(signupResponse.body);
        throw Exception(error['message'] ?? 'Sign up failed');
      }

      final authData = jsonDecode(signupResponse.body);
      
      // Save session token
      if (authData['token'] != null) {
        await _storage.write(key: _tokenKey, value: authData['token']);
      }

      // Step 2: Sync user to backend database
      if (authData['user'] != null && authData['user']['id'] != null) {
        try {
          await http.post(
            Uri.parse('$backendUrl/api/auth/register'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'authUid': authData['user']['id'],
              'email': email,
              'name': name,
              'role': 'PATIENT',
            }),
          );
        } catch (e) {
          print('Warning: Failed to sync user to backend: $e');
          // Continue anyway - user is created in Neon Auth
        }

        // Get full user profile from backend
        final userData = await _fetchUserProfile(authData['token']);
        if (userData != null) {
          await _storage.write(key: _userKey, value: jsonEncode(userData));
          return {'user': userData, 'token': authData['token']};
        }
      }

      // Fallback to Neon Auth user data
      if (authData['user'] != null) {
        await _storage.write(key: _userKey, value: jsonEncode(authData['user']));
      }
      
      return authData;
    } catch (e) {
      throw Exception('Sign up failed: $e');
    }
  }

  // Sign In
  Future<Map<String, dynamic>> signIn(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$neonAuthUrl/sign-in/email'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode != 200) {
        final error = jsonDecode(response.body);
        throw Exception(error['message'] ?? 'Invalid email or password');
      }

      final authData = jsonDecode(response.body);
      
      // Save token
      if (authData['token'] != null) {
        await _storage.write(key: _tokenKey, value: authData['token']);
      }

      // Get user profile from backend
      final userData = await _fetchUserProfile(authData['token']);
      if (userData != null) {
        await _storage.write(key: _userKey, value: jsonEncode(userData));
        return {'user': userData, 'token': authData['token']};
      }

      // Fallback to Neon Auth user data
      if (authData['user'] != null) {
        await _storage.write(key: _userKey, value: jsonEncode(authData['user']));
      }

      return authData;
    } catch (e) {
      throw Exception('Sign in failed: $e');
    }
  }

  // Get current session
  Future<Map<String, dynamic>?> getSession() async {
    try {
      final token = await _storage.read(key: _tokenKey);
      final userData = await _storage.read(key: _userKey);

      if (token == null) return null;

      // Verify token is still valid
      final response = await http.get(
        Uri.parse('$neonAuthUrl/session'),
        headers: {
          'Authorization': 'Bearer $token',
          'Cookie': 'session=$token',
        },
      );

      if (response.statusCode == 200) {
        // Return cached user data if available
        if (userData != null) {
          return {
            'user': jsonDecode(userData),
            'token': token,
          };
        }

        final sessionData = jsonDecode(response.body);
        return sessionData;
      }

      // Token invalid, clear storage
      await signOut();
      return null;
    } catch (e) {
      print('Session check failed: $e');
      return null;
    }
  }

  // Fetch user profile from backend
  Future<Map<String, dynamic>?> _fetchUserProfile(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$backendUrl/api/auth/me'),
        headers: {
          'Authorization': 'Bearer $token',
          'Cookie': 'session=$token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['user'];
      }
    } catch (e) {
      print('Failed to fetch user profile: $e');
    }
    return null;
  }

  // Sign out
  Future<void> signOut() async {
    try {
      final token = await _storage.read(key: _tokenKey);
      
      if (token != null) {
        // Call backend signout
        await http.post(
          Uri.parse('$neonAuthUrl/sign-out'),
          headers: {
            'Authorization': 'Bearer $token',
            'Cookie': 'session=$token',
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

  // Get stored user
  Future<Map<String, dynamic>?> getStoredUser() async {
    final userData = await _storage.read(key: _userKey);
    if (userData != null) {
      return jsonDecode(userData);
    }
    return null;
  }

  // Get stored token
  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }
}
