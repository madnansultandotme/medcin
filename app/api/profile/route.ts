import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, patientProfiles, centers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/get-session';

/**
 * Profile API
 * 
 * Handles profile updates for all user roles.
 * Users can update their own profile information.
 */

// GET /api/profile - Get current user's profile
export async function GET(req: NextRequest) {
  try {
    const { user } = await getSession();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.authUid, user.id))
      .limit(1);

    if (!dbUser.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = dbUser[0];
    let profileData = null;

    // Get role-specific profile data
    if (userData.role === 'PATIENT') {
      const profile = await db
        .select()
        .from(patientProfiles)
        .where(eq(patientProfiles.userId, userData.id))
        .limit(1);

      profileData = profile.length > 0 ? profile[0] : null;
    } else if (userData.role === 'CENTER') {
      const center = await db
        .select()
        .from(centers)
        .where(eq(centers.userId, userData.id))
        .limit(1);

      profileData = center.length > 0 ? center[0] : null;
    }

    return NextResponse.json({
      user: userData,
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
    const { user } = await getSession();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, photoUrl, role, profileData } = body;

    // Get user
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.authUid, user.id))
      .limit(1);

    if (!dbUser.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = dbUser[0].id;
    const userRole = dbUser[0].role;

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
      .where(eq(users.id, userId));

    // Update role-specific profile
    if (profileData && userRole === 'PATIENT') {
      // Check if patient profile exists
      const existingProfile = await db
        .select()
        .from(patientProfiles)
        .where(eq(patientProfiles.userId, userId))
        .limit(1);

      if (existingProfile.length > 0) {
        // Update existing profile
        await db
          .update(patientProfiles)
          .set({
            ...profileData,
            updatedAt: new Date(),
          })
          .where(eq(patientProfiles.userId, userId));
      } else {
        // Create new profile
        await db
          .insert(patientProfiles)
          .values({
            userId,
            ...profileData,
          });
      }
    } else if (profileData && userRole === 'CENTER') {
      // Update center data
      await db
        .update(centers)
        .set({
          ...profileData,
          updatedAt: new Date(),
        })
        .where(eq(centers.userId, userId));
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
