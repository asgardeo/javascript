/**
 * Demo server route: access-token inspector.
 *
 * Calls getValidAccessToken which:
 *   1. Reads the session cookie.
 *   2. Returns the stored access token if it's still fresh.
 *   3. Performs a silent refresh_token grant when the token is near expiry,
 *      reissues the session cookie, and returns the new token.
 *   4. Throws a 401 if the user is not signed in or the refresh fails.
 */
import {useServerSession, getValidAccessToken} from '@asgardeo/nuxt/server';

export default defineEventHandler(async (event) => {
  // Read the current session first so we can detect whether a token refresh
  // happened (the token will differ from the one stored in the cookie before).
  const sessionBefore = await useServerSession(event);

  if (!sessionBefore) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not signed in. Sign in first to test getValidAccessToken.',
    });
  }

  const tokenBefore = sessionBefore.accessToken;

  // getValidAccessToken may silently refresh the access token and rewrite the
  // session cookie.  It throws a 401 if refresh is not possible.
  const freshToken = await getValidAccessToken(event);

  const isRefreshed = freshToken !== tokenBefore;
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = sessionBefore.accessTokenExpiresAt ?? null;

  return {
    // Truncate the token for display — still useful to verify it exists.
    tokenPreview: `${freshToken.slice(0, 40)}…[redacted]`,
    isRefreshed,
    expiresAt,
    expiresIn: expiresAt ? expiresAt - now : null,
    isExpired: expiresAt ? now >= expiresAt : null,
  };
});
