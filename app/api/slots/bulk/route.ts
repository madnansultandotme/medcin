import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getUserCenterId } from '@/lib/middleware/permissions';

import { db } from '@/db';
import { slots, doctors } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Bulk Slots Creation API
 * 
 * Handles bulk creation of doctor availability slots
 */

/**
 * POST - Create multiple slots in bulk
 * Body: { slots: [{doctorId, date, startTime, endTime}] }
 * 
 * The frontend generates the full array of slots with dates already calculated
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

    const { user } = authContext;
    const body = await req.json();
    const { slots: slotsData } = body;

    // Validate required fields
    if (!slotsData || !Array.isArray(slotsData) || slotsData.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: slots array with [{doctorId, date, startTime, endTime}]' },
        { status: 400 }
      );
    }

    // Get unique doctor IDs from the slots
    const doctorIds = [...new Set(slotsData.map((s: any) => s.doctorId))];

    if (doctorIds.length === 0) {
      return NextResponse.json(
        { error: 'No doctor IDs found in slots data' },
        { status: 400 }
      );
    }

    // Check if all doctors exist and belong to user's center
    const doctorsList = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, doctorIds[0]))
      .limit(1);

    if (doctorsList.length === 0) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    const doctor = doctorsList[0];

    // Check permissions (center owner or admin)
    if (user.role === 'CENTER') {
      const userCenterId = await getUserCenterId(user.id);
      if (userCenterId !== doctor.centerId) {
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

    // Prepare slots for insertion with AVAILABLE status
    const slotsToInsert = slotsData.map((slot: any) => ({
      doctorId: slot.doctorId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: 'AVAILABLE' as const,
    }));

    // Insert slots in bulk
    const newSlots = await db
      .insert(slots)
      .values(slotsToInsert)
      .returning();

    return NextResponse.json({
      slots: newSlots,
      count: newSlots.length,
      created: newSlots.length,
      message: `${newSlots.length} slot(s) created successfully`,
    }, { status: 201 });
  } catch (error) {
    console.error('Bulk slots creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create slots in bulk' },
      { status: 500 }
    );
  }
}
