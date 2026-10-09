/**
 * Server-Side Session Helper
 * 
 * Use this in API routes and Server Components to get the current user.
 * Now using local Better Auth instance.
 */

import { headers } from 'next/headers';
import { auth } from './server';

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  token: string;
  expiresAt: string;
  userId: string;
}

export async function getSession(): Promise<{
  user: User | null;
  session: Session | null;
}> {
  try {
    const headersList = await headers();
    
    console.log('[getSession] Checking session with Better Auth...');
    
    // Use Better Auth's built-in session validation
    const sessionData = await auth.api.getSession({
      headers: headersList
    });

    console.log('[getSession] Session data:', {
      hasSession: !!sessionData,
      hasUser: !!sessionData?.user,
      userEmail: sessionData?.user?.email
    });

    if (!sessionData) {
      console.log('[getSession] No session found');
      return { user: null, session: null };
    }

    return {
      user: sessionData.user as any,
      session: sessionData.session as any,
    };
  } catch (error) {
    console.error('[getSession] Error:', error);
    return { user: null, session: null };
  }
}

/**
 * Require authentication in API routes
 * Throws if user is not authenticated
 */
export async function requireAuth() {
  const { user, session } = await getSession();
  
  if (!user || !session) {
    throw new Error('Unauthorized');
  }
  
  return { user, session };
}
