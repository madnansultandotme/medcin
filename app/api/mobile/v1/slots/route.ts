import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { slots } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';

/**
 * Get Available Slots
 * GET /api/mobile/v1/slots
 * 
 * Returns available time slots for a doctor.
 * Query params:
 * - doctorId: doctor ID (required)
 * - date: specific date (YYYY-MM-DD) or leave empty for next 7 days
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');

    if (!doctorId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'doctorId is required' 
        },
        { status: 400 }
      );
    }

    let conditions = [
      eq(slots.doctorId, doctorId),
      eq(slots.status, 'AVAILABLE'),
    ];

    if (date) {
      // Get slots for specific date
      conditions.push(eq(slots.date, date));
    } else {
      // Get slots for next 7 days
      const today = new Date().toISOString().split('T')[0];
      conditions.push(gte(slots.date, today));
    }

    const availableSlots = await db
      .select()
      .from(slots)
      .where(and(...conditions))
      .limit(100);

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
        slots: slotsByDate,
        total: availableSlots.length,
      }
    });

  } catch (error) {
    console.error('Get slots error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch slots' 
      },
      { status: 500 }
    );
  }
}
