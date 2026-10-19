/// Device information model
class DeviceModel {
  final String deviceId;
  final String deviceName;
  final String deviceType;
  final bool trusted;
  final DateTime? lastUsedAt;

  DeviceModel({
    required this.deviceId,
    required this.deviceName,
    required this.deviceType,
    this.trusted = false,
    this.lastUsedAt,
  });

  factory DeviceModel.fromJson(Map<String, dynamic> json) {
    return DeviceModel(
      deviceId: json['deviceId'] ?? '',
      deviceName: json['deviceName'] ?? 'Unknown Device',
      deviceType: json['deviceType'] ?? 'MOBILE_UNKNOWN',
      trusted: json['trusted'] ?? false,
      lastUsedAt: json['lastUsedAt'] != null 
          ? DateTime.parse(json['lastUsedAt']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'deviceId': deviceId,
      'deviceName': deviceName,
      'deviceType': deviceType,
      'trusted': trusted,
      'lastUsedAt': lastUsedAt?.toIso8601String(),
    };
  }

  DeviceModel copyWith({
    String? deviceId,
    String? deviceName,
    String? deviceType,
    bool? trusted,
    DateTime? lastUsedAt,
  }) {
    return DeviceModel(
      deviceId: deviceId ?? this.deviceId,
      deviceName: deviceName ?? this.deviceName,
      deviceType: deviceType ?? this.deviceType,
      trusted: trusted ?? this.trusted,
      lastUsedAt: lastUsedAt ?? this.lastUsedAt,
    );
  }
}
