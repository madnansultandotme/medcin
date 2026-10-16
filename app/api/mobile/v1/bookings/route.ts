import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, doctors, centers, services, patientProfiles, users, slots } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth-config';

/**
 * Get User Bookings
 * GET /api/mobile/v1/bookings
 * 
 * Returns all bookings for the authenticated user.
 * Query params:
 * - status: filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
 * - limit: number of results (default: 50)
 */
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // Get patient profile
    const patientProfile = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, session.user.id))
      .limit(1);

    if (patientProfile.length === 0) {
      return NextResponse.json({
        success: true,
        data: { bookings: [] }
      });
    }

    const patientId = patientProfile[0].id;

    // Build query
    const conditions = [eq(bookings.patientId, patientId)];
    if (statusFilter) {
      conditions.push(eq(bookings.status, statusFilter as any));
    }

    // Get bookings with related data
    const userBookings = await db
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
      .where(and(...conditions))
      .orderBy(desc(bookings.createdAt))
      .limit(limit);

    const formattedBookings = userBookings.map(b => ({
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
      doctor: b.doctor ? {
        id: b.doctor.id,
        name: b.doctor.name,
        role: b.doctor.role,
        category: b.doctor.category,
        imageUrl: b.doctor.imageUrl,
      } : null,
      center: b.center ? {
        id: b.center.id,
        name: b.center.name,
        address: b.center.address,
        city: b.center.city,
        phone: b.center.phone,
      } : null,
      service: b.service ? {
        id: b.service.id,
        name: b.service.name,
        duration: b.service.duration,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      data: { bookings: formattedBookings }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch bookings' 
      },
      { status: 500 }
    );
  }
}

/**
 * Create Booking
 * POST /api/mobile/v1/bookings
 * 
 * Creates a new booking for the authenticated user.
 */
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { doctorId, slotId, serviceId, date, time, price, notes, paymentMethod } = body;

    // Validate required fields
    if (!doctorId || !slotId || !date || !time || !price) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: doctorId, slotId, date, time, price' 
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
          error: 'Patient profile not found. Please complete your profile first.' 
        },
        { status: 404 }
      );
    }

    const patientId = patientProfile[0].id;

    // Validate slot exists and is available
    const slot = await db
      .select()
      .from(slots)
      .where(eq(slots.id, slotId))
      .limit(1);

    if (slot.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Slot not found' 
        },
        { status: 404 }
      );
    }

    if (slot[0].status !== 'AVAILABLE') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Slot is no longer available' 
        },
        { status: 409 }
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
        { 
          success: false,
          error: 'Doctor not found' 
        },
        { status: 404 }
      );
    }

    if (!doctor[0].active) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Doctor is not accepting bookings' 
        },
        { status: 400 }
      );
    }

    // Generate unique reference
    const reference = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create booking
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
        patientNotes: notes || null,
        paymentMethod: paymentMethod || 'Pay at Clinic',
      })
      .returning();

    // Mark slot as booked
    await db
      .update(slots)
      .set({
        status: 'BOOKED',
        updatedAt: new Date(),
      })
      .where(eq(slots.id, slotId));

    // Get complete booking details
    const bookingDetails = await db
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
      .where(eq(bookings.id, newBooking[0].id))
      .limit(1);

    const result = bookingDetails[0];

    return NextResponse.json({
      success: true,
      data: {
        booking: {
          id: result.booking.id,
          reference: result.booking.reference,
          date: result.booking.date,
          time: result.booking.time,
          status: result.booking.status,
          price: result.booking.price,
          patientNotes: result.booking.patientNotes,
          paymentMethod: result.booking.paymentMethod,
          createdAt: result.booking.createdAt,
          doctor: result.doctor ? {
            id: result.doctor.id,
            name: result.doctor.name,
            role: result.doctor.role,
            category: result.doctor.category,
            imageUrl: result.doctor.imageUrl,
          } : null,
          center: result.center ? {
            id: result.center.id,
            name: result.center.name,
            address: result.center.address,
            city: result.center.city,
            phone: result.center.phone,
          } : null,
          service: result.service ? {
            id: result.service.id,
            name: result.service.name,
            duration: result.service.duration,
          } : null,
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create booking' 
      },
      { status: 500 }
    );
  }
}
