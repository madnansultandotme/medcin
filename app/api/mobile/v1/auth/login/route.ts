import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth-config';
import { trackDeviceLogin } from '@/lib/auth/track-device';

/**
 * Mobile App Login
 * POST /api/mobile/v1/auth/login
 * 
 * Authenticates a user and returns session token for mobile app.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email and password are required' 
        },
        { status: 400 }
      );
    }

    // Authenticate using Better Auth
    const session = await auth.api.signInEmail({
      body: { email, password }
    });

    if (!session) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid credentials' 
        },
        { status: 401 }
      );
    }

    // Get user details
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
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

    // Device tracking integration: check if device verification is required
    // Clients must send X-Device-ID header for device tracking to work
    const deviceId = req.headers.get('x-device-id');
    const deviceName = req.headers.get('x-device-name') || 'Mobile Device';
    
    let deviceVerificationRequired = false;
    
    if (deviceId) {
      try {
        // Track device login and check if new device verification is needed
        const deviceResult = await trackDeviceLogin(userData.id, deviceId, deviceName);
        deviceVerificationRequired = deviceResult.requiresVerification;
      } catch (error) {
        // Log error but don't block login if device tracking fails
        console.error('Device tracking failed during login:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        token: session.token,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          photoUrl: userData.photoUrl,
          role: userData.role,
          subscriptionStatus: userData.subscriptionStatus,
          subscriptionTier: userData.subscriptionTier,
          subscriptionExpiryDate: userData.subscriptionExpiryDate,
        },
        // If true, mobile app should show OTP verification screen
        requiresDeviceVerification: deviceVerificationRequired,
      }
    });

  } catch (error) {
    console.error('Mobile login error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Authentication failed' 
      },
      { status: 500 }
    );
  }
}
