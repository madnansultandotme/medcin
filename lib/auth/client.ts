/**
 * Neon Better Auth Client Configuration
 * 
 * This creates the auth client for the entire application.
 * Import this client wherever you need auth functionality.
 */

import { createAuthClient } from '@neondatabase/neon-js/auth';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters';

// Validate environment variable
const authUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL;

if (!authUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_NEON_AUTH_URL environment variable. ' +
    'Add it to .env.local with your Neon Auth URL.'
  );
}

// Create auth client with React adapter for hooks support
export const authClient = createAuthClient(authUrl, {
  adapter: BetterAuthReactAdapter(),
});

// Type-safe auth client
export type AuthClient = typeof authClient;
