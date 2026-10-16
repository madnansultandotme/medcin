import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Refresh Session Token
 * POST /api/mobile/v1/auth/refresh
 * 
 * Refreshes the authentication token for mobile app.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No token provided' 
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify and refresh session
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid or expired token' 
        },
        { status: 401 }
      );
    }

    // Get updated user details
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
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
        token: token, // Return same token (Better Auth handles refresh internally)
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
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Token refresh failed' 
      },
      { status: 500 }
    );
  }
}
