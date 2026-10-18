/**
 * First Login Check Middleware
 * 
 * Checks if user needs to reset their password (first login or forced reset).
 */

import { getAuthenticatedUser, type AuthenticatedUser } from './permissions';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface FirstLoginCheckResult {
  requiresReset: boolean;
  user: AuthenticatedUser | null;
}

/**
 * Check if the current user requires a password reset
 * Used by doctor layout to redirect to password change page
 */
export async function checkFirstLogin(): Promise<FirstLoginCheckResult> {
  const authContext = await getAuthenticatedUser();
  
  if (!authContext) {
    return { requiresReset: false, user: null };
  }

  const { user } = authContext;
  
  // Query passwordResetRequired flag from database
  const userRecord = await db
    .select({ passwordResetRequired: users.passwordResetRequired })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (userRecord.length === 0) {
    return { requiresReset: false, user: null };
  }

  const requiresReset = userRecord[0].passwordResetRequired;
  
  return { requiresReset, user };
}
