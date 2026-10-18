/**
 * POST /api/auth/change-password-first-login
 * 
 * Mandatory password change endpoint for first-time login users
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware/permissions';
import { changePasswordSchema } from '@/lib/validations/doctor';
import { db } from '@/db';
import { users, accounts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  // Require authentication
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
    
    // Validate request body
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Get user record to check flags
    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if password reset is required
    if (!userRecord.passwordResetRequired && !userRecord.isFirstLogin) {
      return NextResponse.json(
        { error: 'Password reset not required for this account' },
        { status: 400 }
      );
    }

    // Check if temporary password has expired
    if (userRecord.tempPasswordExpiresAt && new Date() > userRecord.tempPasswordExpiresAt) {
      return NextResponse.json(
        { error: 'Temporary password has expired. Please contact your administrator.' },
        { status: 401 }
      );
    }

    // Get account record for credential provider
    const [accountRecord] = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.userId, user.id),
          eq(accounts.providerId, 'credential')
        )
      )
      .limit(1);

    if (!accountRecord || !accountRecord.password) {
      return NextResponse.json(
        { error: 'No password account found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await auth.api.verifyPassword(
      currentPassword,
      accountRecord.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Ensure new password is different from current
    const isSamePassword = await auth.api.verifyPassword(
      newPassword,
      accountRecord.password
    );

    if (isSamePassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await auth.api.hashPassword(newPassword);

    // Update password in accounts table
    await db
      .update(accounts)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, accountRecord.id));

    // Update user flags
    await db
      .update(users)
      .set({
        passwordResetRequired: false,
        isFirstLogin: false,
        lastPasswordChangeAt: new Date(),
        tempPasswordExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
