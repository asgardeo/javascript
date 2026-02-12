/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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
  AsgardeoAuthClient,
  AsgardeoAuthException,
  AuthClientConfig,
  IsomorphicCrypto,
  TokenExchangeRequestConfig,
  StorageManager,
  IdToken,
  OIDCEndpoints,
  User,
  createPackageComponentLogger,
} from '@asgardeo/javascript';
import WorkerFile from '../web.worker';
import {MainThreadClient, WebWorkerClient} from './clients';
import {Hooks, REFRESH_ACCESS_TOKEN_ERR0R} from './constants';
import {AuthenticationHelper, SPAHelper} from './helpers';
import {HttpClientInstance} from './http-client';
import {
  AuthSPAClientConfig,
  LegacyConfig as Config,
  HttpRequestConfig,
  HttpResponse,
  MainThreadClientConfig,
  MainThreadClientInterface,
  SignInConfig,
  SignOutError,
  WebWorkerClientConfig,
  WebWorkerClientInterface,
} from './models';
import {BrowserStorage} from './models/storage';
import {SPAUtils} from './utils';

const logger: ReturnType<typeof createPackageComponentLogger> = createPackageComponentLogger(
  '@asgardeo/browser',
  'AsgardeoSPAClient',
);

/**
 * Default configurations.
 */
const DefaultConfig: Partial<AuthClientConfig<Config>> = {
  autoLogoutOnTokenRefreshError: false,
  checkSessionInterval: 3,
  syncSession: false,
  periodicTokenRefresh: false,
  sessionRefreshInterval: 300,
  storage: BrowserStorage.SessionStorage,
};

/**
 * This class provides the necessary methods to implement authentication in a Single Page Application.
 *
 * @export
 * @class AsgardeoSPAClient
 */
export class AsgardeoSPAClient {
  protected static _instances: Map<number, AsgardeoSPAClient> = new Map<number, AsgardeoSPAClient>();
  protected _client: WebWorkerClientInterface | MainThreadClientInterface | undefined;
  protected _storage: BrowserStorage | undefined;
  protected _authHelper: typeof AuthenticationHelper = AuthenticationHelper;
  protected _worker: new () => Worker = WorkerFile;
  protected _initialized: boolean = false;
  protected _startedInitialize: boolean = false;
  protected _onSignInCallback: (response: User) => void = () => null;
  protected _onSignOutCallback: () => void = () => null;
  protected _onSignOutFailedCallback: (error: SignOutError) => void = () => null;
  protected _onEndUserSession: (response: any) => void = () => null;
  protected _onInitialize: (response: boolean) => void = () => null;
  protected _onCustomGrant: Map<string, (response: any) => void> = new Map();
  protected _instanceID: number;

  protected constructor(id: number) {
    this._instanceID = id;
  }

  public instantiateAuthHelper(authHelper?: typeof AuthenticationHelper): void {
    if (authHelper) {
      this._authHelper = authHelper;
    } else {
      this._authHelper = AuthenticationHelper;
    }
  }

  public instantiateWorker(worker: new () => Worker): void {
    if (worker) {
      this._worker = worker;
    } else {
      this._worker = WorkerFile;
    }
  }

  /**
   * This method specifies if the `AsgardeoSPAClient` has been initialized or not.
   *
   * @return {Promise<boolean>} - Resolves to `true` if the client has been initialized.
   *
   * @memberof AsgardeoSPAClient
   *
   * @private
   */
  public async isInitialized(): Promise<boolean> {
    if (!this._startedInitialize) {
      return false;
    }

    let iterationToWait = 0;

    const sleep = (): Promise<any> => {
      return new Promise(resolve => setTimeout(resolve, 1));
    };

    while (!this._initialized) {
      if (iterationToWait === 1e4) {
        logger.warn('It is taking longer than usual for the object to be initialized');
      }
      await sleep();
      iterationToWait++;
    }

    return true;
  }

  /**
   * This method checks if the SDK is initialized and the user is authenticated.
   *
   * @param validateAuthentication - should user's authenticated status be checked as part of validation
   *
   * @return {Promise<boolean>} - A Promise that resolves with `true` if the SDK is initialized and the
   * user is authenticated.
   *
   * @memberof AsgardeoSPAClient
   *
   * @private
   */
  private async _validateMethod(validateAuthentication: boolean = true): Promise<boolean> {
    if (!(await this.isInitialized())) {
      return Promise.reject(
        new AsgardeoAuthException(
          'SPA-AUTH_CLIENT-VM-NF01',
          'The SDK is not initialized.',
          'The SDK must be initialized first.',
        ),
      );
    }

    if (validateAuthentication && !(await this.isSignedIn())) {
      return Promise.reject(
        new AsgardeoAuthException(
          'SPA-AUTH_CLIENT-VM-IV02',
          'The user is not authenticated.',
          'The user must be authenticated first.',
        ),
      );
    }

    return true;
  }

  /**
   * This method returns the instance of the singleton class.
   * If an ID is provided, it will return the instance with the given ID.
   * If no ID is provided, it will return the default instance value 0.
   *
   * @return {AsgardeoSPAClient} - Returns the instance of the singleton class.
   *
   * @example
   * ```
   * const auth = AsgardeoSPAClient.getInstance();
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#getinstance
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public static getInstance(id?: number): AsgardeoSPAClient | undefined {
    if (id && this._instances?.get(id)) {
      return this._instances.get(id);
    } else if (!id && this._instances?.get(0)) {
      return this._instances.get(0);
    }

    if (id) {
      this._instances.set(id, new AsgardeoSPAClient(id));

      return this._instances.get(id);
    }

    this._instances.set(0, new AsgardeoSPAClient(0));

    return this._instances.get(0);
  }

  /**
   * This method initializes the `AsgardeoSPAClient` instance.
   *
   * @param {ConfigInterface} config The config object to initialize with.
   *
   * @return {Promise<boolean>} - Resolves to `true` if initialization is successful.
   *
   * @example
   * ```
   * auth.initialize({
   *     afterSignInUrl: "http://localhost:3000/sign-in",
   *     clientId: "client ID",
   *     baseUrl: "https://api.asgardeo.io"
   * });
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#initialize
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */

  public async initialize(
    config: AuthSPAClientConfig,
    authHelper?: typeof AuthenticationHelper,
    workerFile?: new () => Worker,
  ): Promise<boolean> {
    this._storage = (config.storage as BrowserStorage) ?? BrowserStorage.SessionStorage;
    this._initialized = false;
    this._startedInitialize = true;

    authHelper && this.instantiateAuthHelper(authHelper);
    workerFile && this.instantiateWorker(workerFile);

    const _config = await this._client?.getConfigData();

    if (!(this._storage === BrowserStorage.WebWorker)) {
      const mainThreadClientConfig = config as AuthClientConfig<MainThreadClientConfig>;
      const defaultConfig = {...DefaultConfig} as Partial<AuthClientConfig<MainThreadClientConfig>>;
      const mergedConfig: AuthClientConfig<MainThreadClientConfig> = {
        ...defaultConfig,
        ...mainThreadClientConfig,
      };

      // If the client is not initialized, initialize it as usual.
      // NOTE: With React 19 strict mode, the initialization logic runs twice, and there's an intermittent
      // issue where the config object is not getting stored in the storage layer with Vite scaffolding.
      // Hence, we need to check if the client is initialized but the config object is empty, and reinitialize.
      // Tracker: https://github.com/asgardeo/asgardeo-auth-react-sdk/issues/240
      if (!this._client || (this._client && (!_config || Object.keys(_config)?.length === 0))) {
        this._client = await MainThreadClient(
          this._instanceID,
          mergedConfig,
          (authClient: AsgardeoAuthClient<MainThreadClientConfig>, spaHelper: SPAHelper<MainThreadClientConfig>) => {
            return new this._authHelper(authClient, spaHelper);
          },
        );
      }

      this._initialized = true;

      if (this._onInitialize) {
        this._onInitialize(true);
      }

      // Do not sign out the user if the autoLogoutOnTokenRefreshError is set to false.
      if (!mergedConfig.autoLogoutOnTokenRefreshError) {
        return Promise.resolve(true);
      }

      window.addEventListener('message', event => {
        if (event?.data?.type === REFRESH_ACCESS_TOKEN_ERR0R) {
          this.signOut();
        }
      });

      return Promise.resolve(true);
    } else {
      // If the client is not initialized, initialize it as usual.
      // NOTE: With React 19 strict mode, the initialization logic runs twice, and there's an intermittent
      // issue where the config object is not getting stored in the storage layer with Vite scaffolding.
      // Hence, we need to check if the client is initialized but the config object is empty, and reinitialize.
      // Tracker: https://github.com/asgardeo/asgardeo-auth-react-sdk/issues/240
      if (!this._client || (this._client && (!_config || Object.keys(_config)?.length === 0))) {
        const webWorkerClientConfig = config as AuthClientConfig<WebWorkerClientConfig>;
        this._client = (await WebWorkerClient(
          this._instanceID,
          {
            ...DefaultConfig,
            ...webWorkerClientConfig,
          },
          this._worker,
          (authClient: AsgardeoAuthClient<WebWorkerClientConfig>, spaHelper: SPAHelper<WebWorkerClientConfig>) => {
            return new this._authHelper(authClient, spaHelper);
          },
        )) as WebWorkerClientInterface;

        return this._client
          .initialize()
          .then(() => {
            if (this._onInitialize) {
              this._onInitialize(true);
            }
            this._initialized = true;

            return Promise.resolve(true);
          })
          .catch(error => {
            return Promise.reject(error);
          });
      }

      return Promise.resolve(true);
    }
  }

  /**
   * This method returns a Promise that resolves with the basic user information obtained from the ID token.
   *
   * @return {Promise<User>} - A promise that resolves with the user information.
   *
   * @example
   * ```
   * auth.getUser().then((response) => {
   *    // console.log(response);
   * }).catch((error) => {
   *    // console.error(error);
   * });
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#getuserinfo
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async getUser(): Promise<User | undefined> {
    await this._validateMethod();

    return this._client?.getUser();
  }

  /**
   * This method initiates the authentication flow. This should be called twice.
   *  1. To initiate the authentication flow.
   *  2. To obtain the access token after getting the authorization code.
   *
   * To satisfy the second condition, one of the two strategies mentioned below can be used:
   *  1. Redirect the user back to the same login page that initiated the authentication flow.
   *  2. Call the `signIn()` method in the page the user is redirected to after authentication.
   *
   * **To fire a callback function after signing in, use the `on()` method.**
   * **To learn more about the `on()` method:**
   * @see {@link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#on}
   *
   * @param {SignInConfig} config - The sign-in config.
   * The `SignInConfig` object has these two attributes in addition to any custom key-value pairs.
   *  1. fidp - Specifies the FIDP parameter that is used to take the user directly to an IdP login page.
   *  2. forceInit: Specifies if the OIDC Provider Meta Data should be loaded again from the `well-known`
   * endpoint.
   *  3. Any other parameters that should be appended to the authorization request.
   * @param {string} authorizationCode - The authorization code. (Optional)
   * @param {string} sessionState - The session state. (Optional)
   * @param {string} state - The state. (Optional)
   *
   * @return {Promise<User>} - A promise that resolves with the user information.
   *
   * @example
   * ```
   * auth.signIn();
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#signin
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async signIn(
    config?: SignInConfig,
    authorizationCode?: string,
    sessionState?: string,
    state?: string,
    tokenRequestConfig?: {
      params: Record<string, unknown>;
    },
  ): Promise<User | undefined> {
    await this.isInitialized();

    // Discontinues the execution of this method if `config.callOnlyOnRedirect` is true and the `signIn` method
    // is not being called on redirect.
    if (!SPAUtils.canContinueSignIn(Boolean(config?.callOnlyOnRedirect), authorizationCode)) {
      return undefined;
    }

    delete config?.callOnlyOnRedirect;

    return this._client
      ?.signIn(config, authorizationCode, sessionState, state, tokenRequestConfig)
      .then((response: User) => {
        if (this._onSignInCallback) {
          this._onSignInCallback(response);
        }

        return response;
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }

  /**
   * This method allows you to sign in silently.
   * First, this method sends a prompt none request to see if there is an active user session in the identity server.
   * If there is one, then it requests the access token and stores it. Else, it returns false.
   *
   * If this method is to be called on page load and the `signIn` method is also to be called on page load,
   * then it is advisable to call this method after the `signIn` call.
   *
   * @return {Promise<User | boolean>} - A Promise that resolves with the user information after signing in
   * or with `false` if the user is not signed in.
   *
   * @example
   *```
   * auth.signInSilently()
   *```
   */
  public async signInSilently(
    additionalParams?: Record<string, string | boolean>,
    tokenRequestConfig?: {params: Record<string, unknown>},
  ): Promise<User | boolean | undefined> {
    await this.isInitialized();

    // checks if the `signIn` method has been called.
    if (SPAUtils.wasSignInCalled()) {
      return undefined;
    }

    return this._client?.signInSilently(additionalParams, tokenRequestConfig).then((response: User | boolean) => {
      if (this._onSignInCallback && response) {
        this._onSignInCallback(response as User);
      }

      return response;
    });
  }

  /**
   * This method initiates the sign-out flow.
   *
   * **To fire a callback function after signing out, use the `on()` method.**
   * **To learn more about the `on()` method:**
   * @see {@link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#on}
   *
   * @return {Promise<boolean>} - Returns a promise that resolves with `true` if sign out is successful.
   *
   * @example
   * ```
   * auth.signOut();
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#signout
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async signOut(): Promise<boolean> {
    await this._validateMethod(false);

    const signOutResponse = (await this._client?.signOut()) ?? false;

    return signOutResponse;
  }

  /**
   * This method sends an API request to a protected endpoint.
   * The access token is automatically attached to the header of the request.
   * This is the only way by which protected endpoints can be accessed
   * when the web worker is used to store session information.
   *
   * @param {HttpRequestConfig} config -  The config object containing attributes necessary to send a request.
   *
   * @return {Promise<HttpResponse>} - Returns a Promise that resolves with the response to the request.
   *
   * @example
   * ```
   *  const requestConfig = {
   *      headers: {
   *          "Accept": "application/json",
   *          "Access-Control-Allow-Origin": "https://api.asgardeo.io/myaccount",
   *          "Content-Type": "application/scim+json"
   *      },
   *      method: "GET",
   *      url: "https://api.asgardeo.io/scim2/me"
   *  };
   *
   *  return auth.httpRequest(requestConfig)
   *     .then((response) => {
   *           // console.log(response);
   *      })
   *      .catch((error) => {
   *           // console.error(error);
   *      });
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#httprequest
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async httpRequest(config: HttpRequestConfig): Promise<HttpResponse | undefined> {
    await this._validateMethod(false);

    return this._client?.httpRequest(config);
  }

  /**
   * This method sends multiple API requests to a protected endpoint.
   * The access token is automatically attached to the header of the request.
   * This is the only way by which multiple requests can be sent to protected endpoints
   * when the web worker is used to store session information.
   *
   * @param {HttpRequestConfig[]} config -  The config object containing attributes necessary to send a request.
   *
   * @return {Promise<HttpResponse[]>} - Returns a Promise that resolves with the responses to the requests.
   *
   * @example
   * ```
   *  const requestConfig = {
   *      headers: {
   *          "Accept": "application/json",
   *          "Content-Type": "application/scim+json"
   *      },
   *      method: "GET",
   *      url: "https://api.asgardeo.io/scim2/me"
   *  };
   *
   *  const requestConfig2 = {
   *      headers: {
   *          "Accept": "application/json",
   *          "Content-Type": "application/scim+json"
   *      },
   *      method: "GET",
   *      url: "https://api.asgardeo.io/scim2/me"
   *  };
   *
   *  return auth.httpRequest([requestConfig, requestConfig2])
   *     .then((responses) => {
   *           response.forEach((response)=>{
   *              // console.log(response);
   *           });
   *      })
   *      .catch((error) => {
   *           // console.error(error);
   *      });
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#httprequestall
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async httpRequestAll(config: HttpRequestConfig[]): Promise<HttpResponse[] | undefined> {
    await this._validateMethod(false);

    return this._client?.httpRequestAll(config);
  }

  /**
   * This method allows you to send a request with a custom grant.
   *
   * @param {CustomGrantRequestParams} config - The request parameters.
   *
   * @return {Promise<HttpResponse<any> | SignInResponse>} - A Promise that resolves with
   * the value returned by the custom grant request.
   *
   * @example
   * ```
   * auth.customGrant({
   *   attachToken: false,
   *   data: {
   *       client_id: "{{clientId}}",
   *       grant_type: "account_switch",
   *       scope: "{{scope}}",
   *       token: "{{token}}",
   *   },
   *   id: "account-switch",
   *   returnResponse: true,
   *   returnsSession: true,
   *   signInRequired: true
   * });
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#customgrant
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async exchangeToken(config: TokenExchangeRequestConfig): Promise<Response | User | undefined> {
    if (config.signInRequired) {
      await this._validateMethod();
    } else {
      await this._validateMethod();
    }

    if (!config.id) {
      return Promise.reject(
        new AsgardeoAuthException(
          'SPA-AUTH_CLIENT-RCG-NF01',
          'The custom grant request id not found.',
          'The id attribute of the custom grant config object passed as an argument should have a value.',
        ),
      );
    }

    const customGrantResponse = await this._client?.exchangeToken(config);

    const customGrantCallback = this._onCustomGrant.get(config.id);
    customGrantCallback && customGrantCallback(this._onCustomGrant?.get(config.id));

    return customGrantResponse;
  }

  /**
   * This method ends a user session. The access token is revoked and the session information is destroyed.
   *
   * **To fire a callback function after ending user session, use the `on()` method.**
   * **To learn more about the `on()` method:**
   * @see {@link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#on}
   *
   * @return {Promise<boolean>} - A promise that resolves with `true` if the process is successful.
   *
   * @example
   * ```
   * auth.endUserSession();
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#endusersession
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async revokeAccessToken(): Promise<boolean | undefined> {
    await this._validateMethod();

    const revokeAccessToken = await this._client?.revokeAccessToken();
    this._onEndUserSession && (await this._onEndUserSession(revokeAccessToken));

    return revokeAccessToken;
  }

  /**
   * This method returns a Promise that resolves with an object containing the service endpoints.
   *
   * @return {Promise<ServiceResourcesType} - A Promise that resolves with an object containing the service endpoints.
   *
   * @example
   * ```
   * auth.getServiceEndpoints().then((endpoints) => {
   *      // console.log(endpoints);
   *  }).error((error) => {
   *      // console.error(error);
   *  });
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#getserviceendpoints
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async getOpenIDProviderEndpoints(): Promise<OIDCEndpoints | undefined> {
    await this.isInitialized();

    return this._client?.getOpenIDProviderEndpoints();
  }

  /**
   * This methods returns the Axios http client.
   *
   * @return {HttpClientInstance} - The Axios HTTP client.
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public getHttpClient(): HttpClientInstance {
    if (this._client) {
      if (this._storage !== BrowserStorage.WebWorker) {
        const mainThreadClient = this._client as MainThreadClientInterface;
        return mainThreadClient.getHttpClient();
      }

      throw new AsgardeoAuthException(
        'SPA-AUTH_CLIENT-GHC-IV01',
        'Http client cannot be returned.',
        'The http client cannot be returned when the storage type is set to webWorker.',
      );
    }

    throw new AsgardeoAuthException(
      'SPA-AUTH_CLIENT-GHC-NF02',
      'The SDK is not initialized.',
      'The SDK has not been initialized yet. Initialize the SDK using the initialize method ' +
        'before calling this method.',
    );
  }

  /**
   * This method decodes a JWT token payload and returns it.
   *
   * @param {string} token - The token to decode (optional).
   *
   * @return {Promise<Record<string, unknown>>} - A Promise that resolves with
   * the decoded payload of the token.
   *
   * @example
   * ```
   * auth.decodeJwtToken<T>(token).then((response)=>{
   *     // console.log(response);
   * }).catch((error)=>{
   *     // console.error(error);
   * });
   * ```
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#decodetoken
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async decodeJwtToken<T = Record<string, unknown>>(token?: string): Promise<T | undefined> {
    return this._client?.decodeJwtToken<T>(token);
  }

  /**
   * This method decodes the payload of the id token and returns it.
   *
   * @return {Promise<DecodedIdTokenPayloadInterface>} - A Promise that resolves with
   * the decoded payload of the id token.
   *
   * @example
   * ```
   * auth.getDecodedIdToken().then((response)=>{
   *     // console.log(response);
   * }).catch((error)=>{
   *     // console.error(error);
   * });
   * ```
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#getdecodedidtoken
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async getDecodedIdToken(sessionId?: string): Promise<IdToken | undefined> {
    await this._validateMethod();

    return this._client?.getDecodedIdToken(sessionId);
  }

  /**
   * This method returns the IsomorphicCrypto instance.
   *
   * @return {Promise<DecodedIdTokenPayloadInterface>} - A Promise that resolves with
   * the IsomorphicCrypto instance.
   *
   * @example
   * ```
   * auth.getCrypto().then((response)=>{
   *     // console.log(response);
   * }).catch((error)=>{
   *     // console.error(error);
   * });
   * ```
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#getCrypto
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async getCrypto(): Promise<IsomorphicCrypto | undefined> {
    await this._validateMethod();

    return this._client?.getCrypto();
  }

  /**
   * This method return the ID token.
   *
   * @return {Promise<string>} - A Promise that resolves with the ID token.
   *
   * @example
   * ```
   * const idToken = await auth.getIdToken();
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#getIdToken
   *
   * @memberof AsgardeoAuthClient
   *
   * @preserve
   */
  public async getIdToken(): Promise<string | undefined> {
    await this._validateMethod();

    return this._client?.getIdToken();
  }

  /**
   * This method return a Promise that resolves with the access token.
   *
   * **This method will not return the access token if the storage type is set to `webWorker`.**
   *
   * @return {Promise<string>} - A Promise that resolves with the access token.
   *
   * @example
   * ```
   *   auth.getAccessToken().then((token) => {
   *       // console.log(token);
   *   }).catch((error) => {
   *       // console.error(error);
   *   });
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#getaccesstoken
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async getAccessToken(sessionId?: string): Promise<string> {
    await this._validateMethod();

    if (this._storage && [(BrowserStorage.WebWorker, BrowserStorage.BrowserMemory)].includes(this._storage)) {
      return Promise.reject(
        new AsgardeoAuthException(
          'SPA-AUTH_CLIENT-GAT-IV01',
          'The access token cannot be returned.',
          'The access token cannot be returned when the storage type is set to webWorker or browserMemory.',
        ),
      );
    }
    const mainThreadClient = this._client as MainThreadClientInterface;

    return mainThreadClient.getAccessToken(sessionId);
  }

  /**
   * This method return a Promise that resolves with the idp access token.
   *
   * **This method will not return the access token if the storage type is set to `webWorker`.**
   *
   * @return {Promise<string>} - A Promise that resolves with the idp access token.
   *
   * @example
   * ```
   *   auth.getIDPAccessToken().then((token) => {
   *       // console.log(token);
   *   }).catch((error) => {
   *       // console.error(error);
   *   });
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#getaccesstoken
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async getIDPAccessToken(): Promise<string> {
    await this._validateMethod();

    if (this._storage && [(BrowserStorage.WebWorker, BrowserStorage.BrowserMemory)].includes(this._storage)) {
      return Promise.reject(
        new AsgardeoAuthException(
          'SPA-AUTH_CLIENT-GIAT-IV01',
          'The access token cannot be returned.',
          'The access token cannot be returned when the storage type is set to webWorker or browserMemory.',
        ),
      );
    }
    const mainThreadClient = this._client as MainThreadClientInterface;

    return mainThreadClient.getAccessToken();
  }

  /**
   * This method return a Promise that resolves with the data layer object.
   *
   * **This method will not return the data layer object, if the storage type is set to `webWorker`.**
   *
   * @return {Promise<string>} - A Promise that resolves with the data layer object.
   *
   * @example
   * ```
   *   auth.getStorageManager().then((dataLayer) => {
   *       // console.log(dataLayer);
   *   }).catch((error) => {
   *       // console.error(error);
   *   });
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#getdatalayer
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async getStorageManager(): Promise<StorageManager<MainThreadClientConfig>> {
    if (this._storage && [(BrowserStorage.WebWorker, BrowserStorage.BrowserMemory)].includes(this._storage)) {
      return Promise.reject(
        new AsgardeoAuthException(
          'SPA-AUTH_CLIENT-GDL-IV01',
          'The data layer cannot be returned.',
          'The data layer cannot be returned when the storage type is set to webWorker or browserMemory.',
        ),
      );
    }
    const mainThreadClient = this._client as MainThreadClientInterface;

    return mainThreadClient.getStorageManager();
  }

  /**
   * This method return a Promise that resolves with the config data stored in the storage.
   *
   * @return - A Promise that resolves with the config data.
   *
   * @example
   * ```
   * auth.getConfigData().then((configData) => {
   *     // console.log(configData);
   * }).catch((error) => {
   *    // console.error(error);
   * });
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/main#getConfigData
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async getConfigData(): Promise<
    AuthClientConfig<MainThreadClientConfig> | AuthClientConfig<WebWorkerClientConfig> | undefined
  > {
    return this._client?.getConfigData();
  }

  /**
   * This method refreshes the access token.
   *
   * @return {TokenResponseInterface} - A Promise that resolves with an object containing
   * information about the refreshed access token.
   *
   * @example
   * ```
   * auth.refreshToken().then((response)=>{
   *      // console.log(response);
   * }).catch((error)=>{
   *      // console.error(error);
   * });
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#refreshtoken
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async refreshAccessToken(): Promise<User | undefined> {
    await this._validateMethod(false);

    return this._client?.refreshAccessToken();
  }

  /**
   * This method specifies if the user is authenticated or not.
   *
   * @return {Promise<boolean>} - A Promise that resolves with `true` if the user is authenticated.
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async isSignedIn(): Promise<boolean | undefined> {
    await this.isInitialized();

    return this._client?.isSignedIn();
  }

  /**
   * This method specifies if there is an active session in the browser or not.
   *
   * @return {Promise<boolean>} - A Promise that resolves with `true` if there is a session.
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async isSessionActive(): Promise<boolean | undefined> {
    await this.isInitialized();

    if (this._storage && [(BrowserStorage.WebWorker, BrowserStorage.BrowserMemory)].includes(this._storage)) {
      return Promise.reject(
        new AsgardeoAuthException(
          'SPA-AUTH_CLIENT-ISA-IV01',
          'The active session cannot be returned.',
          'The active session cannot be returned when the storage type is set to webWorker ' + 'or browserMemory.',
        ),
      );
    }
    const mainThreadClient = this._client as MainThreadClientInterface;

    return mainThreadClient?.isSessionActive();
  }

  /**
   * This method attaches a callback function to an event hook that fires the callback when the event happens.
   *
   * @param {Hooks.CustomGrant} hook - The name of the hook.
   * @param {(response?: any) => void} callback - The callback function.
   * @param {string} id (optional) - The id of the hook. This is used when multiple custom grants are used.
   *
   * @example
   * ```
   * auth.on("sign-in", (response)=>{
   *      // console.log(response);
   * });
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#on
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async on(hook: Hooks.CustomGrant, callback: (response?: any) => void, id: string): Promise<void>;
  public async on(hook: Exclude<Hooks, Hooks.CustomGrant>, callback: (response?: any) => void): Promise<void>;
  public async on(hook: Hooks, callback: (response?: any) => void | Promise<void>, id?: string): Promise<void> {
    await this.isInitialized();
    if (callback && typeof callback === 'function') {
      switch (hook) {
        case Hooks.SignIn:
          this._onSignInCallback = callback;
          break;
        case Hooks.SignOut:
          this._onSignOutCallback = callback;
          if (await SPAUtils.isSignOutSuccessful()) {
            this._onSignOutCallback();
          }
          break;
        case Hooks.RevokeAccessToken:
          this._onEndUserSession = callback;
          break;
        case Hooks.Initialize:
          this._onInitialize = callback;
          break;
        case Hooks.HttpRequestError:
          this._client?.setHttpRequestErrorCallback(callback);
          break;
        case Hooks.HttpRequestFinish:
          this._client?.setHttpRequestFinishCallback(callback);
          break;
        case Hooks.HttpRequestStart:
          this._client?.setHttpRequestStartCallback(callback);
          break;
        case Hooks.HttpRequestSuccess:
          this._client?.setHttpRequestSuccessCallback(callback);
          break;
        case Hooks.CustomGrant:
          id && this._onCustomGrant.set(id, callback);
          break;
        case Hooks.SignOutFailed: {
          this._onSignOutFailedCallback = callback;
          const signOutFail: boolean | SignOutError = SPAUtils.didSignOutFail();

          if (signOutFail) {
            this._onSignOutFailedCallback(signOutFail as SignOutError);
          }
          break;
        }
        default:
          throw new AsgardeoAuthException('SPA-AUTH_CLIENT-ON-IV01', 'Invalid hook.', 'The provided hook is invalid.');
      }
    } else {
      throw new AsgardeoAuthException(
        'SPA-AUTH_CLIENT-ON-IV02',
        'Invalid callback function.',
        'The provided callback function is invalid.',
      );
    }
  }

  /**
   * This method enables callback functions attached to the http client.
   *
   * @return {Promise<boolean>} - A promise that resolves with True.
   *
   * @example
   * ```
   * auth.enableHttpHandler();
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#enableHttpHandler
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async enableHttpHandler(): Promise<boolean | undefined> {
    await this.isInitialized();

    return this._client?.enableHttpHandler();
  }

  /**
   * This method disables callback functions attached to the http client.
   *
   * @return {Promise<boolean>} - A promise that resolves with True.
   *
   * @example
   * ```
   * auth.disableHttpHandler();
   * ```
   *
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master#disableHttpHandler
   *
   * @memberof AsgardeoSPAClient
   *
   * @preserve
   */
  public async disableHttpHandler(): Promise<boolean | undefined> {
    await this.isInitialized();

    return this._client?.disableHttpHandler();
  }

  /**
   * This method updates the configuration that was passed into the constructor when instantiating this class.
   *
   * @param {Partial<AuthClientConfig<T>>} config - A config object to update the SDK configurations with.
   *
   * @example
   * ```
   * const config = {
   *     afterSignInUrl: "http://localhost:3000/sign-in",
   *     clientId: "client ID",
   *     baseUrl: "https://api.asgardeo.io"
   * }
   * const auth.reInitialize(config);
   * ```
   * @link https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/master/lib#reInitialize
   *
   * @memberof AsgardeoAuthClient
   *
   * @preserve
   */
  public async reInitialize(config: Partial<AuthClientConfig<Config>>): Promise<void> {
    await this.isInitialized();
    if (this._storage === BrowserStorage.WebWorker) {
      const client = this._client as WebWorkerClientInterface;
      await client.reInitialize(config as Partial<AuthClientConfig<WebWorkerClientConfig>>);
    } else {
      const client = this._client as WebWorkerClientInterface;
      await client.reInitialize(config as Partial<AuthClientConfig<WebWorkerClientConfig>>);
    }

    return;
  }

  /**
   * This method clears the session information from the storage.
   * @param sessionId - The session ID of the session to be cleared. If not provided, the current session will be cleared.
   */
  public clearSession(sessionId?: string): void {
    AsgardeoAuthClient.clearSession(sessionId);
  }
}
