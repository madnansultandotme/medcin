import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth-config';

/**
 * Get Subscription Status
 * GET /api/mobile/v1/subscription
 * 
 * Returns the subscription status for the authenticated user.
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

    // Get user subscription info
    const user = await db
      .select({
        subscriptionStatus: users.subscriptionStatus,
        subscriptionTier: users.subscriptionTier,
        subscriptionStartDate: users.subscriptionStartDate,
        subscriptionExpiryDate: users.subscriptionExpiryDate,
        subscriptionPlatform: users.subscriptionPlatform,
      })
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

    const subscription = user[0];
    const now = new Date();
    const isExpired = subscription.subscriptionExpiryDate && new Date(subscription.subscriptionExpiryDate) < now;

    return NextResponse.json({
      success: true,
      data: {
        status: isExpired ? 'EXPIRED' : subscription.subscriptionStatus,
        tier: subscription.subscriptionTier,
        startDate: subscription.subscriptionStartDate,
        expiryDate: subscription.subscriptionExpiryDate,
        platform: subscription.subscriptionPlatform,
        isActive: subscription.subscriptionStatus === 'ACTIVE' && !isExpired,
        daysRemaining: subscription.subscriptionExpiryDate 
          ? Math.max(0, Math.ceil((new Date(subscription.subscriptionExpiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : null,
      }
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch subscription' 
      },
      { status: 500 }
    );
  }
}

/**
 * Activate Subscription
 * POST /api/mobile/v1/subscription
 * 
 * Activates or updates a subscription after in-app purchase.
 * This should be called after verifying the purchase receipt with the app store.
 */
export async function POST(req: NextRequest) {
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
    const { tier, platform, purchaseToken, duration } = body;

    // Validate required fields
    if (!tier || !platform || !purchaseToken || !duration) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: tier, platform, purchaseToken, duration' 
        },
        { status: 400 }
      );
    }

    // Validate tier
    if (!['BASIC', 'PREMIUM'].includes(tier)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid tier. Must be BASIC or PREMIUM' 
        },
        { status: 400 }
      );
    }

    // Validate platform
    if (!['GOOGLE_PLAY', 'APP_STORE'].includes(platform)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid platform. Must be GOOGLE_PLAY or APP_STORE' 
        },
        { status: 400 }
      );
    }

    // TODO: Verify purchase receipt with Google Play or Apple App Store
    // For now, we'll trust the client (implement proper verification in production!)

    // Calculate expiry date based on duration (in months)
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setMonth(expiryDate.getMonth() + duration);

    // Update user subscription
    await db
      .update(users)
      .set({
        subscriptionStatus: 'ACTIVE',
        subscriptionTier: tier,
        subscriptionStartDate: startDate,
        subscriptionExpiryDate: expiryDate,
        subscriptionPlatform: platform,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      data: {
        status: 'ACTIVE',
        tier,
        startDate,
        expiryDate,
        platform,
      },
      message: 'Subscription activated successfully'
    });

  } catch (error) {
    console.error('Activate subscription error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to activate subscription' 
      },
      { status: 500 }
    );
  }
}

/**
 * Cancel Subscription
 * DELETE /api/mobile/v1/subscription
 * 
 * Cancels an active subscription (will remain active until expiry).
 */
export async function DELETE(req: NextRequest) {
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

    // Update subscription status to CANCELLED
    await db
      .update(users)
      .set({
        subscriptionStatus: 'CANCELLED',
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled. Access will remain active until expiry date.'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to cancel subscription' 
      },
      { status: 500 }
    );
  }
}
