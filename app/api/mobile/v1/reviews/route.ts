import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, bookings, patientProfiles, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth-config';

/**
 * Get Reviews for a Doctor
 * GET /api/mobile/v1/reviews?doctorId=xxx
 * 
 * Returns reviews for a specific doctor.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    if (!doctorId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'doctorId is required' 
        },
        { status: 400 }
      );
    }

    // Get reviews with patient info
    const doctorReviews = await db
      .select({
        review: reviews,
        patient: patientProfiles,
        user: users,
      })
      .from(reviews)
      .leftJoin(bookings, eq(reviews.bookingId, bookings.id))
      .leftJoin(patientProfiles, eq(bookings.patientId, patientProfiles.id))
      .leftJoin(users, eq(patientProfiles.userId, users.id))
      .where(eq(reviews.doctorId, doctorId))
      .orderBy(desc(reviews.createdAt))
      .limit(limit);

    const formattedReviews = doctorReviews.map(r => ({
      id: r.review.id,
      rating: r.review.rating,
      comment: r.review.comment,
      createdAt: r.review.createdAt,
      patient: {
        name: r.user?.name || 'Anonymous',
        photoUrl: r.user?.photoUrl || r.patient?.photoUrl,
      }
    }));

    return NextResponse.json({
      success: true,
      data: {
        reviews: formattedReviews,
        total: doctorReviews.length,
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch reviews' 
      },
      { status: 500 }
    );
  }
}

/**
 * Create Review
 * POST /api/mobile/v1/reviews
 * 
 * Creates a new review for a completed booking.
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized' 
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { bookingId, doctorId, rating, comment } = body;

    // Validate required fields
    if (!bookingId || !doctorId || !rating) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: bookingId, doctorId, rating' 
        },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Rating must be between 1 and 5' 
        },
        { status: 400 }
      );
    }

    // Get patient profile
    const patientProfile = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, session.user.id))
      .limit(1);

    if (patientProfile.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Patient profile not found' 
        },
        { status: 404 }
      );
    }

    // Verify booking ownership and status
    const booking = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.patientId, patientProfile[0].id)
        )
      )
      .limit(1);

    if (booking.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Booking not found or does not belong to you' 
        },
        { status: 404 }
      );
    }

    if (booking[0].status !== 'COMPLETED') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Can only review completed bookings' 
        },
        { status: 400 }
      );
    }

    // Check if review already exists for this booking
    const existingReview = await db
      .select()
      .from(reviews)
      .where(eq(reviews.bookingId, bookingId))
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Review already exists for this booking' 
        },
        { status: 409 }
      );
    }

    // Create review
    const newReview = await db
      .insert(reviews)
      .values({
        bookingId,
        doctorId,
        patientId: patientProfile[0].id,
        rating,
        comment: comment || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        review: {
          id: newReview[0].id,
          rating: newReview[0].rating,
          comment: newReview[0].comment,
          createdAt: newReview[0].createdAt,
        }
      },
      message: 'Review submitted successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create review' 
      },
      { status: 500 }
    );
  }
}
