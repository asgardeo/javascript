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

import type {Ref} from 'vue';
import type {
  HttpRequestConfig,
  HttpResponse,
  IdToken,
  Organization,
  SignInOptions,
  TokenExchangeRequestConfig,
  TokenResponse,
} from '@asgardeo/browser';
import type {AsgardeoVueConfig} from './config';
import type AsgardeoVueClient from '../AsgardeoVueClient';

/**
 * Shape of the core Asgardeo context provided via `provide`/`inject`.
 *
 * Reactive refs are exposed as `Readonly<Ref<T>>` so consumers can read
 * them in templates and `watch()` calls but cannot mutate them directly.
 */
export interface AsgardeoContext {
  /** The `afterSignInUrl` from the config. */
  afterSignInUrl: string | undefined;
  /** The Asgardeo application ID from the config. */
  applicationId: string | undefined;
  /** The base URL of the Asgardeo tenant. */
  baseUrl: string | undefined;
  /** The OAuth2 client ID. */
  clientId: string | undefined;
  /** The instance ID for multi-instance support. */
  instanceId: number;

  // ── Reactive Auth State ──

  /** Whether the SDK has finished initializing. */
  isInitialized: Readonly<Ref<boolean>>;
  /** Whether the SDK is performing a background operation. */
  isLoading: Readonly<Ref<boolean>>;
  /** Whether the user is currently signed in. */
  isSignedIn: Readonly<Ref<boolean>>;
  /** The current user object, or `null` if not signed in. */
  user: Readonly<Ref<any | null>>;
  /** The current organization, or `null`. */
  organization: Readonly<Ref<Organization | null>>;

  // ── Auth Actions ──

  signIn: (...args: any[]) => Promise<any>;
  signOut: (...args: any[]) => Promise<any>;
  signUp: (...args: any[]) => Promise<any>;
  signInSilently: (options?: SignInOptions) => Promise<any>;

  // ── Token ──

  getAccessToken: () => Promise<string>;
  getDecodedIdToken: () => Promise<IdToken>;
  getIdToken: () => Promise<string>;
  exchangeToken: (config: TokenExchangeRequestConfig) => Promise<TokenResponse | Response>;

  // ── HTTP ──

  http: {
    request: (requestConfig?: HttpRequestConfig) => Promise<HttpResponse<any>>;
    requestAll: (requestConfigs?: HttpRequestConfig[]) => Promise<HttpResponse<any>[]>;
  };

  // ── Organization ──

  switchOrganization: AsgardeoVueClient['switchOrganization'];

  // ── Lifecycle ──

  reInitialize: (config: Partial<AsgardeoVueConfig>) => Promise<boolean>;
  clearSession: (...args: any[]) => void;

  // ── Config ──

  signInOptions: SignInOptions | undefined;
  signInUrl: string | undefined;
  signUpUrl: string | undefined;
  organizationHandle: string | undefined;
  storage: AsgardeoVueConfig['storage'] | undefined;
  platform: AsgardeoVueConfig['platform'] | undefined;
}
