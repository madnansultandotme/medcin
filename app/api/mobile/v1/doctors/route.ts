import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { doctors, centers } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Get Doctors List
 * GET /api/mobile/v1/doctors
 * 
 * Returns list of doctors with optional filters.
 * Query params:
 * - featured: boolean (top rated doctors)
 * - limit: number (default: 20)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get('featured') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    let query = db
      .select({
        doctor: doctors,
        center: centers,
      })
      .from(doctors)
      .leftJoin(centers, eq(doctors.centerId, centers.id))
      .where(eq(doctors.active, true))
      .limit(limit);

    // If featured, order by rating
    if (featured) {
      query = query.orderBy(desc(doctors.rating)) as any;
    }

    const results = await query;

    const formattedResults = results.map(result => ({
      id: result.doctor.id,
      name: result.doctor.name,
      role: result.doctor.role,
      category: result.doctor.category,
      price: result.doctor.price,
      rating: result.doctor.rating,
      reviewsCount: result.doctor.reviewsCount,
      imageUrl: result.doctor.imageUrl,
      bio: result.doctor.bio,
      center: result.center ? {
        id: result.center.id,
        name: result.center.name,
        address: result.center.address,
        city: result.center.city,
        country: result.center.country,
        latitude: result.center.latitude,
        longitude: result.center.longitude,
        logoUrl: result.center.logoUrl,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      data: { doctors: formattedResults }
    });

  } catch (error) {
    console.error('Get doctors error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch doctors' 
      },
      { status: 500 }
    );
  }
}
