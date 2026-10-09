import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { rateLimit, RateLimits } from '@/lib/middleware/rate-limit';

/**
 * User Registration Sync API
 * 
 * Called after Better Auth creates an account to update user role and additional info.
 * Better Auth already creates the user record with id, email, name.
 * This endpoint updates role, phone, etc.
 */
export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(req, RateLimits.auth);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  try {
    const body = await req.json();
    const { userId, role, phone } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Update user record with additional info
    const updatedUser = await db
      .update(users)
      .set({
        role: role || 'PATIENT',
        phone: phone || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { user: updatedUser[0], message: 'User updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('User registration sync error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
