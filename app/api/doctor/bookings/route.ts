/**
 * GET /api/doctor/bookings
 * 
 * Get doctor's bookings with optional filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireDoctor, getUserDoctorId } from '@/lib/middleware/permissions';
import { db } from '@/db';
import { bookings, patientProfiles, services, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD format
    const status = searchParams.get('status'); // CONFIRMED, COMPLETED, CANCELLED

    // Build query conditions
    const conditions = [eq(bookings.doctorId, doctorId)];

    if (date) {
      conditions.push(eq(bookings.date, date));
    }

    if (status) {
      conditions.push(eq(bookings.status, status as any));
    }

    // Query bookings with related data
    const bookingsList = await db
      .select({
        // Booking fields
        id: bookings.id,
        reference: bookings.reference,
        date: bookings.date,
        time: bookings.time,
        status: bookings.status,
        price: bookings.price,
        patientNotes: bookings.patientNotes,
        checkedInAt: bookings.checkedInAt,
        checkedOutAt: bookings.checkedOutAt,
        commissionAmount: bookings.commissionAmount,
        centerEarnings: bookings.centerEarnings,
        commissionStatus: bookings.commissionStatus,
        createdAt: bookings.createdAt,
        // Patient info
        patientId: patientProfiles.id,
        patientUserId: users.id,
        patientName: users.name,
        patientEmail: users.email,
        patientPhone: users.phone,
        // Service info
        serviceId: services.id,
        serviceName: services.name,
        serviceDuration: services.duration,
        serviceDescription: services.description,
      })
      .from(bookings)
      .leftJoin(patientProfiles, eq(bookings.patientId, patientProfiles.id))
      .leftJoin(users, eq(patientProfiles.userId, users.id))
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(and(...conditions))
      .orderBy(desc(bookings.date), desc(bookings.time));

    // Format response
    const formattedBookings = bookingsList.map(b => ({
      id: b.id,
      reference: b.reference,
      date: b.date,
      time: b.time,
      status: b.status,
      price: b.price,
      patientNotes: b.patientNotes,
      checkedInAt: b.checkedInAt,
      checkedOutAt: b.checkedOutAt,
      commissionAmount: b.commissionAmount,
      centerEarnings: b.centerEarnings,
      commissionStatus: b.commissionStatus,
      createdAt: b.createdAt,
      patient: {
        id: b.patientId,
        userId: b.patientUserId,
        name: b.patientName,
        email: b.patientEmail,
        phone: b.patientPhone,
      },
      service: b.serviceId ? {
        id: b.serviceId,
        name: b.serviceName,
        duration: b.serviceDuration,
        description: b.serviceDescription,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      count: formattedBookings.length,
    });

  } catch (error) {
    console.error('Get doctor bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
