/**
 * Minimal client-side JWT decoder.
 *
 * Decodes the base64url-encoded header and payload of a JWT without any
 * signature verification. Use only for display/debug purposes.
 *
 * Returns null when the input is not a valid three-part JWT.
 */
export interface DecodedJwt {
  header:  Record<string, unknown>;
  payload: Record<string, unknown>;
}

function base64urlDecode(input: string): string {
  // Pad to a multiple of 4, replace URL-safe characters.
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad    = padded.length % 4;
  const str    = pad ? padded + '='.repeat(4 - pad) : padded;
  return atob(str);
}

export function decodeJwt(token: string): DecodedJwt | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const header  = JSON.parse(base64urlDecode(parts[0] ?? '')) as Record<string, unknown>;
    const payload = JSON.parse(base64urlDecode(parts[1] ?? '')) as Record<string, unknown>;
    return { header, payload };
  } catch {
    return null;
  }
}

/**
 * Returns the number of seconds until the token expires, or null if there is
 * no `exp` claim. Negative values mean the token is already expired.
 */
export function jwtExpiresInSeconds(payload: Record<string, unknown>): number | null {
  if (typeof payload['exp'] !== 'number') return null;
  return payload['exp'] - Math.floor(Date.now() / 1000);
}
