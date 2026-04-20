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

'use server';

import {AsgardeoAPIError, logger, TokenResponse} from '@asgardeo/node';
import {cookies} from 'next/headers';
import AsgardeoNextClient from '../../AsgardeoNextClient';
import {AsgardeoNextConfig} from '../../models/config';
import SessionManager, {SessionTokenPayload} from '../../utils/SessionManager';
import tokenRefreshCore, {TokenRefreshCoreResult} from '../../utils/tokenRefreshCore';

type RequestCookies = Awaited<ReturnType<typeof cookies>>;

/**
 * Server action to refresh the access token using the stored refresh token.
 * Exchanges the refresh token for a new token set and updates the session cookie.
 *
 * Delegates the HTTP exchange to tokenRefreshCore so the same logic is shared
 * with the middleware token refresh path.
 *
 * Called from the client side (e.g. AsgardeoClientProvider refreshOnMount) where
 * Next.js allows cookie mutation. When invoked during SSR rendering the cookie
 * write is silently skipped and a warning is logged.
 */
const refreshToken = async (): Promise<TokenResponse> => {
  try {
    const cookieStore: RequestCookies = await cookies();
    const sessionToken: string | undefined = cookieStore.get(SessionManager.getSessionCookieName())?.value;

    if (!sessionToken) {
      throw new AsgardeoAPIError(
        'No active session found. User must be signed in to refresh the token.',
        'refreshToken-ServerActionError-002',
        'nextjs',
        401,
      );
    }

    const sessionPayload: SessionTokenPayload = await SessionManager.verifySessionToken(sessionToken);
    const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();
    const config: AsgardeoNextConfig = await (client.getConfiguration() as unknown as Promise<AsgardeoNextConfig>);

    const result: TokenRefreshCoreResult = await tokenRefreshCore(sessionPayload, {
      baseUrl: config.baseUrl ?? '',
      clientId: config.clientId ?? '',
      clientSecret: config.clientSecret ?? '',
      sessionExpirySeconds: config.sessionExpirySeconds,
    });

    try {
      cookieStore.set(
        SessionManager.getSessionCookieName(),
        result.newSessionToken,
        SessionManager.getSessionCookieOptions(result.sessionExpirySeconds),
      );
    } catch {
      // cookies().set() is only permitted inside a Server Action invoked from the client
      // or a Route Handler. When this action is called during SSR rendering the write
      // is blocked by Next.js. The middleware refresh path handles that case instead.
      logger.warn('[refreshToken] Could not write session cookie — called from SSR rendering context.');
    }

    logger.debug('[refreshToken] Token refresh succeeded.');
    return result.tokenResponse;
  } catch (error) {
    // Clear the dead session cookie before throwing so the browser is not left
    // holding a stale credential. This is best-effort — if called from an SSR
    // rendering context Next.js blocks cookie mutation; the middleware cleanup
    // path covers that case on the next request.
    try {
      const cookieStore: RequestCookies = await cookies();
      cookieStore.delete(SessionManager.getSessionCookieName());
      logger.debug('[refreshToken] Cleared session cookie after refresh failure.');
    } catch {
      // Intentionally swallowed — middleware handles cleanup when mutation is blocked.
    }

    throw new AsgardeoAPIError(
      `Failed to refresh the session: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      'refreshToken-ServerActionError-001',
      'nextjs',
      error instanceof AsgardeoAPIError ? error.statusCode : undefined,
    );
  }
};

export default refreshToken;
