/**
 * GET /api/me
 *
 * Example custom API route that uses useServerSession to access
 * the current user's session data. Demonstrates server-side
 * session access in custom API routes.
 */
export default defineEventHandler(async (event) => {
  const session = await requireServerSession(event);

  return {
    sessionId: session.sessionId,
    sub: session.sub,
    scopes: session.scopes,
    organizationId: session.organizationId || null,
    issuedAt: session.iat ? new Date(session.iat * 1000).toISOString() : null,
    expiresAt: session.exp ? new Date(session.exp * 1000).toISOString() : null,
  };
});
