import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { centers } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get Center by ID
 * 
 * Public endpoint to fetch a single center's details.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: centerId } = await params;

    if (!centerId) {
      return NextResponse.json(
        { error: 'Center ID is required' },
        { status: 400 }
      );
    }

    const centerRecord = await db
      .select()
      .from(centers)
      .where(eq(centers.id, centerId))
      .limit(1);

    if (centerRecord.length === 0) {
      return NextResponse.json(
        { error: 'Center not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      center: centerRecord[0],
    });
  } catch (error) {
    console.error('Center fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch center' },
      { status: 500 }
    );
  }
}
