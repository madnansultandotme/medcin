import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth/get-session';

/**
 * Mark All Notifications as Read API
 * 
 * POST /api/notifications/mark-all-read
 */

export async function POST(req: NextRequest) {
  try {
    const { user } = await getSession();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.authUid, user.id))
      .limit(1);

    if (!dbUser.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = dbUser[0].id;

    // Mark all as read
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        )
      );

    return NextResponse.json({
      message: 'All notifications marked as read',
      success: true,
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
