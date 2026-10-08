import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { getAuthDb } from '@/db/auth-db';
import { db } from '@/db';
import { services } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get Services
 * 
 * Returns services offered by a doctor.
 * Public endpoint for browsing services.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    // Query services
    const servicesList = await db
      .select()
      .from(services)
      .where(eq(services.doctorId, doctorId))
      .limit(100);

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
    const { session } = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
    const authDb = getAuthDb(session.token);

    // Create service
    const newService = await authDb
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
    const { session } = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated database instance
    const authDb = getAuthDb(session.token);

    // Update service
    const updated = await authDb
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
    const { session } = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated database instance
    const authDb = getAuthDb(session.token);

    // Delete service
    const deleted = await authDb
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
