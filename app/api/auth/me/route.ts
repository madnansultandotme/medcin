import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/get-session';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get Current User Profile
 * 
 * Returns the full user profile from database for authenticated user.
 */
export async function GET() {
  try {
    const { user: authUser } = await requireAuth();

    // Get user profile from database
    const profile = await db
      .select()
      .from(users)
      .where(eq(users.authUid, authUser.id))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: profile[0] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
