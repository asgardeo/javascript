/**
 * Demo server route: session inspector.
 *
 * Returns the decoded session payload for the current request (or null when
 * the user is not signed in).  Raw tokens are redacted so this endpoint is
 * safe to display in the playground UI.
 *
 * Auto-imported utilities used:
 *   • useServerSession — reads and verifies the session JWT cookie.
 */
export default defineEventHandler(async (event) => {
  const session = await useServerSession(event);

  if (!session) {
    return {
      signedIn: false,
      session: null,
    };
  }

  // Redact raw token values — show only a short prefix so viewers can
  // confirm a token exists without exposing the full credential.
  const redact = (value: string | undefined) =>
    value ? `${value.slice(0, 20)}…[redacted]` : null;

  return {
    signedIn: true,
    session: {
      sub:                session.sub,
      sessionId:          session.sessionId,
      scopes:             session.scopes,
      organizationId:     session.organizationId ?? null,
      accessTokenPreview: redact(session.accessToken),
      idTokenPreview:     redact(session.idToken),
      accessTokenExpiresAt: session.accessTokenExpiresAt ?? null,
      issuedAt:           session.iat,
      expiresAt:          session.exp,
    },
  };
});
