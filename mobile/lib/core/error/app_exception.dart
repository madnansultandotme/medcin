/// Custom exception classes for the app
class AppException implements Exception {
  final String message;
  final String? code;
  final dynamic details;

  AppException({
    required this.message,
    this.code,
    this.details,
  });

  @override
  String toString() => message;
}

class NetworkException extends AppException {
  NetworkException({
    String message = 'Network error occurred. Please check your connection.',
    String? code,
    dynamic details,
  }) : super(message: message, code: code, details: details);
}

class AuthException extends AppException {
  AuthException({
    String message = 'Authentication failed. Please try again.',
    String? code,
    dynamic details,
  }) : super(message: message, code: code, details: details);
}

class ValidationException extends AppException {
  ValidationException({
    String message = 'Validation failed. Please check your input.',
    String? code,
    dynamic details,
  }) : super(message: message, code: code, details: details);
}

class DataException extends AppException {
  DataException({
    String message = 'Failed to load data. Please try again.',
    String? code,
    dynamic details,
  }) : super(message: message, code: code, details: details);
}
