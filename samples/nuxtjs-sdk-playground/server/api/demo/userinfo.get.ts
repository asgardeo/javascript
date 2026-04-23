/**
 * Demo server route: SCIM2 user-info via AsgardeoNuxtClient.
 *
 * Uses the singleton AsgardeoNuxtClient to call getUserProfile() for the
 * current session.  getUserProfile fetches /scim2/Me + /scim2/Schemas,
 * flattens them, and returns a structured UserProfile object.  Falls back
 * to ID-token user claims when SCIM2 is unavailable.
 *
 * Server utility used (imported explicitly — not auto-imported):
 *   • AsgardeoNuxtClient.getInstance() — singleton server-side SDK client.
 *
 * Auto-imported utilities used:
 *   • useServerSession — obtain the sessionId needed by the client.
 */
import { AsgardeoNuxtClient } from '@asgardeo/nuxt/server';

export default defineEventHandler(async (event) => {
  const session = await useServerSession(event);

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not signed in. Sign in first to test AsgardeoNuxtClient.',
    });
  }

  const client = AsgardeoNuxtClient.getInstance();

  // getUserProfile calls getScim2Me + getSchemas + generateFlattenedUserProfile
  // and falls back to ID-token user claims if SCIM2 is unavailable.
  const userProfile = await client.getUserProfile(session.sessionId);

  return {
    flattenedProfile: userProfile.flattenedProfile,
    profile:          userProfile.profile,
    schemas:          userProfile.schemas?.map((s: Record<string, unknown>) => ({
      id:          s['id'],
      name:        s['name'],
      description: s['description'],
    })),
  };
});
