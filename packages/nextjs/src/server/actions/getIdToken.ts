/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
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

import {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import {cookies} from 'next/headers';
import SessionManager from '../../utils/SessionManager';

/**
 * Get the ID token from the session cookie.
 *
 * @returns The ID token if it exists, undefined otherwise
 */
const getIdToken = async (sessionId?: string): Promise<string | undefined> => {
  const cookieStore: ReadonlyRequestCookies = await cookies();

  const idToken = cookieStore.get(SessionManager.getSessionCookieName())?.value;

  if (idToken) {
    try {
      const sessionPayload = await SessionManager.verifySessionToken(idToken);
      return sessionPayload['idToken'] as string;
    } catch (error) {
      return undefined;
    }
  }

  return undefined;
};

export default getIdToken;
