/// Doctor booking domain entity (pure Dart class)
class DoctorBooking {
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

  const DoctorBooking({
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

  bool get isCheckedIn => checkedInAt != null;
  bool get isCheckedOut => checkedOutAt != null;
  bool get canCheckIn => status == 'CONFIRMED' && !isCheckedIn;
  bool get canCheckOut => isCheckedIn && !isCheckedOut;

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
  
    return other is DoctorBooking &&
      other.id == id &&
      other.reference == reference &&
      other.patientId == patientId &&
      other.doctorId == doctorId &&
      other.date == date &&
      other.time == time &&
      other.status == status;
  }

  @override
  int get hashCode {
    return id.hashCode ^
      reference.hashCode ^
      patientId.hashCode ^
      doctorId.hashCode ^
      date.hashCode ^
      time.hashCode ^
      status.hashCode;
  }

  @override
  String toString() {
    return 'DoctorBooking(id: $id, ref: $reference, patient: $patientName, date: $date, time: $time, status: $status)';
  }
}
