import 'service.dart';

class Doctor {
  final String id;
  final String name;
  final String role;
  final String category;
  final String clinic;
  final String location;
  final double price;
  final double rating;
  final int reviewsCount;
  final String initials;
  final String licenseNumber;
  final bool active;
  final String? bio;
  final String? image;
  final List<Service> services;
  
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
    required this.clinic,
    required this.location,
    required this.price,
    required this.rating,
    required this.reviewsCount,
    required this.initials,
    required this.licenseNumber,
    required this.active,
    this.bio,
    this.image,
    this.services = const [],
    String? specialization,
    int? experience,
    String? availability,
    double? consultationFee,
  })  : specialization = specialization ?? category,
        experience = experience ?? 5,
        availability = availability ?? 'Mon-Fri, 9AM-5PM',
        consultationFee = consultationFee ?? price;

  factory Doctor.fromJson(Map<String, dynamic> json) {
    return Doctor(
      id: json['id'] as String,
      name: json['name'] as String,
      role: json['role'] as String,
      category: json['category'] as String,
      clinic: json['clinic'] as String,
      location: json['location'] as String,
      price: (json['price'] as num).toDouble(),
      rating: (json['rating'] as num).toDouble(),
      reviewsCount: json['reviewsCount'] as int,
      initials: json['initials'] as String,
      licenseNumber: json['licenseNumber'] as String,
      active: json['active'] as bool,
      bio: json['bio'] as String?,
      image: json['image'] as String?,
      services: (json['services'] as List<dynamic>?)
              ?.map((e) => Service.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
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
      'clinic': clinic,
      'location': location,
      'price': price,
      'rating': rating,
      'reviewsCount': reviewsCount,
      'initials': initials,
      'licenseNumber': licenseNumber,
      'active': active,
      'bio': bio,
      'image': image,
      'services': services.map((s) => s.toJson()).toList(),
    };
  }
}
