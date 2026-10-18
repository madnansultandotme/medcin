/**
 * POST /api/doctor/checkin
 * 
 * Doctor endpoint to check in a patient for their appointment
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireDoctor, getUserDoctorId } from '@/lib/middleware/permissions';
import { checkInSchema } from '@/lib/validations/doctor';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const authResult = await requireDoctor();
  if ('error' in authResult) {
    return authResult.error;
  }

  const { context } = authResult;
  const doctorId = await getUserDoctorId(context.user.id);

  if (!doctorId) {
    return NextResponse.json(
      { error: 'Doctor profile not found for this user' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    
    // Validate request body
    const validation = checkInSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { bookingId } = validation.data;

    // Get booking
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify booking belongs to this doctor
    if (booking.doctorId !== doctorId) {
      return NextResponse.json(
        { error: 'This booking does not belong to you' },
        { status: 403 }
      );
    }

    // Verify booking status
    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: `Cannot check in booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // Verify booking is for today
    const today = new Date().toISOString().split('T')[0];
    if (booking.date !== today) {
      return NextResponse.json(
        { error: 'Booking is not scheduled for today' },
        { status: 400 }
      );
    }

    // Verify not already checked in
    if (booking.checkedInAt) {
      return NextResponse.json(
        { error: 'Patient is already checked in' },
        { status: 400 }
      );
    }

    // Update booking with check-in timestamp
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        checkedInAt: new Date(),
        checkedInBy: context.user.id,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Patient checked in successfully',
      booking: {
        id: updatedBooking.id,
        reference: updatedBooking.reference,
        date: updatedBooking.date,
        time: updatedBooking.time,
        checkedInAt: updatedBooking.checkedInAt,
        status: updatedBooking.status,
      },
    });

  } catch (error) {
    console.error('Patient check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to check in patient' },
      { status: 500 }
    );
  }
}
