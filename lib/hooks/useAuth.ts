'use client';

/**
 * Custom Auth Hooks
 * 
 * Provides convenient hooks for authentication state and actions.
 * Using Better Auth React client with extended user data.
 */

import { authClient } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// Extended user type with our custom fields
interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  phone?: string;
  photoUrl?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function useAuth() {
  // Use the session hook from Better Auth
  const session = authClient.useSession();
  const router = useRouter();
  const [extendedUser, setExtendedUser] = useState<ExtendedUser | null>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(false);

  // Fetch extended user data from our database
  useEffect(() => {
    if (session.data?.user && !isFetchingUser && !extendedUser) {
      setIsFetchingUser(true);
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setExtendedUser(data.user);
          }
        })
        .catch(err => console.error('Failed to fetch extended user:', err))
        .finally(() => setIsFetchingUser(false));
    }
  }, [session.data?.user, isFetchingUser, extendedUser]);

  // Reset extended user when session changes
  useEffect(() => {
    if (!session.data?.user) {
      setExtendedUser(null);
    }
  }, [session.data?.user]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authClient.signIn.email({
      email,
      password,
    });
    
    if (result.error) {
      throw new Error(result.error.message || 'Sign in failed');
    }
    
    // Clear extended user to force refetch
    setExtendedUser(null);
    
    return result.data;
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    name: string,
    role: 'ADMIN' | 'CENTER' | 'PATIENT' = 'PATIENT',
    phone?: string
  ) => {
    // Step 1: Create account with Better Auth
    const result = await authClient.signUp.email({
      email,
      password,
      name,
    });
    
    if (result.error) {
      throw new Error(result.error.message || 'Sign up failed');
    }
    
    // Step 2: Update user role and phone in database
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: result.data.user.id,
          role,
          phone,
        }),
      });

      if (!response.ok) {
        console.error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
    
    // Clear extended user to force refetch
    setExtendedUser(null);
    
    return result.data;
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    setExtendedUser(null);
    router.push('/login');
  }, [router]);

  // Use extended user if available, otherwise fall back to session user
  const user = extendedUser || session.data?.user;

  return {
    // Session data
    user: user as ExtendedUser | null,
    session: session.data?.session ?? null,
    isLoading: session.isPending || isFetchingUser,
    isAuthenticated: !!session.data?.user,
    
    // Auth actions
    signIn,
    signUp,
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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  return { user, isLoading };
}

/**
 * Hook to require specific role(s)
 * Redirects to login if not authenticated
 * Redirects to portal if wrong role
 */
export function useRequireRole(...allowedRoles: Array<'ADMIN' | 'CENTER' | 'PATIENT'>) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [roleChecked, setRoleChecked] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch user role from database
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          const role = data.user?.role;
          setUserRole(role);

          // Check if user has required role
          if (!allowedRoles.includes(role)) {
            console.warn(`Access denied: User has role ${role}, required one of: ${allowedRoles.join(', ')}`);
            router.push('/portal'); // Redirect to portal to choose correct workspace
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        router.push('/login');
      } finally {
        setRoleChecked(true);
      }
    };

    fetchUserRole();
  }, [isLoading, isAuthenticated, router, allowedRoles]);

  return { 
    user, 
    isLoading: isLoading || !roleChecked,
    userRole,
    hasAccess: roleChecked && userRole && allowedRoles.includes(userRole as any)
  };
}
