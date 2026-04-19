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
import {SignJWT, jwtVerify, decodeJwt, JWTPayload} from 'jose';
import {DEFAULT_SESSION_EXPIRY_SECONDS} from './constants';

/**
 * Session token payload interface
 */
export interface SessionTokenPayload extends JWTPayload {
  /** Expiration timestamp — doubles as the access token expiry (JWT exp == access token exp) */
  exp: number;
  /** Issued at timestamp */
  iat: number;
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
   * Resolve the session expiry in seconds.
   *
   * Resolution order (first defined value wins):
   *   1. `configuredExpiry` — value from `AsgardeoNextConfig.sessionExpirySeconds`
   *   2. `ASGARDEO_SESSION_EXPIRY_SECONDS` environment variable
   *   3. `DEFAULT_SESSION_EXPIRY_SECONDS` (24 hours)
   */
  static resolveSessionExpiry(configuredExpiry?: number): number {
    if (configuredExpiry != null && configuredExpiry > 0) {
      return configuredExpiry;
    }

    const envValue: string | undefined = process.env['ASGARDEO_SESSION_EXPIRY_SECONDS'];

    if (envValue) {
      const parsed: number = parseInt(envValue, 10);

      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return DEFAULT_SESSION_EXPIRY_SECONDS;
  }

  static async createSessionToken(
    accessToken: string,
    userId: string,
    sessionId: string,
    scopes: string,
    accessTokenTtlSeconds: number,
    refreshToken: string,
    organizationId?: string,
  ): Promise<string> {
    const secret: Uint8Array = this.getSecret();

    const jwt: string = await new SignJWT({
      accessToken,
      organizationId,
      refreshToken,
      scopes,
      sessionId,
      type: 'session',
    } as Omit<SessionTokenPayload, 'sub' | 'iat' | 'exp'>)
      .setProtectedHeader({alg: 'HS256'})
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + accessTokenTtlSeconds)
      .sign(secret);

    return jwt;
  }

  /**
   * Decode a session token without verifying the signature or expiry.
   * Use only to inspect an expired token (e.g. to extract a refresh token for renewal).
   * Never use the result to make authorization decisions.
   */
  static decodeSessionToken(token: string): SessionTokenPayload {
    return decodeJwt(token) as SessionTokenPayload;
  }

  /**
   * Verify and decode a session token
   */
  static async verifySessionToken(token: string): Promise<SessionTokenPayload> {
    try {
      const secret: Uint8Array = this.getSecret();
      const {payload} = await jwtVerify(token, secret);

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
