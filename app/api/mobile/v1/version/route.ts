import { NextRequest, NextResponse } from 'next/server';

/**
 * Version Check Endpoint
 * GET /api/mobile/v1/version
 * 
 * Returns current API version and minimum supported mobile app versions.
 * Used by mobile apps to check if they need to be updated.
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      apiVersion: 'v1',
      minimumAppVersion: {
        ios: '1.0.0',
        android: '1.0.0',
      },
      latestAppVersion: {
        ios: '1.0.0',
        android: '1.0.0',
      },
      forceUpdate: false, // Set to true to force users to update
      maintenanceMode: false, // Set to true to show maintenance screen
      features: {
        subscriptions: true,
        bookings: true,
        reviews: true,
        notifications: true,
        search: true,
      }
    }
  });
}
