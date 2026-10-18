/**
 * Device Login Tracking
 * 
 * Tracks device logins and sends OTP verification for new devices.
 */

import crypto from 'crypto';
import { trackDevice } from '@/lib/middleware/device-tracking';
import { sendNewDeviceAlertEmail } from '@/lib/email';
import { db } from '@/db';
import { verifications, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface DeviceLoginResult {
  isNewDevice: boolean;
  requiresVerification: boolean;
  deviceId: string;
}

/**
 * Track device login and handle verification flow for new devices
 */
export async function trackDeviceLogin(
  userId: string,
  deviceId: string,
  deviceName: string
): Promise<DeviceLoginResult> {
  try {
    // Track device using existing middleware
    const result = await trackDevice(userId);

    // If it's a known, trusted device, no verification needed
    if (!result.isNewDevice || result.trusted) {
      return {
        isNewDevice: result.isNewDevice,
        requiresVerification: false,
        deviceId: result.deviceId,
      };
    }

    // New device detected - generate OTP and send email
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP for storage
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    // Store verification with 10-minute expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const identifier = `device-verify:${deviceId}`;

    // Delete any existing verification for this device
    await db
      .delete(verifications)
      .where(eq(verifications.identifier, identifier));

    // Create new verification
    await db.insert(verifications).values({
      id: crypto.randomUUID(),
      identifier,
      value: hashedOTP,
      expiresAt,
    });

    // Get user details for email
    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userRecord) {
      throw new Error('User not found');
    }

    // Get IP address from the tracked device
    const { userDevices } = await import('@/db/schema');
    const [deviceRecord] = await db
      .select()
      .from(userDevices)
      .where(eq(userDevices.deviceId, deviceId))
      .limit(1);

    // Send email alert with OTP
    await sendNewDeviceAlertEmail(
      userRecord.email,
      userRecord.name,
      deviceName,
      deviceRecord?.deviceType || 'WEB',
      deviceRecord?.ipAddress || null,
      otp
    );

    return {
      isNewDevice: true,
      requiresVerification: true,
      deviceId: result.deviceId,
    };
  } catch (error) {
    console.error('Track device login error:', error);
    // If device tracking fails, allow login but log error
    return {
      isNewDevice: false,
      requiresVerification: false,
      deviceId,
    };
  }
}
