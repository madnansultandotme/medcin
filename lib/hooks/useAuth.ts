'use client';

/**
 * Custom Auth Hooks
 * 
 * Provides convenient hooks for authentication state and actions.
 */

import { authClient } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAuth() {
  // Use the session hook from the authClient instance
  const session = authClient.useSession();
  const router = useRouter();

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authClient.signIn.email({
      email,
      password,
    });
    
    if (result.error) {
      throw new Error(result.error.message || 'Sign in failed');
    }
    
    return result.data;
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    name: string,
    role: 'ADMIN' | 'CENTER' | 'PATIENT' = 'PATIENT',
    phone?: string
  ) => {
    // Step 1: Create account in Neon Auth
    const result = await authClient.signUp.email({
      email,
      password,
      name,
    });
    
    if (result.error) {
      throw new Error(result.error.message || 'Sign up failed');
    }
    
    // Step 2: Sync user to our database
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authUid: result.data.user.id,
          email,
          name,
          role,
          phone,
        }),
      });

      if (!response.ok) {
        console.error('Failed to sync user to database');
      }
    } catch (error) {
      console.error('Error syncing user to database:', error);
      // Don't throw - user is created in Neon Auth, we can sync later
    }
    
    return result.data;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const result = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/portal', // Redirect after Google sign-in
    });
    
    if (result.error) {
      throw new Error(result.error.message || 'Google sign in failed');
    }
    
    return result.data;
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    router.push('/login');
  }, [router]);

  return {
    // Session data
    user: session.data?.user ?? null,
    session: session.data?.session ?? null,
    isLoading: session.isPending,
    isAuthenticated: !!session.data?.user,
    
    // Auth actions
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    
    // Raw session query
    sessionQuery: session,
  };
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  if (!isLoading && !isAuthenticated) {
    router.push('/login');
  }

  return { user, isLoading };
}
