import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import { config } from '../config';

/**
 * Better Auth Configuration
 *
 * Replaces Supabase Auth with Better Auth for simpler architecture.
 * Uses Drizzle adapter to work seamlessly with our existing database.
 *
 * Features:
 * - Google OAuth 2.0
 * - Twitter/X OAuth 2.0
 * - Built-in session management
 * - Automatic database schema generation
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  socialProviders: {
    google: {
      clientId: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
    },
    twitter: {
      clientId: config.oauth.twitter.clientId,
      clientSecret: config.oauth.twitter.clientSecret,
    },
  },
  // Base URL for OAuth callbacks
  baseURL: config.oauth.baseUrl,
  // Trust proxy headers (needed for production behind reverse proxy)
  trustedOrigins: [config.frontend.url],
});
