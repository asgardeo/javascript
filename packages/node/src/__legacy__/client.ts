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
  AuthClientConfig,
  TokenExchangeRequestConfig,
  StorageManager,
  IdToken,
  OIDCEndpoints,
  Storage,
  TokenResponse,
  User,
  ExtendedAuthorizeRequestUrlParams,
} from '@asgardeo/javascript';
import {AsgardeoNodeCore} from './core';
import {AuthURLCallback} from './models';

/**
 * This class provides the necessary methods needed to implement authentication.
 *
 * @export
 * @class AsgardeoNodeClient
 */
export class AsgardeoNodeClient<T> {
  private authCore: AsgardeoNodeCore<T>;

  /**
    * This is the constructor method that returns an instance of the `AsgardeoNodeClient` class.
    *
    * @param {AuthClientConfig<T>} config - The configuration object.
    * @param {Storage} store - The store object.
    *
    * @example
    * ```
    * const _store: Storage = new DataStore();
    * const _config = {
           afterSignInUrl: "http://localhost:3000/sign-in",
           afterSignOutUrl: "http://localhost:3000/dashboard",
           clientId: "client ID",
           serverOrigin: "https://api.asgardeo.io/t/<org_name>"
       };
    * const auth = new AsgardeoNodeClient(_config,_store);
    * ```
    *
    * @link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#constructor
    * @preserve
    */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  public async initialize(config: AuthClientConfig<T>, store?: Storage): Promise<boolean> {
    this.authCore = new AsgardeoNodeCore(config, store);

    return Promise.resolve(true);
  }

  /**
   * This method logs in a user. If the authorization code is not available it will resolve with the
   * authorization URL to authorize the user.
   * @param {string} authorizationCode - The authorization code obtained from Asgardeo after a user signs in.
   * @param {String} sessionState - The session state obtained from Asgardeo after a user signs in.
   * @param {string} userId - (Optional) A unique ID of the user to be authenticated. This is useful in multi-user
   * scenarios where each user should be uniquely identified.
   * @param {string} state - The state parameter in the redirect URL.
   *
   * @return {Promise<URLResponse | NodeTokenResponse>} - A Promise that resolves with the
   * [`URLResponse`](#URLResponse) object or a Promise that resolves with
   * the [`NodeTokenResponse`](#NodeTokenResponse) object.
   *
   * @example
   * ```
   * authClient.signIn(req.query.code, req.query.session_state).then(response => {
   *   //URL property will available if the user has not been authenticated already
   *   if (response.hasOwnProperty('url')) {
   *       res.redirect(response.url)
   *   } else {
   *       //Set the cookie
   *       res.cookie('ASGARDEO_SESSION_ID', response.session, { maxAge: 900000, httpOnly: true, SameSite: true });
   *       res.status(200).send(response)
   *   }
   *});
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#signIn
   *
   * @memberof AsgardeoNodeClient
   *
   */
  public async signIn(
    authURLCallback: AuthURLCallback,
    userId: string,
    authorizationCode?: string,
    sessionState?: string,
    state?: string,
    signInConfig?: Record<string, string | boolean>,
  ): Promise<TokenResponse> {
    return this.authCore.signIn(authURLCallback, userId, authorizationCode, sessionState, state, signInConfig);
  }

  /**
   * Method to get the configuration data.
   *
   * @returns {Promise<AuthClientConfig<Config>>} - A promise that resolves with the configuration data.
   */
  public async getConfigData(): Promise<AuthClientConfig<T>> {
    return this.authCore.getConfigData();
  }

  /**
   * This method clears all session data and returns the sign-out URL.
   * @param {string} userId - The userId of the user. (If you are using ExpressJS,
   * you may get this from the request cookies)
   *
   * @return {Promise<string>} - A Promise that resolves with the sign-out URL.
   *
   * @example
   * ```
   * const signOutUrl = await auth.signOut(userId);
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#signOut
   *
   * @memberof AsgardeoNodeClient
   *
   */
  public async signOut(userId: string): Promise<string> {
    return this.authCore.signOut(userId);
  }

  /**
   * This method returns a boolean value indicating if the user is authenticated or not.
   * @param {string} userId - The userId of the user.
   * (If you are using ExpressJS, you may get this from the request cookies)
   *
   * @return { Promise<boolean>} -A boolean value that indicates of the user is authenticated or not.
   *
   * @example
   * ```
   * const isAuth = await authClient.isSignedIn("a2a2972c-51cd-5e9d-a9ae-058fae9f7927");
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#isSignedIn
   *
   * @memberof AsgardeoNodeClient
   *
   */
  public async isSignedIn(userId: string): Promise<boolean> {
    return this.authCore.isSignedIn(userId);
  }

  /**
   * This method returns the id token.
   * @param {string} userId - The userId of the user.
   * (If you are using ExpressJS, you may get this from the request cookies)
   *
   * @return {Promise<string>} -A Promise that resolves with the ID Token.
   *
   * @example
   * ```
   * const isAuth = await authClient.getIdToken("a2a2972c-51cd-5e9d-a9ae-058fae9f7927");
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#getIdToken
   *
   * @memberof AsgardeoNodeClient
   *
   */
  public async getIdToken(userId: string): Promise<string> {
    return this.authCore.getIdToken(userId);
  }

  /**
   * This method returns an object containing basic user information obtained from the id token.
   * @param {string} userId - The userId of the user.
   * (If you are using ExpressJS, you may get this from the request cookies)
   *
   * @return {Promise<string>} -A Promise that resolves with the
   * An object containing basic user information obtained from the id token.
   *
   * @example
   * ```
   * const basicInfo = await authClient.getUser("a2a2972c-51cd-5e9d-a9ae-058fae9f7927");
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#getUser
   *
   * @memberof AsgardeoNodeClient
   *
   */
  public async getUser(userId: string): Promise<User> {
    return this.authCore.getUser(userId);
  }

  /**
   * This method returns an object containing the OIDC service endpoints returned by the `.well-known` endpoint.
   * @return {Promise<OIDCEndpoints>} -A Promise that resolves with
   * an object containing the OIDC service endpoints returned by the `.well-known` endpoint.
   *
   * @example
   * ```
   * const oidcEndpoints = await auth.getOpenIDProviderEndpoints();
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#getOpenIDProviderEndpoints
   *
   * @memberof AsgardeoNodeClient
   *
   */
  public async getOpenIDProviderEndpoints(): Promise<OIDCEndpoints> {
    return this.authCore.getOpenIDProviderEndpoints();
  }

  /**
   * This method returns the decoded ID token payload.
   * @param {string} userId - The userId of the user.
   * (If you are using ExpressJS, you may get this from the request cookies)
   *
   * @return {Promise<IdToken>} -A Promise that resolves with
   * an object containing the decoded ID token payload.
   *
   * @example
   * ```
   * const decodedIDTokenPayload = await auth.getDecodedIdToken("a2a2972c-51cd-5e9d-a9ae-058fae9f7927");
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#getDecodedIdToken
   *
   * @memberof AsgardeoNodeClient
   *
   */
  public async getDecodedIdToken(userId?: string, idToken?: string): Promise<IdToken> {
    return this.authCore.getDecodedIdToken(userId, idToken);
  }

  /**
   * This method returns the access token.
   * @param {string} userId - The userId of the user.
   * (If you are using ExpressJS, you may get this from the request cookies)
   *
   * @return {Promise<string>} -A Promise that resolves with
   * the access token stored in the store
   *
   * @example
   * ```
   *const accessToken = await auth.getAccessToken("a2a2972c-51cd-5e9d-a9ae-058fae9f7927");
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#getAccessToken
   *
   * @memberof AsgardeoNodeClient
   *
   */
  public async getAccessToken(userId?: string): Promise<string> {
    return this.authCore.getAccessToken(userId);
  }

  /**
     * This method returns Promise that resolves with the token information
     * or the response returned by the server depending on the configuration passed.
     * @param {TokenExchangeRequestConfig} config - The config object contains attributes that would be used
     * to configure the custom grant request.
     *
     * @param {string} userId - The userId of the user.
     * (If you are using ExpressJS, you may get this from the request cookies)
     *
     * @return {Promise<TokenResponse | Response>} -A Promise that resolves with the token information
     * or the response returned by the server depending on the configuration passed.
     *
     * @example
     * ```
     * const config = {
     *      attachToken: false,
     *      data: {
     *          client_id: "{{clientId}}",
     *          grant_type: "account_switch",
     *          scope: "{{scope}}",
     *          token: "{{token}}",
     *      },
     *      id: "account-switch",
     *      returnResponse: true,
     *      returnsSession: true,
     *      signInRequired: true
     * }

     * auth.exchangeToken(config).then((response)=>{
     *     console.log(response);
     * }).catch((error)=>{
     *     console.error(error);
     * });
     * ```
     *
     * @link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#exchangeToken
     *
     * @memberof AsgardeoNodeClient
     *
     */
  public async exchangeToken(config: TokenExchangeRequestConfig, userId?: string): Promise<TokenResponse | Response> {
    return this.authCore.exchangeToken(config, userId);
  }

  /**
   * This method can be used to update the configurations passed into the constructor of the AsgardeoAuthClient.
   * @param {AuthClientConfig<T>} config - The config object containing the attributes
   * that can be used to configure the SDK
   *
   * @return {Promise<void>} -A Promise that resolves with a void.
   *
   * @example
   * ```
   * const reInitialize = await auth.reInitialize({
   *       afterSignOutUrl: "http://localhost:3000/sign-out"
   *   });
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#reInitialize
   *
   * @memberof AsgardeoNodeClient
   *
   */
  public async reInitialize(config: Partial<AuthClientConfig<T>>): Promise<void> {
    return this.authCore.reInitialize(config);
  }

  public async getSignInUrl(requestConfig?: ExtendedAuthorizeRequestUrlParams, userId?: string): Promise<string> {
    return this.authCore.getAuthURL(userId, requestConfig);
  }

  /**
   * This method returns a Promise that resolves with the response returned by the server.
   * @param {string} userId - The userId of the user.
   * (If you are using ExpressJS, you may get this from the request cookies)
   *
   * @return {Promise<Response>} -A Promise that resolves with the response returned by the server.
   *
   * @example
   * ```
   * const revokeToken = await auth.revokeAccessToken("a2a2972c-51cd-5e9d-a9ae-058fae9f7927");
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#revokeAccessToken
   *
   * @memberof AsgardeoNodeClient
   *
   */
  public async revokeAccessToken(userId?: string): Promise<Response> {
    return this.authCore.revokeAccessToken(userId);
  }

  /**
   * This method refreshes the access token and returns a Promise that resolves with the new access
   * token and other relevant data.
   *
   * @param {string} userId - A unique ID of the user to be authenticated. This is useful in multi-user
   * scenarios where each user should be uniquely identified.
   *
   * @returns {Promise<TokenResponse>} - A Promise that resolves with the token response.
   *
   * @example
   * ```
   * const tokenResponse = await auth.refreshAccessToken("a2a2972c-51cd-5e9d-a9ae-058fae9f7927")
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#refreshAccessToken
   *
   * @memberof AsgardeoNodeClient
   */
  public refreshAccessToken(userId?: string): Promise<TokenResponse> {
    return this.authCore.refreshAccessToken(userId);
  }

  /**
   * This method returns if the user has been successfully signed out or not.
   * @param {string} afterSignOutUrl - The URL to which the user is redirected to
   * after signing out from the server.
   *
   * @return {boolean} - A boolean value indicating if the user has been signed out or not.
   *
   * @example
   * ```
   * const isSignedOut = auth.isSignOutSuccessful(<signout_url>);;
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#isSignOutSuccessful
   *
   * @memberof AsgardeoNodeClient
   *
   */
  public static isSignOutSuccessful(afterSignOutUrl: string): boolean {
    return AsgardeoNodeClient.isSignOutSuccessful(afterSignOutUrl);
  }

  /**
   * This method returns if sign-out failed or not
   * @param {string} afterSignOutUrl - The URL to which the user is redirected to
   * after signing out from the server.
   *
   * @return {boolean} - A boolean value indicating if sign-out failed or not.
   *
   * @example
   * ```
   * const isSignedOut = auth.isSignOutSuccessful(<signout_url>);
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#didSignOutFail
   *
   * @memberof AsgardeoNodeClient
   *
   */
  public static didSignOutFail(afterSignOutUrl: string): boolean {
    return AsgardeoNodeClient.didSignOutFail(afterSignOutUrl);
  }

  public async getStorageManager(): Promise<StorageManager<T>> {
    return this.authCore.getStorageManager();
  }

  public async decodeJwtToken<K = Record<string, unknown>>(token: string): Promise<K> {
    return this._authCore.decodeJwtToken<K>(token);
  }
}
