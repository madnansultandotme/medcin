class Service {
  final String id;
  final String name;
  final String duration;
  final double price;
  final String? description;

  const Service({
    required this.id,
    required this.name,
    required this.duration,
    required this.price,
    this.description,
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      id: json['id'] as String,
      name: json['name'] as String,
      duration: json['duration'] as String,
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
