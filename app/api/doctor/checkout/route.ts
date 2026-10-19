/**
 * Doctor Check-Out API
 * 
 * Allows doctors to check out patients and calculate commission.
 * POST /api/doctor/checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireDoctor, getUserDoctorId } from '@/lib/middleware/permissions';
import { db } from '@/db';
import { bookings, doctors, centers, notifications, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { calculateCommission } from '@/lib/utils/commission';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // 1. Require DOCTOR role
    const authResult = await requireDoctor();
    if ('error' in authResult) {
      return authResult.error;
    }

    const { context } = authResult;
    const { user } = context;

    // 2. Get doctor profile with center info
    const doctorId = await getUserDoctorId(user.id);
    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    const doctorRecord = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, doctorId))
      .limit(1);

    if (doctorRecord.length === 0) {
      return NextResponse.json(
        { error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    const doctor = doctorRecord[0];

    // 3. Parse request body
    const body = await req.json();
    const { bookingId, actualPrice } = body;

    if (!bookingId || typeof bookingId !== 'string') {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    if (actualPrice !== undefined && (typeof actualPrice !== 'number' || actualPrice <= 0)) {
      return NextResponse.json(
        { error: 'Actual price must be a positive number' },
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

    // 6. Validate booking has been checked in
    if (!booking.checkedInAt) {
      return NextResponse.json(
        { error: 'Patient must be checked in before checkout' },
        { status: 400 }
      );
    }

    // 7. Validate not already checked out
    if (booking.checkedOutAt) {
      return NextResponse.json(
        { error: 'Patient is already checked out' },
        { status: 400 }
      );
    }

    // 8. Determine final price
    const finalPrice = actualPrice || booking.price;

    // 9. Calculate commission based on center settings
    let commission = { commissionAmount: 0, centerEarnings: finalPrice };

    if (doctor.centerId) {
      // Center-affiliated doctor: apply center commission
      const centerRecord = await db
        .select()
        .from(centers)
        .where(eq(centers.id, doctor.centerId))
        .limit(1);

      if (centerRecord.length > 0) {
        const center = centerRecord[0];
        commission = calculateCommission(finalPrice, {
          commissionType: center.commissionType,
          commissionRate: center.commissionRate,
          fixedCommissionAmount: center.fixedCommissionAmount,
        });

        // Create notification for center admin
        const centerUserId = centerRecord[0].userId;
        await db.insert(notifications).values({
          id: crypto.randomUUID(),
          userId: centerUserId,
          type: 'info',
          title: 'Booking Completed',
          message: `Doctor ${doctor.name} completed a booking. Commission: SGD ${commission.commissionAmount.toFixed(2)}`,
          link: `/center/bookings`,
          createdAt: new Date(),
        });
      }
    } else {
      // Independent doctor: no commission
      commission = { commissionAmount: 0, centerEarnings: finalPrice };
    }

    // 10. Update booking
    const now = new Date();
    await db
      .update(bookings)
      .set({
        checkedOutAt: now,
        checkedOutBy: user.id,
        status: 'COMPLETED',
        price: finalPrice,
        commissionAmount: commission.commissionAmount,
        centerEarnings: commission.centerEarnings,
        commissionStatus: 'CALCULATED',
        updatedAt: now,
      })
      .where(eq(bookings.id, bookingId));

    // 11. Fetch updated booking
    const updatedBooking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    return NextResponse.json({
      success: true,
      booking: updatedBooking[0],
      commission: {
        commissionAmount: commission.commissionAmount,
        centerEarnings: commission.centerEarnings,
      },
      message: 'Patient checked out successfully',
    });

  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json(
      { error: 'Failed to check out patient', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
