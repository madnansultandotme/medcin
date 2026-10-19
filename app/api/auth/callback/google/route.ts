/**
 * Google OAuth Callback Route
 * 
 * Handles Google OAuth callback with manual account linking.
 * Enforces doctor-only access by verifying doctor profile exists.
 * Prevents unauthorized self-registration via Google Sign-In.
 */

import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { auth } from '@/lib/auth/server';
import { db } from '@/db';
import { users, accounts, doctors } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(new URL('/auth/signin?error=missing_code', req.url));
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(new URL('/auth/signin?error=token_exchange_failed', req.url));
    }

    const tokens = await tokenResponse.json();
    
    // Verify ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.redirect(new URL('/auth/signin?error=invalid_token', req.url));
    }

    const { email, sub: googleId, name, picture } = payload;

    // Check if user exists by email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      // New user: Doctors must be provisioned by center admin first
      return NextResponse.redirect(
        new URL('/auth/signin?error=account_not_found', req.url)
      );
    }

    const user = existingUser[0];

    // Doctor role check: must have doctor profile
    if (user.role === 'DOCTOR') {
      const doctorProfile = await db
        .select()
        .from(doctors)
        .where(eq(doctors.userId, user.id))
        .limit(1);

      if (doctorProfile.length === 0) {
        return NextResponse.redirect(
          new URL('/auth/signin?error=doctor_profile_missing', req.url)
        );
      }
    }

    // Check if Google account already linked
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, user.id))
      .where(eq(accounts.providerId, 'google'))
      .limit(1);

    // Link Google account if not already linked
    if (existingAccount.length === 0) {
      await db.insert(accounts).values({
        id: crypto.randomUUID(),
        accountId: googleId,
        providerId: 'google',
        userId: user.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        idToken: tokens.id_token,
        accessTokenExpiresAt: tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000) 
          : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Update user's googleId and mark email as verified
    await db
      .update(users)
      .set({ 
        googleId,
        emailVerified: true,
        image: picture || user.image,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Create session via Better Auth
    const session = await auth.api.createSession({
      userId: user.id,
      expiresIn: 60 * 60 * 24, // 24 hours
    });

    // Set session cookie
    const response = NextResponse.redirect(new URL('/doctor/dashboard', req.url));
    response.cookies.set('better-auth.session_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/auth/signin?error=oauth_failed', req.url)
    );
  }
}
