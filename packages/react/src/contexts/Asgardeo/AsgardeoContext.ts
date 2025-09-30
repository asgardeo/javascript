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

import {Context, createContext} from 'react';
import {
  HttpRequestConfig,
  HttpResponse,
  IdToken,
  Organization,
  SignInOptions,
  TokenExchangeRequestConfig,
  TokenResponse,
} from '@asgardeo/browser';
import AsgardeoReactClient from '../../AsgardeoReactClient';
import {AsgardeoReactConfig} from '../../models/config';

/**
 * Props interface of {@link AsgardeoContext}
 */
export type AsgardeoContextProps = {
  organizationHandle: string | undefined;
  applicationId: string | undefined;
  signInUrl: string | undefined;
  signUpUrl: string | undefined;
  afterSignInUrl: string | undefined;
  baseUrl: string | undefined;
  isInitialized: boolean;
  /**
   * Flag indicating whether the SDK is working in the background.
   */
  isLoading: boolean;
  /**
   * Flag indicating whether the user is signed in or not.
   */
  isSignedIn: boolean;
  /**
   * Sign-in function to initiate the authentication process.
   * @remark This is the programmatic version of the `SignInButton` component.
   * TODO: Fix the types.
   */
  signIn: any;
  signInSilently: AsgardeoReactClient['signInSilently'];
  /**
   * Sign-out function to terminate the authentication session.
   * @remark This is the programmatic version of the `SignOutButton` component.
   * FIXME: Fix the types.
   */
  signOut: any;
  /**
   * Sign-up function to initiate the registration process.
   * @remark This is the programmatic version of the `SignUpButton` component.
   * FIXME: Fix the types.
   */
  signUp: any;
  user: any;
  organization: Organization;
  /**
   * HTTP request function to make API calls.
   * @param requestConfig - Configuration for the HTTP request.
   * @returns A promise that resolves to the HTTP response.
   */
  http: {
    /**
     * Makes an HTTP request using the provided configuration.
     * @param requestConfig - Configuration for the HTTP request.
     * @returns A promise that resolves to the HTTP response.
     */
    request: (requestConfig?: HttpRequestConfig) => Promise<HttpResponse<any>>;
    /**
     * Makes multiple HTTP requests based on the provided configuration.
     * @param requestConfigs - Set of configurations for the HTTP requests.
     * @returns A promise that resolves to an array of HTTP responses.
     */
    requestAll: (requestConfigs?: HttpRequestConfig[]) => Promise<HttpResponse<any>[]>;
  };
  /**
   * Optional additional parameters to be sent in the sign-in request.
   * This can include custom parameters that your authorization server supports.
   * These parameters will be included in the authorization request sent to the server.
   * If not provided, no additional parameters will be sent.
   *
   * @example
   * signInOptions: { prompt: "login", fidp: "OrganizationSSO" }
   */
  signInOptions: SignInOptions;
  /**
   * Function to retrieve the decoded ID token.
   * This function decodes the ID token and returns its payload.
   * It can be used to access user claims and other information contained in the ID token.
   *
   * @returns A promise that resolves to the decoded ID token payload.
   */
  getDecodedIdToken: () => Promise<IdToken>;

  /**
   * Retrieves the access token stored in the storage.
   * This function retrieves the access token and returns it.
   * @remarks This does not work in the `webWorker` or any other worker environment.
   * @returns A promise that resolves to the access token.
   */
  getAccessToken: () => Promise<string>;

  /**
   * Swaps the current access token with a new one based on the provided configuration (with a grant type).
   * @param config - Configuration for the token exchange request.
   * @returns A promise that resolves to the token response or the raw response.
   */
  exchangeToken: (config: TokenExchangeRequestConfig) => Promise<TokenResponse | Response>;

  /**
   * Re-initializes the client with a new configuration.
   *
   * @remarks
   * This can be partial configuration to update only specific fields.
   *
   * @param config - New configuration to re-initialize the client with.
   * @returns Promise resolving to boolean indicating success.
   */
  reInitialize: (config: Partial<AsgardeoReactConfig>) => Promise<boolean>;
} & Pick<AsgardeoReactConfig, 'storage'>;

/**
 * Context object for managing the Authentication flow builder core context.
 */
const AsgardeoContext: Context<AsgardeoContextProps | null> = createContext<null | AsgardeoContextProps>({
  organizationHandle: undefined,
  applicationId: undefined,
  signInUrl: undefined,
  signUpUrl: undefined,
  afterSignInUrl: undefined,
  baseUrl: undefined,
  isInitialized: false,
  isLoading: true,
  isSignedIn: false,
  organization: null,
  signIn: null,
  signInSilently: null,
  signOut: null,
  signUp: null,
  user: null,
  http: {
    request: () => null,
    requestAll: () => null,
  },
  signInOptions: {},
  getDecodedIdToken: null,
  getAccessToken: null,
  exchangeToken: null,
  storage: 'sessionStorage',
  reInitialize: null,
});

AsgardeoContext.displayName = 'AsgardeoContext';

export default AsgardeoContext;
