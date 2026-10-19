/**
 * Device Verification API
 * 
 * Verifies a new device using OTP sent via email.
 * POST /api/auth/verify-device
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware/permissions';
import { db } from '@/db';
import { userDevices, verifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

// OTP configuration with validation
const OTP_LENGTH = Math.max(4, Math.min(8, parseInt(process.env.OTP_LENGTH || '6', 10) || 6));
const OTP_REGEX = new RegExp(`^\\d{${OTP_LENGTH}}$`);

// NOTE: This uses in-memory rate limiting which resets on server restart
// and doesn't work across multiple server instances.
// For production deployments with multiple replicas, migrate to Redis
// or database-backed rate limiting with TTL.
const otpAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(deviceId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = deviceId;
  const limit = otpAttempts.get(key);

  // Reset if window expired
  if (limit && now > limit.resetAt) {
    otpAttempts.delete(key);
  }

  const current = otpAttempts.get(key) || { count: 0, resetAt: now + 10 * 60 * 1000 }; // 10 min window

  if (current.count >= 3) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: 3 - current.count };
}

function incrementRateLimit(deviceId: string) {
  const now = Date.now();
  const key = deviceId;
  const current = otpAttempts.get(key) || { count: 0, resetAt: now + 10 * 60 * 1000 };
  
  current.count += 1;
  otpAttempts.set(key, current);
}

function clearRateLimit(deviceId: string) {
  otpAttempts.delete(deviceId);
}

export async function POST(req: NextRequest) {
  try {
    // 1. Get authenticated user
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const { user } = authContext;

    // 2. Parse request body
    const body = await req.json();
    const { deviceId, otp } = body;

    // Validation
    if (!deviceId || typeof deviceId !== 'string') {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string' || !OTP_REGEX.test(otp)) {
      return NextResponse.json(
        { error: `Valid ${OTP_LENGTH}-digit OTP is required` },
        { status: 400 }
      );
    }

    // 3. Check rate limiting
    const rateCheck = checkRateLimit(deviceId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait 10 minutes before trying again.' },
        { status: 429 }
      );
    }

    // 4. Fetch verification record
    const identifier = `device-verify:${deviceId}`;
    const verificationRecord = await db
      .select()
      .from(verifications)
      .where(eq(verifications.identifier, identifier))
      .limit(1);

    if (verificationRecord.length === 0) {
      incrementRateLimit(deviceId);
      return NextResponse.json(
        { error: 'Invalid or expired verification code', attemptsRemaining: rateCheck.remaining - 1 },
        { status: 400 }
      );
    }

    const verification = verificationRecord[0];

    // 5. Check expiration
    if (new Date() > verification.expiresAt) {
      // Clean up expired record
      await db
        .delete(verifications)
        .where(eq(verifications.id, verification.id));

      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // 6. Hash submitted OTP and compare
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    if (hashedOTP !== verification.value) {
      incrementRateLimit(deviceId);
      return NextResponse.json(
        { error: 'Invalid verification code', attemptsRemaining: rateCheck.remaining - 1 },
        { status: 400 }
      );
    }

    // 7. Mark device as trusted
    await db
      .update(userDevices)
      .set({ trusted: true })
      .where(and(
        eq(userDevices.userId, user.id),
        eq(userDevices.deviceId, deviceId)
      ));

    // 8. Delete verification record (one-time use)
    await db
      .delete(verifications)
      .where(eq(verifications.id, verification.id));

    // 9. Clear rate limit on success
    clearRateLimit(deviceId);

    return NextResponse.json({
      success: true,
      message: 'Device verified successfully',
    });

  } catch (error) {
    console.error('Device verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify device', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
