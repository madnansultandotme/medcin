import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { doctors, centers, services, slots } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';

/**
 * Get Doctor Details
 * GET /api/mobile/v1/doctors/:id
 * 
 * Returns detailed information about a specific doctor including
 * their center, services, and available slots.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await params;

    // Get doctor with center
    const result = await db
      .select({
        doctor: doctors,
        center: centers,
      })
      .from(doctors)
      .leftJoin(centers, eq(doctors.centerId, centers.id))
      .where(eq(doctors.id, doctorId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Doctor not found' 
        },
        { status: 404 }
      );
    }

    const { doctor, center } = result[0];

    // Get doctor's services
    const doctorServices = await db
      .select()
      .from(services)
      .where(eq(services.doctorId, doctorId));

    // Get available slots for next 7 days
    const today = new Date().toISOString().split('T')[0];
    const availableSlots = await db
      .select()
      .from(slots)
      .where(
        and(
          eq(slots.doctorId, doctorId),
          eq(slots.status, 'AVAILABLE'),
          gte(slots.date, today)
        )
      )
      .limit(50);

    // Group slots by date
    const slotsByDate: Record<string, any[]> = {};
    availableSlots.forEach(slot => {
      if (!slotsByDate[slot.date]) {
        slotsByDate[slot.date] = [];
      }
      slotsByDate[slot.date].push({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status,
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        id: doctor.id,
        name: doctor.name,
        role: doctor.role,
        category: doctor.category,
        price: doctor.price,
        rating: doctor.rating,
        reviewsCount: doctor.reviewsCount,
        licenseNumber: doctor.licenseNumber,
        bio: doctor.bio,
        imageUrl: doctor.imageUrl,
        active: doctor.active,
        center: center ? {
          id: center.id,
          name: center.name,
          category: center.category,
          address: center.address,
          city: center.city,
          country: center.country,
          streetAddress: center.streetAddress,
          latitude: center.latitude,
          longitude: center.longitude,
          formattedAddress: center.formattedAddress,
          email: center.email,
          phone: center.phone,
          logoUrl: center.logoUrl,
          coverImageUrl: center.coverImageUrl,
          operatingHours: center.operatingHours,
          amenities: center.amenities,
        } : null,
        services: doctorServices.map(s => ({
          id: s.id,
          name: s.name,
          duration: s.duration,
          price: s.price,
          description: s.description,
        })),
        availableSlots: slotsByDate,
      }
    });

  } catch (error) {
    console.error('Get doctor details error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch doctor details' 
      },
      { status: 500 }
    );
  }
}
