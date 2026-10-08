import { NextRequest, NextResponse } from 'next/server';

/**
 * Reset Password API
 * 
 * Completes the password reset using Neon Auth token
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const neonAuthUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL;
    
    if (!neonAuthUrl) {
      return NextResponse.json(
        { error: 'Auth service not configured' },
        { status: 500 }
      );
    }

    // Call Neon Auth to complete password reset
    const resetResponse = await fetch(`${neonAuthUrl}/password/reset/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        password,
      }),
    });

    if (!resetResponse.ok) {
      const errorData = await resetResponse.json();
      console.error('Neon Auth reset confirm error:', errorData);
      
      return NextResponse.json(
        { 
          error: errorData.message || 'Failed to reset password. The link may have expired.' 
        },
        { status: resetResponse.status }
      );
    }

    const data = await resetResponse.json();

    return NextResponse.json({
      message: 'Password reset successfully',
      data,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
