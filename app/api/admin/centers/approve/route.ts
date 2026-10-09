import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware/permissions';

import { centers, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendCenterApprovalEmail, sendCenterRejectionEmail } from '@/lib/email';
import { db } from '@/db';

/**
 * Approve or Reject Center Application
 * 
 * Admin-only endpoint to update center status and send email notifications.
 */
export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();

    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { user, session } = authContext;

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    
    
    // Parse request body
    const body = await req.json();
    const { centerId, action, reason } = body;

    if (!centerId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: centerId and action' },
        { status: 400 }
      );
    }

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be APPROVE or REJECT' },
        { status: 400 }
      );
    }

    // Update center status
    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'SUSPENDED';
    
    const updated = await db
      .update(centers)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(centers.id, centerId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Center not found' },
        { status: 404 }
      );
    }

    // Get center owner details for email notification
    const centerWithOwner = await db
      .select({
        center: centers,
        owner: users,
      })
      .from(centers)
      .leftJoin(users, eq(centers.userId, users.id))
      .where(eq(centers.id, centerId))
      .limit(1);

    // Send email notification
    if (centerWithOwner.length > 0 && centerWithOwner[0].owner) {
      const { center, owner } = centerWithOwner[0];
      
      if (action === 'APPROVE') {
        await sendCenterApprovalEmail(
          center.name,
          owner.email,
          owner.name
        );
      } else {
        await sendCenterRejectionEmail(
          center.name,
          owner.email,
          owner.name,
          reason
        );
      }
    }

    return NextResponse.json({
      success: true,
      center: updated[0],
      message: `Center ${action.toLowerCase()}d successfully`,
    });
  } catch (error) {
    console.error('Center approval error:', error);
    return NextResponse.json(
      { error: 'Failed to process center approval' },
      { status: 500 }
    );
  }
}
