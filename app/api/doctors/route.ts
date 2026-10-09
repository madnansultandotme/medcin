import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';

import { db } from '@/db';
import { doctors, centers } from '@/db/schema';
import { eq, and, ilike } from 'drizzle-orm';
import { getAuthenticatedUser, requireCenter, getUserCenterId } from '@/lib/middleware/permissions';

/**
 * Get Doctors
 * 
 * Returns list of doctors.
 * - For admin with centerId param: returns all doctors for that center
 * - For authenticated center owners without centerId: returns ALL their doctors (including inactive)
 * - For public/other users: returns only active doctors, optionally filtered by centerId
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const centerId = searchParams.get('centerId');

    // Check if user is authenticated
    const authContext = await getAuthenticatedUser();

    // Build query conditions
    const conditions = [];
    
    if (search) {
      conditions.push(ilike(doctors.name, `%${search}%`));
    }
    
    if (category) {
      conditions.push(eq(doctors.category, category));
    }

    // Handle centerId filtering and active status
    if (centerId) {
      // If centerId is explicitly provided, use it (for admin viewing specific center)
      conditions.push(eq(doctors.centerId, centerId));
      // If user is admin, show all doctors; otherwise only active
      if (!authContext || authContext.user.role !== 'ADMIN') {
        conditions.push(eq(doctors.active, true));
      }
    } else if (authContext?.user.role === 'CENTER') {
      // For center owners without centerId param, show all their doctors
      const userCenterId = await getUserCenterId(authContext.user.id);
      if (userCenterId) {
        conditions.push(eq(doctors.centerId, userCenterId));
      }
    } else {
      // For public browsing without centerId, show only active
      conditions.push(eq(doctors.active, true));
    }

    // Query doctors
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
 * Auto-detects center from authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const result = await requireCenter();
    
    if ('error' in result) {
      return result.error;
    }

    const { context } = result;
    const { user, session } = context;

    // Get the user's center ID
    const userCenterId = await getUserCenterId(user.id);
    
    if (!userCenterId) {
      return NextResponse.json(
        { error: 'Center not found for this user' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      name,
      role,
      category,
      price,
      licenseNumber,
      bio,
      imageUrl,
      active = true,
    } = body;

    // Validate required fields
    if (!name || !role || !category || price === undefined || !licenseNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: name, role, category, price, licenseNumber' },
        { status: 400 }
      );
    }

    // Create doctor with auto-detected centerId
    const newDoctor = await db
      .insert(doctors)
      .values({
        centerId: userCenterId,
        name,
        role,
        category,
        price,
        licenseNumber,
        bio: bio || null,
        imageUrl: imageUrl || null,
        active,
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
    

    // Update doctor
    const updated = await db
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
    
    // Get ID from request body
    const body = await req.json();
    const { id } = body;

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

    // Soft delete - set active to false
    const updated = await db
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
