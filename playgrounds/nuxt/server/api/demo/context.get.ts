/**
 * Demo server route: read the Asgardeo event context via getAsgardeoContext.
 *
 * Demonstrates the typed accessor for event.context.asgardeo.
 */
import {getAsgardeoContext} from '@asgardeo/nuxt/server';

export default defineEventHandler((event) => {
  const ctx = getAsgardeoContext(event);

  if (!ctx?.isSignedIn) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not signed in. Sign in first to test getAsgardeoContext.',
    });
  }

  return {
    isSignedIn: ctx.isSignedIn,
    session: ctx.session
      ? {
          sub: ctx.session.sub,
          sessionId: ctx.session.sessionId,
          scopes: ctx.session.scopes,
          organizationId: ctx.session.organizationId ?? null,
          accessTokenExpiresAt: ctx.session.accessTokenExpiresAt ?? null,
        }
      : null,
    ssrPresent: ctx.ssr != null,
    ssrKeys: ctx.ssr ? Object.keys(ctx.ssr) : [],
  };
});
