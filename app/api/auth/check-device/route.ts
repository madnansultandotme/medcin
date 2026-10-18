/**
 * Check Device Trust Status
 * 
 * POST /api/auth/check-device
 * 
 * Checks if the current device is trusted and handles new device verification flow.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware/permissions';
import { trackDeviceLogin } from '@/lib/auth/track-device';

export async function POST(req: NextRequest) {
  try {
    // 1. Get authenticated user
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const { user } = authContext;

    // 2. Get device info from headers
    const deviceId = req.headers.get('x-device-id');
    const deviceName = req.headers.get('x-device-name') || 'Unknown Device';

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required in X-Device-ID header' },
        { status: 400 }
      );
    }

    // 3. Track device and check if verification is required
    const result = await trackDeviceLogin(user.id, deviceId, deviceName);

    return NextResponse.json({
      requiresVerification: result.requiresVerification,
      isNewDevice: result.isNewDevice,
      deviceId: result.deviceId,
    });

  } catch (error) {
    console.error('Check device error:', error);
    return NextResponse.json(
      { error: 'Failed to check device status' },
      { status: 500 }
    );
  }
}
