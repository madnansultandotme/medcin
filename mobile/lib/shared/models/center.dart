class Center {
  final String id;
  final String name;
  final String category;
  final String address;
  final String email;
  final String phone;
  final String licenseNumber;
  final String status;
  final String? logo;
  final String? coverImage;
  final int doctorCount;
  final String? operatingHours;
  final List<String> amenities;
  final String? submittedTime;

  const Center({
    required this.id,
    required this.name,
    required this.category,
    required this.address,
    required this.email,
    required this.phone,
    required this.licenseNumber,
    required this.status,
    this.logo,
    this.coverImage,
    required this.doctorCount,
    this.operatingHours,
    this.amenities = const [],
    this.submittedTime,
  });

  factory Center.fromJson(Map<String, dynamic> json) {
    return Center(
      id: json['id'] as String,
      name: json['name'] as String,
      category: json['category'] as String,
      address: json['address'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String,
      licenseNumber: json['licenseNumber'] as String,
      status: json['status'] as String,
      logo: json['logo'] as String?,
      coverImage: json['coverImage'] as String?,
      doctorCount: json['doctorCount'] as int,
      operatingHours: json['operatingHours'] as String?,
      amenities: (json['amenities'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      submittedTime: json['submittedTime'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'address': address,
      'email': email,
      'phone': phone,
      'licenseNumber': licenseNumber,
      'status': status,
      'logo': logo,
      'coverImage': coverImage,
      'doctorCount': doctorCount,
      'operatingHours': operatingHours,
      'amenities': amenities,
      'submittedTime': submittedTime,
    };
  }
}
