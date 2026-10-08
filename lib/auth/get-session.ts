/**
 * Server-Side Session Helper
 * 
 * Use this in API routes and Server Components to get the current user.
 * Neon Better Auth handles JWT verification automatically.
 */

import { cookies } from 'next/headers';

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
    const cookieStore = await cookies();
    const authUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL;

    if (!authUrl) {
      console.error('NEXT_PUBLIC_NEON_AUTH_URL not set');
      return { user: null, session: null };
    }

    // Get session cookie
    const sessionToken = cookieStore.get('better-auth.session_token');
    
    if (!sessionToken) {
      return { user: null, session: null };
    }

    // Validate session with Neon Auth
    const response = await fetch(`${authUrl}/api/auth/get-session`, {
      headers: {
        'Cookie': `better-auth.session_token=${sessionToken.value}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return { user: null, session: null };
    }

    const data = await response.json();
    
    return {
      user: data.user ?? null,
      session: data.session ?? null,
    };
  } catch (error) {
    console.error('Failed to get session:', error);
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
