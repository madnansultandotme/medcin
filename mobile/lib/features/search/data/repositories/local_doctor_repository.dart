import 'package:hive/hive.dart';
import '../../domain/repositories/doctor_repository.dart';
import '../../../../shared/models/doctor.dart';

/// Local implementation of doctor repository using Hive
class LocalDoctorRepository implements IDoctorRepository {
  final Box _box = Hive.box('doctors');
  
  @override
  Future<List<Doctor>> getAllDoctors() async {
    final List<Doctor> doctors = [];
    for (var value in _box.values) {
      try {
        // Convert dynamic map to Map<String, dynamic> recursively
        final jsonMap = _convertToJsonMap(value);
        doctors.add(Doctor.fromJson(jsonMap));
      } catch (e) {
        print('Error parsing doctor: $e');
      }
    }
    return doctors;
  }
  
  @override
  Future<Doctor?> getDoctorById(String id) async {
    final data = _box.get(id);
    if (data == null) return null;
    
    try {
      final jsonMap = _convertToJsonMap(data);
      return Doctor.fromJson(jsonMap);
    } catch (e) {
      print('Error parsing doctor by ID: $e');
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
    var doctors = await getAllDoctors();
    
    // Filter by search query
    if (query != null && query.isNotEmpty) {
      doctors = doctors.where((d) {
        final searchLower = query.toLowerCase();
        return d.name.toLowerCase().contains(searchLower) ||
               d.role.toLowerCase().contains(searchLower) ||
               d.clinic.toLowerCase().contains(searchLower);
      }).toList();
    }
    
    // Filter by category
    if (category != null && category != 'All') {
      doctors = doctors.where((d) => d.category == category).toList();
    }
    
    // Filter by location
    if (location != null && location != 'All') {
      doctors = doctors.where((d) =>
        d.location.toLowerCase().contains(location.toLowerCase()) ||
        d.clinic.toLowerCase().contains(location.toLowerCase())
      ).toList();
    }
    
    // Sort
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
  }
  
  /// Get cached doctors synchronously from Hive box
  List<Doctor> getCachedDoctors() {
    final List<Doctor> doctors = [];
    for (var value in _box.values) {
      try {
        final jsonMap = _convertToJsonMap(value);
        doctors.add(Doctor.fromJson(jsonMap));
      } catch (e) {
        print('Error parsing cached doctor: $e');
      }
    }
    return doctors;
  }
  
  /// Helper method to convert dynamic map to Map<String, dynamic> recursively
  Map<String, dynamic> _convertToJsonMap(dynamic data) {
    if (data is Map) {
      return Map<String, dynamic>.fromEntries(
        data.entries.map((entry) {
          dynamic value = entry.value;
          
          // Recursively convert nested maps
          if (value is Map) {
            value = _convertToJsonMap(value);
          }
          // Recursively convert lists
          else if (value is List) {
            value = value.map((item) {
              if (item is Map) {
                return _convertToJsonMap(item);
              }
              return item;
            }).toList();
          }
          
          return MapEntry(entry.key.toString(), value);
        }),
      );
    }
    return {};
  }
}
