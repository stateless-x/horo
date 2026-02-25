import Elysia, { t } from 'elysia';
import { db } from '../lib/db';
import { auth } from '../lib/auth';
import { compatibilityInvites, birthProfiles, users } from '@horo/db';
import { eq, and, gt } from 'drizzle-orm';
import { randomBytes } from 'crypto';

/**
 * Invite Routes
 *
 * Handles compatibility invite link generation and validation
 */
export const inviteRoutes = new Elysia({ prefix: '/invite' })
  /**
   * Generate a new invite link
   * POST /invite/create
   *
   * Authenticated user creates an invite link to share their fortune
   * Returns a token that can be embedded in a shareable URL
   */
  .post('/create', async ({ request, set }) => {
    // Get session from Better Auth
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      set.status = 401;
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;
    const userName = session.user.name;

    try {
      // Get user's birth profile
      const profile = await db.query.birthProfiles.findFirst({
        where: eq(birthProfiles.userId, userId),
      });

      if (!profile) {
        set.status = 404;
        return { error: 'Birth profile not found. Please complete onboarding first.' };
      }

      // Generate unique token (8 characters, URL-safe)
      const token = randomBytes(4).toString('hex'); // e.g., "a3f8c2d1"

      // Create invite (expires in 7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const inviteId = crypto.randomUUID();

      await db.insert(compatibilityInvites).values({
        id: inviteId,
        token,
        inviterId: userId,
        inviterName: userName || 'เพื่อนของเจ้า',
        inviterProfileId: profile.id,
        expiresAt,
      });

      return {
        token,
        inviteUrl: `${process.env.FRONTEND_URL}/invite/${token}`,
        expiresAt: expiresAt.toISOString(),
      };
    } catch (error) {
      console.error('Create invite error:', error);
      set.status = 500;
      return { error: 'Failed to create invite' };
    }
  })

  /**
   * Get invite details
   * GET /invite/:token
   *
   * Public endpoint to fetch invite information
   * Used when someone clicks on an invite link
   */
  .get('/:token', async ({ params, set }) => {
    const { token } = params;

    try {
      // Find invite
      const invite = await db.query.compatibilityInvites.findFirst({
        where: and(
          eq(compatibilityInvites.token, token),
          gt(compatibilityInvites.expiresAt, new Date()) // Not expired
        ),
      });

      if (!invite) {
        set.status = 404;
        return { error: 'Invite not found or expired' };
      }

      // Check if already used
      if (invite.isUsed) {
        set.status = 410; // Gone
        return { error: 'This invite has already been used' };
      }

      return {
        inviterName: invite.inviterName,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
      };
    } catch (error) {
      console.error('Get invite error:', error);
      set.status = 500;
      return { error: 'Failed to fetch invite' };
    }
  })

  /**
   * Mark invite as used and calculate compatibility
   * POST /invite/:token/use
   *
   * Called after the recipient completes onboarding and authenticates
   * Marks the invite as used and calculates compatibility
   */
  .post('/:token/use', async ({ params, request, set }) => {
    const { token } = params;

    // Get session from Better Auth
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      set.status = 401;
      return { error: 'Not authenticated' };
    }

    const recipientId = session.user.id;

    try {
      // Find invite
      const invite = await db.query.compatibilityInvites.findFirst({
        where: and(
          eq(compatibilityInvites.token, token),
          gt(compatibilityInvites.expiresAt, new Date())
        ),
      });

      if (!invite) {
        set.status = 404;
        return { error: 'Invite not found or expired' };
      }

      if (invite.isUsed) {
        set.status = 410;
        return { error: 'This invite has already been used' };
      }

      // Check if user is trying to use their own invite
      if (invite.inviterId === recipientId) {
        set.status = 400;
        return { error: 'You cannot use your own invite link' };
      }

      // Get recipient's profile
      const recipientProfile = await db.query.birthProfiles.findFirst({
        where: eq(birthProfiles.userId, recipientId),
      });

      if (!recipientProfile) {
        set.status = 404;
        return { error: 'Birth profile not found. Please complete onboarding first.' };
      }

      // Mark invite as used
      await db
        .update(compatibilityInvites)
        .set({
          isUsed: true,
          usedBy: recipientId,
          usedAt: new Date(),
        })
        .where(eq(compatibilityInvites.id, invite.id));

      // Return success with compatibility calculation endpoint
      return {
        success: true,
        message: 'Invite accepted',
        inviterName: invite.inviterName,
        // Frontend should now call /fortune/compatibility with the inviter's profile
        compatibilityEndpoint: '/fortune/compatibility',
      };
    } catch (error) {
      console.error('Use invite error:', error);
      set.status = 500;
      return { error: 'Failed to use invite' };
    }
  });
