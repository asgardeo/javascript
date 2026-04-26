/**
 * Dev-only endpoint: exposes all auth tokens from the current session for
 * the Token Debugger page.
 *
 * SECURITY: Returns 403 in production. This file must never ship as part of a
 * real application — it lives only inside the playground sample.
 */
import { getCookie } from 'h3';
import { useServerSession } from '@asgardeo/nuxt/server';
import type { AsgardeoSessionPayload } from '@asgardeo/nuxt/server';

// TODO: Import these from @asgardeo/nuxt/server once the SDK exports them.
// For now we hard-code the names derived from CookieConfig (VENDOR_PREFIX = 'asgardeo').
const SESSION_COOKIE_NAME      = '__asgardeo__session';
const TEMP_SESSION_COOKIE_NAME = '__asgardeo__temp.session';

export type TokensResponse = {
  session: {
    cookieName: string;
    raw: string | null;
    payload: AsgardeoSessionPayload | null;
    error: string | null;
    expiresInSeconds: number | null;
  };
  tempSession: {
    cookieName: string;
    raw: string | null;
    /** Decoded temp-session payload (sessionId + optional returnTo). */
    payload: { sessionId: string; returnTo?: string } | null;
    error: string | null;
    expiresInSeconds: number | null;
  };
  accessToken:  { value: string | null };
  idToken:      { value: string | null };
  refreshToken: { value: string | null };
};

export default defineEventHandler(async (event): Promise<TokensResponse> => {
  // Hard gate: never serve in production.
  if (process.env['NODE_ENV'] === 'production') {
    throw createError({ statusCode: 403, statusMessage: 'Token debugger is disabled in production.' });
  }

  const now = Math.floor(Date.now() / 1000);

  // ── Main session ────────────────────────────────────────────────────────
  const sessionRaw = getCookie(event, SESSION_COOKIE_NAME) ?? null;
  let sessionPayload: AsgardeoSessionPayload | null = null;
  let sessionError: string | null = null;
  let sessionExpiresIn: number | null = null;

  if (sessionRaw) {
    // useServerSession re-reads the cookie internally via getCookie, so we
    // call it directly to get a verified, typed payload.
    const verified = await useServerSession(event);
    if (verified) {
      sessionPayload    = verified;
      sessionExpiresIn  = typeof verified.exp === 'number' ? verified.exp - now : null;
    } else {
      sessionError = 'Session cookie present but could not be verified (expired or invalid signature).';
    }
  }

  // ── Temp session (present only mid-OAuth flow) ──────────────────────────
  const tempRaw = getCookie(event, TEMP_SESSION_COOKIE_NAME) ?? null;
  let tempPayload: { sessionId: string; returnTo?: string } | null = null;
  let tempError: string | null = null;
  let tempExpiresIn: number | null = null;

  if (tempRaw) {
    // Decode without verifying signature — the signature was already
    // verified server-side during the OAuth callback. We only need the
    // payload here for display, and we're already behind the production gate.
    try {
      const parts = tempRaw.split('.');
      if (parts.length !== 3) throw new Error('Not a JWT');
      // Replace URL-safe chars and pad before decoding.
      const padded  = (parts[1] ?? '').replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as Record<string, unknown>;
      tempPayload   = {
        sessionId: String(decoded['sessionId'] ?? ''),
        returnTo:  decoded['returnTo'] != null ? String(decoded['returnTo']) : undefined,
      };
      if (typeof decoded['exp'] === 'number') {
        tempExpiresIn = decoded['exp'] - now;
      }
    } catch (err) {
      tempError = err instanceof Error ? err.message : 'Failed to decode temp session cookie.';
    }
  }

  return {
    session: {
      cookieName:       SESSION_COOKIE_NAME,
      raw:              sessionRaw,
      payload:          sessionPayload,
      error:            sessionError,
      expiresInSeconds: sessionExpiresIn,
    },
    tempSession: {
      cookieName:       TEMP_SESSION_COOKIE_NAME,
      raw:              tempRaw,
      payload:          tempPayload,
      error:            tempError,
      expiresInSeconds: tempExpiresIn,
    },
    accessToken:  { value: sessionPayload?.accessToken  ?? null },
    idToken:      { value: sessionPayload?.idToken      ?? null },
    refreshToken: { value: sessionPayload?.refreshToken ?? null },
  };
});
