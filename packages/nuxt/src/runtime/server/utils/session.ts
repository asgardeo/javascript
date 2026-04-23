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

import {SignJWT, jwtVerify} from 'jose';
import {CookieConfig} from '@asgardeo/node';
import type {AsgardeoSessionPayload, AsgardeoTempSessionPayload} from '../../types';

const DEFAULT_EXPIRY_SECONDS = 3600;

/**
 * Get the signing secret from environment or runtime config.
 */
function getSecret(sessionSecret?: string): Uint8Array {
  const secret = sessionSecret || process.env['ASGARDEO_SESSION_SECRET'];

  if (!secret) {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error(
        '[asgardeo] ASGARDEO_SESSION_SECRET environment variable is required in production. ' +
        'Set it to a secure random string of at least 32 characters.',
      );
    }
    console.warn('[asgardeo] Using default session secret for development. Set ASGARDEO_SESSION_SECRET for production.');
    return new TextEncoder().encode('asgardeo-dev-secret-not-for-production');
  }

  return new TextEncoder().encode(secret);
}

/**
 * Create a signed JWT session token.
 */
export async function createSessionToken(
  params: {
    accessToken: string;
    userId: string;
    sessionId: string;
    scopes: string;
    organizationId?: string;
    expirySeconds?: number;
    /** Unix timestamp (seconds) when the access token expires. */
    accessTokenExpiresAt?: number;
    /** Refresh token for silent re-auth. */
    refreshToken?: string;
    /** Raw ID token string. */
    idToken?: string;
  },
  sessionSecret?: string,
): Promise<string> {
  const secret = getSecret(sessionSecret);

  return new SignJWT({
    accessToken: params.accessToken,
    scopes: params.scopes,
    sessionId: params.sessionId,
    organizationId: params.organizationId,
    accessTokenExpiresAt: params.accessTokenExpiresAt,
    refreshToken: params.refreshToken,
    idToken: params.idToken,
    type: 'session',
  } as Omit<AsgardeoSessionPayload, 'sub' | 'iat' | 'exp'>)
    .setProtectedHeader({alg: 'HS256'})
    .setSubject(params.userId)
    .setIssuedAt()
    .setExpirationTime(Date.now() / 1000 + (params.expirySeconds ?? DEFAULT_EXPIRY_SECONDS))
    .sign(secret);
}

/**
 * Create a signed JWT temp session token (used during OAuth flow).
 */
export async function createTempSessionToken(
  sessionId: string,
  sessionSecret?: string,
  returnTo?: string,
): Promise<string> {
  const secret = getSecret(sessionSecret);

  const payload: Record<string, unknown> = {
    sessionId,
    type: 'temp',
  };

  if (returnTo) {
    payload['returnTo'] = returnTo;
  }

  return new SignJWT(payload)
    .setProtectedHeader({alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}

/**
 * Verify and decode a session JWT.
 */
export async function verifySessionToken(
  token: string,
  sessionSecret?: string,
): Promise<AsgardeoSessionPayload> {
  const secret = getSecret(sessionSecret);
  const {payload} = await jwtVerify(token, secret);
  return payload as AsgardeoSessionPayload;
}

/**
 * Verify and decode a temp session JWT.
 */
export async function verifyTempSessionToken(
  token: string,
  sessionSecret?: string,
): Promise<{sessionId: string; returnTo?: string}> {
  const secret = getSecret(sessionSecret);
  const {payload} = await jwtVerify(token, secret);

  if (payload['type'] !== 'temp') {
    throw new Error('Invalid token type: expected temp session');
  }

  return {
    sessionId: payload['sessionId'] as string,
    returnTo: payload['returnTo'] as string | undefined,
  };
}

/**
 * Session cookie name.
 */
export function getSessionCookieName(): string {
  return CookieConfig.SESSION_COOKIE_NAME;
}

/**
 * Temp session cookie name.
 */
export function getTempSessionCookieName(): string {
  return CookieConfig.TEMP_SESSION_COOKIE_NAME;
}

/**
 * Session cookie options.
 */
export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: DEFAULT_EXPIRY_SECONDS,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env['NODE_ENV'] === 'production',
  };
}

/**
 * Temp session cookie options (15 min TTL).
 */
export function getTempSessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: 15 * 60,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env['NODE_ENV'] === 'production',
  };
}
