/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {AsgardeoRuntimeError, CookieConfig} from '@asgardeo/node';
import {SignJWT, jwtVerify, compactVerify, JWTPayload} from 'jose';
import logger from './logger';
import {DEFAULT_SESSION_COOKIE_EXPIRY_TIME} from '../constants/sessionConstants';

/**
 * Session token payload interface
 */
export interface SessionTokenPayload extends JWTPayload {
  /** Expiration timestamp — doubles as the access token expiry (JWT exp == access token exp) */
  exp: number;
  /** Issued at timestamp */
  iat: number;
  /**
   * Claims of the ID token that was issued together with the access token, minus the
   * single-use protocol claims (see {@link SessionManager.toIdTokenClaims}). Lets the
   * server read the user's organization and identity claims without an in-memory session.
   * Reduced to the essential claims, or left out, when the full set would not fit into the
   * cookie (see {@link SessionManager.createSessionToken}).
   */
  idTokenClaims?: Record<string, unknown>;
  /** Organization ID if applicable */
  organizationId?: string;
  /** The refresh token; empty string if not provided by the auth server */
  refreshToken: string;
  /** OAuth scopes */
  scopes: string[];
  /** Session ID */
  sessionId: string;
  /** User ID */
  sub: string;
  /** Token type discriminant — must be 'session' for access-session JWTs */
  type: 'session';
}

/**
 * Session management utility class for JWT-based session cookies
 */
class SessionManager {
  /**
   * Get the signing secret from environment variable
   * Throws error in production if not set
   */
  private static getSecret(): Uint8Array {
    const secret: string | undefined = process.env['ASGARDEO_SECRET'];

    if (!secret) {
      if (process.env['NODE_ENV'] === 'production') {
        throw new AsgardeoRuntimeError(
          'ASGARDEO_SECRET environment variable is required in production',
          'session-secret-required',
          'nextjs',
          'Set the ASGARDEO_SECRET environment variable with a secure random string',
        );
      }
      // Use a default secret for development (not secure)
      // eslint-disable-next-line no-console
      console.warn('Using default secret for development. Set ASGARDEO_SECRET for production!');
      return new TextEncoder().encode('development-secret-not-for-production');
    }

    return new TextEncoder().encode(secret);
  }

  /**
   * Create a temporary session cookie for login initiation
   */
  static async createTempSession(sessionId: string): Promise<string> {
    const secret: Uint8Array = this.getSecret();

    const jwt: string = await new SignJWT({
      sessionId,
      type: 'temp',
    })
      .setProtectedHeader({alg: 'HS256'})
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(secret);

    return jwt;
  }

  /**
   * Resolve the session cookie expiry time in seconds.
   *
   * Resolution order (first defined value wins):
   *   1. `configuredExpiry` — value from `AsgardeoNodeConfig.sessionCookieExpiryTime`
   *   2. `ASGARDEO_SESSION_COOKIE_EXPIRY_TIME` environment variable
   *   3. `DEFAULT_SESSION_COOKIE_EXPIRY_TIME` (24 hours)
   */
  static resolveSessionCookieExpiry(configuredExpiry?: number): number {
    if (configuredExpiry != null && configuredExpiry > 0) {
      return configuredExpiry;
    }

    const envValue: string | undefined = process.env['ASGARDEO_SESSION_COOKIE_EXPIRY_TIME'];

    if (envValue) {
      const parsed: number = parseInt(envValue, 10);

      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return DEFAULT_SESSION_COOKIE_EXPIRY_TIME;
  }

  /**
   * ID token claims that are only meaningful while the token is being validated (hashes, nonce,
   * session identifiers). They are dropped before the claims are stored in the session cookie
   * to keep the cookie small; everything else, including the organization claims (`org_id`,
   * `org_name`, `org_handle`, `user_org`) and the user attributes, is kept.
   */
  private static readonly TRANSIENT_ID_TOKEN_CLAIMS: string[] = [
    'acr',
    'amr',
    'at_hash',
    'azp',
    'c_hash',
    'isk',
    'jti',
    'nbf',
    'nonce',
    'sid',
  ];

  /**
   * Reduces a decoded ID token to the claims worth keeping in the session cookie.
   *
   * @param decodedIdToken - The decoded ID token payload, if one was issued.
   * @returns The claims to persist, or `undefined` when there is no ID token.
   */
  static toIdTokenClaims(decodedIdToken?: Record<string, unknown> | null): Record<string, unknown> | undefined {
    if (!decodedIdToken || typeof decodedIdToken !== 'object') {
      return undefined;
    }

    return Object.fromEntries(
      Object.entries(decodedIdToken).filter(
        ([claim, value]: [string, unknown]) => value !== undefined && !this.TRANSIENT_ID_TOKEN_CLAIMS.includes(claim),
      ),
    );
  }

  /**
   * Browsers store at most 4096 bytes per cookie (name, value and attributes together) and drop
   * larger ones, so the session token has to stay within that budget.
   */
  private static readonly MAX_COOKIE_BYTES: number = 4096;

  /**
   * Room left for the cookie attributes (`Path`, `Max-Age`, `HttpOnly`, `Secure`, `SameSite`)
   * that accompany the session token.
   */
  private static readonly COOKIE_ATTRIBUTES_HEADROOM_BYTES: number = 128;

  /**
   * ID token claims the SDK itself reads: the organization claims behind `getCurrentOrganization()`
   * and the basic identity claims behind the ID-token fallback of `getUser()`. When the full claim
   * set does not fit into the session cookie, the persisted claims are reduced to these.
   */
  private static readonly ESSENTIAL_ID_TOKEN_CLAIMS: string[] = [
    'aud',
    'email',
    'exp',
    'family_name',
    'given_name',
    'iat',
    'iss',
    'name',
    'org_handle',
    'org_id',
    'org_name',
    'preferred_username',
    'sub',
    'user_org',
    'username',
  ];

  /**
   * The largest session token, in bytes, that still fits into a browser cookie together with the
   * cookie name and attributes.
   */
  static getSessionCookieValueBudget(): number {
    return this.MAX_COOKIE_BYTES - this.getSessionCookieName().length - this.COOKIE_ATTRIBUTES_HEADROOM_BYTES;
  }

  /**
   * The organization claims behind `getCurrentOrganization()`: the smallest claim set worth keeping
   * when not even the essential claims fit into the session cookie.
   */
  private static readonly ORGANIZATION_ID_TOKEN_CLAIMS: string[] = [
    'org_handle',
    'org_id',
    'org_name',
    'sub',
    'user_org',
  ];

  private static pickIdTokenClaims(
    idTokenClaims: Record<string, unknown>,
    claimNames: string[],
  ): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(idTokenClaims).filter(([claim]: [string, unknown]) => claimNames.includes(claim)),
    );
  }

  /**
   * Reduces persisted ID token claims to the ones the SDK itself reads
   * (see {@link SessionManager.ESSENTIAL_ID_TOKEN_CLAIMS}).
   */
  static toEssentialIdTokenClaims(idTokenClaims: Record<string, unknown>): Record<string, unknown> {
    return this.pickIdTokenClaims(idTokenClaims, this.ESSENTIAL_ID_TOKEN_CLAIMS);
  }

  /**
   * Reduces persisted ID token claims to the organization claims only
   * (see {@link SessionManager.ORGANIZATION_ID_TOKEN_CLAIMS}).
   */
  static toOrganizationIdTokenClaims(idTokenClaims: Record<string, unknown>): Record<string, unknown> {
    return this.pickIdTokenClaims(idTokenClaims, this.ORGANIZATION_ID_TOKEN_CLAIMS);
  }

  /**
   * Creates the signed session token that is stored in the session cookie.
   *
   * A cookie above the browser limit is dropped silently, which would leave the user without a
   * session right after signing in or refreshing. The ID token claims are the only part of the
   * payload whose size the SDK controls, so when the token exceeds the cookie budget they are
   * narrowed step by step: to the essential identity and organization claims, then to the
   * organization claims alone, and finally left out entirely. Any reduction is logged at `warn`
   * level. The session stays cookie-only on purpose; there is no server-side store to fall back to.
   */
  static async createSessionToken(
    accessToken: string,
    userId: string,
    sessionId: string,
    scopes: string,
    accessTokenTtlSeconds: number,
    refreshToken: string,
    organizationId?: string,
    idTokenClaims?: Record<string, unknown>,
  ): Promise<string> {
    const secret: Uint8Array = this.getSecret();
    const expirationTime: number = Math.floor(Date.now() / 1000) + accessTokenTtlSeconds;
    const budget: number = this.getSessionCookieValueBudget();

    const sign = (claims?: Record<string, unknown>): Promise<string> =>
      new SignJWT({
        accessToken,
        idTokenClaims: claims,
        organizationId,
        refreshToken,
        scopes,
        sessionId,
        type: 'session',
      } as Omit<SessionTokenPayload, 'sub' | 'iat' | 'exp'>)
        .setProtectedHeader({alg: 'HS256'})
        .setSubject(userId)
        .setIssuedAt()
        .setExpirationTime(expirationTime)
        .sign(secret);

    // A compact JWT is ASCII, so its length is its size in bytes.
    let jwt: string = await sign(idTokenClaims);

    if (idTokenClaims && jwt.length > budget) {
      let keptClaims: string = 'only the essential ID token claims';
      jwt = await sign(this.toEssentialIdTokenClaims(idTokenClaims));

      if (jwt.length > budget) {
        keptClaims = 'only the organization claims of the ID token';
        jwt = await sign(this.toOrganizationIdTokenClaims(idTokenClaims));
      }

      if (jwt.length > budget) {
        // Without claims, the ID token fallbacks behave as they did before the claims were persisted.
        keptClaims = 'none of the ID token claims';
        jwt = await sign(undefined);
      }

      logger.warn(
        `[SessionManager] The ID token claims do not fit into the session cookie (budget: ${budget} bytes); ${keptClaims} are kept in the session.`,
      );
    }

    if (jwt.length > budget) {
      logger.warn(
        `[SessionManager] The session cookie value is ${jwt.length} bytes, above the ${budget}-byte budget; the browser may drop the cookie.`,
      );
    }

    return jwt;
  }

  /**
   * Verify and decode a session token
   */
  static async verifySessionToken(token: string): Promise<SessionTokenPayload> {
    try {
      const secret: Uint8Array = this.getSecret();
      const {payload} = await jwtVerify(token, secret);

      if (payload['type'] !== 'session') {
        throw new Error('Invalid token type');
      }

      return payload as SessionTokenPayload;
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Invalid session token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'invalid-session-token',
        'nextjs',
        'Session token verification failed',
      );
    }
  }

  /**
   * Verify a session token for refresh. Validates the HMAC signature and the
   * `type === 'session'` discriminant but intentionally skips the `exp` check
   * so an expired access token can still be exchanged for a new one.
   *
   * Session lifetime is still bounded — the cookie's `maxAge` is set from
   * `sessionCookieExpiryTime`, so the browser drops an over-age session regardless
   * of the access-token exp embedded in the JWT.
   *
   * Never use the returned payload for authorization.
   */
  static async verifySessionTokenForRefresh(token: string): Promise<SessionTokenPayload> {
    try {
      const secret: Uint8Array = this.getSecret();
      const {payload: rawPayload} = await compactVerify(token, secret);
      const payload: SessionTokenPayload = JSON.parse(new TextDecoder().decode(rawPayload)) as SessionTokenPayload;

      if (payload.type !== 'session') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Invalid session token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'invalid-session-token-for-refresh',
        'nextjs',
        'Session token signature or type check failed during refresh',
      );
    }
  }

  /**
   * Verify and decode a temporary session token
   */
  static async verifyTempSession(token: string): Promise<{sessionId: string}> {
    try {
      const secret: Uint8Array = this.getSecret();
      const {payload} = await jwtVerify(token, secret);

      if (payload['type'] !== 'temp') {
        throw new Error('Invalid token type');
      }

      return {sessionId: payload['sessionId'] as string};
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Invalid temporary session token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'invalid-temp-session-token',
        'nextjs',
        'Temporary session token verification failed',
      );
    }
  }

  /**
   * Get session cookie options
   */
  static getSessionCookieOptions(maxAge: number): {
    httpOnly: boolean;
    maxAge: number;
    path: string;
    sameSite: 'lax';
    secure: boolean;
  } {
    return {
      httpOnly: true,
      maxAge,
      path: '/',
      sameSite: 'lax' as const,
      secure: process.env['NODE_ENV'] === 'production',
    };
  }

  /**
   * Get temporary session cookie options
   */
  static getTempSessionCookieOptions(): {
    httpOnly: boolean;
    maxAge: number;
    path: string;
    sameSite: 'lax';
    secure: boolean;
  } {
    return {
      httpOnly: true,
      maxAge: 15 * 60,
      path: '/',
      sameSite: 'lax' as const,
      secure: process.env['NODE_ENV'] === 'production',
    };
  }

  /**
   * Get session cookie name
   */
  static getSessionCookieName(): string {
    return CookieConfig.SESSION_COOKIE_NAME;
  }

  /**
   * Get temporary session cookie name
   */
  static getTempSessionCookieName(): string {
    return CookieConfig.TEMP_SESSION_COOKIE_NAME;
  }
}

export default SessionManager;
