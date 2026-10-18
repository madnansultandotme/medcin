import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/permissions';
import { centers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/db';

/**
 * Set Commission Settings for a Center
 * 
 * Admin-only endpoint to configure commission settings per center.
 * Supports both percentage-based and fixed commission models.
 */
export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireAdmin();

    if ('error' in authResult) {
      return authResult.error;
    }

    // Parse request body
    const body = await req.json();
    const { centerId, commissionRate, commissionType, fixedCommissionAmount } = body;

    // Validate required fields
    if (!centerId || !commissionType) {
      return NextResponse.json(
        { error: 'Missing required fields: centerId and commissionType' },
        { status: 400 }
      );
    }

    // Validate commission type
    if (!['PERCENTAGE', 'FIXED'].includes(commissionType)) {
      return NextResponse.json(
        { error: 'Invalid commissionType. Must be PERCENTAGE or FIXED' },
        { status: 400 }
      );
    }

    // Validate percentage commission
    if (commissionType === 'PERCENTAGE') {
      if (commissionRate === null || commissionRate === undefined) {
        return NextResponse.json(
          { error: 'commissionRate is required when commissionType is PERCENTAGE' },
          { status: 400 }
        );
      }
      if (commissionRate < 0 || commissionRate > 100) {
        return NextResponse.json(
          { error: 'commissionRate must be between 0 and 100' },
          { status: 400 }
        );
      }
    }

    // Validate fixed commission
    if (commissionType === 'FIXED') {
      if (fixedCommissionAmount === null || fixedCommissionAmount === undefined) {
        return NextResponse.json(
          { error: 'fixedCommissionAmount is required when commissionType is FIXED' },
          { status: 400 }
        );
      }
      if (fixedCommissionAmount <= 0) {
        return NextResponse.json(
          { error: 'fixedCommissionAmount must be greater than 0' },
          { status: 400 }
        );
      }
    }

    // Check if center exists
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

    // Update commission settings
    const updateData: any = {
      commissionType,
      updatedAt: new Date(),
    };

    if (commissionType === 'PERCENTAGE') {
      updateData.commissionRate = commissionRate;
      updateData.fixedCommissionAmount = null;
    } else {
      updateData.fixedCommissionAmount = fixedCommissionAmount;
      updateData.commissionRate = null;
    }

    const updated = await db
      .update(centers)
      .set(updateData)
      .where(eq(centers.id, centerId))
      .returning();

    return NextResponse.json({
      success: true,
      center: updated[0],
      message: 'Commission settings updated successfully',
    });
  } catch (error) {
    console.error('Commission settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update commission settings' },
      { status: 500 }
    );
  }
}
