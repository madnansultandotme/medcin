/**
 * Mobile Google OAuth API
 * 
 * Verifies Google ID token from mobile app and returns Bearer token.
 * POST /api/auth/google/mobile
 */

import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { auth } from '@/lib/auth-config';
import { db } from '@/db';
import { users, accounts, doctors } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken, role } = body;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Verify Google ID token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      console.error('Google token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid Google ID token' },
        { status: 401 }
      );
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: 'Invalid token payload' },
        { status: 401 }
      );
    }

    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let userId: string;

    if (existingUser) {
      // User exists - verify role if specified
      if (role && existingUser.role !== role) {
        return NextResponse.json(
          { error: `This account is not registered as a ${role}. Please use the correct app or contact support.` },
          { status: 403 }
        );
      }

      // For doctors, verify they have a doctor profile
      if (existingUser.role === 'DOCTOR') {
        const [doctorProfile] = await db
          .select()
          .from(doctors)
          .where(eq(doctors.userId, existingUser.id))
          .limit(1);

        if (!doctorProfile) {
          return NextResponse.json(
            { error: 'Doctor profile not found. Please contact your center administrator.' },
            { status: 403 }
          );
        }

        // Check if doctor is active
        if (!doctorProfile.active) {
          return NextResponse.json(
            { error: 'Your doctor account is inactive. Please contact your center administrator.' },
            { status: 403 }
          );
        }
      }

      userId = existingUser.id;

      // Check if Google account is already linked
      const [googleAccount] = await db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.userId, userId),
            eq(accounts.providerId, 'google')
          )
        )
        .limit(1);

      // If not linked, link the Google account
      if (!googleAccount) {
        await db.insert(accounts).values({
          id: crypto.randomUUID(),
          userId,
          accountId: googleId,
          providerId: 'google',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } else {
      // New user - only allow patients and centers to sign up
      // Doctors must be provisioned by center admin
      if (role === 'DOCTOR') {
        return NextResponse.json(
          { error: 'Doctor accounts must be created by a center administrator. Please contact your center.' },
          { status: 403 }
        );
      }

      // Create new user
      userId = crypto.randomUUID();
      await db.insert(users).values({
        id: userId,
        email,
        name: name || email.split('@')[0],
        image: picture || null,
        emailVerified: true, // Google emails are pre-verified
        role: (role as 'PATIENT' | 'CENTER' | 'ADMIN') || 'PATIENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create Google account
      await db.insert(accounts).values({
        id: crypto.randomUUID(),
        userId,
        accountId: googleId,
        providerId: 'google',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Create session using Better Auth
    // This generates a Bearer token that can be used in mobile app
    const session = await auth.api.signInSocial({
      body: {
        provider: 'google',
        idToken,
      },
    });

    if (!session || !session.token) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Get updated user info
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return NextResponse.json({
      success: true,
      token: session.token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    });

  } catch (error) {
    console.error('Mobile Google OAuth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
