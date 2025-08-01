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
  AsgardeoSPAClient,
  AuthClientConfig,
  User,
  LegacyConfig as Config,
  IdToken,
  Hooks,
  HttpClientInstance,
  HttpRequestConfig,
  HttpResponse,
  OIDCEndpoints,
  SignInConfig,
  SPACustomGrantConfig,
} from '@asgardeo/browser';
import {AuthStateInterface} from './models';

class AuthAPI {
  static DEFAULT_STATE: AuthStateInterface;

  private _authState = AuthAPI.DEFAULT_STATE;
  private _client: AsgardeoSPAClient;

  private _isLoading: boolean;

  constructor(spaClient?: AsgardeoSPAClient) {
    this._client = spaClient ?? AsgardeoSPAClient.getInstance();

    this.getState = this.getState.bind(this);
    this.init = this.init.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.updateState = this.updateState.bind(this);
  }

  public _setIsLoading(isLoading: boolean): void {
    this._isLoading = isLoading;
  }

  public _getIsLoading(): boolean {
    return this._isLoading;
  }

  public isLoading(): boolean {
    return this._getIsLoading();
  }

  /**
   * Method to return Auth Client instance authentication state.
   *
   * @return {AuthStateInterface} Authentication State.
   */
  public getState(): AuthStateInterface {
    return this._authState;
  }

  /**
   * Method to initialize the AuthClient instance.
   *
   * @param {Config} config - `dispatch` function from React Auth Context.
   */
  public async init(config: AuthClientConfig<Config>): Promise<boolean> {
    return this._client.initialize(config);
  }

  /**
   * Method to get the configuration data.
   *
   * @returns {Promise<AuthClientConfig<Config>>} - A promise that resolves with the configuration data.
   */
  public async getConfigData(): Promise<AuthClientConfig<Config>> {
    return this._client.getConfigData();
  }

  /**
   * Method to get the configuration data.
   *
   * @returns {Promise<AuthClientConfig<Config>>} - A promise that resolves with the configuration data.
   */
  public async isInitialized(): Promise<boolean> {
    // Wait for initialization to complete
    return this._client.isInitialized();
  }

  /**
   * Method to handle user Sign In requests.
   *
   * @param {any} dispatch - `dispatch` function from React Auth Context.
   * @param {AuthStateInterface} state - Current authentication state in React Auth Context.
   * @param {any} callback - Action to trigger on successful sign in.
   */
  public async signIn(
    // dispatch: (state: AuthStateInterface) => void,
    // state: AuthStateInterface,
    config: SignInConfig,
    authorizationCode?: string,
    sessionState?: string,
    authState?: string,
    callback?: (response: User) => void,
    tokenRequestConfig?: {
      params: Record<string, unknown>;
    },
  ): Promise<any> {
    return this._client
      .signIn(config, authorizationCode, sessionState, authState, tokenRequestConfig)
      .then(async (response: User) => {
        if (!response) {
          return null; // FIXME: Validate this. Temp fix for: error TS7030: Not all code paths return a value.
        }

        if (await this._client.isSignedIn()) {
          const stateToUpdate = {
            displayName: response.displayName,
            email: response.email,
            isSignedIn: true,
            isLoading: false,
            isSigningOut: false,
            username: response.username,
          };

          this.updateState(stateToUpdate);

          // dispatch({...state, ...stateToUpdate});
          this._setIsLoading(false);

          if (callback) {
            callback(response);
          }
        }

        return response;
      })
      .catch(error => Promise.reject(error));
  }

  /**
   * Method to handle user Sign Out requests.
   *
   * @param {any} dispatch - `dispatch` function from React Auth Context.
   * @param {AuthStateInterface} state - Current authentication state in React Auth Context.
   * @param {any} callback - Action to trigger on successful sign out.
   */
  public signOut(callback?: (response?: boolean) => void): Promise<boolean> {
    return this._client
      .signOut()
      .then(response => {
        if (callback) {
          callback(response);
        }

        return response;
      })
      .catch(error => Promise.reject(error));
  }

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
   * @return {Promise<User>} - A promise that resolves with the user information.
   */
  public async getUser(): Promise<User> {
    return this._client.getUser();
  }

  /**
   * This method sends an API request to a protected endpoint.
   * The access token is automatically attached to the header of the request.
   * This is the only way by which protected endpoints can be accessed
   * when the web worker is used to store session information.
   *
   * @param {HttpRequestConfig} config -  The config object containing attributes necessary to send a request.
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
   * @param {HttpRequestConfig[]} config -  The config object containing attributes necessary to send a request.
   *
   * @return {Promise<Response>} - Returns a Promise that resolves with the responses to the requests.
   */
  public async httpRequestAll(configs: HttpRequestConfig[]): Promise<HttpResponse<any>[]> {
    return this._client.httpRequestAll(configs);
  }

  /**
   * This method allows you to send a request with a custom grant.
   *
   * @param {CustomGrantRequestParams} config - The request parameters.
   *
   * @return {Promise<Response | SignInResponse>} - A Promise that resolves with
   * the value returned by the custom grant request.
   */
  public exchangeToken(
    config: SPACustomGrantConfig,
    callback: (response: User | Response) => void,
  ): Promise<User | Response> {
    return this._client
      .exchangeToken(config)
      .then((response: User | Response) => {
        if (!response) {
          return null; // FIXME: Validate this. Temp fix for: error TS7030: Not all code paths return a value.
        }

        if (config.returnsSession) {
          this.updateState({
            ...this.getState(),
            ...(response as User),
            isSignedIn: true,
            isLoading: false,
          });
        }

        callback && callback(response);

        return response;
      })
      .catch(error => Promise.reject(error));
  }

  /**
   * This method ends a user session. The access token is revoked and the session information is destroyed.
   *
   * @return {Promise<boolean>} - A promise that resolves with `true` if the process is successful.
   */
  public async revokeAccessToken(dispatch: (state: AuthStateInterface) => void): Promise<boolean> {
    return this._client
      .revokeAccessToken()
      .then(() => {
        this.updateState({...AuthAPI.DEFAULT_STATE, isLoading: false});
        dispatch(AuthAPI.DEFAULT_STATE);
        return true;
      })
      .catch(error => Promise.reject(error));
  }

  /**
   * This method returns a Promise that resolves with an object containing the service endpoints.
   *
   * @return {Promise<ServiceResourcesType} - A Promise that resolves with an object containing the service endpoints.
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
  public async getDecodedIdToken(sessionId?: string): Promise<IdToken> {
    return this._client.getDecodedIdToken(sessionId);
  }

  /**
   * This method decodes the payload of the idp id token and returns it.
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
   * **This method will not return the access token if the storage type is set to `webWorker`.**
   *
   * @return {Promise<string>} - A Promise that resolves with the access token.
   */
  public async getAccessToken(sessionId?: string): Promise<string> {
    return this._client.getAccessToken(sessionId);
  }

  /**
   * This method return a Promise that resolves with the idp access token.
   *
   * **This method will not return the idp access token if the storage type is set to `webWorker`.**
   * **This can be used to access the IDP access token when custom auth grant functionalities are used**
   *
   * @return {Promise<string>} - A Promise that resolves with the idp access token.
   */
  public async getIDPAccessToken(): Promise<string> {
    return this._client.getIDPAccessToken();
  }

  /**
   * This method refreshes the access token.
   *
   * @return {TokenResponseInterface} - A Promise that resolves with an object containing
   * information about the refreshed access token.
   */
  public async refreshAccessToken(): Promise<User> {
    return this._client.refreshAccessToken();
  }

  /**
   * This method specifies if the user is authenticated or not.
   *
   * @return {Promise<boolean>} - A Promise that resolves with `true` if teh user is authenticated.
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
   * @return {Promise<boolean>} - A promise that resolves with True.
   *
   */
  public async enableHttpHandler(): Promise<boolean> {
    return this._client.enableHttpHandler();
  }

  /**
   * This method disables callback functions attached to the http client.
   *
   * @return {Promise<boolean>} - A promise that resolves with True.
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
   * @param {string} id (optional) - The id of the hook. This is used when multiple custom grants are used.
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
   * First, this method sends a prompt none request to see if there is an active user session in the identity server.
   * If there is one, then it requests the access token and stores it. Else, it returns false.
   *
   * @return {Promise<User | boolean>} - A Promise that resolves with the user information after signing in
   * or with `false` if the user is not signed in.
   *
   * @example
   *```
   * client.signInSilently()
   *```
   */
  public async signInSilently(
    additionalParams?: Record<string, string | boolean>,
    tokenRequestConfig?: {params: Record<string, unknown>},
  ): Promise<User | boolean | undefined> {
    return this._client
      .signInSilently(additionalParams, tokenRequestConfig)
      .then(async (response: User | boolean) => {
        if (!response) {
          return false;
        }

        return response;
      })
      .catch(error => Promise.reject(error));
  }
}

AuthAPI.DEFAULT_STATE = {
  displayName: '',
  email: '',
  isSignedIn: false,
  isLoading: true,
  username: '',
};

export default AuthAPI;
