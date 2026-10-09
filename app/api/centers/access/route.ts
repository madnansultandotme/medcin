import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware/permissions';
import { checkCenterAccess, getCenterRedirectPath } from '@/lib/middleware/center-access';

/**
 * Check Center Access API
 * 
 * Database-level validation for center access.
 * Returns access status and redirect path if needed.
 */
export async function GET(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();

    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { user } = authContext;

    // Only check for CENTER role users
    if (user.role !== 'CENTER') {
      return NextResponse.json(
        { 
          hasAccess: false,
          reason: 'User is not a center',
        },
        { status: 403 }
      );
    }

    // Check center access from database
    const accessCheck = await checkCenterAccess(user.id);

    // Get redirect path if needed
    let redirectPath = null;
    if (!accessCheck.hasAccess && accessCheck.center) {
      redirectPath = getCenterRedirectPath(
        accessCheck.center.completedRegistration,
        accessCheck.status
      );
    }

    return NextResponse.json({
      hasAccess: accessCheck.hasAccess,
      status: accessCheck.status,
      reason: accessCheck.reason,
      redirectPath,
      center: accessCheck.center ? {
        id: accessCheck.center.id,
        name: accessCheck.center.name,
        status: accessCheck.center.status,
        completedRegistration: accessCheck.center.completedRegistration,
      } : null,
    });
  } catch (error) {
    console.error('Center access check error:', error);
    return NextResponse.json(
      { error: 'Failed to check center access' },
      { status: 500 }
    );
  }
}
