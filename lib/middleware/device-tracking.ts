/**
 * Device Tracking Middleware
 * 
 * Tracks user devices for security monitoring and new device detection
 */

import { NextRequest } from 'next/server';
import { db } from '@/db';
import { userDevices } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string | null;
  deviceType: 'WEB' | 'MOBILE_IOS' | 'MOBILE_ANDROID';
  userAgent: string | null;
  ipAddress: string | null;
}

export interface DeviceTrackingResult {
  trusted: boolean;
  isNew: boolean;
  deviceId: string;
}

/**
 * Extract device information from request headers
 */
function getDeviceInfoFromRequest(request: NextRequest): DeviceInfo {
  const userAgent = request.headers.get('user-agent') || null;
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
  
  // Check for mobile-provided device ID
  const mobileDeviceId = request.headers.get('x-device-id');
  const mobileDeviceName = request.headers.get('x-device-name');
  
  if (mobileDeviceId) {
    // Mobile device
    const isIOS = userAgent?.toLowerCase().includes('ios') || userAgent?.toLowerCase().includes('iphone');
    return {
      deviceId: mobileDeviceId,
      deviceName: mobileDeviceName,
      deviceType: isIOS ? 'MOBILE_IOS' : 'MOBILE_ANDROID',
      userAgent,
      ipAddress,
    };
  }

  // Web device - generate fingerprint from user-agent and IP
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${userAgent || ''}:${ipAddress || ''}`)
    .digest('hex')
    .substring(0, 32);

  return {
    deviceId: fingerprint,
    deviceName: parseBrowserName(userAgent),
    deviceType: 'WEB',
    userAgent,
    ipAddress,
  };
}

/**
 * Parse browser name from user-agent
 */
function parseBrowserName(userAgent: string | null): string {
  if (!userAgent) return 'Unknown Browser';
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome Browser';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari Browser';
  if (userAgent.includes('Firefox')) return 'Firefox Browser';
  if (userAgent.includes('Edg')) return 'Edge Browser';
  
  return 'Web Browser';
}

/**
 * Track device usage and determine if it's new or trusted
 * 
 * @param request - Next.js request object
 * @param userId - User ID from authenticated session
 * @returns Device tracking result with trusted and isNew flags
 */
export async function trackDevice(
  request: NextRequest,
  userId: string
): Promise<DeviceTrackingResult> {
  try {
    const deviceInfo = getDeviceInfoFromRequest(request);

    // Check if device exists for this user
    const existingDevice = await db
      .select()
      .from(userDevices)
      .where(
        and(
          eq(userDevices.userId, userId),
          eq(userDevices.deviceId, deviceInfo.deviceId)
        )
      )
      .limit(1);

    if (existingDevice.length > 0) {
      // Device exists - update last used timestamp
      await db
        .update(userDevices)
        .set({
          lastUsedAt: new Date(),
          userAgent: deviceInfo.userAgent,
          ipAddress: deviceInfo.ipAddress,
        })
        .where(eq(userDevices.id, existingDevice[0].id));

      return {
        trusted: existingDevice[0].trusted,
        isNew: false,
        deviceId: deviceInfo.deviceId,
      };
    }

    // New device - create record
    await db.insert(userDevices).values({
      userId,
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      deviceType: deviceInfo.deviceType,
      userAgent: deviceInfo.userAgent,
      ipAddress: deviceInfo.ipAddress,
      trusted: false,
    });

    return {
      trusted: false,
      isNew: true,
      deviceId: deviceInfo.deviceId,
    };
  } catch (error) {
    console.error('Device tracking error:', error);
    // Don't block the request on device tracking errors
    return {
      trusted: true,
      isNew: false,
      deviceId: 'unknown',
    };
  }
}
