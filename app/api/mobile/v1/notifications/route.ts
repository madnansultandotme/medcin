import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth-config';

/**
 * Get User Notifications
 * GET /api/mobile/v1/notifications
 * 
 * Returns notifications for the authenticated user.
 * Query params:
 * - unreadOnly: boolean (default: false)
 * - limit: number (default: 50, max: 100)
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized' 
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // Build query conditions
    const conditions = [eq(notifications.userId, session.user.id)];
    if (unreadOnly) {
      conditions.push(eq(notifications.read, false));
    }

    // Get notifications
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    // Count unread
    const unreadCount = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, session.user.id),
          eq(notifications.read, false)
        )
      );

    return NextResponse.json({
      success: true,
      data: {
        notifications: userNotifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          link: n.link,
          isRead: n.read,
          createdAt: n.createdAt,
        })),
        unreadCount: unreadCount.length,
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch notifications' 
      },
      { status: 500 }
    );
  }
}

/**
 * Mark All Notifications as Read
 * PATCH /api/mobile/v1/notifications
 */
export async function PATCH(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized' 
        },
        { status: 401 }
      );
    }

    // Mark all as read
    await db
      .update(notifications)
      .set({
        read: true,
      })
      .where(
        and(
          eq(notifications.userId, session.user.id),
          eq(notifications.read, false)
        )
      );

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Mark notifications read error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update notifications' 
      },
      { status: 500 }
    );
  }
}
