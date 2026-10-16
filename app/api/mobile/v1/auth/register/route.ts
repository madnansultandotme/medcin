import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, patientProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth-config';

/**
 * Mobile App Registration
 * POST /api/mobile/v1/auth/register
 * 
 * Registers a new user for the mobile app (patients only).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, phone } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email, password, and name are required' 
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email already registered' 
        },
        { status: 409 }
      );
    }

    // Create user using Better Auth
    const session = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      }
    });

    if (!session) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Registration failed' 
        },
        { status: 500 }
      );
    }

    // Get the created user
    const newUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (newUser.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User creation failed' 
        },
        { status: 500 }
      );
    }

    const userData = newUser[0];

    // Update phone if provided
    if (phone) {
      await db
        .update(users)
        .set({ phone })
        .where(eq(users.id, userData.id));
    }

    // Create patient profile
    await db
      .insert(patientProfiles)
      .values({
        userId: userData.id,
        preferredLanguage: 'English',
      });

    return NextResponse.json({
      success: true,
      data: {
        token: session.token,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: phone || null,
          photoUrl: userData.photoUrl,
          role: userData.role,
          subscriptionStatus: userData.subscriptionStatus,
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Mobile registration error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Registration failed' 
      },
      { status: 500 }
    );
  }
}
