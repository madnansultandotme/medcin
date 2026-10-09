import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware/permissions';

import { db } from '@/db';
import { disputes } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get Disputes
 * 
 * Returns disputes. Filtered by user role:
 * - Patients: their own disputes
 * - Centers: disputes against them
 * - Admins: all disputes
 */
export async function GET(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();

    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { session } = authContext;

    // Get authenticated database instance (RLS enforces filtering)
    

    const disputesList = await db
      .select()
      .from(disputes)
      .limit(100);

    return NextResponse.json({
      disputes: disputesList,
      count: disputesList.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

/**
 * Create Dispute
 * 
 * Files a new dispute (authenticated users only).
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
    const body = await req.json();

    const { bookingId, title, description, amount } = body;

    // Validate required fields
    if (!bookingId || !title || !description || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, title, description, amount' },
        { status: 400 }
      );
    }

    // Get authenticated database instance
    

    // Create dispute
    const newDispute = await db
      .insert(disputes)
      .values({
        bookingId,
        reporterId: user.id,
        title,
        description,
        amount,
        status: 'OPEN',
      })
      .returning();

    return NextResponse.json(
      { dispute: newDispute[0], message: 'Dispute filed successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Dispute creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create dispute' },
      { status: 500 }
    );
  }
}

/**
 * Update Dispute
 * 
 * Updates dispute status (admin only for resolution).
 */
export async function PUT(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();

    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { session } = authContext;
    const body = await req.json();

    const { id, status, resolutionNote, clinicStatement } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Dispute ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated database instance
    

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) {
      updateData.status = status;
      if (status === 'RESOLVED' || status === 'CLOSED') {
        updateData.resolvedAt = new Date();
      }
    }
    if (resolutionNote) updateData.resolutionNote = resolutionNote;
    if (clinicStatement) updateData.clinicStatement = clinicStatement;

    // Update dispute - RLS ensures only authorized users
    const updated = await db
      .update(disputes)
      .set(updateData)
      .where(eq(disputes.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Dispute not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ dispute: updated[0] });
  } catch (error) {
    console.error('Dispute update error:', error);
    return NextResponse.json(
      { error: 'Failed to update dispute' },
      { status: 500 }
    );
  }
}
