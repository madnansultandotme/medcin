class Booking {
  final String id;
  final String reference;
  final String patientName;
  final String patientEmail;
  final String patientPhone;
  final String? patientNotes;
  final String doctorId;
  final String doctorName;
  final String doctorRole;
  final String clinicName;
  final String clinicAddress;
  final String serviceName;
  final String duration;
  final String date;
  final String time;
  final double price;
  final String status;
  final String createdAt;
  final String paymentMethod;
  final String? cancellationReason;

  const Booking({
    required this.id,
    required this.reference,
    required this.patientName,
    required this.patientEmail,
    required this.patientPhone,
    this.patientNotes,
    required this.doctorId,
    required this.doctorName,
    required this.doctorRole,
    required this.clinicName,
    required this.clinicAddress,
    required this.serviceName,
    required this.duration,
    required this.date,
    required this.time,
    required this.price,
    required this.status,
    required this.createdAt,
    required this.paymentMethod,
    this.cancellationReason,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] as String,
      reference: json['reference'] as String,
      patientName: json['patientName'] as String,
      patientEmail: json['patientEmail'] as String,
      patientPhone: json['patientPhone'] as String,
      patientNotes: json['patientNotes'] as String?,
      doctorId: json['doctorId'] as String,
      doctorName: json['doctorName'] as String,
      doctorRole: json['doctorRole'] as String,
      clinicName: json['clinicName'] as String,
      clinicAddress: json['clinicAddress'] as String,
      serviceName: json['serviceName'] as String,
      duration: json['duration'] as String,
      date: json['date'] as String,
      time: json['time'] as String,
      price: (json['price'] as num).toDouble(),
      status: json['status'] as String,
      createdAt: json['createdAt'] as String,
      paymentMethod: json['paymentMethod'] as String,
      cancellationReason: json['cancellationReason'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'reference': reference,
      'patientName': patientName,
      'patientEmail': patientEmail,
      'patientPhone': patientPhone,
      'patientNotes': patientNotes,
      'doctorId': doctorId,
      'doctorName': doctorName,
      'doctorRole': doctorRole,
      'clinicName': clinicName,
      'clinicAddress': clinicAddress,
      'serviceName': serviceName,
      'duration': duration,
      'date': date,
      'time': time,
      'price': price,
      'status': status,
      'createdAt': createdAt,
      'paymentMethod': paymentMethod,
      'cancellationReason': cancellationReason,
    };
  }
}
