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

import {
  AsgardeoAuthException,
  AuthClientConfig,
  AuthSPAClientConfig,
  Config,
  TokenExchangeRequestConfig,
  IdToken,
  Hooks,
  HttpClientInstance,
  HttpRequestConfig,
  HttpResponse,
  OIDCEndpoints,
  SignInConfig,
  User,
} from '@asgardeo/browser';

export interface ReactConfig {
  disableAutoSignIn?: boolean;
  /**
   * The `AuthProvider`, by default, looks for an active session in the server and updates the session information
   * with the latest session information from the server. This option could be used to disable that behaviour.
   */
  disableTrySignInSilently?: boolean;
  /**
   * The SDK's `AuthProvider` by default is listening to the URL changes to see
   * if `code` & `session_state` search params are available so that it could perform
   * token exchange. This option could be used to override that behaviour.
   */
  skipRedirectCallback?: boolean;
}

export type AuthReactConfig = AuthSPAClientConfig & ReactConfig;

/**
 * Interface for the Authenticated state of the user which is exposed
 * via `state` object from `useAuthContext` hook.
 */
export interface AuthStateInterface {
  /**
   * The display name of the user.
   */
  displayName?: string;
  /**
   * The email address of the user.
   */
  email?: string;
  /**
   * Are the Auth requests loading.
   */
  isLoading: boolean;
  /**
   * Specifies if the user is authenticated or not.
   */
  isSignedIn: boolean;
  /**
   * The username of the user.
   */
  username?: string;
}

export interface AuthContextInterface {
  disableHttpHandler(): Promise<boolean>;
  enableHttpHandler(): Promise<boolean>;
  error: AsgardeoAuthException;
  exchangeToken(config: TokenExchangeRequestConfig, callback?: (response: User | Response) => void): void;
  getAccessToken(): Promise<string>;
  getDecodedIDPIDToken(): Promise<IdToken>;
  getDecodedIdToken(sessionId?: string): Promise<IdToken>;
  getHttpClient(): Promise<HttpClientInstance>;
  getIdToken(): Promise<string>;
  getOpenIDProviderEndpoints(): Promise<OIDCEndpoints>;
  getUser(): Promise<User>;
  httpRequest(config: HttpRequestConfig): Promise<HttpResponse<any>>;
  httpRequestAll(configs: HttpRequestConfig[]): Promise<HttpResponse<any>[]>;
  isSignedIn(): Promise<boolean>;
  on(hook: Exclude<Hooks, Hooks.CustomGrant>, callback: (response?: any) => void): void;
  on(hook: Hooks.CustomGrant, callback: (response?: any) => void, id: string): void;
  on(hook: Hooks, callback: (response?: any) => void, id?: string): void;
  reInitialize(config: Partial<AuthClientConfig<Config>>): Promise<void>;
  refreshAccessToken(): Promise<User>;
  revokeAccessToken(): Promise<boolean>;
  signIn: (
    config?: SignInConfig,
    authorizationCode?: string,
    sessionState?: string,
    state?: string,
    callback?: (response: User) => void,
    tokenRequestConfig?: {
      params: Record<string, unknown>;
    },
  ) => Promise<User>;
  signInSilently: (
    additionalParams?: Record<string, string | boolean>,
    tokenRequestConfig?: {params: Record<string, unknown>},
  ) => Promise<boolean | User>;
  signOut: (callback?: (response: boolean) => void) => Promise<boolean>;
  state: AuthStateInterface;
}

/**
 * The model of the object returned by the `getAuthParams` prop method of the `AuthProvider`.
 */
export interface AuthParams {
  authorizationCode?: string;
  sessionState?: string;
  state?: string;
}
