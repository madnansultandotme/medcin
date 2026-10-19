import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, doctors } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireCenter, getUserCenterId } from '@/lib/middleware/permissions';

/**
 * POST /api/center/checkin
 * 
 * Check in a patient for their appointment.
 * CENTER role only. Validates booking belongs to center's doctor.
 */
export async function POST(req: NextRequest) {
  try {
    // Require CENTER role
    const authResult = await requireCenter();
    
    if ('error' in authResult) {
      return authResult.error;
    }

    const { context } = authResult;
    const { user } = context;

    // Get center ID
    const centerId = await getUserCenterId(user.id);
    
    if (!centerId) {
      return NextResponse.json(
        { error: 'Center profile not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing required field: bookingId' },
        { status: 400 }
      );
    }

    // Get booking
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = existingBooking[0];

    // Verify booking belongs to center's doctor
    const doctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, booking.doctorId))
      .limit(1);

    if (doctor.length === 0) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    if (doctor[0].centerId !== centerId) {
      return NextResponse.json(
        { error: 'Forbidden: This booking does not belong to your center' },
        { status: 403 }
      );
    }

    // Check if booking is in CONFIRMED status
    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: `Cannot check in booking with status: ${booking.status}. Only CONFIRMED bookings can be checked in.` },
        { status: 400 }
      );
    }

    // Check if already checked in
    if (booking.checkedInAt) {
      return NextResponse.json(
        { error: 'Booking already checked in' },
        { status: 400 }
      );
    }

    // Validate booking date is today
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (booking.date !== today) {
      return NextResponse.json(
        { error: 'Can only check in patients for today\'s appointments' },
        { status: 400 }
      );
    }

    // Update booking with check-in info
    const updatedBooking = await db
      .update(bookings)
      .set({
        checkedInAt: new Date(),
        checkedInBy: user.id,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return NextResponse.json({
      booking: updatedBooking[0],
      message: 'Patient checked in successfully',
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to check in patient' },
      { status: 500 }
    );
  }
}
