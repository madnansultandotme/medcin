import 'service.dart';

class Doctor {
  final String id;
  final String name;
  final String role;
  final String category;
  final double price;
  final double rating;
  final int reviewsCount;
  final String? bio;
  final String? imageUrl;
  final List<Service> services;
  
  // Center information (from joined data)
  final String? centerId;
  final String? centerName;
  final String? centerAddress;
  final String? centerCity;
  final String? centerCountry;
  final double? centerLatitude;
  final double? centerLongitude;
  final String? centerLogoUrl;
  
  // Derived properties for backward compatibility
  String get clinic => centerName ?? 'Unknown Clinic';
  String get location => centerAddress != null && centerCity != null
      ? '$centerAddress, $centerCity'
      : centerCity ?? centerCountry ?? 'Unknown Location';
  String get image => imageUrl ?? '';
  String get initials => name.split(' ').map((n) => n[0]).take(2).join().toUpperCase();
  String get licenseNumber => id; // Using ID as fallback
  bool get active => true; // Assume active if returned by API
  
  // Additional properties for UI
  final String specialization;
  final int experience;
  final String availability;
  final double consultationFee;

  const Doctor({
    required this.id,
    required this.name,
    required this.role,
    required this.category,
    required this.price,
    required this.rating,
    required this.reviewsCount,
    this.bio,
    this.imageUrl,
    this.services = const [],
    this.centerId,
    this.centerName,
    this.centerAddress,
    this.centerCity,
    this.centerCountry,
    this.centerLatitude,
    this.centerLongitude,
    this.centerLogoUrl,
    String? specialization,
    int? experience,
    String? availability,
    double? consultationFee,
  })  : specialization = specialization ?? category,
        experience = experience ?? 5,
        availability = availability ?? 'Mon-Fri, 9AM-5PM',
        consultationFee = consultationFee ?? price;

  factory Doctor.fromJson(Map<String, dynamic> json) {
    // Parse center data if present
    final center = json['center'] as Map<String, dynamic>?;
    
    return Doctor(
      id: json['id'] as String,
      name: json['name'] as String,
      role: json['role'] as String,
      category: json['category'] as String,
      price: (json['price'] as num).toDouble(),
      rating: (json['rating'] as num).toDouble(),
      reviewsCount: json['reviewsCount'] as int,
      bio: json['bio'] as String?,
      imageUrl: json['imageUrl'] as String?,
      services: (json['services'] as List<dynamic>?)
              ?.map((e) => Service.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      centerId: center?['id'] as String?,
      centerName: center?['name'] as String?,
      centerAddress: center?['address'] as String?,
      centerCity: center?['city'] as String?,
      centerCountry: center?['country'] as String?,
      centerLatitude: center?['latitude'] != null 
          ? (center!['latitude'] as num).toDouble() 
          : null,
      centerLongitude: center?['longitude'] != null 
          ? (center!['longitude'] as num).toDouble() 
          : null,
      centerLogoUrl: center?['logoUrl'] as String?,
      specialization: json['specialization'] as String?,
      experience: json['experience'] as int?,
      availability: json['availability'] as String?,
      consultationFee: json['consultationFee'] != null 
          ? (json['consultationFee'] as num).toDouble() 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'role': role,
      'category': category,
      'price': price,
      'rating': rating,
      'reviewsCount': reviewsCount,
      'bio': bio,
      'imageUrl': imageUrl,
      'services': services.map((s) => s.toJson()).toList(),
      'center': centerId != null ? {
        'id': centerId,
        'name': centerName,
        'address': centerAddress,
        'city': centerCity,
        'country': centerCountry,
        'latitude': centerLatitude,
        'longitude': centerLongitude,
        'logoUrl': centerLogoUrl,
      } : null,
    };
  }
}
