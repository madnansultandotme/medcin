import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getUserCenterId } from '@/lib/middleware/permissions';
import { db } from '@/db';
import { bookings, doctors, users, centers, reviews } from '@/db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';

/**
 * GET /api/analytics
 * 
 * Get platform analytics based on user role
 * - ADMIN: System-wide analytics
 * - CENTER: Center-specific analytics
 * - PATIENT: Not allowed
 */
export async function GET(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();
    
    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { user } = authContext;
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30'; // days

    if (user.role === 'PATIENT') {
      return NextResponse.json(
        { error: 'Patients cannot access analytics' },
        { status: 403 }
      );
    }

    const daysAgo = parseInt(period, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    const startDateStr = startDate.toISOString().split('T')[0];

    if (user.role === 'ADMIN') {
      // Admin: System-wide analytics
      
      // Total counts
      const [usersCount] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(users);

      const [centersCount] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(centers);

      const [doctorsCount] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(doctors);

      const [bookingsCount] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(bookings);

      // Booking stats
      const [pendingCount] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(bookings)
        .where(eq(bookings.status, 'PENDING'));

      const [confirmedCount] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(bookings)
        .where(eq(bookings.status, 'CONFIRMED'));

      const [completedCount] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(bookings)
        .where(eq(bookings.status, 'COMPLETED'));

      const [cancelledCount] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(bookings)
        .where(eq(bookings.status, 'CANCELLED'));

      // Revenue calculation (completed bookings)
      const [revenueData] = await db
        .select({ total: sql<number>`cast(sum(price) as real)` })
        .from(bookings)
        .where(eq(bookings.status, 'COMPLETED'));

      // Recent bookings
      const recentBookings = await db
        .select({
          id: bookings.id,
          reference: bookings.reference,
          date: bookings.date,
          time: bookings.time,
          status: bookings.status,
          price: bookings.price,
          doctorName: doctors.name,
          createdAt: bookings.createdAt,
        })
        .from(bookings)
        .leftJoin(doctors, eq(bookings.doctorId, doctors.id))
        .orderBy(desc(bookings.createdAt))
        .limit(10);

      // Top doctors by bookings
      const topDoctors = await db
        .select({
          doctorId: bookings.doctorId,
          doctorName: doctors.name,
          centerName: centers.name,
          bookingCount: sql<number>`cast(count(*) as integer)`,
          totalRevenue: sql<number>`cast(sum(${bookings.price}) as real)`,
          avgRating: doctors.rating,
        })
        .from(bookings)
        .leftJoin(doctors, eq(bookings.doctorId, doctors.id))
        .leftJoin(centers, eq(doctors.centerId, centers.id))
        .where(eq(bookings.status, 'COMPLETED'))
        .groupBy(bookings.doctorId, doctors.name, centers.name, doctors.rating)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

      // Bookings by date (last 30 days for chart)
      const bookingsByDate = await db
        .select({
          date: bookings.date,
          count: sql<number>`cast(count(*) as integer)`,
        })
        .from(bookings)
        .where(gte(bookings.date, startDateStr))
        .groupBy(bookings.date)
        .orderBy(bookings.date);

      return NextResponse.json({
        platform: {
          totalUsers: usersCount.count,
          totalCenters: centersCount.count,
          totalDoctors: doctorsCount.count,
          totalBookings: bookingsCount.count,
        },
        bookings: {
          total: bookingsCount.count,
          pending: pendingCount.count,
          confirmed: confirmedCount.count,
          completed: completedCount.count,
          cancelled: cancelledCount.count,
        },
        revenue: {
          total: revenueData.total || 0,
          period: `Last ${daysAgo} days`,
        },
        recentBookings,
        topDoctors,
        bookingsByDate,
      });

    } else if (user.role === 'CENTER') {
      // Center: Center-specific analytics
      const centerId = await getUserCenterId(user.id);

      if (!centerId) {
        return NextResponse.json(
          { error: 'Center profile not found' },
          { status: 404 }
        );
      }

      // Get center's doctors
      const centerDoctors = await db
        .select({ id: doctors.id })
        .from(doctors)
        .where(eq(doctors.centerId, centerId));

      const doctorIds = centerDoctors.map(d => d.id);

      if (doctorIds.length === 0) {
        return NextResponse.json({
          doctors: { total: 0, active: 0 },
          bookings: { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
          revenue: { total: 0, period: `Last ${daysAgo} days` },
          recentBookings: [],
          doctorPerformance: [],
          bookingsByDate: [],
        });
      }

      // Doctor counts
      const [activeDoctors] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(doctors)
        .where(and(
          eq(doctors.centerId, centerId),
          eq(doctors.active, true)
        ));

      // Booking counts by status
      const bookingStats = await db
        .select({
          status: bookings.status,
          count: sql<number>`cast(count(*) as integer)`,
        })
        .from(bookings)
        .where(sql`${bookings.doctorId} IN ${doctorIds}`)
        .groupBy(bookings.status);

      const stats = {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
      };

      bookingStats.forEach(stat => {
        stats.total += stat.count;
        if (stat.status === 'PENDING') stats.pending = stat.count;
        if (stat.status === 'CONFIRMED') stats.confirmed = stat.count;
        if (stat.status === 'COMPLETED') stats.completed = stat.count;
        if (stat.status === 'CANCELLED') stats.cancelled = stat.count;
      });

      // Revenue
      const [revenueData] = await db
        .select({ total: sql<number>`cast(sum(price) as real)` })
        .from(bookings)
        .where(and(
          sql`${bookings.doctorId} IN ${doctorIds}`,
          eq(bookings.status, 'COMPLETED')
        ));

      // Recent bookings
      const recentBookings = await db
        .select({
          id: bookings.id,
          reference: bookings.reference,
          date: bookings.date,
          time: bookings.time,
          status: bookings.status,
          price: bookings.price,
          doctorName: doctors.name,
          createdAt: bookings.createdAt,
        })
        .from(bookings)
        .leftJoin(doctors, eq(bookings.doctorId, doctors.id))
        .where(sql`${bookings.doctorId} IN ${doctorIds}`)
        .orderBy(desc(bookings.createdAt))
        .limit(10);

      // Doctor performance
      const doctorPerformance = await db
        .select({
          doctorId: doctors.id,
          doctorName: doctors.name,
          bookingCount: sql<number>`cast(count(${bookings.id}) as integer)`,
          revenue: sql<number>`cast(sum(${bookings.price}) as real)`,
          rating: doctors.rating,
          reviewsCount: doctors.reviewsCount,
        })
        .from(doctors)
        .leftJoin(bookings, and(
          eq(doctors.id, bookings.doctorId),
          eq(bookings.status, 'COMPLETED')
        ))
        .where(eq(doctors.centerId, centerId))
        .groupBy(doctors.id, doctors.name, doctors.rating, doctors.reviewsCount)
        .orderBy(desc(sql`count(${bookings.id})`));

      // Bookings by date
      const bookingsByDate = await db
        .select({
          date: bookings.date,
          count: sql<number>`cast(count(*) as integer)`,
        })
        .from(bookings)
        .where(and(
          sql`${bookings.doctorId} IN ${doctorIds}`,
          gte(bookings.date, startDateStr)
        ))
        .groupBy(bookings.date)
        .orderBy(bookings.date);

      return NextResponse.json({
        doctors: {
          total: centerDoctors.length,
          active: activeDoctors.count,
        },
        bookings: stats,
        revenue: {
          total: revenueData.total || 0,
          period: `Last ${daysAgo} days`,
        },
        recentBookings,
        doctorPerformance,
        bookingsByDate,
      });
    }

    return NextResponse.json(
      { error: 'Invalid role' },
      { status: 403 }
    );

  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}
