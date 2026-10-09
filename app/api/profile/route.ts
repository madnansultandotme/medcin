import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, patientProfiles, centers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/middleware/permissions';
import { getAuthDb } from '@/db/auth-db';
import { unstable_cache } from 'next/cache';

/**
 * Profile API
 * 
 * Handles profile updates for all user roles.
 * Users can update their own profile information.
 * Implements caching to reduce database queries.
 */

// Cache profile data for 5 minutes
const getCachedProfile = unstable_cache(
  async (userId: string, role: string) => {
    let profileData = null;

    // Get role-specific profile data
    if (role === 'PATIENT') {
      const profile = await db
        .select()
        .from(patientProfiles)
        .where(eq(patientProfiles.userId, userId))
        .limit(1);

      profileData = profile.length > 0 ? profile[0] : null;
    } else if (role === 'CENTER') {
      const center = await db
        .select()
        .from(centers)
        .where(eq(centers.userId, userId))
        .limit(1);

      profileData = center.length > 0 ? center[0] : null;
    }

    return profileData;
  },
  ['user-profile'],
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ['profile'],
  }
);

// GET /api/profile - Get current user's profile
export async function GET(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = authContext;

    // Get cached profile data
    const profileData = await getCachedProfile(user.id, user.role);

    return NextResponse.json({
      user: user,
      profile: profileData,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

// POST /api/profile - Update current user's profile
export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = authContext;
    const body = await req.json();
    const { name, phone, photoUrl, profileData } = body;

    // Update user table
    const updates: any = {
      updatedAt: new Date(),
    };

    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (photoUrl !== undefined) updates.photoUrl = photoUrl;

    await db
      .update(users)
      .set(updates)
      .where(eq(users.id, user.id));

    // Update role-specific profile
    if (profileData && user.role === 'PATIENT') {
      // Check if patient profile exists
      const existingProfile = await db
        .select()
        .from(patientProfiles)
        .where(eq(patientProfiles.userId, user.id))
        .limit(1);

      if (existingProfile.length > 0) {
        // Update existing profile
        await db
          .update(patientProfiles)
          .set({
            ...profileData,
            updatedAt: new Date(),
          })
          .where(eq(patientProfiles.userId, user.id));
      } else {
        // Create new profile
        await db
          .insert(patientProfiles)
          .values({
            userId: user.id,
            ...profileData,
          });
      }
    } else if (profileData && user.role === 'CENTER') {
      // Update center data
      await db
        .update(centers)
        .set({
          ...profileData,
          updatedAt: new Date(),
        })
        .where(eq(centers.userId, user.id));
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      success: true,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
