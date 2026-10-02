import 'dart:async';
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/models/user_model.dart';

/// Local implementation of auth repository using flutter_secure_storage
class LocalAuthRepository implements IAuthRepository {
  final _storage = const FlutterSecureStorage();
  final _authStateController = StreamController<UserModel?>.broadcast();
  
  // Storage keys
  static const String _keyUserId = 'user_id';
  static const String _keyUserData = 'user_data';
  static const String _keyAuthToken = 'auth_token';
  
  @override
  Stream<UserModel?> get authStateChanges => _authStateController.stream;
  
  @override
  Future<UserModel?> getCurrentUser() async {
    try {
      final userData = await _storage.read(key: _keyUserData);
      if (userData == null) return null;
      
      final userJson = json.decode(userData) as Map<String, dynamic>;
      return UserModel.fromJson(userJson);
    } catch (e) {
      print('Error getting current user: $e');
      return null;
    }
  }
  
  @override
  Future<UserModel> signInWithEmail(String email, String password) async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));
    
    // Mock authentication - accept any email/password for demo
    // In real app, this would validate against backend
    
    if (email.isEmpty || password.isEmpty) {
      throw Exception('Email and password are required');
    }
    
    if (!email.contains('@')) {
      throw Exception('Invalid email format');
    }
    
    if (password.length < 6) {
      throw Exception('Password must be at least 6 characters');
    }
    
    // Create user from email
    final user = UserModel(
      id: 'user_${DateTime.now().millisecondsSinceEpoch}',
      email: email,
      name: _extractNameFromEmail(email),
      authProvider: 'email',
    );
    
    await _saveUser(user);
    _authStateController.add(user);
    
    return user;
  }
  
  @override
  Future<UserModel> signUpWithEmail(String email, String password, String name) async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));
    
    // Validation
    if (email.isEmpty || password.isEmpty || name.isEmpty) {
      throw Exception('All fields are required');
    }
    
    if (!email.contains('@')) {
      throw Exception('Invalid email format');
    }
    
    if (password.length < 6) {
      throw Exception('Password must be at least 6 characters');
    }
    
    if (name.length < 2) {
      throw Exception('Name must be at least 2 characters');
    }
    
    // Create new user
    final user = UserModel(
      id: 'user_${DateTime.now().millisecondsSinceEpoch}',
      email: email,
      name: name,
      authProvider: 'email',
    );
    
    await _saveUser(user);
    _authStateController.add(user);
    
    return user;
  }
  
  @override
  Future<void> signOut() async {
    await _storage.delete(key: _keyUserId);
    await _storage.delete(key: _keyUserData);
    await _storage.delete(key: _keyAuthToken);
    _authStateController.add(null);
  }
  
  @override
  Future<void> resetPassword(String email) async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));
    
    if (email.isEmpty || !email.contains('@')) {
      throw Exception('Invalid email format');
    }
    
    // Mock: In real app, this would send reset email
    print('Password reset email sent to $email');
  }
  
  /// Save user data to secure storage
  Future<void> _saveUser(UserModel user) async {
    await _storage.write(key: _keyUserId, value: user.id);
    await _storage.write(key: _keyUserData, value: json.encode(user.toJson()));
    await _storage.write(
      key: _keyAuthToken,
      value: 'mock_token_${user.id}_${DateTime.now().millisecondsSinceEpoch}',
    );
  }
  
  /// Extract name from email (before @ symbol)
  String _extractNameFromEmail(String email) {
    final parts = email.split('@');
    if (parts.isEmpty) return 'User';
    
    // Capitalize first letter
    final name = parts[0];
    if (name.isEmpty) return 'User';
    
    return name[0].toUpperCase() + name.substring(1);
  }
  
  /// Check if user is signed in (useful for init)
  Future<bool> isSignedIn() async {
    final userId = await _storage.read(key: _keyUserId);
    return userId != null;
  }
  
  /// Get auth token
  Future<String?> getAuthToken() async {
    return await _storage.read(key: _keyAuthToken);
  }
  
  void dispose() {
    _authStateController.close();
  }
}
