import '../../../../shared/models/doctor.dart';

/// Repository interface for doctor data access
abstract class IDoctorRepository {
  /// Get all doctors
  Future<List<Doctor>> getAllDoctors();
  
  /// Get doctor by ID
  Future<Doctor?> getDoctorById(String id);
  
  /// Search doctors with filters
  Future<List<Doctor>> searchDoctors({
    String? query,
    String? category,
    String? location,
    String? sortBy,
  });
}
