import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';

import { db } from '@/db';
import { centers, users } from '@/db/schema';
import { eq, and, ilike } from 'drizzle-orm';
import { getAuthenticatedUser, getUserCenterId } from '@/lib/middleware/permissions';

/**
 * Get Centers
 * 
 * Returns list of medical centers.
 * Public endpoint (no auth required for browsing).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    // Build query conditions
    const conditions = [];
    
    if (search) {
      conditions.push(ilike(centers.name, `%${search}%`));
    }
    
    if (category) {
      conditions.push(eq(centers.category, category));
    }
    
    if (status) {
      conditions.push(eq(centers.status, status as any));
    }

    // Query centers (public access)
    const centersList = await db
      .select()
      .from(centers)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(100);

    return NextResponse.json({
      centers: centersList,
      count: centersList.length,
    });
  } catch (error) {
    console.error('Centers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch centers' },
      { status: 500 }
    );
  }
}

/**
 * Create Center
 * 
 * Registers a new medical center (authenticated users only).
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

    const { user, session } = authContext;

    const body = await req.json();
    const {
      name,
      category,
      address,
      email,
      phone,
      licenseNumber,
      logoUrl,
      coverImageUrl,
      operatingHours,
      amenities,
      completedRegistration,
    } = body;

    // Validate required fields
    if (!name || !category || !address || !email || !phone || !licenseNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already has a center
    const existingCenter = await db
      .select()
      .from(centers)
      .where(eq(centers.userId, user.id))
      .limit(1);

    if (existingCenter.length > 0) {
      return NextResponse.json(
        { error: 'User already has a registered center' },
        { status: 400 }
      );
    }

    // Get authenticated database instance
    

    // Create center
    const newCenter = await db
      .insert(centers)
      .values({
        userId: user.id,
        name,
        category,
        address,
        email,
        phone,
        licenseNumber,
        status: 'PENDING', // Always start as PENDING (only admin can change)
        logoUrl,
        coverImageUrl,
        operatingHours,
        amenities,
        completedRegistration: completedRegistration ?? false,
      })
      .returning();

    return NextResponse.json(
      { 
        center: newCenter[0], 
        message: 'Center registered successfully. Pending admin approval.' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Center creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create center' },
      { status: 500 }
    );
  }
}

/**
 * Update Center
 * 
 * Updates center information (center owners can only update their own center).
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
        { error: 'Center ID is required' },
        { status: 400 }
      );
    }

    // Check permissions
    let authorized = false;

    if (user.role === 'ADMIN') {
      authorized = true;
    } else if (user.role === 'CENTER') {
      const userCenterId = await getUserCenterId(user.id);
      authorized = userCenterId === id;
      
      // Centers cannot change their own status - only admin can
      if (authorized && updates.status) {
        return NextResponse.json(
          { error: 'Forbidden: Centers cannot change their approval status' },
          { status: 403 }
        );
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own center' },
        { status: 403 }
      );
    }

    // Get authenticated database instance
    

    // Update center
    const updated = await db
      .update(centers)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(centers.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Center not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ center: updated[0] });
  } catch (error) {
    console.error('Center update error:', error);
    return NextResponse.json(
      { error: 'Failed to update center' },
      { status: 500 }
    );
  }
}
