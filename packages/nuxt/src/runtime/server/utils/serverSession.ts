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

import type {H3Event} from 'h3';
import {getCookie, createError} from 'h3';
import {verifySessionToken, getSessionCookieName} from './session';
import type {AsgardeoSessionPayload} from '../../types';
import {useRuntimeConfig} from '#imports';

/**
 * Get the current session from the request cookie.
 * Returns the session payload if valid, or null if no session exists.
 *
 * Use this in custom server API routes to access session data.
 *
 * @example
 * ```ts
 * // server/api/me.get.ts
 * export default defineEventHandler(async (event) => {
 *   const session = await useServerSession(event);
 *   if (!session) {
 *     throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
 *   }
 *   return { sessionId: session.sessionId, sub: session.sub };
 * });
 * ```
 */
export async function useServerSession(event: H3Event): Promise<AsgardeoSessionPayload | null> {
  const config = useRuntimeConfig();
  const sessionSecret = config.asgardeo?.sessionSecret;

  const sessionCookie = getCookie(event, getSessionCookieName());
  if (!sessionCookie) {
    return null;
  }

  try {
    return await verifySessionToken(sessionCookie, sessionSecret);
  } catch {
    return null;
  }
}

/**
 * Get the current session or throw a 401 error.
 * Use this when the route must be authenticated.
 *
 * @example
 * ```ts
 * // server/api/protected-data.get.ts
 * export default defineEventHandler(async (event) => {
 *   const session = await requireServerSession(event);
 *   // session is guaranteed to be non-null here
 *   return { userId: session.sub };
 * });
 * ```
 */
export async function requireServerSession(event: H3Event): Promise<AsgardeoSessionPayload> {
  const session = await useServerSession(event);
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Authentication required.',
    });
  }
  return session;
}
