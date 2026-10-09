import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware/permissions';

import { db } from '@/db';
import { patientProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get Patient Profile
 * 
 * Returns the patient profile for the authenticated user.
 */
export async function GET() {
  try {
    const authContext = await getAuthenticatedUser();

    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { user } = authContext;

    // Get patient profile
    const profile = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, user.id))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile: profile[0] });
  } catch (error) {
    console.error('Patient profile fetch error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

/**
 * Create Patient Profile
 * 
 * Creates a patient profile for the authenticated user.
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
      location,
      photoUrl,
      emergencyName,
      emergencyRelation,
      emergencyPhone,
      medicalNotes,
      insuranceProvider,
      insurancePolicy,
      preferredLanguage,
    } = body;

    // Check if profile already exists
    const existing = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, user.id))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Patient profile already exists' },
        { status: 400 }
      );
    }

    // Get authenticated database instance
    

    // Create profile
    const newProfile = await db
      .insert(patientProfiles)
      .values({
        userId: user.id,
        location,
        photoUrl,
        emergencyName,
        emergencyRelation,
        emergencyPhone,
        medicalNotes,
        insuranceProvider,
        insurancePolicy,
        preferredLanguage: preferredLanguage || 'English',
      })
      .returning();

    return NextResponse.json(
      { profile: newProfile[0], message: 'Profile created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Patient profile creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}

/**
 * Update Patient Profile
 * 
 * Updates the patient profile for the authenticated user.
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
        { error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated database instance
    

    // Update profile - RLS ensures user can only update their own
    const updated = await db
      .update(patientProfiles)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(patientProfiles.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Profile not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile: updated[0] });
  } catch (error) {
    console.error('Patient profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
