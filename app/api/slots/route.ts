import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getUserCenterId } from '@/lib/middleware/permissions';

import { db } from '@/db';
import { slots, doctors } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

/**
 * Slots Management API
 * 
 * Handles doctor availability slots (time slots for bookings)
 */

/**
 * GET - Get slots for a doctor
 * Query params: doctorId (required), date (optional), startDate (optional), endDate (optional)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    // Build query conditions
    const conditions = [eq(slots.doctorId, doctorId)];

    if (date) {
      conditions.push(eq(slots.date, date));
    } else if (startDate && endDate) {
      conditions.push(gte(slots.date, startDate));
      conditions.push(lte(slots.date, endDate));
    }

    // Query slots
    const slotsList = await db
      .select()
      .from(slots)
      .where(and(...conditions))
      .orderBy(slots.date, slots.startTime)
      .limit(500);

    return NextResponse.json({
      slots: slotsList,
      count: slotsList.length,
    });
  } catch (error) {
    console.error('Slots fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new slots
 * Body: { doctorId, date, slots: [{startTime, endTime}] } or { doctorId, slots: [{date, startTime, endTime}] }
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
    const { doctorId, date, slots: slotsData } = body;

    // Validate required fields
    if (!doctorId || !slotsData || slotsData.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: doctorId, slots array' },
        { status: 400 }
      );
    }

    // Check if doctor exists and belongs to user's center
    const doctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, doctorId))
      .limit(1);

    if (doctor.length === 0) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Check permissions (center owner or admin)
    if (user.role === 'CENTER') {
      const userCenterId = await getUserCenterId(user.id);
      if (userCenterId !== doctor[0].centerId) {
        return NextResponse.json(
          { error: 'Forbidden: You can only create slots for doctors in your center' },
          { status: 403 }
        );
      }
    } else if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only center owners and admins can create slots' },
        { status: 403 }
      );
    }

    // Get authenticated database instance
    

    // Prepare slots for insertion
    const slotsToInsert = slotsData.map((slot: any) => ({
      doctorId,
      date: slot.date || date, // Use slot.date if provided, otherwise use common date
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: 'AVAILABLE',
    }));

    // Insert slots
    const newSlots = await db
      .insert(slots)
      .values(slotsToInsert)
      .returning();

    return NextResponse.json({
      slots: newSlots,
      count: newSlots.length,
      message: `${newSlots.length} slot(s) created successfully`,
    }, { status: 201 });
  } catch (error) {
    console.error('Slots creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create slots' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update slot status (AVAILABLE, BOOKED, BLOCKED)
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

    const { user, session } = authContext;
    const body = await req.json();
    const { id, status, startTime, endTime } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Slot ID is required' },
        { status: 400 }
      );
    }

    // Get the slot to check ownership
    const existingSlot = await db
      .select()
      .from(slots)
      .where(eq(slots.id, id))
      .limit(1);

    if (existingSlot.length === 0) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      );
    }

    // Get doctor to check center ownership
    const doctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, existingSlot[0].doctorId))
      .limit(1);

    // Check permissions
    if (user.role === 'CENTER') {
      const userCenterId = await getUserCenterId(user.id);
      if (userCenterId !== doctor[0].centerId) {
        return NextResponse.json(
          { error: 'Forbidden: You can only update slots for your center\'s doctors' },
          { status: 403 }
        );
      }
    } else if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only center owners and admins can update slots' },
        { status: 403 }
      );
    }

    // Get authenticated database instance
    

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;

    // Update slot
    const updated = await db
      .update(slots)
      .set(updateData)
      .where(eq(slots.id, id))
      .returning();

    return NextResponse.json({
      slot: updated[0],
      message: 'Slot updated successfully',
    });
  } catch (error) {
    console.error('Slot update error:', error);
    return NextResponse.json(
      { error: 'Failed to update slot' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete slots
 * Body: { id } (single slot) or { doctorId, date } (all slots for doctor on date)
 */
export async function DELETE(req: NextRequest) {
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
    const { id, doctorId, date } = body;

    if (!id && (!doctorId || !date)) {
      return NextResponse.json(
        { error: 'Either id or (doctorId + date) is required' },
        { status: 400 }
      );
    }

    // Get authenticated database instance
    

    let deleted;

    if (id) {
      // Delete single slot
      const existingSlot = await db
        .select()
        .from(slots)
        .where(eq(slots.id, id))
        .limit(1);

      if (existingSlot.length === 0) {
        return NextResponse.json(
          { error: 'Slot not found' },
          { status: 404 }
        );
      }

      // Check permissions
      if (user.role === 'CENTER') {
        const doctor = await db
          .select()
          .from(doctors)
          .where(eq(doctors.id, existingSlot[0].doctorId))
          .limit(1);

        const userCenterId = await getUserCenterId(user.id);
        if (userCenterId !== doctor[0].centerId) {
          return NextResponse.json(
            { error: 'Forbidden: You can only delete slots for your center\'s doctors' },
            { status: 403 }
          );
        }
      } else if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden: Only center owners and admins can delete slots' },
          { status: 403 }
        );
      }

      deleted = await db
        .delete(slots)
        .where(eq(slots.id, id))
        .returning();
    } else {
      // Delete all slots for doctor on date
      // Check permissions first
      const doctor = await db
        .select()
        .from(doctors)
        .where(eq(doctors.id, doctorId!))
        .limit(1);

      if (doctor.length === 0) {
        return NextResponse.json(
          { error: 'Doctor not found' },
          { status: 404 }
        );
      }

      if (user.role === 'CENTER') {
        const userCenterId = await getUserCenterId(user.id);
        if (userCenterId !== doctor[0].centerId) {
          return NextResponse.json(
            { error: 'Forbidden: You can only delete slots for your center\'s doctors' },
            { status: 403 }
          );
        }
      } else if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden: Only center owners and admins can delete slots' },
          { status: 403 }
        );
      }

      deleted = await db
        .delete(slots)
        .where(
          and(
            eq(slots.doctorId, doctorId!),
            eq(slots.date, date!)
          )
        )
        .returning();
    }

    return NextResponse.json({
      message: `${deleted.length} slot(s) deleted successfully`,
      count: deleted.length,
    });
  } catch (error) {
    console.error('Slot deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete slots' },
      { status: 500 }
    );
  }
}
