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
import {TokenExchangeRequestConfig, TokenResponse} from '@asgardeo/node';
import AsgardeoNextClient from '../../AsgardeoNextClient';
import SessionManager from '../../utils/SessionManager';

/**
 * Exchange tokens based on the provided configuration.
 * This supports various token exchange grant types like organization switching.
 *
 * @param config - Token exchange request configuration
 * @param sessionId - Optional session ID for the exchange
 * @returns The token response from the exchange operation
 * @throws {AsgardeoRuntimeError} If the token exchange fails
 */
const exchangeToken = async (
  config: TokenExchangeRequestConfig,
  sessionId?: string,
): Promise<TokenResponse | Response | undefined> => {
  let resolvedSessionId: string | undefined = sessionId;

  if (!resolvedSessionId) {
    const cookieStore: ReadonlyRequestCookies = await cookies();
    const sessionToken = cookieStore.get(SessionManager.getSessionCookieName())?.value;

    if (sessionToken) {
      try {
        const sessionPayload = await SessionManager.verifySessionToken(sessionToken);
        resolvedSessionId = sessionPayload['sessionId'] as string;
      } catch (error) {
        return undefined;
      }
    }
  }

  if (!resolvedSessionId) {
    return undefined;
  }

  const client = AsgardeoNextClient.getInstance();
  try {
    return await client.exchangeToken(config, resolvedSessionId);
  } catch (error) {
    return undefined;
  }
};

export default exchangeToken;
