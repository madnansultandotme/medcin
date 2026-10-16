import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { doctors } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Get Doctor Categories
 * GET /api/mobile/v1/doctors/categories
 * 
 * Returns list of unique doctor categories with counts.
 */
export async function GET(req: NextRequest) {
  try {
    // Get unique categories with counts
    const categories = await db
      .select({
        category: doctors.category,
        count: sql<number>`count(*)::int`,
      })
      .from(doctors)
      .where(eq(doctors.active, true))
      .groupBy(doctors.category)
      .orderBy(sql`count(*) DESC`);

    return NextResponse.json({
      success: true,
      data: {
        categories: categories.map(c => ({
          name: c.category,
          count: c.count,
        }))
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch categories' 
      },
      { status: 500 }
    );
  }
}
