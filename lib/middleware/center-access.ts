/**
 * Center Access Middleware
 * 
 * Database-level validation for center access based on approval status.
 * Ensures proper validation at the API level, not just client-side.
 */

import { db } from '@/db';
import { centers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type CenterStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface CenterAccessCheck {
  hasAccess: boolean;
  status: CenterStatus;
  reason?: string;
  center?: any;
}

/**
 * Check if a center has access to dashboard features
 * Only APPROVED centers can access the dashboard
 */
export async function checkCenterAccess(userId: string): Promise<CenterAccessCheck> {
  try {
    // Fetch center from database
    const userCenters = await db
      .select()
      .from(centers)
      .where(eq(centers.userId, userId))
      .limit(1);

    if (userCenters.length === 0) {
      return {
        hasAccess: false,
        status: 'PENDING',
        reason: 'No center found for this user',
      };
    }

    const center = userCenters[0];
    const status = center.status as CenterStatus;

    // Check registration completion
    if (!center.completedRegistration) {
      return {
        hasAccess: false,
        status,
        reason: 'Registration not completed',
        center,
      };
    }

    // Check approval status - only APPROVED centers have access
    if (status !== 'APPROVED') {
      return {
        hasAccess: false,
        status,
        reason: getStatusReason(status),
        center,
      };
    }

    // All checks passed
    return {
      hasAccess: true,
      status,
      center,
    };
  } catch (error) {
    console.error('Center access check error:', error);
    return {
      hasAccess: false,
      status: 'PENDING',
      reason: 'Error checking center access',
    };
  }
}

/**
 * Get human-readable reason for status
 */
function getStatusReason(status: CenterStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Center registration is pending review';
    case 'UNDER_REVIEW':
      return 'Center application is currently under review by admin';
    case 'REJECTED':
      return 'Center application has been rejected';
    case 'SUSPENDED':
      return 'Center account has been suspended';
    case 'APPROVED':
      return 'Center is approved';
    default:
      return 'Unknown status';
  }
}

/**
 * Require center to be approved
 * Returns center data if approved, null otherwise
 */
export async function requireApprovedCenter(userId: string) {
  const accessCheck = await checkCenterAccess(userId);
  
  if (!accessCheck.hasAccess) {
    return null;
  }
  
  return accessCheck.center;
}

/**
 * Get center status and redirect path
 * Returns the appropriate path based on center status
 */
export function getCenterRedirectPath(
  completedRegistration: boolean,
  status: CenterStatus
): string | null {
  // Check registration completion first
  if (!completedRegistration) {
    return '/center/complete-registration';
  }

  // Check approval status
  switch (status) {
    case 'PENDING':
    case 'UNDER_REVIEW':
      return '/center/under-review';
    case 'REJECTED':
      return '/center/rejected';
    case 'SUSPENDED':
      return '/center/suspended';
    case 'APPROVED':
      return null; // No redirect, has access
    default:
      return '/center/under-review';
  }
}
