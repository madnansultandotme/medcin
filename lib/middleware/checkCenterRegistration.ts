import { db } from '@/db';
import { centers } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Check if center has completed registration
 * Returns the center object if found, null otherwise
 */
export async function checkCenterRegistration(userId: string) {
  const center = await db
    .select()
    .from(centers)
    .where(eq(centers.userId, userId))
    .limit(1);

  if (center.length === 0) {
    return null;
  }

  return center[0];
}

/**
 * Check if center registration is incomplete
 */
export function isRegistrationIncomplete(center: typeof centers.$inferSelect | null): boolean {
  if (!center) return true;
  return !center.completedRegistration;
}
