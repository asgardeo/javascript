import { requireServerSession } from '@asgardeo/nuxt/server';

export default defineEventHandler(async (event) => {
  // Throws 401 automatically when no valid session exists.
  const session = await requireServerSession(event);

  const redact = (value: string | undefined) =>
    value ? `${value.slice(0, 20)}…[redacted]` : null;

  return {
    signedIn: true,
    session: {
      sub:                  session.sub,
      sessionId:            session.sessionId,
      scopes:               session.scopes,
      organizationId:       session.organizationId ?? null,
      accessTokenPreview:   redact(session.accessToken),
      idTokenPreview:       redact(session.idToken),
      accessTokenExpiresAt: session.accessTokenExpiresAt ?? null,
      issuedAt:             session.iat,
      expiresAt:            session.exp,
    },
  };
});
