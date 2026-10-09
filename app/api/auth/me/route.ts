import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware/permissions';

/**
 * Get Current User Profile
 * 
 * Returns the full user profile from database for authenticated user.
 */
export async function GET() {
  try {
    const authContext = await getAuthenticatedUser();

    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user: authContext.user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
