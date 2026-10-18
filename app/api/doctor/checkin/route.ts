/**
 * Doctor Check-In API
 * 
 * Allows doctors to check in patients for their appointments.
 * POST /api/doctor/checkin
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireDoctor, getUserDoctorId } from '@/lib/middleware/permissions';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    // 1. Require DOCTOR role
    const authResult = await requireDoctor();
    if ('error' in authResult) {
      return authResult.error;
    }

    const { context } = authResult;
    const { user } = context;

    // 2. Get doctor ID
    const doctorId = await getUserDoctorId(user.id);
    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    // 3. Parse request body
    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId || typeof bookingId !== 'string') {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // 4. Fetch booking
    const bookingRecord = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (bookingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = bookingRecord[0];

    // 5. Validate booking belongs to this doctor
    if (booking.doctorId !== doctorId) {
      return NextResponse.json(
        { error: 'This booking does not belong to you' },
        { status: 403 }
      );
    }

    // 6. Validate booking status
    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: `Cannot check in booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // 7. Validate not already checked in
    if (booking.checkedInAt) {
      return NextResponse.json(
        { error: 'Patient is already checked in' },
        { status: 400 }
      );
    }

    // 8. Validate booking date is today
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (booking.date !== today) {
      return NextResponse.json(
        { error: 'Can only check in patients for today\'s appointments' },
        { status: 400 }
      );
    }

    // 9. Update booking with check-in timestamp
    const now = new Date();
    await db
      .update(bookings)
      .set({
        checkedInAt: now,
        checkedInBy: user.id,
        updatedAt: now,
      })
      .where(eq(bookings.id, bookingId));

    // 10. Fetch updated booking
    const updatedBooking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    return NextResponse.json({
      success: true,
      booking: updatedBooking[0],
      message: 'Patient checked in successfully',
    });

  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to check in patient', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
