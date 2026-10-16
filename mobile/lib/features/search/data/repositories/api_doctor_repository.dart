import '../../domain/repositories/doctor_repository.dart';
import '../../../../shared/models/doctor.dart';
import '../../../../services/api_service.dart';

/// API implementation of doctor repository
class ApiDoctorRepository implements IDoctorRepository {
  final ApiService _apiService = ApiService();
  
  @override
  Future<List<Doctor>> getAllDoctors() async {
    try {
      final doctors = await _apiService.getDoctors(limit: 100);
      return doctors.map((json) => Doctor.fromJson(json)).toList();
    } catch (e) {
      print('Error fetching all doctors: $e');
      return [];
    }
  }
  
  @override
  Future<Doctor?> getDoctorById(String id) async {
    try {
      final doctorData = await _apiService.getDoctorById(id);
      return Doctor.fromJson(doctorData);
    } catch (e) {
      print('Error fetching doctor by ID: $e');
      return null;
    }
  }
  
  @override
  Future<List<Doctor>> searchDoctors({
    String? query,
    String? category,
    String? location,
    String? sortBy,
  }) async {
    try {
      final searchResult = await _apiService.searchDoctors(
        query: query,
        category: category,
        city: location,
      );
      
      final doctors = (searchResult['doctors'] as List)
          .map((json) => Doctor.fromJson(json))
          .toList();
      
      // Apply sorting locally if needed
      if (sortBy != null) {
        switch (sortBy) {
          case 'rating':
            doctors.sort((a, b) => b.rating.compareTo(a.rating));
            break;
          case 'price-asc':
            doctors.sort((a, b) => a.price.compareTo(b.price));
            break;
          case 'price-desc':
            doctors.sort((a, b) => b.price.compareTo(a.price));
            break;
        }
      }
      
      return doctors;
    } catch (e) {
      print('Error searching doctors: $e');
      return [];
    }
  }
}
