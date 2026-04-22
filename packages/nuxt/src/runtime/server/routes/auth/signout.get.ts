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

import {defineEventHandler, getCookie, deleteCookie, sendRedirect} from 'h3';
import {useAsgardeoServerClient} from '../../utils/client';
import {
  verifySessionToken,
  getSessionCookieName,
  getSessionCookieOptions,
  getTempSessionCookieName,
  getTempSessionCookieOptions,
} from '../../utils/session';
import {useRuntimeConfig} from '#imports';

/**
 * GET /api/auth/signout
 *
 * Signs the user out by:
 * 1. Getting the sign-out URL from Asgardeo (for RP-Initiated Logout)
 * 2. Clearing all session cookies
 * 3. Redirecting to Asgardeo's logout endpoint
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const sessionSecret = config.asgardeo?.sessionSecret;
  const publicConfig = config.public.asgardeo;

  const clearCookies = () => {
    deleteCookie(event, getSessionCookieName(), getSessionCookieOptions());
    deleteCookie(event, getTempSessionCookieName(), getTempSessionCookieOptions());
  };

  // Try to get the session ID from the JWT cookie
  const sessionCookie = getCookie(event, getSessionCookieName());
  if (!sessionCookie) {
    clearCookies();
    return sendRedirect(event, publicConfig.afterSignOutUrl || '/', 302);
  }

  let sessionId: string;
  try {
    const session = await verifySessionToken(sessionCookie, sessionSecret);
    sessionId = session.sessionId;
  } catch {
    // Invalid session — just clear cookies and redirect
    clearCookies();
    return sendRedirect(event, publicConfig.afterSignOutUrl || '/', 302);
  }

  try {
    const client = useAsgardeoServerClient(event);
    const signOutUrl = await client.signOut(sessionId);

    clearCookies();

    if (signOutUrl) {
      return sendRedirect(event, signOutUrl, 302);
    }

    return sendRedirect(event, publicConfig.afterSignOutUrl || '/', 302);
  } catch (err: any) {
    console.error('[asgardeo] Sign-out error:', err?.message || err);
    clearCookies();
    return sendRedirect(event, publicConfig.afterSignOutUrl || '/', 302);
  }
});
