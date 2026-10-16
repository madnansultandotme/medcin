import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { centers, doctors } from '@/db/schema';
import { eq, and, like, or, sql } from 'drizzle-orm';

/**
 * Search Centers
 * GET /api/mobile/v1/centers
 * 
 * Search and filter medical centers.
 * Query params:
 * - q: search query (name, category)
 * - category: filter by category
 * - city: filter by city
 * - country: filter by country
 * - latitude: user latitude for distance calculation
 * - longitude: user longitude for distance calculation
 * - radius: search radius in km (default: 50)
 * - page: page number (default: 1)
 * - limit: results per page (default: 20)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = parseInt(searchParams.get('radius') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    // Build query conditions - only approved centers
    let conditions: any[] = [eq(centers.status, 'APPROVED')];

    if (query) {
      conditions.push(
        or(
          like(centers.name, `%${query}%`),
          like(centers.category, `%${query}%`)
        )
      );
    }

    if (category) {
      conditions.push(eq(centers.category, category));
    }

    if (city) {
      conditions.push(eq(centers.city, city));
    }

    if (country) {
      conditions.push(eq(centers.country, country));
    }

    // Get centers
    let results = await db
      .select()
      .from(centers)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

    // Calculate distance if lat/lng provided
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);

      results = results
        .map((center: any) => {
          if (!center.latitude || !center.longitude) {
            return { ...center, distance: null };
          }

          // Haversine formula for distance calculation
          const R = 6371; // Earth's radius in km
          const dLat = (center.latitude - userLat) * Math.PI / 180;
          const dLon = (center.longitude - userLng) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(userLat * Math.PI / 180) * Math.cos(center.latitude * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;

          return { ...center, distance };
        })
        .filter((center: any) => !center.distance || center.distance <= radius)
        .sort((a: any, b: any) => {
          if (!a.distance) return 1;
          if (!b.distance) return -1;
          return a.distance - b.distance;
        });
    }

    // Get doctor count for each center
    const centersWithDoctorCount = await Promise.all(
      results.map(async (center: any) => {
        const doctorCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(doctors)
          .where(
            and(
              eq(doctors.centerId, center.id),
              eq(doctors.active, true)
            )
          );

        return {
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
          phone: center.phone,
          email: center.email,
          logoUrl: center.logoUrl,
          coverImageUrl: center.coverImageUrl,
          operatingHours: center.operatingHours,
          amenities: center.amenities,
          doctorCount: doctorCount[0]?.count || 0,
          distance: center.distance,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        centers: centersWithDoctorCount,
        pagination: {
          page,
          limit,
          total: centersWithDoctorCount.length,
          hasMore: centersWithDoctorCount.length === limit,
        }
      }
    });

  } catch (error) {
    console.error('Centers search error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Search failed' 
      },
      { status: 500 }
    );
  }
}
