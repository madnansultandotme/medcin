import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';

/**
 * Change Password
 * 
 * Allows authenticated users to change their password.
 * Note: This requires Neon Auth Better Auth integration.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, session } = await getSession();

    if (!user || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields: currentPassword, newPassword' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Note: Password change needs to be handled by Neon Auth
    // This is a placeholder that returns instructions
    return NextResponse.json({
      message: 'Password change must be done through Neon Auth',
      instructions: {
        method1: 'Use Neon Console: Go to your project → Neon Auth → Users → Select user → Change password',
        method2: 'Use password reset flow: Click "Forgot Password" on login page',
        note: 'Direct password change via API is not yet supported by Neon Auth'
      }
    }, { status: 501 }); // 501 Not Implemented

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
