import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth Client for Frontend
 *
 * Provides React hooks for authentication:
 * - useSession() - Get current session
 * - signIn.social() - Sign in with OAuth
 * - signOut() - Sign out
 */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Debug: Log the API URL being used (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('[Auth Client] Using API URL:', apiUrl);
}

export const authClient = createAuthClient({
  baseURL: apiUrl,
});

// Export hooks for easy use
export const { useSession, signIn, signOut } = authClient;
