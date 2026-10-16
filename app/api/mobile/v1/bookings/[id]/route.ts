import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, doctors, centers, services, patientProfiles, slots } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth-config';

/**
 * Get Booking Details
 * GET /api/mobile/v1/bookings/:id
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized' 
        },
        { status: 401 }
      );
    }

    const { id: bookingId } = await params;

    // Get patient profile
    const patientProfile = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, session.user.id))
      .limit(1);

    if (patientProfile.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Patient profile not found' 
        },
        { status: 404 }
      );
    }

    // Get booking with related data
    const result = await db
      .select({
        booking: bookings,
        doctor: doctors,
        center: centers,
        service: services,
      })
      .from(bookings)
      .leftJoin(doctors, eq(bookings.doctorId, doctors.id))
      .leftJoin(centers, eq(doctors.centerId, centers.id))
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.patientId, patientProfile[0].id)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Booking not found' 
        },
        { status: 404 }
      );
    }

    const b = result[0];

    return NextResponse.json({
      success: true,
      data: {
        booking: {
          id: b.booking.id,
          reference: b.booking.reference,
          date: b.booking.date,
          time: b.booking.time,
          status: b.booking.status,
          price: b.booking.price,
          patientNotes: b.booking.patientNotes,
          paymentMethod: b.booking.paymentMethod,
          cancellationReason: b.booking.cancellationReason,
          createdAt: b.booking.createdAt,
          updatedAt: b.booking.updatedAt,
          doctor: b.doctor ? {
            id: b.doctor.id,
            name: b.doctor.name,
            role: b.doctor.role,
            category: b.doctor.category,
            imageUrl: b.doctor.imageUrl,
            bio: b.doctor.bio,
          } : null,
          center: b.center ? {
            id: b.center.id,
            name: b.center.name,
            address: b.center.address,
            city: b.center.city,
            country: b.center.country,
            phone: b.center.phone,
            email: b.center.email,
            latitude: b.center.latitude,
            longitude: b.center.longitude,
          } : null,
          service: b.service ? {
            id: b.service.id,
            name: b.service.name,
            duration: b.service.duration,
            price: b.service.price,
            description: b.service.description,
          } : null,
        }
      }
    });

  } catch (error) {
    console.error('Get booking details error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch booking' 
      },
      { status: 500 }
    );
  }
}

/**
 * Cancel Booking
 * PATCH /api/mobile/v1/bookings/:id
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized' 
        },
        { status: 401 }
      );
    }

    const { id: bookingId } = await params;
    const body = await req.json();
    const { action, cancellationReason } = body;

    if (action !== 'cancel') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid action. Only "cancel" is supported.' 
        },
        { status: 400 }
      );
    }

    // Get patient profile
    const patientProfile = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, session.user.id))
      .limit(1);

    if (patientProfile.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Patient profile not found' 
        },
        { status: 404 }
      );
    }

    // Get booking
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.patientId, patientProfile[0].id)
        )
      )
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Booking not found' 
        },
        { status: 404 }
      );
    }

    const booking = existingBooking[0];

    // Check if booking can be cancelled
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Booking is already cancelled' 
        },
        { status: 400 }
      );
    }

    if (booking.status === 'COMPLETED') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Cannot cancel completed booking' 
        },
        { status: 400 }
      );
    }

    // Update booking status
    const updated = await db
      .update(bookings)
      .set({
        status: 'CANCELLED',
        cancellationReason: cancellationReason || 'Cancelled by patient',
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    // Release the slot
    if (booking.slotId) {
      await db
        .update(slots)
        .set({
          status: 'AVAILABLE',
          updatedAt: new Date(),
        })
        .where(eq(slots.id, booking.slotId));
    }

    return NextResponse.json({
      success: true,
      data: {
        booking: {
          id: updated[0].id,
          status: updated[0].status,
          cancellationReason: updated[0].cancellationReason,
        }
      },
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to cancel booking' 
      },
      { status: 500 }
    );
  }
}
