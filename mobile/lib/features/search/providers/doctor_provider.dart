import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/repositories/doctor_repository.dart';
import '../data/repositories/local_doctor_repository.dart';
import '../../../shared/models/doctor.dart';

/// Repository provider
final doctorRepositoryProvider = Provider<IDoctorRepository>((ref) {
  return LocalDoctorRepository();
});

/// Provider for all doctors
final allDoctorsProvider = FutureProvider<List<Doctor>>((ref) async {
  final repository = ref.read(doctorRepositoryProvider);
  return repository.getAllDoctors();
});

/// Synchronous doctors provider (loads from cache/Hive immediately)
final doctorsProvider = Provider<List<Doctor>>((ref) {
  final repository = ref.read(doctorRepositoryProvider) as LocalDoctorRepository;
  return repository.getCachedDoctors();
});

/// Provider for searching doctors with filters
final searchDoctorsProvider = FutureProvider.family<List<Doctor>, DoctorSearchParams>(
  (ref, params) async {
    final repository = ref.read(doctorRepositoryProvider);
    return repository.searchDoctors(
      query: params.query,
      category: params.category,
      location: params.location,
      sortBy: params.sortBy,
    );
  },
);

/// Provider for a single doctor by ID
final doctorByIdProvider = FutureProvider.family<Doctor?, String>((ref, id) async {
  final repository = ref.read(doctorRepositoryProvider);
  return repository.getDoctorById(id);
});

/// Search parameters class
class DoctorSearchParams {
  final String? query;
  final String? category;
  final String? location;
  final String? sortBy;
  
  const DoctorSearchParams({
    this.query,
    this.category,
    this.location,
    this.sortBy,
  });
  
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is DoctorSearchParams &&
        other.query == query &&
        other.category == category &&
        other.location == location &&
        other.sortBy == sortBy;
  }
  
  @override
  int get hashCode {
    return Object.hash(query, category, location, sortBy);
  }
}
