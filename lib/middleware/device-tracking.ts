/**
 * Device Tracking Middleware
 * 
 * Tracks user devices for security monitoring and alerts.
 * Requires X-Device-ID header to be sent by client (web or mobile).
 * 
 * SECURITY NOTE: Device IDs are client-provided and not cryptographically verified.
 * This system provides notification-based security (alerts on new devices) rather than
 * device-based access control. Attackers can spoof device IDs, but legitimate device changes
 * will trigger email alerts to the account owner.
 */

import { headers } from 'next/headers';
import { db } from '@/db';
import { userDevices } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export interface DeviceTrackingResult {
  isNewDevice: boolean;
  deviceId: string;
  trusted: boolean;
}

/**
 * Track device for the authenticated user
 * Returns whether this is a new device and if it's trusted
 * 
 * @throws Error if device ID is missing or invalid format
 */
export async function trackDevice(userId: string): Promise<DeviceTrackingResult> {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || 'Unknown';
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || 
                   headersList.get('x-real-ip') || 'Unknown';
  
  // For mobile: expect 'X-Device-ID' header sent by app
  // For web: expect 'X-Device-ID' header from client-side JavaScript
  const deviceId = headersList.get('x-device-id');
  const deviceName = headersList.get('x-device-name') || detectDeviceName(userAgent);
  
  if (!deviceId) {
    throw new Error('Device ID is required in X-Device-ID header');
  }

  // Validate device ID format (must be UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(deviceId)) {
    throw new Error('Invalid device ID format - must be UUID');
  }

  // Check if device exists for this user
  const existingDevice = await db
    .select()
    .from(userDevices)
    .where(and(eq(userDevices.userId, userId), eq(userDevices.deviceId, deviceId)))
    .limit(1);

  if (existingDevice.length > 0) {
    // Update last used time and IP (for audit trail only)
    await db
      .update(userDevices)
      .set({ 
        lastUsedAt: new Date(), 
        ipAddress,
        userAgent,
      })
      .where(eq(userDevices.id, existingDevice[0].id));
    
    return { 
      isNewDevice: false, 
      deviceId,
      trusted: existingDevice[0].trusted,
    };
  }

  // New device: create record
  const deviceType = detectDeviceType(userAgent);

  await db.insert(userDevices).values({
    userId,
    deviceId,
    deviceName,
    deviceType,
    userAgent,
    ipAddress,
    trusted: false, // Require explicit trust via OTP
  });

  return { 
    isNewDevice: true, 
    deviceId,
    trusted: false,
  };
}

/**
 * Detect device type from user agent
 */
function detectDeviceType(userAgent: string): 'WEB' | 'MOBILE_IOS' | 'MOBILE_ANDROID' {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    return 'MOBILE_IOS';
  }
  if (ua.includes('android')) {
    return 'MOBILE_ANDROID';
  }
  
  return 'WEB';
}

/**
 * Detect device name from user agent
 */
function detectDeviceName(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  // Browsers
  if (ua.includes('edg/') || ua.includes('edge/')) return 'Microsoft Edge';
  if (ua.includes('chrome/') && !ua.includes('edg')) return 'Google Chrome';
  if (ua.includes('firefox/')) return 'Mozilla Firefox';
  if (ua.includes('safari/') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('opr/') || ua.includes('opera/')) return 'Opera';
  
  // Mobile devices
  if (ua.includes('iphone')) return 'iPhone';
  if (ua.includes('ipad')) return 'iPad';
  if (ua.includes('android')) return 'Android Device';
  
  return 'Unknown Device';
}
