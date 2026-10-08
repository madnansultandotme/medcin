import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { rateLimit, RateLimits } from '@/lib/middleware/rate-limit';

/**
 * Forgot Password API
 * 
 * Sends a password reset email using Neon Auth
 */
export async function POST(req: NextRequest) {
  // Apply strict rate limiting for password reset
  const rateLimitResult = await rateLimit(req, RateLimits.passwordReset);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists in our database
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (userRecord.length > 0) {
      const neonAuthUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL;
      
      if (!neonAuthUrl) {
        console.error('NEON_AUTH_URL not configured');
        return NextResponse.json(
          { error: 'Email service not configured' },
          { status: 500 }
        );
      }

      // Call Neon Auth to send reset email
      try {
        const resetResponse = await fetch(`${neonAuthUrl}/password/reset`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
          }),
        });

        if (!resetResponse.ok) {
          const errorData = await resetResponse.json();
          console.error('Neon Auth reset error:', errorData);
          
          // Don't expose auth errors to user
          return NextResponse.json({
            message: 'If an account exists with this email, a reset link has been sent.',
          });
        }
      } catch (authError) {
        console.error('Failed to call Neon Auth:', authError);
        // Don't expose errors
      }
    }

    // Always return success message (prevents email enumeration)
    return NextResponse.json({
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
