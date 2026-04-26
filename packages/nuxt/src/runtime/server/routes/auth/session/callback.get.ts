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

import type {TokenResponse} from '@asgardeo/node';
import {defineEventHandler, getQuery, getCookie, deleteCookie, sendRedirect, createError} from 'h3';
import AsgardeoNuxtClient from '../../../AsgardeoNuxtClient';
import {
  issueSessionCookie,
  verifyTempSessionToken,
  getTempSessionCookieName,
  getTempSessionCookieOptions,
} from '../../../utils/session';
import {useRuntimeConfig} from '#imports';

/**
 * GET /api/auth/callback
 *
 * Handles the OAuth2 callback from Asgardeo.
 * Exchanges the authorization code for tokens,
 * creates a signed session JWT cookie,
 * and redirects to afterSignInUrl.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const sessionSecret = config.asgardeo?.sessionSecret;
  const publicConfig = config.public.asgardeo;

  const query = getQuery(event);
  const code = query['code'] as string | undefined;
  const state = query['state'] as string | undefined;
  const sessionState = query['session_state'] as string | undefined;
  const error = query['error'] as string | undefined;
  const errorDescription = query['error_description'] as string | undefined;

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: `Authentication failed: ${errorDescription || error}`,
    });
  }

  if (!code || !state) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required OAuth parameters: code and state are required.',
    });
  }

  // Retrieve and verify temp session
  const tempSessionCookie = getCookie(event, getTempSessionCookieName());
  if (!tempSessionCookie) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No temporary session found. Please start the sign-in flow again.',
    });
  }

  let sessionId: string;
  let returnTo: string | undefined;
  try {
    const tempSession = await verifyTempSessionToken(tempSessionCookie, sessionSecret);
    sessionId = tempSession.sessionId;
    returnTo = tempSession.returnTo;
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid or expired temporary session. Please start the sign-in flow again.',
    });
  }

  // Exchange authorization code for tokens using the Node SDK.
  const client = AsgardeoNuxtClient.getInstance();

  let tokenResponse: TokenResponse;
  try {
    tokenResponse = await client.signIn(
      () => {}, // no-op redirect callback (we're handling the code exchange)
      sessionId,
      code,
      sessionState || '',
      state,
    );
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Token exchange failed.',
      data: err?.message || 'An unexpected error occurred during token exchange.',
    });
  }

  if (!tokenResponse?.accessToken && !tokenResponse?.idToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Token exchange failed: Invalid response from Identity Provider.',
    });
  }

  // Create signed session JWT and set cookie
  try {
    await issueSessionCookie(event, sessionId, tokenResponse, sessionSecret);
    deleteCookie(event, getTempSessionCookieName(), getTempSessionCookieOptions());
  } catch (err: any) {
    console.error('[asgardeo] Failed to create JWT session:', err?.message || err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to establish session after authentication.',
    });
  }

  // Redirect to returnTo (from sign-in request) or configured afterSignInUrl
  const redirectUrl = returnTo || publicConfig.afterSignInUrl || '/';
  return sendRedirect(event, redirectUrl, 302);
});
