/**
 * Role-Based Permission Middleware
 * 
 * Provides utilities for checking user roles and enforcing access control.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type UserRole = 'ADMIN' | 'CENTER' | 'PATIENT';

export interface AuthenticatedUser {
  id: string;
  authUid: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
}

export interface AuthContext {
  user: AuthenticatedUser;
  session: any;
}

/**
 * Get authenticated user with full database record
 */
export async function getAuthenticatedUser(): Promise<AuthContext | null> {
  try {
    const { user: authUser, session } = await getSession();

    if (!authUser || !session) {
      return null;
    }

    // Get full user record from database
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.authUid, authUser.id))
      .limit(1);

    if (userRecord.length === 0) {
      return null;
    }

    return {
      user: userRecord[0] as AuthenticatedUser,
      session,
    };
  } catch (error) {
    console.error('Get authenticated user error:', error);
    return null;
  }
}

/**
 * Require specific role(s)
 */
export async function requireRole(
  ...allowedRoles: UserRole[]
): Promise<{ context: AuthContext } | { error: NextResponse }> {
  const authContext = await getAuthenticatedUser();

  if (!authContext) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      ),
    };
  }

  if (!allowedRoles.includes(authContext.user.role)) {
    return {
      error: NextResponse.json(
        {
          error: `Forbidden: Required role(s): ${allowedRoles.join(', ')}`,
          userRole: authContext.user.role,
        },
        { status: 403 }
      ),
    };
  }

  return { context: authContext };
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<
  { context: AuthContext } | { error: NextResponse }
> {
  return requireRole('ADMIN');
}

/**
 * Require center role
 */
export async function requireCenter(): Promise<
  { context: AuthContext } | { error: NextResponse }
> {
  return requireRole('CENTER');
}

/**
 * Require patient role
 */
export async function requirePatient(): Promise<
  { context: AuthContext } | { error: NextResponse }
> {
  return requireRole('PATIENT');
}

/**
 * Check if user owns a specific resource
 */
export function isResourceOwner(
  userId: string,
  resourceUserId: string
): boolean {
  return userId === resourceUserId;
}

/**
 * Check if user can access resource
 * - Admins can access all resources
 * - Owners can access their own resources
 */
export function canAccessResource(
  userRole: UserRole,
  userId: string,
  resourceUserId: string
): boolean {
  if (userRole === 'ADMIN') {
    return true;
  }
  return isResourceOwner(userId, resourceUserId);
}

/**
 * Enforce resource ownership or admin access
 */
export function enforceOwnershipOrAdmin(
  context: AuthContext,
  resourceUserId: string
): { authorized: true } | { error: NextResponse } {
  if (!canAccessResource(context.user.role, context.user.id, resourceUserId)) {
    return {
      error: NextResponse.json(
        {
          error: 'Forbidden: You can only access your own resources',
        },
        { status: 403 }
      ),
    };
  }
  return { authorized: true };
}

/**
 * Get user's center ID (for CENTER role users)
 */
export async function getUserCenterId(userId: string): Promise<string | null> {
  try {
    const { centers } = await import('@/db/schema');
    const centerRecord = await db
      .select()
      .from(centers)
      .where(eq(centers.userId, userId))
      .limit(1);

    return centerRecord.length > 0 ? centerRecord[0].id : null;
  } catch (error) {
    console.error('Get user center ID error:', error);
    return null;
  }
}

/**
 * Get user's patient profile ID (for PATIENT role users)
 */
export async function getUserPatientId(userId: string): Promise<string | null> {
  try {
    const { patientProfiles } = await import('@/db/schema');
    const profileRecord = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, userId))
      .limit(1);

    return profileRecord.length > 0 ? profileRecord[0].id : null;
  } catch (error) {
    console.error('Get user patient ID error:', error);
    return null;
  }
}
