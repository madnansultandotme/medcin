/// Doctor data model with JSON serialization
class DoctorModel {
  final String id;
  final String email;
  final String name;
  final String? phone;
  final String role;
  final String? centerId;
  final String? centerName;
  final String? category;
  final String? licenseNumber;
  final String? bio;
  final double? price;
  final bool? active;
  final bool passwordResetRequired;
  final DateTime createdAt;
  final DateTime? updatedAt;

  DoctorModel({
    required this.id,
    required this.email,
    required this.name,
    this.phone,
    required this.role,
    this.centerId,
    this.centerName,
    this.category,
    this.licenseNumber,
    this.bio,
    this.price,
    this.active,
    this.passwordResetRequired = false,
    required this.createdAt,
    this.updatedAt,
  });

  factory DoctorModel.fromJson(Map<String, dynamic> json) {
    // Handle nested user and doctor profile structure from /api/auth/me
    final user = json['user'] ?? json;
    final doctor = user['doctor'] ?? {};

    return DoctorModel(
      id: user['id'] ?? '',
      email: user['email'] ?? '',
      name: user['name'] ?? '',
      phone: user['phone'],
      role: user['role'] ?? 'DOCTOR',
      centerId: doctor['centerId'],
      centerName: doctor['center']?['name'],
      category: doctor['category'],
      licenseNumber: doctor['licenseNumber'],
      bio: doctor['bio'],
      price: doctor['price']?.toDouble(),
      active: doctor['active'],
      passwordResetRequired: user['passwordResetRequired'] ?? false,
      createdAt: DateTime.parse(user['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: user['updatedAt'] != null ? DateTime.parse(user['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'phone': phone,
      'role': role,
      'centerId': centerId,
      'centerName': centerName,
      'category': category,
      'licenseNumber': licenseNumber,
      'bio': bio,
      'price': price,
      'active': active,
      'passwordResetRequired': passwordResetRequired,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  DoctorModel copyWith({
    String? id,
    String? email,
    String? name,
    String? phone,
    String? role,
    String? centerId,
    String? centerName,
    String? category,
    String? licenseNumber,
    String? bio,
    double? price,
    bool? active,
    bool? passwordResetRequired,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return DoctorModel(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      centerId: centerId ?? this.centerId,
      centerName: centerName ?? this.centerName,
      category: category ?? this.category,
      licenseNumber: licenseNumber ?? this.licenseNumber,
      bio: bio ?? this.bio,
      price: price ?? this.price,
      active: active ?? this.active,
      passwordResetRequired: passwordResetRequired ?? this.passwordResetRequired,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
