/**
 * PUT /api/admin/centers/commission
 * 
 * Admin endpoint to update center commission settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/permissions';
import { commissionSchema } from '@/lib/validations/doctor';
import { db } from '@/db';
import { centers, users, notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';

export async function PUT(request: NextRequest) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    
    // Validate request body
    const validation = commissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const { centerId, commissionType, commissionRate, fixedCommissionAmount } = validation.data;

    // Get center with user info
    const centerRecord = await db.query.centers.findFirst({
      where: (c, { eq }) => eq(c.id, centerId),
      with: {
        user: true,
      },
    });

    if (!centerRecord) {
      return NextResponse.json(
        { error: 'Center not found' },
        { status: 404 }
      );
    }

    // Update center commission settings
    const [updatedCenter] = await db
      .update(centers)
      .set({
        commissionType,
        commissionRate: commissionType === 'PERCENTAGE' ? commissionRate : null,
        fixedCommissionAmount: commissionType === 'FIXED' ? fixedCommissionAmount : null,
        updatedAt: new Date(),
      })
      .where(eq(centers.id, centerId))
      .returning();

    // Send notification to center admin
    if (centerRecord.user) {
      await db.insert(notifications).values({
        userId: centerRecord.user.id,
        type: 'info',
        title: 'Commission Settings Updated',
        message: commissionType === 'PERCENTAGE' 
          ? `Your commission rate has been updated to ${commissionRate}%`
          : `Your commission has been updated to SGD ${fixedCommissionAmount} per booking`,
        link: '/center/settings',
      });

      // Send email notification
      const emailText = `
Dear ${centerRecord.user.name},

Your commission settings have been updated on the Medcin platform.

Center: ${centerRecord.name}
Commission Type: ${commissionType}
${commissionType === 'PERCENTAGE' ? `Rate: ${commissionRate}%` : `Fixed Amount: SGD ${fixedCommissionAmount}`}

This will apply to all new bookings effective immediately.

View your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://medcin.health'}/center

If you have questions, please contact support@medcin.health

Best regards,
The Medcin Team
      `.trim();

      await sendEmail({
        to: centerRecord.user.email,
        subject: 'Commission Settings Updated - Medcin Platform',
        text: emailText,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Commission settings updated successfully',
      center: {
        id: updatedCenter.id,
        name: updatedCenter.name,
        commissionType: updatedCenter.commissionType,
        commissionRate: updatedCenter.commissionRate,
        fixedCommissionAmount: updatedCenter.fixedCommissionAmount,
      },
    });

  } catch (error) {
    console.error('Update commission error:', error);
    return NextResponse.json(
      { error: 'Failed to update commission settings' },
      { status: 500 }
    );
  }
}
