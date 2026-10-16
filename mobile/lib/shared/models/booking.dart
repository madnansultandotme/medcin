class Booking {
  final String id;
  final String reference;
  final String date;
  final String time;
  final String status;
  final double price;
  final String? patientNotes;
  final String paymentMethod;
  final String? cancellationReason;
  final String createdAt;
  
  // Nested doctor data
  final String? doctorId;
  final String? doctorName;
  final String? doctorRole;
  final String? doctorCategory;
  final String? doctorImageUrl;
  
  // Nested center data
  final String? centerId;
  final String? centerName;
  final String? centerAddress;
  final String? centerCity;
  final String? centerPhone;
  
  // Nested service data
  final String? serviceId;
  final String? serviceName;
  final int? serviceDuration;
  
  // Derived properties for backward compatibility
  String get patientName => 'Patient'; // Not provided by API
  String get patientEmail => ''; // Not provided by API
  String get patientPhone => ''; // Not provided by API
  String get clinicName => centerName ?? 'Unknown Clinic';
  String get clinicAddress => centerAddress ?? '';
  String get duration => serviceDuration != null ? '${serviceDuration}min' : 'N/A';

  const Booking({
    required this.id,
    required this.reference,
    required this.date,
    required this.time,
    required this.status,
    required this.price,
    this.patientNotes,
    required this.paymentMethod,
    this.cancellationReason,
    required this.createdAt,
    this.doctorId,
    this.doctorName,
    this.doctorRole,
    this.doctorCategory,
    this.doctorImageUrl,
    this.centerId,
    this.centerName,
    this.centerAddress,
    this.centerCity,
    this.centerPhone,
    this.serviceId,
    this.serviceName,
    this.serviceDuration,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    final doctor = json['doctor'] as Map<String, dynamic>?;
    final center = json['center'] as Map<String, dynamic>?;
    final service = json['service'] as Map<String, dynamic>?;
    
    return Booking(
      id: json['id'] as String,
      reference: json['reference'] as String,
      date: json['date'] as String,
      time: json['time'] as String,
      status: json['status'] as String,
      price: (json['price'] as num).toDouble(),
      patientNotes: json['patientNotes'] as String?,
      paymentMethod: json['paymentMethod'] as String,
      cancellationReason: json['cancellationReason'] as String?,
      createdAt: json['createdAt'] as String,
      doctorId: doctor?['id'] as String?,
      doctorName: doctor?['name'] as String?,
      doctorRole: doctor?['role'] as String?,
      doctorCategory: doctor?['category'] as String?,
      doctorImageUrl: doctor?['imageUrl'] as String?,
      centerId: center?['id'] as String?,
      centerName: center?['name'] as String?,
      centerAddress: center?['address'] as String?,
      centerCity: center?['city'] as String?,
      centerPhone: center?['phone'] as String?,
      serviceId: service?['id'] as String?,
      serviceName: service?['name'] as String?,
      serviceDuration: service?['duration'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'reference': reference,
      'date': date,
      'time': time,
      'status': status,
      'price': price,
      'patientNotes': patientNotes,
      'paymentMethod': paymentMethod,
      'cancellationReason': cancellationReason,
      'createdAt': createdAt,
      'doctor': doctorId != null ? {
        'id': doctorId,
        'name': doctorName,
        'role': doctorRole,
        'category': doctorCategory,
        'imageUrl': doctorImageUrl,
      } : null,
      'center': centerId != null ? {
        'id': centerId,
        'name': centerName,
        'address': centerAddress,
        'city': centerCity,
        'phone': centerPhone,
      } : null,
      'service': serviceId != null ? {
        'id': serviceId,
        'name': serviceName,
        'duration': serviceDuration,
      } : null,
    };
  }
}
