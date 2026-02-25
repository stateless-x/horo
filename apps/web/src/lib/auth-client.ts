import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth Client for Frontend
 *
 * Provides React hooks for authentication:
 * - useSession() - Get current session
 * - signIn.social() - Sign in with OAuth
 * - signOut() - Sign out
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

// Export hooks for easy use
export const { useSession, signIn, signOut } = authClient;
