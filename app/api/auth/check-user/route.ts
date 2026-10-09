import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, centers } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Check User Existence API
 * 
 * Checks if a user with a specific email exists and returns their status
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({
        exists: false,
        user: null,
        center: null,
      });
    }

    const user = existingUser[0];

    // If user is a center, check their center status
    let centerData = null;
    if (user.role === 'CENTER') {
      const userCenter = await db
        .select()
        .from(centers)
        .where(eq(centers.userId, user.id))
        .limit(1);
      
      if (userCenter.length > 0) {
        centerData = userCenter[0];
      }
    }

    return NextResponse.json({
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      center: centerData ? {
        id: centerData.id,
        name: centerData.name,
        completedRegistration: centerData.completedRegistration,
        status: centerData.status,
      } : null,
    });
  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json(
      { error: 'Failed to check user' },
      { status: 500 }
    );
  }
}
