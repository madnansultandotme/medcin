class EmergencyContact {
  final String name;
  final String relationship;
  final String phone;

  const EmergencyContact({
    required this.name,
    required this.relationship,
    required this.phone,
  });

  factory EmergencyContact.fromJson(Map<String, dynamic> json) {
    return EmergencyContact(
      name: json['name'] as String,
      relationship: json['relationship'] as String,
      phone: json['phone'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'relationship': relationship,
      'phone': phone,
    };
  }
}

class PatientProfile {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String location;
  final String initials;
  final String? photo;
  final String? preferredLanguage;
  final EmergencyContact? emergencyContact;
  final String? medicalNotes;
  final String? insuranceProvider;
  final String? insurancePolicyNumber;

  const PatientProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.location,
    required this.initials,
    this.photo,
    this.preferredLanguage,
    this.emergencyContact,
    this.medicalNotes,
    this.insuranceProvider,
    this.insurancePolicyNumber,
  });

  factory PatientProfile.fromJson(Map<String, dynamic> json) {
    return PatientProfile(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String,
      location: json['location'] as String,
      initials: json['initials'] as String,
      photo: json['photo'] as String?,
      preferredLanguage: json['preferredLanguage'] as String?,
      emergencyContact: json['emergencyContact'] != null
          ? EmergencyContact.fromJson(json['emergencyContact'] as Map<String, dynamic>)
          : null,
      medicalNotes: json['medicalNotes'] as String?,
      insuranceProvider: json['insuranceProvider'] as String?,
      insurancePolicyNumber: json['insurancePolicyNumber'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'location': location,
      'initials': initials,
      'photo': photo,
      'preferredLanguage': preferredLanguage,
      'emergencyContact': emergencyContact?.toJson(),
      'medicalNotes': medicalNotes,
      'insuranceProvider': insuranceProvider,
      'insurancePolicyNumber': insurancePolicyNumber,
    };
  }
}
