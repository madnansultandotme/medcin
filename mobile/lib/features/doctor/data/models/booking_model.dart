/// Booking data model for doctor dashboard
class BookingModel {
  final String id;
  final String reference;
  final String patientId;
  final String? patientName;
  final String? patientEmail;
  final String? patientPhone;
  final String doctorId;
  final String? doctorName;
  final String slotId;
  final String date;
  final String time;
  final double price;
  final String status;
  final String? serviceId;
  final String? serviceName;
  final String? patientNotes;
  final DateTime? checkedInAt;
  final DateTime? checkedOutAt;
  final double? commissionAmount;
  final double? centerEarnings;
  final DateTime createdAt;
  final DateTime? updatedAt;

  BookingModel({
    required this.id,
    required this.reference,
    required this.patientId,
    this.patientName,
    this.patientEmail,
    this.patientPhone,
    required this.doctorId,
    this.doctorName,
    required this.slotId,
    required this.date,
    required this.time,
    required this.price,
    required this.status,
    this.serviceId,
    this.serviceName,
    this.patientNotes,
    this.checkedInAt,
    this.checkedOutAt,
    this.commissionAmount,
    this.centerEarnings,
    required this.createdAt,
    this.updatedAt,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    return BookingModel(
      id: json['id'] ?? '',
      reference: json['reference'] ?? '',
      patientId: json['patientId'] ?? '',
      patientName: json['patient']?['name'] ?? json['patientName'],
      patientEmail: json['patient']?['email'] ?? json['patientEmail'],
      patientPhone: json['patient']?['phone'] ?? json['patientPhone'],
      doctorId: json['doctorId'] ?? '',
      doctorName: json['doctor']?['name'] ?? json['doctorName'],
      slotId: json['slotId'] ?? '',
      date: json['date'] ?? '',
      time: json['time'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      status: json['status'] ?? 'PENDING',
      serviceId: json['serviceId'],
      serviceName: json['service']?['name'] ?? json['serviceName'],
      patientNotes: json['patientNotes'],
      checkedInAt: json['checkedInAt'] != null ? DateTime.parse(json['checkedInAt']) : null,
      checkedOutAt: json['checkedOutAt'] != null ? DateTime.parse(json['checkedOutAt']) : null,
      commissionAmount: json['commissionAmount']?.toDouble(),
      centerEarnings: json['centerEarnings']?.toDouble(),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'reference': reference,
      'patientId': patientId,
      'patientName': patientName,
      'patientEmail': patientEmail,
      'patientPhone': patientPhone,
      'doctorId': doctorId,
      'doctorName': doctorName,
      'slotId': slotId,
      'date': date,
      'time': time,
      'price': price,
      'status': status,
      'serviceId': serviceId,
      'serviceName': serviceName,
      'patientNotes': patientNotes,
      'checkedInAt': checkedInAt?.toIso8601String(),
      'checkedOutAt': checkedOutAt?.toIso8601String(),
      'commissionAmount': commissionAmount,
      'centerEarnings': centerEarnings,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  BookingModel copyWith({
    String? id,
    String? reference,
    String? patientId,
    String? patientName,
    String? patientEmail,
    String? patientPhone,
    String? doctorId,
    String? doctorName,
    String? slotId,
    String? date,
    String? time,
    double? price,
    String? status,
    String? serviceId,
    String? serviceName,
    String? patientNotes,
    DateTime? checkedInAt,
    DateTime? checkedOutAt,
    double? commissionAmount,
    double? centerEarnings,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return BookingModel(
      id: id ?? this.id,
      reference: reference ?? this.reference,
      patientId: patientId ?? this.patientId,
      patientName: patientName ?? this.patientName,
      patientEmail: patientEmail ?? this.patientEmail,
      patientPhone: patientPhone ?? this.patientPhone,
      doctorId: doctorId ?? this.doctorId,
      doctorName: doctorName ?? this.doctorName,
      slotId: slotId ?? this.slotId,
      date: date ?? this.date,
      time: time ?? this.time,
      price: price ?? this.price,
      status: status ?? this.status,
      serviceId: serviceId ?? this.serviceId,
      serviceName: serviceName ?? this.serviceName,
      patientNotes: patientNotes ?? this.patientNotes,
      checkedInAt: checkedInAt ?? this.checkedInAt,
      checkedOutAt: checkedOutAt ?? this.checkedOutAt,
      commissionAmount: commissionAmount ?? this.commissionAmount,
      centerEarnings: centerEarnings ?? this.centerEarnings,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  bool get isCheckedIn => checkedInAt != null;
  bool get isCheckedOut => checkedOutAt != null;
  bool get canCheckIn => status == 'CONFIRMED' && !isCheckedIn;
  bool get canCheckOut => isCheckedIn && !isCheckedOut;
}
