/**
 * First Login Check Middleware
 * 
 * Checks if user requires password reset on first login
 */

import { getAuthenticatedUser, type AuthContext } from './permissions';

export interface FirstLoginCheckResult {
  requiresReset: boolean;
  user: AuthContext['user'] | null;
}

/**
 * Check if authenticated user requires first-login password reset
 * 
 * @returns Result with requiresReset flag and user info
 */
export async function checkFirstLogin(): Promise<FirstLoginCheckResult> {
  const authContext = await getAuthenticatedUser();

  if (!authContext) {
    return {
      requiresReset: false,
      user: null,
    };
  }

  const user = authContext.user as any;
  const requiresReset = user.passwordResetRequired === true || user.isFirstLogin === true;

  return {
    requiresReset,
    user: authContext.user,
  };
}
