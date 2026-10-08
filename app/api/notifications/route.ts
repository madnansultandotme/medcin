import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications, users } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth/get-session';

/**
 * Notifications API
 * 
 * GET - List user's notifications
 * POST - Create a notification (admin only)
 */

// GET /api/notifications - List user's notifications
export async function GET(req: NextRequest) {
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

    // Get query params
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    if (unreadOnly) {
      query = db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.read, false)
          )
        )
        .orderBy(desc(notifications.createdAt))
        .limit(limit);
    }

    const result = await query;

    // Get unread count
    const unreadCount = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        )
      );

    return NextResponse.json({
      notifications: result,
      unreadCount: unreadCount.length,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create notification (admin only)
export async function POST(req: NextRequest) {
  try {
    const { user } = await getSession();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.authUid, user.id))
      .limit(1);

    if (!dbUser.length || dbUser[0].role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, type, title, message, link } = body;

    // Validate
    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create notification
    const newNotification = await db
      .insert(notifications)
      .values({
        userId,
        type,
        title,
        message,
        link: link || null,
        read: false,
      })
      .returning();

    return NextResponse.json({
      notification: newNotification[0],
      message: 'Notification created successfully',
    });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
