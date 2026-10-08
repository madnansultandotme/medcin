import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { rateLimit, RateLimits } from '@/lib/middleware/rate-limit';

/**
 * User Registration Sync API
 * 
 * Called after Neon Auth creates an account to sync user to database.
 * This creates the user record in our users table.
 */
export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(req, RateLimits.auth);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  try {
    const body = await req.json();
    const { authUid, email, name, role, phone } = body;

    // Validate required fields
    if (!authUid || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: authUid, email, name' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.authUid, authUid))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { user: existing[0], message: 'User already exists' },
        { status: 200 }
      );
    }

    // Create new user record
    const newUser = await db
      .insert(users)
      .values({
        authUid,
        email,
        name,
        role: role || 'PATIENT',
        phone: phone || null,
      })
      .returning();

    return NextResponse.json(
      { user: newUser[0], message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('User registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
