import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, patientProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth-config';

/**
 * Get User Profile
 * GET /api/mobile/v1/profile
 * 
 * Returns the complete profile of the authenticated user.
 */
export async function GET(req: NextRequest) {
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

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found' 
        },
        { status: 404 }
      );
    }

    const userData = user[0];

    // Get patient profile if exists
    const patientProfile = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, session.user.id))
      .limit(1);

    const profile = patientProfile.length > 0 ? patientProfile[0] : null;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          photoUrl: userData.photoUrl,
          role: userData.role,
          subscriptionStatus: userData.subscriptionStatus,
          subscriptionTier: userData.subscriptionTier,
          subscriptionStartDate: userData.subscriptionStartDate,
          subscriptionExpiryDate: userData.subscriptionExpiryDate,
          subscriptionPlatform: userData.subscriptionPlatform,
          createdAt: userData.createdAt,
        },
        profile: profile ? {
          id: profile.id,
          location: profile.location,
          photoUrl: profile.photoUrl,
          emergencyName: profile.emergencyName,
          emergencyRelation: profile.emergencyRelation,
          emergencyPhone: profile.emergencyPhone,
          medicalNotes: profile.medicalNotes,
          insuranceProvider: profile.insuranceProvider,
          insurancePolicy: profile.insurancePolicy,
          preferredLanguage: profile.preferredLanguage,
        } : null
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch profile' 
      },
      { status: 500 }
    );
  }
}

/**
 * Update User Profile
 * PATCH /api/mobile/v1/profile
 * 
 * Updates the user's profile information.
 */
export async function PATCH(req: NextRequest) {
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
    const {
      name,
      phone,
      photoUrl,
      location,
      emergencyName,
      emergencyRelation,
      emergencyPhone,
      medicalNotes,
      insuranceProvider,
      insurancePolicy,
      preferredLanguage,
    } = body;

    // Update user table fields
    const userUpdates: any = {};
    if (name !== undefined) userUpdates.name = name;
    if (phone !== undefined) userUpdates.phone = phone;
    if (photoUrl !== undefined) userUpdates.photoUrl = photoUrl;

    if (Object.keys(userUpdates).length > 0) {
      userUpdates.updatedAt = new Date();
      await db
        .update(users)
        .set(userUpdates)
        .where(eq(users.id, session.user.id));
    }

    // Get or create patient profile
    let patientProfile = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, session.user.id))
      .limit(1);

    if (patientProfile.length === 0) {
      // Create new patient profile
      patientProfile = await db
        .insert(patientProfiles)
        .values({
          userId: session.user.id,
          preferredLanguage: preferredLanguage || 'English',
        })
        .returning();
    }

    // Update patient profile fields
    const profileUpdates: any = {};
    if (location !== undefined) profileUpdates.location = location;
    if (photoUrl !== undefined) profileUpdates.photoUrl = photoUrl;
    if (emergencyName !== undefined) profileUpdates.emergencyName = emergencyName;
    if (emergencyRelation !== undefined) profileUpdates.emergencyRelation = emergencyRelation;
    if (emergencyPhone !== undefined) profileUpdates.emergencyPhone = emergencyPhone;
    if (medicalNotes !== undefined) profileUpdates.medicalNotes = medicalNotes;
    if (insuranceProvider !== undefined) profileUpdates.insuranceProvider = insuranceProvider;
    if (insurancePolicy !== undefined) profileUpdates.insurancePolicy = insurancePolicy;
    if (preferredLanguage !== undefined) profileUpdates.preferredLanguage = preferredLanguage;

    if (Object.keys(profileUpdates).length > 0) {
      profileUpdates.updatedAt = new Date();
      await db
        .update(patientProfiles)
        .set(profileUpdates)
        .where(eq(patientProfiles.id, patientProfile[0].id));
    }

    // Get updated profile
    const updatedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const updatedProfile = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, session.user.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: updatedUser[0].id,
          email: updatedUser[0].email,
          name: updatedUser[0].name,
          phone: updatedUser[0].phone,
          photoUrl: updatedUser[0].photoUrl,
          role: updatedUser[0].role,
        },
        profile: updatedProfile.length > 0 ? {
          id: updatedProfile[0].id,
          location: updatedProfile[0].location,
          photoUrl: updatedProfile[0].photoUrl,
          emergencyName: updatedProfile[0].emergencyName,
          emergencyRelation: updatedProfile[0].emergencyRelation,
          emergencyPhone: updatedProfile[0].emergencyPhone,
          medicalNotes: updatedProfile[0].medicalNotes,
          insuranceProvider: updatedProfile[0].insuranceProvider,
          insurancePolicy: updatedProfile[0].insurancePolicy,
          preferredLanguage: updatedProfile[0].preferredLanguage,
        } : null
      },
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update profile' 
      },
      { status: 500 }
    );
  }
}
