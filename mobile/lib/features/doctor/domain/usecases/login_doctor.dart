import '../../data/repositories/doctor_auth_repository.dart';

/// Use case for doctor login
class LoginDoctor {
  final DoctorAuthRepository _repository = DoctorAuthRepository();

  Future<Map<String, dynamic>> call({
    required String email,
    required String password,
  }) async {
    return await _repository.login(
      email: email,
      password: password,
    );
  }

  Future<Map<String, dynamic>> withGoogle() async {
    return await _repository.loginWithGoogle();
  }
}
