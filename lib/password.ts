/**
 * Password Hashing and Verification Utilities
 * 
 * Wraps Better Auth's internal password functions for server-side use.
 */

import { hashPassword as betterAuthHash, verifyPassword as betterAuthVerify } from 'better-auth/crypto';

/**
 * Hash a password using Better Auth's default algorithm
 */
export async function hashPassword(password: string): Promise<string> {
  return betterAuthHash(password);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(data: { password: string; hash: string }): Promise<boolean> {
  return betterAuthVerify(data);
}
