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

import getSessionId from './getSessionId';
import getSessionPayload from './getSessionPayload';
import AsgardeoNextClient from '../../AsgardeoNextClient';
import {SessionTokenPayload} from '../../utils/SessionManager';

/**
 * Check if the user is currently signed in.
 * First tries JWT session validation, then falls back to legacy session check.
 *
 * @param sessionId - Optional session ID to check (if not provided, gets from cookies)
 * @returns True if user is signed in, false otherwise
 */
const isSignedIn = async (sessionId?: string): Promise<boolean> => {
  try {
    const sessionPayload: SessionTokenPayload | undefined = await getSessionPayload();

    if (sessionPayload) {
      const resolvedSessionId: string = sessionPayload.sessionId;

      if (resolvedSessionId) {
        const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();
        try {
          const accessToken: string = await client.getAccessToken(resolvedSessionId);
          return !!accessToken;
        } catch (error) {
          return false;
        }
      }
    }

    const resolvedSessionId: string | undefined = sessionId || (await getSessionId());

    if (!resolvedSessionId) {
      return false;
    }

    const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();

    try {
      const accessToken: string = await client.getAccessToken(resolvedSessionId);

      return !!accessToken;
    } catch (error) {
      return false;
    }
  } catch {
    return false;
  }
};

export default isSignedIn;
