/**
 * POST /api/doctor/checkout
 * 
 * Doctor endpoint to check out a patient and calculate commission
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireDoctor, getUserDoctorId } from '@/lib/middleware/permissions';
import { checkOutSchema } from '@/lib/validations/doctor';
import { calculateCommission } from '@/lib/utils/commission';
import { db } from '@/db';
import { bookings, doctors, centers, notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
    const validation = checkOutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const { bookingId, actualPrice } = validation.data;

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

    // Verify booking is checked in
    if (!booking.checkedInAt) {
      return NextResponse.json(
        { error: 'Patient must be checked in before checkout' },
        { status: 400 }
      );
    }

    // Verify not already checked out
    if (booking.checkedOutAt) {
      return NextResponse.json(
        { error: 'Patient is already checked out' },
        { status: 400 }
      );
    }

    // Get doctor with center info
    const doctorRecord = await db.query.doctors.findFirst({
      where: (d, { eq }) => eq(d.id, doctorId),
      with: {
        center: true,
      },
    });

    if (!doctorRecord) {
      return NextResponse.json(
        { error: 'Doctor record not found' },
        { status: 404 }
      );
    }

    // Calculate final price and commission
    const finalPrice = actualPrice !== undefined ? actualPrice : booking.price;
    let commissionAmount = 0;
    let centerEarnings = finalPrice;
    let commissionData = null;

    if (doctorRecord.center) {
      // Doctor belongs to a center - calculate commission
      const commission = calculateCommission(finalPrice, {
        commissionType: doctorRecord.center.commissionType,
        commissionRate: doctorRecord.center.commissionRate,
        fixedCommissionAmount: doctorRecord.center.fixedCommissionAmount,
      });

      commissionAmount = commission.commissionAmount;
      centerEarnings = commission.centerEarnings;

      commissionData = {
        commissionAmount,
        centerEarnings,
        commissionType: doctorRecord.center.commissionType,
        commissionRate: doctorRecord.center.commissionRate,
        fixedCommissionAmount: doctorRecord.center.fixedCommissionAmount,
      };

      // Create notification for center admin
      if (doctorRecord.center.userId) {
        await db.insert(notifications).values({
          userId: doctorRecord.center.userId,
          type: 'info',
          title: 'Booking Completed',
          message: `Dr. ${doctorRecord.name} completed a booking. Commission: SGD ${commissionAmount.toFixed(2)}`,
          link: `/center/bookings`,
        });
      }
    }
    // If independent doctor, no commission (centerEarnings = full price)

    // Update booking with check-out info
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        checkedOutAt: new Date(),
        checkedOutBy: context.user.id,
        status: 'COMPLETED',
        price: finalPrice,
        commissionAmount,
        centerEarnings,
        commissionStatus: 'CALCULATED',
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Patient checked out successfully',
      booking: {
        id: updatedBooking.id,
        reference: updatedBooking.reference,
        date: updatedBooking.date,
        time: updatedBooking.time,
        status: updatedBooking.status,
        checkedInAt: updatedBooking.checkedInAt,
        checkedOutAt: updatedBooking.checkedOutAt,
        price: updatedBooking.price,
        commissionAmount: updatedBooking.commissionAmount,
        centerEarnings: updatedBooking.centerEarnings,
      },
      commission: commissionData,
    });

  } catch (error) {
    console.error('Patient checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to check out patient' },
      { status: 500 }
    );
  }
}
