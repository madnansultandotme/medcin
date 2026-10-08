import { db } from './index';

/**
 * Get database instance with authenticated user context
 * Pass the Neon Auth JWT token to enforce RLS policies automatically
 * 
 * @param authToken - JWT token from Neon Better Auth session
 * @returns Drizzle database instance with RLS enforcement
 */
export function getAuthDb(authToken: string) {
  // Use Drizzle's $withAuth to include JWT in all queries
  // This automatically enforces RLS policies at the database level
  return db.$withAuth(authToken);
}
