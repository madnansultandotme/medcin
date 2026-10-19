/**
 * POST /api/auth/request-device-otp
 * 
 * Request OTP for new device verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware/permissions';
import { db } from '@/db';
import { verifications, userDevices } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendNewDeviceAlertEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const authContext = await getAuthenticatedUser();
  
  if (!authContext) {
    return NextResponse.json(
      { error: 'Unauthorized: Authentication required' },
      { status: 401 }
    );
  }

  const { user } = authContext;

  try {
    const body = await request.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId is required' },
        { status: 400 }
      );
    }

    // Get device info
    const [device] = await db
      .select()
      .from(userDevices)
      .where(
        and(
          eq(userDevices.userId, user.id),
          eq(userDevices.deviceId, deviceId)
        )
      )
      .limit(1);

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    if (device.trusted) {
      return NextResponse.json(
        { error: 'Device is already trusted' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash OTP for storage
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

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

    // Send email with OTP
    const emailSent = await sendNewDeviceAlertEmail(
      user.email,
      user.name,
      device.deviceName || 'Unknown Device',
      device.deviceType,
      device.ipAddress,
      otp
    );

    if (!emailSent) {
      console.error('Failed to send device alert email to:', user.email);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      expiresIn: 600, // seconds
    });

  } catch (error) {
    console.error('Request device OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to request verification code' },
      { status: 500 }
    );
  }
}
