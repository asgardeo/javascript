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

import {defineEventHandler, getCookie, createError} from 'h3';
import AsgardeoNuxtClient from '../../AsgardeoNuxtClient';
import {
  verifySessionToken,
  getSessionCookieName,
} from '../../utils/session';
import {useRuntimeConfig} from '#imports';

/**
 * GET /api/auth/user
 *
 * Returns user information for the current session.
 * Requires a valid session.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const sessionSecret = config.asgardeo?.sessionSecret;

  const sessionCookie = getCookie(event, getSessionCookieName());
  if (!sessionCookie) {
    throw createError({statusCode: 401, statusMessage: 'Unauthorized: No active session.'});
  }

  let sessionId: string;
  try {
    const session = await verifySessionToken(sessionCookie, sessionSecret);
    sessionId = session.sessionId;
  } catch {
    throw createError({statusCode: 401, statusMessage: 'Unauthorized: Invalid or expired session.'});
  }

  try {
    const client = AsgardeoNuxtClient.getInstance();
    return await client.getUser(sessionId);
  } catch {
    throw createError({statusCode: 500, statusMessage: 'Failed to retrieve user information.'});
  }
});
