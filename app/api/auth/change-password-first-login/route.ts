/**
 * First Login Password Change API
 * 
 * Allows doctors to change their temporary password on first login.
 * POST /api/auth/change-password-first-login
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware/permissions';
import { hashPassword, verifyPassword } from '@/lib/password';
import { db } from '@/db';
import { users, accounts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';
import { changePasswordFirstLoginSchema } from '@/lib/validations/doctor';

export async function POST(req: NextRequest) {
  try {
    // 1. Get authenticated user
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const { user } = authContext;

    // 2. Verify passwordResetRequired flag
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentUser = userRecord[0];

    if (!currentUser.passwordResetRequired) {
      return NextResponse.json(
        { error: 'Password reset not required' },
        { status: 403 }
      );
    }

    // 3. Check temporary password expiration
    if (currentUser.tempPasswordExpiresAt && new Date() > currentUser.tempPasswordExpiresAt) {
      return NextResponse.json(
        { error: 'Temporary password has expired. Please contact your center admin to resend credentials.' },
        { status: 401 }
      );
    }

    // 4. Parse and validate request
    const body = await req.json();
    const parseResult = changePasswordFirstLoginSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      );
    }

    const { oldPassword, newPassword } = parseResult.data;

    // 5. Fetch credential account
    const accountRecord = await db
      .select()
      .from(accounts)
      .where(and(
        eq(accounts.userId, user.id),
        eq(accounts.providerId, 'credential')
      ))
      .limit(1);

    if (accountRecord.length === 0) {
      return NextResponse.json(
        { error: 'Credential account not found' },
        { status: 404 }
      );
    }

    const account = accountRecord[0];

    // 6. Verify old password using Better Auth's password verification
    const isValidOldPassword = await verifyPassword({
      password: oldPassword,
      hash: account.password || '',
    });

    if (!isValidOldPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // 7. Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // 8. Update account password
    await db
      .update(accounts)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, account.id));

    // 9. Update user flags
    await db
      .update(users)
      .set({
        passwordResetRequired: false,
        lastPasswordChangeAt: new Date(),
        tempPasswordExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // 10. Send confirmation email
    await sendEmail({
      to: user.email,
      subject: '✅ Password Changed Successfully',
      text: `
Dear ${user.name},

Your password has been successfully changed on the Medcin platform.

Changed at: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' })}

If you didn't make this change, please contact support@medcin.health immediately.

Best regards,
The Medcin Security Team
      `.trim(),
      html: `
<div style="font-family: 'IBM Plex Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #10B981;">✅ Password Changed Successfully</h2>
  <p>Dear ${user.name},</p>
  <p>Your password has been successfully changed on the Medcin platform.</p>
  <div style="background-color: #F0F7FF; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <strong>Changed at:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' })}
  </div>
  <p style="color: #DC2626;">⚠️ If you didn't make this change, please contact support@medcin.health immediately.</p>
  <p>Best regards,<br>The Medcin Security Team</p>
</div>
      `.trim(),
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Failed to change password', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
