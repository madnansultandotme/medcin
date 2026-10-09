import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';

/**
 * Change Password API
 * 
 * Uses Better Auth's built-in changePassword endpoint
 * Requires: currentPassword, newPassword
 * Optional: revokeOtherSessions (invalidates all other sessions)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentPassword, newPassword, revokeOtherSessions } = body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Use Better Auth's changePassword endpoint
    const headersList = await headers();
    
    const result = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: revokeOtherSessions ?? false,
      },
      headers: headersList,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to change password. Please check your current password.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
      sessionRevoked: revokeOtherSessions,
    });

  } catch (error: any) {
    console.error('Change password error:', error);
    
    // Better Auth throws specific errors
    if (error.message?.includes('Invalid password')) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
