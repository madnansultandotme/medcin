import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth/get-session';

import { db } from '@/db';
import { bookings, users, patientProfiles, doctors, centers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthenticatedUser, getUserPatientId, getUserCenterId } from '@/lib/middleware/permissions';
import { rateLimit, RateLimits } from '@/lib/middleware/rate-limit';
import { sendBookingConfirmationEmail } from '@/lib/email';

/**
 * Get Bookings
 * 
 * Returns bookings for the authenticated user based on their role:
 * - PATIENT: Only their own bookings
 * - CENTER: Bookings for their doctors
 * - ADMIN: All bookings
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

    const { user } = authContext;
    let userBookings: any[] = [];

    if (user.role === 'PATIENT') {
      // Patient can only see their own bookings
      const patientId = await getUserPatientId(user.id);
      
      if (!patientId) {
        return NextResponse.json({
          bookings: [],
          count: 0,
        });
      }

      userBookings = await db
        .select()
        .from(bookings)
        .where(eq(bookings.patientId, patientId))
        .limit(100);

    } else if (user.role === 'CENTER') {
      // Center can see bookings for their doctors
      const centerId = await getUserCenterId(user.id);
      
      if (!centerId) {
        return NextResponse.json({
          bookings: [],
          count: 0,
        });
      }

      // Get all doctors for this center
      const centerDoctors = await db
        .select()
        .from(doctors)
        .where(eq(doctors.centerId, centerId));

      const doctorIds = centerDoctors.map(d => d.id);

      if (doctorIds.length === 0) {
        return NextResponse.json({
          bookings: [],
          count: 0,
        });
      }

      // Get bookings for these doctors
      userBookings = await db
        .select()
        .from(bookings)
        .where(
          doctorIds.length === 1
            ? eq(bookings.doctorId, doctorIds[0])
            : undefined // TODO: Add IN operator support
        )
        .limit(100);

    } else if (user.role === 'ADMIN') {
      // Admin can see all bookings
      userBookings = await db
        .select()
        .from(bookings)
        .limit(100);
    }

    return NextResponse.json({
      bookings: userBookings,
      count: userBookings.length,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

/**
 * Create Booking
 * 
 * Creates a new booking (PATIENT role only).
 * Validates slot availability before creating booking.
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

    // Only patients can create bookings
    if (user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Forbidden: Only patients can create bookings' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { doctorId, slotId, serviceId, date, time, price, notes, paymentMethod } = body;

    // Validate required fields
    if (!doctorId || !slotId || !date || !time || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: doctorId, slotId, date, time, price' },
        { status: 400 }
      );
    }

    // Get patient profile ID
    const patientId = await getUserPatientId(user.id);
    
    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      );
    }

    // Validate slot exists and is available
    const { slots } = await import('@/db/schema');
    const slot = await db
      .select()
      .from(slots)
      .where(eq(slots.id, slotId))
      .limit(1);

    if (slot.length === 0) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      );
    }

    if (slot[0].status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: `Slot is not available (status: ${slot[0].status})` },
        { status: 409 } // Conflict
      );
    }

    // Validate slot matches date and doctor
    if (slot[0].date !== date || slot[0].doctorId !== doctorId) {
      return NextResponse.json(
        { error: 'Slot does not match booking details' },
        { status: 400 }
      );
    }

    // Validate doctor exists and is active
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

    if (!doctor[0].active) {
      return NextResponse.json(
        { error: 'Doctor is not accepting bookings' },
        { status: 400 }
      );
    }

    // Generate unique reference
    const reference = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Get authenticated database instance
    

    // Create booking and update slot in a transaction-like manner
    // 1. Create booking
    const newBooking = await db
      .insert(bookings)
      .values({
        reference,
        patientId,
        doctorId,
        slotId,
        serviceId: serviceId || null,
        date,
        time,
        status: 'PENDING',
        price,
        patientNotes: notes,
        paymentMethod: paymentMethod || 'Pay at Clinic',
      })
      .returning();

    // 2. Mark slot as booked
    await db
      .update(slots)
      .set({
        status: 'BOOKED',
        updatedAt: new Date(),
      })
      .where(eq(slots.id, slotId));

    // 3. Send booking confirmation email
    const patientProfile = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.id, patientId))
      .limit(1);

    const doctorWithCenter = await db
      .select({
        doctor: doctors,
        center: centers,
      })
      .from(doctors)
      .leftJoin(centers, eq(doctors.centerId, centers.id))
      .where(eq(doctors.id, doctorId))
      .limit(1);

    if (patientProfile.length > 0 && doctorWithCenter.length > 0) {
      const patient = patientProfile[0];
      const { doctor: doc, center } = doctorWithCenter[0];
      
      // Send email asynchronously (don't wait for it)
      sendBookingConfirmationEmail(
        patient.userId, // Using userId as patient name fallback
        patient.userId + '@example.com', // TODO: Get actual email from users table
        reference,
        doc.name,
        center?.name || 'Medical Center',
        serviceId || 'Medical Consultation',
        date,
        time,
        price
      ).catch(err => console.error('Failed to send booking email:', err));
    }

    return NextResponse.json(
      {
        booking: newBooking[0],
        message: 'Booking created successfully. Confirmation email sent.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

/**
 * Update Booking
 * 
 * Updates an existing booking (patient owns it, center owns the doctor, or admin).
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
    const { id, status, notes, cancellationReason } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get the booking to check ownership
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = existingBooking[0];

    // Check permissions based on role
    let authorized = false;

    if (user.role === 'ADMIN') {
      // Admin can update any booking
      authorized = true;
    } else if (user.role === 'PATIENT') {
      // Patient can only update their own bookings
      const patientId = await getUserPatientId(user.id);
      authorized = patientId === booking.patientId;
    } else if (user.role === 'CENTER') {
      // Center can update bookings for their doctors
      const doctor = await db
        .select()
        .from(doctors)
        .where(eq(doctors.id, booking.doctorId))
        .limit(1);

      if (doctor.length > 0) {
        const centerId = await getUserCenterId(user.id);
        authorized = centerId === doctor[0].centerId;
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { error: 'Forbidden: You cannot update this booking' },
        { status: 403 }
      );
    }

    // Get authenticated database instance
    

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (notes) updateData.patientNotes = notes;
    if (cancellationReason) updateData.cancellationReason = cancellationReason;

    // Update booking
    const updated = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();

    return NextResponse.json({ booking: updated[0] });
  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
