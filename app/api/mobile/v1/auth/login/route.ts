import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth-config';

/**
 * Mobile App Login
 * POST /api/mobile/v1/auth/login
 * 
 * Authenticates a user and returns session token for mobile app.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email and password are required' 
        },
        { status: 400 }
      );
    }

    // Authenticate using Better Auth
    const session = await auth.api.signInEmail({
      body: { email, password }
    });

    if (!session) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid credentials' 
        },
        { status: 401 }
      );
    }

    // Get user details
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found' 
        },
        { status: 404 }
      );
    }

    const userData = user[0];

    return NextResponse.json({
      success: true,
      data: {
        token: session.token,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          photoUrl: userData.photoUrl,
          role: userData.role,
          subscriptionStatus: userData.subscriptionStatus,
          subscriptionTier: userData.subscriptionTier,
          subscriptionExpiryDate: userData.subscriptionExpiryDate,
        }
      }
    });

  } catch (error) {
    console.error('Mobile login error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Authentication failed' 
      },
      { status: 500 }
    );
  }
}
