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

import {AsgardeoContextProps as AsgardeoReactContextProps} from '@asgardeo/react';
import {Context, createContext} from 'react';

/**
 * Props interface of {@link AsgardeoContext}
 */
export type AsgardeoContextProps = Partial<AsgardeoReactContextProps>;

/**
 * Context object for managing the Authentication flow builder core context.
 */
const AsgardeoContext: Context<AsgardeoContextProps | null> = createContext<null | AsgardeoContextProps>({
  rootOrganizationHandle: undefined,
  organizationHandle: undefined,
  applicationId: undefined,
  signInUrl: undefined,
  signUpUrl: undefined,
  afterSignInUrl: undefined,
  baseUrl: undefined,
  isInitialized: false,
  isLoading: true,
  isSignedIn: false,
  signIn: null,
  signOut: null,
  signUp: null,
  user: null,
});

AsgardeoContext.displayName = 'AsgardeoContext';

export default AsgardeoContext;
