import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { getAuthDb } from '@/db/auth-db';
import { db } from '@/db';
import { doctors, centers } from '@/db/schema';
import { eq, and, ilike } from 'drizzle-orm';
import { getAuthenticatedUser, requireCenter, getUserCenterId } from '@/lib/middleware/permissions';

/**
 * Get Doctors
 * 
 * Returns list of doctors, optionally filtered by search/category.
 * Public endpoint (no auth required for browsing).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const centerId = searchParams.get('centerId');

    // Build query conditions
    const conditions = [];
    
    if (search) {
      conditions.push(ilike(doctors.name, `%${search}%`));
    }
    
    if (category) {
      conditions.push(eq(doctors.category, category));
    }
    
    if (centerId) {
      conditions.push(eq(doctors.centerId, centerId));
    }

    // Only show active doctors
    conditions.push(eq(doctors.active, true));

    // Query doctors (public access, no auth needed)
    const doctorsList = await db
      .select()
      .from(doctors)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(100);

    return NextResponse.json({
      doctors: doctorsList,
      count: doctorsList.length,
    });
  } catch (error) {
    console.error('Doctors fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

/**
 * Create Doctor
 * 
 * Creates a new doctor profile (center owners only).
 * Centers can only create doctors for their own center.
 */
export async function POST(req: NextRequest) {
  try {
    const result = await requireCenter();
    
    if ('error' in result) {
      return result.error;
    }

    const { context } = result;
    const { user, session } = context;

    const body = await req.json();
    const {
      centerId,
      name,
      role,
      category,
      price,
      licenseNumber,
      bio,
      imageUrl,
    } = body;

    // Validate required fields
    if (!centerId || !name || !role || !category || !price || !licenseNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the center belongs to this user
    const userCenterId = await getUserCenterId(user.id);
    
    if (!userCenterId) {
      return NextResponse.json(
        { error: 'Center not found for this user' },
        { status: 404 }
      );
    }

    if (userCenterId !== centerId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only create doctors for your own center' },
        { status: 403 }
      );
    }

    // Get authenticated database instance
    const authDb = getAuthDb(session.token);

    // Create doctor
    const newDoctor = await authDb
      .insert(doctors)
      .values({
        centerId,
        name,
        role,
        category,
        price,
        licenseNumber,
        bio,
        imageUrl,
        active: true,
      })
      .returning();

    return NextResponse.json(
      { doctor: newDoctor[0], message: 'Doctor created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Doctor creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create doctor' },
      { status: 500 }
    );
  }
}

/**
 * Update Doctor
 * 
 * Updates doctor information (center owners can only update their own doctors).
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

    const { user, session } = authContext;
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    // Get the doctor to check ownership
    const existingDoctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, id))
      .limit(1);

    if (existingDoctor.length === 0) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Check permissions
    let authorized = false;

    if (user.role === 'ADMIN') {
      authorized = true;
    } else if (user.role === 'CENTER') {
      const userCenterId = await getUserCenterId(user.id);
      authorized = userCenterId === existingDoctor[0].centerId;
    }

    if (!authorized) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update doctors in your own center' },
        { status: 403 }
      );
    }

    // Get authenticated database instance
    const authDb = getAuthDb(session.token);

    // Update doctor
    const updated = await authDb
      .update(doctors)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(doctors.id, id))
      .returning();

    return NextResponse.json({ 
      doctor: updated[0],
      message: 'Doctor updated successfully'
    });
  } catch (error) {
    console.error('Doctor update error:', error);
    return NextResponse.json(
      { error: 'Failed to update doctor' },
      { status: 500 }
    );
  }
}

/**
 * Delete Doctor (Soft Delete)
 * 
 * Deactivates a doctor (center owners can only delete their own doctors).
 * Admin can delete any doctor.
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

    const { user, session } = authContext;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    // Get the doctor to check ownership
    const existingDoctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, id))
      .limit(1);

    if (existingDoctor.length === 0) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Check permissions
    let authorized = false;

    if (user.role === 'ADMIN') {
      authorized = true;
    } else if (user.role === 'CENTER') {
      const userCenterId = await getUserCenterId(user.id);
      authorized = userCenterId === existingDoctor[0].centerId;
    }

    if (!authorized) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete doctors in your own center' },
        { status: 403 }
      );
    }

    // Get authenticated database instance
    const authDb = getAuthDb(session.token);

    // Soft delete - set active to false
    const updated = await authDb
      .update(doctors)
      .set({
        active: false,
        updatedAt: new Date(),
      })
      .where(eq(doctors.id, id))
      .returning();

    return NextResponse.json({ 
      message: 'Doctor deactivated successfully',
      doctor: updated[0]
    });
  } catch (error) {
    console.error('Doctor delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete doctor' },
      { status: 500 }
    );
  }
}
