import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getUserPatientId, getUserCenterId } from '@/lib/middleware/permissions';
import { db } from '@/db';
import { reviews, bookings, doctors, patientProfiles, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

/**
 * GET /api/reviews
 * 
 * Get reviews for a doctor or by a patient
 * Query params: doctorId, patientId
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');

    let reviewsList: any[] = [];

    if (doctorId) {
      // Get all reviews for a specific doctor (public)
      reviewsList = await db
        .select({
          id: reviews.id,
          bookingId: reviews.bookingId,
          doctorId: reviews.doctorId,
          patientId: reviews.patientId,
          rating: reviews.rating,
          comment: reviews.comment,
          response: reviews.response,
          createdAt: reviews.createdAt,
          updatedAt: reviews.updatedAt,
          patientName: users.name,
          patientPhoto: users.photoUrl,
        })
        .from(reviews)
        .leftJoin(patientProfiles, eq(reviews.patientId, patientProfiles.id))
        .leftJoin(users, eq(patientProfiles.userId, users.id))
        .where(eq(reviews.doctorId, doctorId))
        .orderBy(desc(reviews.createdAt))
        .limit(100);

    } else if (patientId) {
      // Get all reviews by a specific patient (requires auth)
      const authContext = await getAuthenticatedUser();
      if (!authContext) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      reviewsList = await db
        .select()
        .from(reviews)
        .where(eq(reviews.patientId, patientId))
        .orderBy(desc(reviews.createdAt))
        .limit(100);

    } else {
      // Get all reviews (admin only or public recent reviews)
      reviewsList = await db
        .select({
          id: reviews.id,
          bookingId: reviews.bookingId,
          doctorId: reviews.doctorId,
          patientId: reviews.patientId,
          rating: reviews.rating,
          comment: reviews.comment,
          response: reviews.response,
          createdAt: reviews.createdAt,
          updatedAt: reviews.updatedAt,
          patientName: users.name,
          patientPhoto: users.photoUrl,
          doctorName: doctors.name,
        })
        .from(reviews)
        .leftJoin(patientProfiles, eq(reviews.patientId, patientProfiles.id))
        .leftJoin(users, eq(patientProfiles.userId, users.id))
        .leftJoin(doctors, eq(reviews.doctorId, doctors.id))
        .orderBy(desc(reviews.createdAt))
        .limit(50);
    }

    return NextResponse.json({
      reviews: reviewsList,
      count: reviewsList.length,
    });

  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * 
 * Create a review for a completed booking (patient only)
 * Body: { bookingId, rating, comment? }
 */
export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();
    
    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { user } = authContext;

    if (user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Only patients can create reviews' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { bookingId, rating, comment } = body;

    if (!bookingId || !rating) {
      return NextResponse.json(
        { error: 'bookingId and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get patient ID
    const patientId = await getUserPatientId(user.id);
    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      );
    }

    // Verify the booking exists, is completed, and belongs to this patient
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (booking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const bookingData = booking[0];

    if (bookingData.patientId !== patientId) {
      return NextResponse.json(
        { error: 'You can only review your own bookings' },
        { status: 403 }
      );
    }

    if (bookingData.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'You can only review completed bookings' },
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
        { error: 'You have already reviewed this booking' },
        { status: 400 }
      );
    }

    // Create the review
    const newReview = await db
      .insert(reviews)
      .values({
        bookingId,
        doctorId: bookingData.doctorId,
        patientId,
        rating,
        comment: comment || null,
        response: null,
      })
      .returning();

    // Update doctor's average rating and review count
    const doctorReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.doctorId, bookingData.doctorId));

    const totalRating = doctorReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / doctorReviews.length;

    await db
      .update(doctors)
      .set({
        rating: avgRating,
        reviewsCount: doctorReviews.length,
        updatedAt: new Date(),
      })
      .where(eq(doctors.id, bookingData.doctorId));

    return NextResponse.json({
      success: true,
      review: newReview[0],
      message: 'Review submitted successfully',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reviews
 * 
 * Update a review (patient can edit comment/rating, center can add response)
 * Body: { id, rating?, comment?, response? }
 */
export async function PUT(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();
    
    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { user } = authContext;
    const body = await req.json();
    const { id, rating, comment, response } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Get the review
    const existingReview = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    const reviewData = existingReview[0];

    // Patient updating their own review
    if (user.role === 'PATIENT') {
      const patientId = await getUserPatientId(user.id);
      if (reviewData.patientId !== patientId) {
        return NextResponse.json(
          { error: 'You can only update your own reviews' },
          { status: 403 }
        );
      }

      const updates: any = {
        updatedAt: new Date(),
      };

      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return NextResponse.json(
            { error: 'Rating must be between 1 and 5' },
            { status: 400 }
          );
        }
        updates.rating = rating;
      }

      if (comment !== undefined) {
        updates.comment = comment;
      }

      const updatedReview = await db
        .update(reviews)
        .set(updates)
        .where(eq(reviews.id, id))
        .returning();

      // Recalculate doctor rating if rating changed
      if (rating !== undefined) {
        const doctorReviews = await db
          .select()
          .from(reviews)
          .where(eq(reviews.doctorId, reviewData.doctorId));

        const totalRating = doctorReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / doctorReviews.length;

        await db
          .update(doctors)
          .set({
            rating: avgRating,
            updatedAt: new Date(),
          })
          .where(eq(doctors.id, reviewData.doctorId));
      }

      return NextResponse.json({
        success: true,
        review: updatedReview[0],
        message: 'Review updated successfully',
      });
    }

    // Center adding a response
    if (user.role === 'CENTER' && response !== undefined) {
      const centerId = await getUserCenterId(user.id);
      
      // Verify the doctor belongs to this center
      const doctor = await db
        .select()
        .from(doctors)
        .where(eq(doctors.id, reviewData.doctorId))
        .limit(1);

      if (doctor.length === 0 || doctor[0].centerId !== centerId) {
        return NextResponse.json(
          { error: 'You can only respond to reviews for your doctors' },
          { status: 403 }
        );
      }

      const updatedReview = await db
        .update(reviews)
        .set({
          response,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, id))
        .returning();

      return NextResponse.json({
        success: true,
        review: updatedReview[0],
        message: 'Response added successfully',
      });
    }

    // Admin can update anything
    if (user.role === 'ADMIN') {
      const updates: any = {
        updatedAt: new Date(),
      };

      if (rating !== undefined) updates.rating = rating;
      if (comment !== undefined) updates.comment = comment;
      if (response !== undefined) updates.response = response;

      const updatedReview = await db
        .update(reviews)
        .set(updates)
        .where(eq(reviews.id, id))
        .returning();

      return NextResponse.json({
        success: true,
        review: updatedReview[0],
        message: 'Review updated successfully',
      });
    }

    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );

  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews
 * 
 * Delete a review (patient or admin only)
 * Query param: id
 */
export async function DELETE(req: NextRequest) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Get the review
    const existingReview = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    const reviewData = existingReview[0];

    // Patient can delete their own review, admin can delete any
    if (user.role === 'PATIENT') {
      const patientId = await getUserPatientId(user.id);
      if (reviewData.patientId !== patientId) {
        return NextResponse.json(
          { error: 'You can only delete your own reviews' },
          { status: 403 }
        );
      }
    } else if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Delete the review
    await db
      .delete(reviews)
      .where(eq(reviews.id, id));

    // Recalculate doctor rating
    const doctorReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.doctorId, reviewData.doctorId));

    const totalRating = doctorReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = doctorReviews.length > 0 ? totalRating / doctorReviews.length : 0;

    await db
      .update(doctors)
      .set({
        rating: avgRating,
        reviewsCount: doctorReviews.length,
        updatedAt: new Date(),
      })
      .where(eq(doctors.id, reviewData.doctorId));

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });

  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review', details: error.message },
      { status: 500 }
    );
  }
}
