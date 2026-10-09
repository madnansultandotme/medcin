/**
 * Neon Better Auth Client Configuration
 * 
 * This creates the auth client for the entire application.
 * Now pointing to our local Better Auth server at /api/auth
 */

import { createAuthClient } from 'better-auth/react';

// Use local Better Auth server
const authUrl = typeof window !== 'undefined'
  ? `${window.location.origin}/api/auth`
  : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth`;

// Create auth client
export const authClient = createAuthClient({
  baseURL: authUrl,
});

// Type-safe auth client
export type AuthClient = typeof authClient;
