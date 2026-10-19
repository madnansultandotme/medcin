/// Doctor domain entity (pure Dart class)
class Doctor {
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

  const Doctor({
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

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
  
    return other is Doctor &&
      other.id == id &&
      other.email == email &&
      other.name == name &&
      other.phone == phone &&
      other.role == role &&
      other.centerId == centerId &&
      other.centerName == centerName &&
      other.category == category &&
      other.licenseNumber == licenseNumber &&
      other.bio == bio &&
      other.price == price &&
      other.active == active &&
      other.passwordResetRequired == passwordResetRequired;
  }

  @override
  int get hashCode {
    return id.hashCode ^
      email.hashCode ^
      name.hashCode ^
      role.hashCode ^
      passwordResetRequired.hashCode;
  }

  @override
  String toString() {
    return 'Doctor(id: $id, name: $name, email: $email, role: $role)';
  }
}
