import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { doctors, centers } from '@/db/schema';
import { eq, and, like, or, gte, lte, sql } from 'drizzle-orm';

/**
 * Search Doctors
 * GET /api/mobile/v1/doctors/search
 * 
 * Search and filter doctors with pagination.
 * Query params:
 * - q: search query (name, specialization)
 * - category: filter by category
 * - minPrice: minimum price
 * - maxPrice: maximum price
 * - rating: minimum rating
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
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('rating');
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = parseInt(searchParams.get('radius') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    // Build query conditions
    let conditions: any[] = [eq(doctors.active, true)];

    if (query) {
      conditions.push(
        or(
          like(doctors.name, `%${query}%`),
          like(doctors.role, `%${query}%`),
          like(doctors.category, `%${query}%`)
        )
      );
    }

    if (category) {
      conditions.push(eq(doctors.category, category));
    }

    if (minPrice) {
      conditions.push(gte(doctors.price, parseFloat(minPrice)));
    }

    if (maxPrice) {
      conditions.push(lte(doctors.price, parseFloat(maxPrice)));
    }

    if (minRating) {
      conditions.push(gte(doctors.rating, parseFloat(minRating)));
    }

    // Get doctors with their centers
    const results = await db
      .select({
        doctor: doctors,
        center: centers,
      })
      .from(doctors)
      .leftJoin(centers, eq(doctors.centerId, centers.id))
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

    // Filter by location if provided
    let filteredResults = results;
    if (city) {
      filteredResults = filteredResults.filter(r => 
        r.center?.city?.toLowerCase() === city.toLowerCase()
      );
    }

    if (country) {
      filteredResults = filteredResults.filter(r => 
        r.center?.country?.toLowerCase() === country.toLowerCase()
      );
    }

    // Calculate distance if lat/lng provided
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);

      filteredResults = filteredResults
        .map(result => {
          if (!result.center?.latitude || !result.center?.longitude) {
            return { ...result, distance: null };
          }

          // Haversine formula for distance calculation
          const R = 6371; // Earth's radius in km
          const dLat = (result.center.latitude - userLat) * Math.PI / 180;
          const dLon = (result.center.longitude - userLng) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(userLat * Math.PI / 180) * Math.cos(result.center.latitude * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;

          return { ...result, distance };
        })
        .filter(result => !result.distance || result.distance <= radius)
        .sort((a, b) => {
          if (!a.distance) return 1;
          if (!b.distance) return -1;
          return a.distance - b.distance;
        });
    }

    // Format response
    const formattedResults = filteredResults.map(result => ({
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
      distance: (result as any).distance,
    }));

    return NextResponse.json({
      success: true,
      data: {
        doctors: formattedResults,
        pagination: {
          page,
          limit,
          total: filteredResults.length,
          hasMore: filteredResults.length === limit,
        }
      }
    });

  } catch (error) {
    console.error('Doctor search error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Search failed' 
      },
      { status: 500 }
    );
  }
}
