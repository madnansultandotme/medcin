import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, doctors, centers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireCenter, getUserCenterId } from '@/lib/middleware/permissions';

/**
 * POST /api/center/checkout
 * 
 * Check out a patient and calculate commission automatically.
 * CENTER role only. Validates booking belongs to center's doctor and is checked in.
 * Sets booking status to COMPLETED, populates commissionAmount/centerEarnings,
 * and sets commissionStatus to CALCULATED.
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

    // Check if booking is checked in
    if (!booking.checkedInAt) {
      return NextResponse.json(
        { error: 'Cannot check out: Patient has not been checked in yet' },
        { status: 400 }
      );
    }

    // Check if already checked out
    if (booking.checkedOutAt) {
      return NextResponse.json(
        { error: 'Booking already checked out' },
        { status: 400 }
      );
    }

    // Get center's commission settings
    const centerRecord = await db
      .select()
      .from(centers)
      .where(eq(centers.id, centerId))
      .limit(1);

    if (centerRecord.length === 0) {
      return NextResponse.json(
        { error: 'Center not found' },
        { status: 404 }
      );
    }

    const center = centerRecord[0];

    // Calculate commission based on center's commission settings
    let commissionAmount = 0;
    const bookingPrice = booking.price;

    if (center.commissionType === 'PERCENTAGE') {
      // PERCENTAGE: commissionAmount = price * (rate / 100)
      const rate = center.commissionRate || 0;
      commissionAmount = bookingPrice * (rate / 100);
    } else if (center.commissionType === 'FIXED') {
      // FIXED: use fixedCommissionAmount
      commissionAmount = center.fixedCommissionAmount || 0;
    }

    // Calculate center earnings
    const centerEarnings = bookingPrice - commissionAmount;

    // Update booking with checkout info and commission calculation
    const updatedBooking = await db
      .update(bookings)
      .set({
        checkedOutAt: new Date(),
        checkedOutBy: user.id,
        status: 'COMPLETED',
        commissionAmount,
        centerEarnings,
        commissionStatus: 'CALCULATED',
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return NextResponse.json({
      booking: updatedBooking[0],
      commissionBreakdown: {
        bookingPrice,
        commissionType: center.commissionType,
        commissionRate: center.commissionType === 'PERCENTAGE' ? center.commissionRate : null,
        fixedCommissionAmount: center.commissionType === 'FIXED' ? center.fixedCommissionAmount : null,
        commissionAmount,
        centerEarnings,
      },
      message: 'Patient checked out successfully. Commission calculated.',
    });
  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json(
      { error: 'Failed to check out patient' },
      { status: 500 }
    );
  }
}
