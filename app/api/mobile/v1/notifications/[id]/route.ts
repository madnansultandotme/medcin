import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth-config';

/**
 * Mark Notification as Read
 * PATCH /api/mobile/v1/notifications/:id
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: notificationId } = await params;

    // Update notification
    const updated = await db
      .update(notifications)
      .set({
        read: true,
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, session.user.id)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Notification not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        notification: {
          id: updated[0].id,
          isRead: updated[0].read,
        }
      },
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update notification' 
      },
      { status: 500 }
    );
  }
}

/**
 * Delete Notification
 * DELETE /api/mobile/v1/notifications/:id
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: notificationId } = await params;

    // Delete notification
    const deleted = await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, session.user.id)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Notification not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete notification' 
      },
      { status: 500 }
    );
  }
}
