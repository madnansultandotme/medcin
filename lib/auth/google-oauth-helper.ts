/**
 * Google OAuth Helper Functions
 * 
 * Provides utilities for Google OAuth account linking, validation, and session creation.
 * Used by Better Auth hooks to customize OAuth flow for doctor authentication.
 */

import { db } from "@/db";
import { users, doctors, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Links a Google account to an existing user
 * Updates the user's googleId and marks email as verified
 */
export async function linkGoogleAccount(
  userId: string,
  googleId: string,
  email: string
): Promise<void> {
  await db
    .update(users)
    .set({
      googleId,
      emailVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

/**
 * Validates that a doctor profile exists for the given user
 * Returns the doctor profile if found, null otherwise
 */
export async function validateDoctorProfile(userId: string) {
  const [doctor] = await db
    .select()
    .from(doctors)
    .where(eq(doctors.userId, userId))
    .limit(1);

  return doctor || null;
}

/**
 * Checks if a user exists by email
 * Returns the user object if found, null otherwise
 */
export async function findUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user || null;
}

/**
 * Checks if a user has a Google account linked
 * Returns true if googleId exists or an accounts record with providerId='google' exists
 */
export async function hasGoogleAccountLinked(userId: string): Promise<boolean> {
  // Check if user has googleId set
  const [user] = await db
    .select({ googleId: users.googleId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user?.googleId) {
    return true;
  }

  // Check if accounts table has a Google OAuth record
  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .where(eq(accounts.providerId, "google"))
    .limit(1);

  return !!account;
}

/**
 * Determines the dashboard redirect URL based on user role
 */
export function getDashboardUrl(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "CENTER":
      return "/center";
    case "DOCTOR":
      return "/doctor";
    case "PATIENT":
      return "/patient";
    default:
      return "/portal";
  }
}
