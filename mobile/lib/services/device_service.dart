import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

/// Service to manage device information and device ID
class DeviceService {
  static const String _deviceIdKey = 'device_id';
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();
  final Uuid _uuid = const Uuid();

  /// Get or create a unique device ID
  /// This ID persists across app launches
  Future<String> getOrCreateDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    String? deviceId = prefs.getString(_deviceIdKey);

    if (deviceId == null || deviceId.isEmpty) {
      deviceId = _uuid.v4();
      await prefs.setString(_deviceIdKey, deviceId);
    }

    return deviceId;
  }

  /// Get device name (e.g., 'iPhone 14 Pro', 'Samsung Galaxy S23')
  Future<String> getDeviceName() async {
    try {
      if (Platform.isAndroid) {
        final androidInfo = await _deviceInfo.androidInfo;
        return '${androidInfo.manufacturer} ${androidInfo.model}';
      } else if (Platform.isIOS) {
        final iosInfo = await _deviceInfo.iosInfo;
        return iosInfo.utsname.machine ?? 'iOS Device';
      } else {
        return 'Unknown Device';
      }
    } catch (e) {
      return 'Unknown Device';
    }
  }

  /// Get device type ('MOBILE_IOS' or 'MOBILE_ANDROID')
  String getDeviceType() {
    if (Platform.isAndroid) {
      return 'MOBILE_ANDROID';
    } else if (Platform.isIOS) {
      return 'MOBILE_IOS';
    } else {
      return 'MOBILE_UNKNOWN';
    }
  }

  /// Get complete device info for headers
  Future<Map<String, String>> getDeviceHeaders() async {
    final deviceId = await getOrCreateDeviceId();
    final deviceName = await getDeviceName();
    
    return {
      'X-Device-ID': deviceId,
      'X-Device-Name': deviceName,
      'X-Device-Type': getDeviceType(),
    };
  }
}
