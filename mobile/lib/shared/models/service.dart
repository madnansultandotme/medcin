class Service {
  final String id;
  final String name;
  final int duration;
  final double price;
  final String? description;

  const Service({
    required this.id,
    required this.name,
    required this.duration,
    required this.price,
    this.description,
  });

  /// A doctor's base consultation, matching the "General Consultation" option
  /// always offered on the web dashboard alongside any custom services.
  /// Uses an empty [id] so bookings created from it omit `serviceId`.
  factory Service.general(double price) {
    return Service(
      id: '',
      name: 'General Consultation',
      duration: 30,
      price: price,
      description: 'Standard consultation with the doctor',
    );
  }

  bool get isGeneral => id.isEmpty;

  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      id: json['id'] as String,
      name: json['name'] as String,
      duration: json['duration'] as int,
      price: (json['price'] as num).toDouble(),
      description: json['description'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'duration': duration,
      'price': price,
      'description': description,
    };
  }
}
