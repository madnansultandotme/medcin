import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { centers, doctors } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get Center Details
 * GET /api/mobile/v1/centers/:id
 * 
 * Returns detailed information about a specific center including its doctors.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: centerId } = await params;

    // Get center
    const center = await db
      .select()
      .from(centers)
      .where(eq(centers.id, centerId))
      .limit(1);

    if (center.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Center not found' 
        },
        { status: 404 }
      );
    }

    // Get center's doctors
    const centerDoctors = await db
      .select()
      .from(doctors)
      .where(eq(doctors.centerId, centerId));

    const centerData = center[0];

    return NextResponse.json({
      success: true,
      data: {
        id: centerData.id,
        name: centerData.name,
        category: centerData.category,
        address: centerData.address,
        city: centerData.city,
        country: centerData.country,
        streetAddress: centerData.streetAddress,
        latitude: centerData.latitude,
        longitude: centerData.longitude,
        formattedAddress: centerData.formattedAddress,
        email: centerData.email,
        phone: centerData.phone,
        logoUrl: centerData.logoUrl,
        coverImageUrl: centerData.coverImageUrl,
        operatingHours: centerData.operatingHours,
        amenities: centerData.amenities,
        status: centerData.status,
        doctors: centerDoctors.map(d => ({
          id: d.id,
          name: d.name,
          role: d.role,
          category: d.category,
          price: d.price,
          rating: d.rating,
          reviewsCount: d.reviewsCount,
          imageUrl: d.imageUrl,
          bio: d.bio,
          active: d.active,
        }))
      }
    });

  } catch (error) {
    console.error('Get center details error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch center details' 
      },
      { status: 500 }
    );
  }
}
