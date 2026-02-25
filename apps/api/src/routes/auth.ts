import { Elysia, t } from 'elysia';
import { supabase } from '../lib/supabase';
import { config } from '../config';
import { db } from '../lib/db';
import { users, sessions } from '@horo/db';
import { eq } from 'drizzle-orm';

/**
 * Authentication routes
 *
 * SECURITY CRITICAL:
 * - All OAuth flows happen server-side
 * - Tokens never exposed to client
 * - Session stored in httpOnly cookie
 */
export const authRoutes = new Elysia({ prefix: '/auth' })
  .get('/login', async ({ query, set }) => {
    const { provider } = query;

    if (provider !== 'google' && provider !== 'x') {
      set.status = 400;
      return { error: 'Invalid provider. Must be "google" or "x"' };
    }

    // Generate OAuth URL server-side
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider === 'x' ? 'twitter' : provider,
      options: {
        redirectTo: `${config.frontend.url}/api/auth/callback`,
      },
    });

    if (error || !data.url) {
      set.status = 500;
      return { error: 'Failed to generate auth URL' };
    }

    // Redirect user to OAuth provider
    set.redirect = data.url;
  }, {
    query: t.Object({
      provider: t.String(),
    }),
  })

  .get('/callback', async ({ query, cookie, set }) => {
    const { code } = query;

    if (!code) {
      set.status = 400;
      return { error: 'Missing authorization code' };
    }

    // Exchange code for session SERVER-SIDE
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      set.status = 401;
      return { error: 'Failed to exchange code for session' };
    }

    const { user: supabaseUser, session } = data;

    // Create or update user in our database
    let user = await db.query.users.findFirst({
      where: eq(users.supabaseUid, supabaseUser.id),
    });

    if (!user) {
      const [newUser] = await db.insert(users).values({
        supabaseUid: supabaseUser.id,
        name: supabaseUser.user_metadata.full_name || supabaseUser.email?.split('@')[0] || 'User',
        email: supabaseUser.email,
        provider: supabaseUser.app_metadata.provider,
        avatarUrl: supabaseUser.user_metadata.avatar_url,
      }).returning();
      user = newUser;
    }

    // Store refresh token encrypted in database
    await db.insert(sessions).values({
      userId: user.id,
      refreshTokenEnc: session.refresh_token, // TODO: Encrypt this
      expiresAt: new Date(session.expires_at! * 1000),
    });

    // Set httpOnly session cookie with access token
    // In production, also set: Secure, SameSite=Lax
    cookie.session.set({
      value: session.access_token,
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: session.expires_in,
      path: '/',
    });

    // Redirect to dashboard
    set.redirect = `${config.frontend.url}/dashboard`;
  }, {
    query: t.Object({
      code: t.String(),
    }),
  })

  .post('/logout', async ({ cookie, set }) => {
    // Clear session cookie
    cookie.session.remove();

    return { success: true };
  })

  .get('/me', async ({ cookie, set }) => {
    const sessionToken = cookie.session?.value;

    if (!sessionToken) {
      set.status = 401;
      return { error: 'Not authenticated' };
    }

    // Verify session with Supabase
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(sessionToken as string);

    if (error || !supabaseUser) {
      set.status = 401;
      return { error: 'Invalid session' };
    }

    // Get user from our database
    const user = await db.query.users.findFirst({
      where: eq(users.supabaseUid, supabaseUser.id),
    });

    if (!user) {
      set.status = 404;
      return { error: 'User not found' };
    }

    return { user };
  });
