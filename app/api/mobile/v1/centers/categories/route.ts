import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { centers } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Get Center Categories
 * GET /api/mobile/v1/centers/categories
 * 
 * Returns list of unique center categories with counts.
 */
export async function GET(req: NextRequest) {
  try {
    // Get unique categories with counts (only approved centers)
    const categories = await db
      .select({
        category: centers.category,
        count: sql<number>`count(*)::int`,
      })
      .from(centers)
      .where(eq(centers.status, 'APPROVED'))
      .groupBy(centers.category)
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
