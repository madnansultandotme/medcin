import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getUserCenterId } from '@/lib/middleware/permissions';

import { db } from '@/db';
import { services, doctors } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

/**
 * Get Services
 * 
 * Returns services:
 * - If doctorId provided: returns services for that doctor
 * - If authenticated center owner and no doctorId: returns all services for their center's doctors
 * - Otherwise: error
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');

    // Check if user is authenticated
    const authContext = await getAuthenticatedUser();

    let servicesList = [];

    if (doctorId) {
      // Query services for specific doctor
      servicesList = await db
        .select()
        .from(services)
        .where(eq(services.doctorId, doctorId))
        .limit(100);
    } else if (authContext?.user.role === 'CENTER') {
      // For center owners, get all services for their doctors
      const userCenterId = await getUserCenterId(authContext.user.id);
      
      if (!userCenterId) {
        return NextResponse.json(
          { error: 'Center not found for this user' },
          { status: 404 }
        );
      }

      // First get all doctors for this center
      const centerDoctors = await db
        .select({ id: doctors.id })
        .from(doctors)
        .where(eq(doctors.centerId, userCenterId));

      const doctorIds = centerDoctors.map(d => d.id);

      if (doctorIds.length === 0) {
        return NextResponse.json({
          services: [],
          count: 0,
        });
      }

      // Get all services for these doctors
      servicesList = await db
        .select()
        .from(services)
        .where(inArray(services.doctorId, doctorIds))
        .limit(100);
    } else {
      return NextResponse.json(
        { error: 'Doctor ID is required or you must be an authenticated center owner' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      services: servicesList,
      count: servicesList.length,
    });
  } catch (error) {
    console.error('Services fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

/**
 * Create Service
 * 
 * Creates a new service offering (center/doctor management only).
 * Requires authentication.
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

    const { session } = authContext;

    const body = await req.json();
    const { doctorId, name, duration, price, description } = body;

    // Validate required fields
    if (!doctorId || !name || !duration || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: doctorId, name, duration, price' },
        { status: 400 }
      );
    }

    // Get authenticated database instance
    

    // Create service
    const newService = await db
      .insert(services)
      .values({
        doctorId,
        name,
        duration,
        price,
        description,
      })
      .returning();

    return NextResponse.json(
      { service: newService[0], message: 'Service created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Service creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}

/**
 * Update Service
 * 
 * Updates service information (center owners only).
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

    const { session } = authContext;

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated database instance
    

    // Update service
    const updated = await db
      .update(services)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(services.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Service not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ service: updated[0] });
  } catch (error) {
    console.error('Service update error:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

/**
 * Delete Service
 * 
 * Removes a service (center owners only).
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

    const { session } = authContext;

    // Get ID from request body
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Delete service
    const deleted = await db
      .delete(services)
      .where(eq(services.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Service not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Service deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
