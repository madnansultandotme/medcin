import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';

/**
 * Mobile App Logout
 * POST /api/mobile/v1/auth/logout
 * 
 * Logs out the user and invalidates the session token.
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

    // Sign out using Better Auth
    await auth.api.signOut({
      headers: req.headers,
    });

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Mobile logout error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Logout failed' 
      },
      { status: 500 }
    );
  }
}
