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

'use client';

import {IdToken, Organization, TokenResponse} from '@asgardeo/node';
import {AsgardeoContextProps as AsgardeoReactContextProps} from '@asgardeo/react';
import {Context, createContext} from 'react';
import {RefreshResult} from '../../../server/actions/refreshToken';

/**
 * Props interface of {@link AsgardeoContext}
 *
 * A subset of the React SDK's context: the raw tokens never reach the browser (they live in the HttpOnly
 * session cookie), so `getAccessToken`, `getIdToken` and `exchangeToken` are not available here. Use
 * `http.request` for authenticated calls and `getDecodedIdToken` for the ID token claims.
 */
export type AsgardeoContextProps = Partial<
  Omit<AsgardeoReactContextProps, 'getDecodedIdToken' | 'switchOrganization' | 'organization'>
> & {
  clearSession?: () => Promise<void>;
  /**
   * Returns the decoded ID token (its claims) of the signed-in user, resolved through a server action.
   */
  getDecodedIdToken?: () => Promise<IdToken>;
  /**
   * The organization the session belongs to, or `null` while signed out or unknown.
   */
  organization?: Organization | null;
  refreshToken?: () => Promise<RefreshResult>;
  /**
   * Switches the session to `organization` and re-renders the server components so the new organization,
   * user and organization list are picked up.
   */
  switchOrganization?: (organization: Organization) => Promise<TokenResponse | Response>;
};

/**
 * Context object for managing the Authentication flow builder core context.
 */
const AsgardeoContext: Context<AsgardeoContextProps | null> = createContext<null | AsgardeoContextProps>({
  afterSignInUrl: undefined,
  applicationId: undefined,
  baseUrl: undefined,
  clearSession: () => Promise.resolve(),
  clientId: undefined,
  getDecodedIdToken: () => Promise.resolve({} as IdToken),
  isInitialized: false,
  isLoading: true,
  isSignedIn: false,
  organization: null,
  organizationHandle: undefined,
  refreshToken: () => Promise.resolve({expiresAt: 0}),
  signIn: () => Promise.resolve({} as any),
  signInOptions: {},
  signInUrl: undefined,
  signOut: () => Promise.resolve({} as any),
  signUp: () => Promise.resolve({} as any),
  signUpUrl: undefined,
  switchOrganization: () => Promise.resolve({} as TokenResponse),
  user: null,
});

AsgardeoContext.displayName = 'AsgardeoContext';

export default AsgardeoContext;
