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
  AsgardeoSPAClient,
  AuthClientConfig,
  BasicUserInfo,
  Config,
  IdToken,
  Hooks,
  HttpClientInstance,
  HttpRequestConfig,
  HttpResponse,
  OIDCEndpoints,
  SignInConfig,
  SPACustomGrantConfig,
} from '@asgardeo/auth-spa';
import {reactive} from 'vue';
import {AuthStateInterface, AuthVueConfig} from './types';

class AuthAPI {
  static DEFAULT_STATE: AuthStateInterface;

  private _authState: AuthStateInterface = reactive<AuthStateInterface>({...AuthAPI.DEFAULT_STATE});

  private _client: AsgardeoSPAClient;

  constructor(spaClient?: AsgardeoSPAClient) {
    this._client = spaClient ?? AsgardeoSPAClient.getInstance();
  }

  /**
   * Method to return Auth Client instance authentication state.
   *
   * @return {AuthStateInterface} Authentication State.
   */
  public getState = (): AuthStateInterface => this._authState;

  /**
   * Initializes the AuthClient instance with the given authentication configuration.
   *
   * @param {AuthClientConfig<Config>} config - The authentication configuration object
   *        containing details such as client ID, redirect URLs, and base URL.
   * @returns {Promise<boolean>} A promise that resolves to `true` if initialization is successful.
   */
  public init = (config: AuthVueConfig): Promise<boolean> => this._client.initialize(config);

  /**
   * Handles user sign-in by exchanging the authorization code for tokens
   * and updating the authentication state if the user is authenticated.
   *
   * @param {SignInConfig} config - The sign-in configuration containing client-specific settings.
   * @param {string} authorizationCode - The authorization code received from the authentication provider.
   * @param {string} sessionState - The session state value to track the authentication session.
   * @param {string} [authState] - An optional authentication state parameter for additional tracking.
   * @param {{ params: Record<string, unknown> }} [tokenRequestConfig] - Optional token request parameters.
   * @returns {Promise<BasicUserInfo>} A promise resolving to the authenticated user's basic information.
   */
  public signIn = async (
    config?: SignInConfig,
    authorizationCode?: string,
    sessionState?: string,
    authState?: string,
    callback?: (response: BasicUserInfo) => void,
    tokenRequestConfig?: {params: Record<string, unknown>},
  ): Promise<BasicUserInfo> =>
    this._client
      .signIn(config, authorizationCode, sessionState, authState, tokenRequestConfig)
      .then(async (response: BasicUserInfo) => {
        if (!response) {
          return response;
        }
        if (await this._client.isSignedIn()) {
          Object.assign(this._authState, {
            allowedScopes: response.allowedScopes,
            displayName: response.displayName,
            email: response.email,
            isLoading: false,
            isSignedIn: true,
            isSigningOut: false,
            sub: response.sub,
            username: response.username,
          });

          if (callback) {
            callback(response);
          }
        }

        return response;
      })
      .catch((error: Error) => Promise.reject(error));

  /**
   * Signs the user out and resets the authentication state.
   *
   * @param {(response?: boolean) => void} callback - An optional callback function to execute after sign-out.
   * @returns {Promise<boolean>} A promise resolving to `true` if sign-out is successful.
   *
   */
  public signOut = async (callback?: (response?: boolean) => void): Promise<boolean> =>
    this._client
      .signOut()
      .then((response: boolean) => {
        if (callback) {
          callback(response);
        }
        return response;
      })
      .catch((error: AsgardeoAuthException) => Promise.reject(error));

  /**
   * Method to update Auth Client instance authentication state.
   *
   * @param {AuthStateInterface} state - State values to update in authentication state.
   */
  public updateState(state: AuthStateInterface): void {
    this._authState = {...this._authState, ...state};
  }

  /**
   * This method returns a Promise that resolves with the basic user information obtained from the ID token.
   *
   * @return {Promise<BasicUserInfo>} a promise that resolves with the user information.
   */
  public async getBasicUserInfo(): Promise<BasicUserInfo> {
    return this._client.getBasicUserInfo();
  }

  /**
   * This method returns a Promise that resolves with the basic user information obtained from the ID token.
   *
   * @return {Promise<BasicUserInfo>} a promise that resolves with the user information.
   */
  public async getUser(): Promise<BasicUserInfo> {
    return this._client.getBasicUserInfo();
  }

  /**
   * This method sends an API request to a protected endpoint.
   * The access token is automatically attached to the header of the request.
   * This is the only way by which protected endpoints can be accessed
   * when the web worker is used to store session information.
   *
   * @param {HttpRequestConfig} config - The config object containing attributes necessary to send a request.
   *
   * @return {Promise<Response>} - Returns a Promise that resolves with the response to the request.
   */
  public async httpRequest(config: HttpRequestConfig): Promise<HttpResponse<any>> {
    return this._client.httpRequest(config);
  }

  /**
   * This method sends multiple API requests to a protected endpoint.
   * The access token is automatically attached to the header of the request.
   * This is the only way by which multiple requests can be sent to protected endpoints
   * when the web worker is used to store session information.
   *
   * @param {HttpRequestConfig[]} configs - The config object containing attributes necessary to send a request.
   *
   * @return {Promise<Response>} a Promise that resolves with the responses to the requests.
   */
  public async httpRequestAll(configs: HttpRequestConfig[]): Promise<HttpResponse<any>[]> {
    return this._client.httpRequestAll(configs);
  }

  /**
   * This method allows you to send a request with a custom grant.
   *
   * @param {CustomGrantRequestParams} config - The request parameters.
   * @param {(response: BasicUserInfo | Response) => void} [callback] - An optional callback function.
   *
   * @return {Promise<Response | SignInResponse>} a promise that resolves with
   * the value returned by the custom grant request.
   */
  public exchangeToken(
    config: SPACustomGrantConfig,
    callback?: (response: BasicUserInfo | Response) => void,
  ): Promise<BasicUserInfo | Response> {
    return this._client
      .exchangeToken(config)
      .then((response: BasicUserInfo | Response) => {
        if (!response) {
          return response;
        }

        if (config.returnsSession) {
          Object.assign(this._authState, {
            ...this._authState,
            ...(response as BasicUserInfo),
            isLoading: false,
            isSignedIn: true,
          });
        }
        if (callback) {
          callback(response);
        }
        return response;
      })
      .catch((error: AsgardeoAuthException) => Promise.reject(error));
  }

  /**
   * This method ends a user session. The access token is revoked and the session information is destroyed.
   *
   * @return {Promise<boolean>} - A promise that resolves with `true` if the process is successful.
   */
  public async revokeAccessToken(): Promise<boolean> {
    return this._client
      .revokeAccessToken()
      .then(() => {
        this._authState = {...AuthAPI.DEFAULT_STATE, isLoading: false};
        return true;
      })
      .catch((error: AsgardeoAuthException) => Promise.reject(error));
  }

  /**
   * This method returns a Promise that resolves with an object containing the service endpoints.
   *
   * @return {Promise<ServiceResourcesType>} - A Promise that resolves with an object containing the service endpoints.
   */
  public async getOpenIDProviderEndpoints(): Promise<OIDCEndpoints> {
    return this._client.getOpenIDProviderEndpoints();
  }

  /**
   * This methods returns the Axios http client.
   *
   * @return {HttpClientInstance} - The Axios HTTP client.
   */
  public async getHttpClient(): Promise<HttpClientInstance> {
    return this._client.getHttpClient();
  }

  /**
   * This method decodes the payload of the id token and returns it.
   *
   * @return {Promise<DecodedIDTokenPayloadInterface>} - A Promise that resolves with
   * the decoded payload of the id token.
   */
  public async getDecodedIdToken(): Promise<IdToken> {
    return this._client.getDecodedIdToken();
  }

  /**
   * This method decodes the payload of the idp id token and returns it.
   * @remarks
   * This method is intended for retrieving the IdP ID token when extending a plugin.
   *
   * @return {Promise<DecodedIDTokenPayloadInterface>} - A Promise that resolves with
   * the decoded payload of the idp id token.
   */
  public async getDecodedIDPIDToken(): Promise<IdToken> {
    return this._client.getDecodedIdToken();
  }

  /**
   * This method returns the ID token.
   *
   * @return {Promise<string>} - A Promise that resolves with the id token.
   */
  public async getIdToken(): Promise<string> {
    return this._client.getIdToken();
  }

  /**
   * This method return a Promise that resolves with the access token.
   *
   * @remarks
   * This method will not return the access token if the storage type is set to `webWorker`.
   *
   * @return {Promise<string>} - A Promise that resolves with the access token.
   */
  public getAccessToken = async (): Promise<string> => this._client.getAccessToken();

  /**
   * This method returns a Promise that resolves with the IDP access token.
   *
   * @remarks
   * This method will not return the IDP access token if the storage type is set to `webWorker`.
   * It can be used to access the IDP access token when custom authentication grant functionalities are used.
   *
   * @return {Promise<string>} A Promise that resolves with the IDP access token.
   */
  public async getIDPAccessToken(): Promise<string> {
    return this._client.getIDPAccessToken();
  }

  /**
   * This method refreshes the access token.
   *
   * @return {BasicUserInfo} - A Promise that resolves with an object containing
   * information about the refreshed access token.
   */
  public async refreshAccessToken(): Promise<BasicUserInfo> {
    return this._client.refreshAccessToken();
  }

  /**
   * This method specifies if the user is authenticated or not.
   *
   * @return {Promise<boolean>} - A Promise that resolves with `true` if the user is authenticated.
   */
  public async isSignedIn(): Promise<boolean> {
    return this._client.isSignedIn();
  }

  /**
   * This method specifies if the session is active or not.
   *
   * @return {Promise<boolean>} - A Promise that resolves with `true` if there is an active session.
   */
  public async isSessionActive(): Promise<boolean> {
    return this._client.isSessionActive();
  }

  /**
   * This method enables callback functions attached to the http client.
   *
   * @return {Promise<boolean>} - A promise that resolves with `true`.
   */
  public async enableHttpHandler(): Promise<boolean> {
    return this._client.enableHttpHandler();
  }

  /**
   * This method disables callback functions attached to the http client.
   *
   * @return {Promise<boolean>} - A promise that resolves with `true`.
   */
  public async disableHttpHandler(): Promise<boolean> {
    return this._client.disableHttpHandler();
  }

  /**
   * This method updates the configuration that was passed into the constructor when instantiating this class.
   *
   * @param {Partial<AuthClientConfig<T>>} config - A config object to update the SDK configurations with.
   */
  public async reInitialize(config: Partial<AuthClientConfig<Config>>): Promise<void> {
    return this._client.reInitialize(config);
  }

  /**
   * This method attaches a callback function to an event hook that fires the callback when the event happens.
   *
   * @param {Hooks.CustomGrant} hook - The name of the hook.
   * @param {(response?: any) => void} callback - The callback function.
   * @param {string} id- Optional id for the hook. This is used when multiple custom grants are used.
   *
   */
  public on(hook: Hooks.CustomGrant, callback: (response?: any) => void, id: string): Promise<void>;
  public on(hook: Exclude<Hooks, Hooks.CustomGrant>, callback: (response?: any) => void): Promise<void>;
  public on(hook: Hooks, callback: (response?: any) => void, id?: string): Promise<void> {
    if (hook === Hooks.CustomGrant) {
      return this._client.on(hook, callback, id);
    }

    return this._client.on(hook, callback);
  }

  /**
   * This method allows you to sign in silently.
   * First, this method sends a prompt-none request to check for an active user session in the identity provider.
   * If a session exists, it retrieves the access token and stores it. Otherwise, it returns `false`.
   *
   * @param {Record<string, string | boolean>} [additionalParams] - Optional additional parameters to be sent with the request.
   * @param {{ params: Record<string, unknown> }} [tokenRequestConfig] - Optional configuration for the token request.
   *
   * @returns {Promise<BasicUserInfo | boolean>} A Promise that resolves with the user information after signing in,
   * or `false` if the user is not signed in.
   *
   * @example
   * ```
   * client.signInSilently();
   * ```
   */
  public async signInSilently(
    additionalParams?: Record<string, string | boolean>,
    tokenRequestConfig?: {params: Record<string, unknown>},
  ): Promise<BasicUserInfo | boolean> {
    return this._client
      .signInSilently(additionalParams, tokenRequestConfig)
      .then(async (response: BasicUserInfo | boolean) => {
        if (!response) {
          Object.assign(this._authState, {isLoading: false});
          return false;
        }

        if (await this._client.isSignedIn()) {
          const basicUserInfo: BasicUserInfo = response as BasicUserInfo;
          Object.assign(this._authState, {
            allowedScopes: basicUserInfo.allowedScopes,
            displayName: basicUserInfo.displayName,
            email: basicUserInfo.email,
            isLoading: false,
            isSignedIn: true,
            sub: basicUserInfo.sub,
            username: basicUserInfo.username,
          });
        }
        return response;
      })
      .catch((error: AsgardeoAuthException) => Promise.reject(error));
  }
}

AuthAPI.DEFAULT_STATE = {
  allowedScopes: '',
  displayName: '',
  email: '',
  isLoading: true,
  isSignedIn: false,
  sub: '',
  username: '',
};

export default AuthAPI;
