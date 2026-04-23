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

import {createError, setCookie, type H3Event} from 'h3';
import {useRuntimeConfig} from '#imports';
import {requireServerSession} from './serverSession';
import {createSessionToken, getSessionCookieName, getSessionCookieOptions} from './session';

/**
 * Seconds before expiry at which we proactively refresh the access token.
 * Refreshing 60 s early avoids races where the token expires mid-request.
 */
const REFRESH_SKEW_SECONDS = 60;

/**
 * Shape of an OIDC token endpoint refresh response (snake_case JSON).
 */
interface OIDCTokenRefreshResponse {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  id_token?: string;
  token_type?: string;
  scope?: string;
}

/**
 * Return a valid access token for the current request.
 *
 * If the stored access token is still fresh (or has no expiry metadata —
 * e.g. sessions created before Phase 2), it is returned as-is.
 *
 * When the token is within `REFRESH_SKEW_SECONDS` of expiring and a
 * refresh token is present, a `refresh_token` grant is sent to the OIDC
 * token endpoint.  On success the session cookie is reissued with the new
 * tokens so subsequent calls within the same browser session are also fresh.
 *
 * Throws a 401 if the token is expired and no refresh token is available, or
 * if the refresh call itself fails.
 *
 * @example
 * ```ts
 * // In a Nitro API route:
 * export default defineEventHandler(async (event) => {
 *   const accessToken = await getValidAccessToken(event);
 *   // use accessToken to call a protected API
 * });
 * ```
 */
export async function getValidAccessToken(event: H3Event): Promise<string> {
  const session = await requireServerSession(event);
  const now = Math.floor(Date.now() / 1000);

  // If no expiry metadata (old session pre-Phase-2) or token still fresh, return as-is.
  if (!session.accessTokenExpiresAt || session.accessTokenExpiresAt - REFRESH_SKEW_SECONDS > now) {
    return session.accessToken;
  }

  // Token is expired (or within skew window). Attempt silent refresh.
  if (!session.refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Session expired. Please sign in again.',
    });
  }

  const config = useRuntimeConfig(event);
  const publicConfig = config.public.asgardeo;
  const privateConfig = config.asgardeo;

  const tokenEndpoint = `${publicConfig.baseUrl}/oauth2/token`;

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: session.refreshToken,
    client_id: publicConfig.clientId,
  });

  if (privateConfig?.clientSecret) {
    body.set('client_secret', privateConfig.clientSecret);
  }

  let refreshed: OIDCTokenRefreshResponse;
  try {
    const res = await fetch(tokenEndpoint, {
      method: 'POST',
      body,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => String(res.status));
      throw new Error(`Token endpoint returned ${res.status}: ${errText}`);
    }

    refreshed = (await res.json()) as OIDCTokenRefreshResponse;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[asgardeo] Token refresh failed:', msg);
    throw createError({
      statusCode: 401,
      statusMessage: 'Token refresh failed. Please sign in again.',
    });
  }

  // Re-issue session JWT with the refreshed tokens.
  const newSessionToken = await createSessionToken(
    {
      accessToken: refreshed.access_token,
      userId: session.sub,
      sessionId: session.sessionId,
      scopes: refreshed.scope ?? session.scopes,
      organizationId: session.organizationId,
      accessTokenExpiresAt: now + (refreshed.expires_in ?? 3600),
      refreshToken: refreshed.refresh_token ?? session.refreshToken,
      idToken: refreshed.id_token ?? session.idToken,
    },
    privateConfig?.sessionSecret,
  );

  setCookie(event, getSessionCookieName(), newSessionToken, getSessionCookieOptions());

  return refreshed.access_token;
}
