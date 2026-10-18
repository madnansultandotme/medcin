/**
 * POST /api/auth/verify-device
 * 
 * Verify device with OTP and mark as trusted
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware/permissions';
import { db } from '@/db';
import { userDevices, verifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

// In-memory rate limiting (3 attempts per device per 10 minutes)
const rateLimitMap = new Map<string, { attempts: number; resetAt: number }>();

function checkRateLimit(deviceId: string): { allowed: boolean; attemptsLeft?: number } {
  const now = Date.now();
  const limit = rateLimitMap.get(deviceId);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(deviceId, { attempts: 1, resetAt: now + 10 * 60 * 1000 });
    return { allowed: true, attemptsLeft: 2 };
  }

  if (limit.attempts >= 3) {
    return { allowed: false };
  }

  limit.attempts++;
  return { allowed: true, attemptsLeft: 3 - limit.attempts };
}

function clearRateLimit(deviceId: string) {
  rateLimitMap.delete(deviceId);
}

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
    const { deviceId, otp } = body;

    if (!deviceId || !otp) {
      return NextResponse.json(
        { error: 'deviceId and otp are required' },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(deviceId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again in 10 minutes.' },
        { status: 429 }
      );
    }

    // Fetch verification record
    const identifier = `device-verify:${deviceId}`;
    const [verification] = await db
      .select()
      .from(verifications)
      .where(eq(verifications.identifier, identifier))
      .limit(1);

    if (!verification) {
      return NextResponse.json(
        { 
          error: 'No verification found. Please request a new code.',
          attemptsLeft: rateLimit.attemptsLeft,
        },
        { status: 404 }
      );
    }

    // Check expiration
    if (new Date() > verification.expiresAt) {
      // Clean up expired verification
      await db
        .delete(verifications)
        .where(eq(verifications.id, verification.id));

      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 401 }
      );
    }

    // Hash the submitted OTP and compare
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    if (hashedOTP !== verification.value) {
      return NextResponse.json(
        { 
          error: 'Invalid verification code.',
          attemptsLeft: rateLimit.attemptsLeft,
        },
        { status: 401 }
      );
    }

    // OTP is valid - mark device as trusted
    await db
      .update(userDevices)
      .set({
        trusted: true,
        lastUsedAt: new Date(),
      })
      .where(
        and(
          eq(userDevices.userId, user.id),
          eq(userDevices.deviceId, deviceId)
        )
      );

    // Delete verification record
    await db
      .delete(verifications)
      .where(eq(verifications.id, verification.id));

    // Clear rate limit on success
    clearRateLimit(deviceId);

    return NextResponse.json({
      success: true,
      message: 'Device verified successfully',
    });

  } catch (error) {
    console.error('Device verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify device' },
      { status: 500 }
    );
  }
}
