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

import {TokenExchangeRequestConfig, TokenResponse, User, UserProfile} from '@asgardeo/node';
import clearSessionAction from './actions/clearSession';
import getSessionIdAction from './actions/getSessionId';
import getSessionPayloadAction from './actions/getSessionPayload';
import isSignedInAction from './actions/isSignedIn';
import signOutAction from './actions/signOutAction';
import AsgardeoNextClient from '../AsgardeoNextClient';
import {AsgardeoNextConfig} from '../models/config';
import {SessionTokenPayload} from '../utils/SessionManager';

/**
 * Server-side helper for Server Components, Route Handlers and Server Actions.
 *
 * @example
 * ```ts
 * import {asgardeo} from '@asgardeo/nextjs/server';
 *
 * export default async function Page() {
 *   const {isSignedIn, getUser} = await asgardeo();
 *
 *   if (!(await isSignedIn())) {
 *     redirect('/signin');
 *   }
 *
 *   const user = await getUser();
 *   ...
 * }
 * ```
 */
const asgardeo = async (): Promise<{
  /** Deletes the session cookies without contacting the identity server. */
  clearSession: () => Promise<void>;
  exchangeToken: (config: TokenExchangeRequestConfig, sessionId: string) => Promise<TokenResponse | Response>;
  getAccessToken: (sessionId: string) => Promise<string>;
  /** The verified session cookie payload, or `undefined` when there is no valid session. */
  getSession: () => Promise<SessionTokenPayload | undefined>;
  getSessionId: () => Promise<string | undefined>;
  /** The signed-in user (SCIM2 profile, falling back to the ID token claims). */
  getUser: (sessionId?: string) => Promise<User>;
  /** The signed-in user's profile with its schemas. */
  getUserProfile: (sessionId?: string) => Promise<UserProfile>;
  isSignedIn: (sessionId?: string) => Promise<boolean>;
  reInitialize: (config: Partial<AsgardeoNextConfig>) => Promise<boolean>;
  /** Signs the user out: clears the session cookies and resolves the identity server's logout URL. */
  signOut: () => Promise<{data?: {afterSignOutUrl?: string}; error?: unknown; success: boolean}>;
}> => {
  const getAccessToken = async (sessionId: string): Promise<string> => {
    const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();
    return client.getAccessToken(sessionId);
  };

  const getSessionId = async (): Promise<string | undefined> => getSessionIdAction();

  const getSession = async (): Promise<SessionTokenPayload | undefined> => getSessionPayloadAction();

  const isSignedIn = async (sessionId?: string): Promise<boolean> => isSignedInAction(sessionId);

  const getUser = async (sessionId?: string): Promise<User> => {
    const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();
    return client.getUser(sessionId);
  };

  const getUserProfile = async (sessionId?: string): Promise<UserProfile> => {
    const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();
    return client.getUserProfile(sessionId);
  };

  const signOut = async (): Promise<{data?: {afterSignOutUrl?: string}; error?: unknown; success: boolean}> =>
    signOutAction();

  const clearSession = async (): Promise<void> => clearSessionAction();

  const exchangeToken = async (
    config: TokenExchangeRequestConfig,
    sessionId: string,
  ): Promise<TokenResponse | Response> => {
    const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();
    return client.exchangeToken(config, sessionId);
  };

  const reInitialize = async (config: Partial<AsgardeoNextConfig>): Promise<boolean> => {
    const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();
    return client.reInitialize(config);
  };

  return {
    clearSession,
    exchangeToken,
    getAccessToken,
    getSession,
    getSessionId,
    getUser,
    getUserProfile,
    isSignedIn,
    reInitialize,
    signOut,
  };
};

export default asgardeo;
