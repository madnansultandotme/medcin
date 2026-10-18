/**
 * Doctor Bookings API
 * 
 * Fetch bookings for the authenticated doctor.
 * GET /api/doctor/bookings?date=YYYY-MM-DD&status=CONFIRMED
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireDoctor, getUserDoctorId } from '@/lib/middleware/permissions';
import { db } from '@/db';
import { bookings, patientProfiles, services, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
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

    // 3. Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const dateFilter = searchParams.get('date'); // YYYY-MM-DD
    const statusFilter = searchParams.get('status'); // CONFIRMED, COMPLETED, CANCELLED

    // 4. Build query conditions
    const conditions = [eq(bookings.doctorId, doctorId)];

    if (dateFilter) {
      conditions.push(eq(bookings.date, dateFilter));
    }

    if (statusFilter) {
      conditions.push(eq(bookings.status, statusFilter as any));
    }

    // 5. Fetch bookings with patient and service info
    const bookingsData = await db
      .select({
        booking: bookings,
        patient: patientProfiles,
        patientUser: users,
        service: services,
      })
      .from(bookings)
      .leftJoin(patientProfiles, eq(bookings.patientId, patientProfiles.id))
      .leftJoin(users, eq(patientProfiles.userId, users.id))
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(and(...conditions))
      .orderBy(desc(bookings.date), desc(bookings.time));

    // 6. Format response
    const formattedBookings = bookingsData.map((row) => ({
      ...row.booking,
      patient: row.patientUser ? {
        id: row.patient?.id,
        name: row.patientUser.name,
        email: row.patientUser.email,
        phone: row.patientUser.phone,
      } : null,
      service: row.service ? {
        id: row.service.id,
        name: row.service.name,
        duration: row.service.duration,
        price: row.service.price,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      count: formattedBookings.length,
    });

  } catch (error) {
    console.error('Fetch doctor bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
