'use client';

/**
 * Auth Provider Component
 * 
 * Simple wrapper component for authentication.
 * The BetterAuthReactAdapter provides React hooks without needing a provider.
 */

import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // With BetterAuthReactAdapter, hooks work without a provider wrapper
  // The authClient instance with the adapter is sufficient
  return <>{children}</>;
}
