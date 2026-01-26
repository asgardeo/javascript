/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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

import StorageManager from '../StorageManager';
import {AuthClientConfig, StrictAuthClientConfig} from './models';
import {ExtendedAuthorizeRequestUrlParams} from '../models/oauth-request';
import {Crypto} from '../models/crypto';
import {TokenResponse, IdToken, TokenExchangeRequestConfig} from '../models/token';
import {OIDCEndpoints} from '../models/oidc-endpoints';
import {Storage} from '../models/store';
import ScopeConstants from '../constants/ScopeConstants';
import OIDCDiscoveryConstants from '../constants/OIDCDiscoveryConstants';
import OIDCRequestConstants from '../constants/OIDCRequestConstants';
import {IsomorphicCrypto} from '../IsomorphicCrypto';
import extractPkceStorageKeyFromState from '../utils/extractPkceStorageKeyFromState';
import generateStateParamForRequestCorrelation from '../utils/generateStateParamForRequestCorrelation';
import {AsgardeoAuthException} from '../errors/exception';
import {AuthenticationHelper} from './helpers';
import {SessionData, UserSession} from '../models/session';
import {AuthorizeRequestUrlParams} from '../models/oauth-request';
import {TemporaryStore} from '../models/store';
import generatePkceStorageKey from '../utils/generatePkceStorageKey';
import {OIDCDiscoveryApiResponse} from '../models/oidc-discovery';
import getAuthorizeRequestUrlParams from '../utils/getAuthorizeRequestUrlParams';
import PKCEConstants from '../constants/PKCEConstants';
import {User} from '../models/user';
import processOpenIDScopes from '../utils/processOpenIDScopes';

/**
 * Default configurations.
 */
const DefaultConfig: Partial<AuthClientConfig<unknown>> = {
  tokenValidation: {
    idToken: {
      validate: true,
      validateIssuer: true,
      clockTolerance: 300,
    },
  },
  enablePKCE: true,
  responseMode: 'query',
  sendCookiesInRequests: true,
};

/**
 * This class provides the necessary methods needed to implement authentication.
 */
export class AsgardeoAuthClient<T> {
  private _storageManager!: StorageManager<T>;
  private _config: () => Promise<AuthClientConfig>;
  private _oidcProviderMetaData: () => Promise<OIDCDiscoveryApiResponse>;
  private _authenticationHelper: AuthenticationHelper<T>;
  private _cryptoUtils: Crypto;
  private _cryptoHelper: IsomorphicCrypto;

  private static _instanceID: number;

  // FIXME: Validate this.
  // Ref: https://github.com/asgardeo/asgardeo-auth-js-core/pull/205
  static _authenticationHelper: any;

  /**
   * This is the constructor method that returns an instance of the .
   *
   * @param store - The store object.
   *
   * @example
   * ```
   * const _store: Store = new DataStore();
   * const auth = new AsgardeoAuthClient<CustomClientConfig>(_store);
   * ```
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#constructor}
   *
   * @preserve
   */
  public constructor() {}

  /**
   *
   * This method initializes the SDK with the config data.
   *
   * @param config - The config object to initialize with.
   *
   * @example
   * const config = \{
   *     afterSignInUrl: "http://localhost:3000/sign-in",
   *     clientId: "client ID",
   *     baseUrl: "https://localhost:9443"
   * \}
   *
   * await auth.initialize(config);
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#initialize}
   *
   * @preserve
   */
  public async initialize(
    config: AuthClientConfig<T>,
    store: Storage,
    cryptoUtils: Crypto,
    instanceID?: number,
  ): Promise<void> {
    const clientId: string = config.clientId;

    if (!AsgardeoAuthClient._instanceID) {
      AsgardeoAuthClient._instanceID = 0;
    } else {
      AsgardeoAuthClient._instanceID += 1;
    }

    if (instanceID) {
      AsgardeoAuthClient._instanceID = instanceID;
    }

    if (!clientId) {
      this._storageManager = new StorageManager<T>(`instance_${AsgardeoAuthClient._instanceID}`, store);
    } else {
      this._storageManager = new StorageManager<T>(`instance_${AsgardeoAuthClient._instanceID}-${clientId}`, store);
    }

    this._cryptoUtils = cryptoUtils;
    this._cryptoHelper = new IsomorphicCrypto(cryptoUtils);
    this._authenticationHelper = new AuthenticationHelper(this._storageManager, this._cryptoHelper);
    this._config = async () => await this._storageManager.getConfigData();
    this._oidcProviderMetaData = async () => await this._storageManager.loadOpenIDProviderConfiguration();

    // FIXME: Validate this.
    // Ref: https://github.com/asgardeo/asgardeo-auth-js-core/pull/205
    AsgardeoAuthClient._authenticationHelper = this._authenticationHelper;

    await this._storageManager.setConfigData({
      ...DefaultConfig,
      ...config,
      scope: processOpenIDScopes(config.scopes),
    });
  }

  /**
   * This method returns the `StorageManager` object that allows you to access authentication data.
   *
   * @returns - The `StorageManager` object.
   *
   * @example
   * ```
   * const data = auth.getStorageManager();
   * ```
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#getStorageManager}
   *
   * @preserve
   */
  public getStorageManager(): StorageManager<T> {
    return this._storageManager;
  }

  /**
   * This method returns the `instanceID` variable of the given instance.
   *
   * @returns - The `instanceID` number.
   *
   * @example
   * ```
   * const instanceId = auth.getInstanceId();
   * ```
   *
   * @preserve
   */
  public getInstanceId(): number {
    return AsgardeoAuthClient._instanceID;
  }

  /**
   * This is an async method that returns a Promise that resolves with the authorization URL.
   *
   * @param config - (Optional) A config object to force initialization and pass
   * custom path parameters such as the fidp parameter.
   * @param userId - (Optional) A unique ID of the user to be authenticated. This is useful in multi-user
   * scenarios where each user should be uniquely identified.
   *
   * @returns - A promise that resolves with the authorization URL.
   *
   * @example
   * ```
   * auth.getSignInUrl().then((url)=>{
   *  // console.log(url);
   * }).catch((error)=>{
   *  // console.error(error);
   * });
   * ```
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#getSignInUrl}
   *
   * @preserve
   */
  public async getSignInUrl(requestConfig?: ExtendedAuthorizeRequestUrlParams, userId?: string): Promise<string> {
    const authRequestConfig: ExtendedAuthorizeRequestUrlParams = {...requestConfig};

    delete authRequestConfig?.forceInit;

    const __TODO__ = async () => {
      const authorizeEndpoint: string = (await this._storageManager.getOIDCProviderMetaDataParameter(
        OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.AUTHORIZATION as keyof OIDCDiscoveryApiResponse,
      )) as string;

      if (!authorizeEndpoint || authorizeEndpoint.trim().length === 0) {
        throw new AsgardeoAuthException(
          'JS-AUTH_CORE-GAU-NF01',
          'No authorization endpoint found.',
          'No authorization endpoint was found in the OIDC provider meta data from the well-known endpoint ' +
            'or the authorization endpoint passed to the SDK is empty.',
        );
      }

      const authorizeRequest: URL = new URL(authorizeEndpoint);
      const configData: StrictAuthClientConfig = await this._config();
      const tempStore: TemporaryStore = await this._storageManager.getTemporaryData(userId);
      const pkceKey: string = await generatePkceStorageKey(tempStore);

      let codeVerifier: string | undefined;
      let codeChallenge: string | undefined;

      if (configData.enablePKCE) {
        codeVerifier = this._cryptoHelper?.getCodeVerifier();
        codeChallenge = this._cryptoHelper?.getCodeChallenge(codeVerifier);
        await this._storageManager.setTemporaryDataParameter(pkceKey, codeVerifier, userId);
      }

      if (authRequestConfig['client_secret']) {
        authRequestConfig['client_secret'] = configData.clientSecret;
      }

      const authorizeRequestParams: Map<string, string> = getAuthorizeRequestUrlParams(
        {
          redirectUri: configData.afterSignInUrl,
          clientId: configData.clientId,
          scopes: processOpenIDScopes(configData.scopes),
          responseMode: configData.responseMode,
          codeChallengeMethod: PKCEConstants.DEFAULT_CODE_CHALLENGE_METHOD,
          codeChallenge,
          prompt: configData.prompt,
        },
        {key: pkceKey},
        authRequestConfig,
      );

      for (const [key, value] of authorizeRequestParams.entries()) {
        authorizeRequest.searchParams.append(key, value);
      }

      return authorizeRequest.toString();
    };

    if (
      await this._storageManager.getTemporaryDataParameter(
        OIDCDiscoveryConstants.Storage.StorageKeys.OPENID_PROVIDER_CONFIG_INITIATED,
      )
    ) {
      return __TODO__();
    }

    return this.loadOpenIDProviderConfiguration(requestConfig?.forceInit as boolean).then(() => {
      return __TODO__();
    });
  }

  /**
   * This is an async method that sends a request to obtain the access token and returns a Promise
   * that resolves with the token and other relevant data.
   *
   * @param authorizationCode - The authorization code.
   * @param sessionState - The session state.
   * @param userId - (Optional) A unique ID of the user to be authenticated. This is useful in multi-user
   * scenarios where each user should be uniquely identified.
   *
   * @returns - A Promise that resolves with the token response.
   *
   * @example
   * ```
   * auth.requestAccessToken(authCode, sessionState).then((token)=>{
   *  // console.log(token);
   * }).catch((error)=>{
   *  // console.error(error);
   * });
   * ```
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#requestAccessToken}
   *
   *
   * @preserve
   */
  public async requestAccessToken(
    authorizationCode: string,
    sessionState: string,
    state: string,
    userId?: string,
    tokenRequestConfig?: {
      params: Record<string, unknown>;
    },
  ): Promise<TokenResponse> {
    const __TODO__ = async () => {
      const tokenEndpoint: string | undefined = (await this._oidcProviderMetaData()).token_endpoint;
      const configData: StrictAuthClientConfig = await this._config();

      if (!tokenEndpoint || tokenEndpoint.trim().length === 0) {
        throw new AsgardeoAuthException(
          'JS-AUTH_CORE-RAT1-NF01',
          'Token endpoint not found.',
          'No token endpoint was found in the OIDC provider meta data returned by the well-known endpoint ' +
            'or the token endpoint passed to the SDK is empty.',
        );
      }

      sessionState &&
        (await this._storageManager.setSessionDataParameter(
          OIDCRequestConstants.Params.SESSION_STATE as keyof SessionData,
          sessionState,
          userId,
        ));

      const body: URLSearchParams = new URLSearchParams();

      body.set('client_id', configData.clientId);

      if (configData.clientSecret && configData.clientSecret.trim().length > 0) {
        body.set('client_secret', configData.clientSecret);
      }

      const code: string = authorizationCode;

      body.set('code', code);

      body.set('grant_type', 'authorization_code');
      body.set('redirect_uri', configData.afterSignInUrl);

      if (tokenRequestConfig?.params) {
        Object.entries(tokenRequestConfig.params).forEach(([key, value]: [key: string, value: unknown]) => {
          body.append(key, value as string);
        });
      }

      if (configData.enablePKCE) {
        body.set(
          'code_verifier',
          `${await this._storageManager.getTemporaryDataParameter(extractPkceStorageKeyFromState(state), userId)}`,
        );

        await this._storageManager.removeTemporaryDataParameter(extractPkceStorageKeyFromState(state), userId);
      }

      let tokenResponse: Response;

      try {
        tokenResponse = await fetch(tokenEndpoint, {
          body: body,
          credentials: configData.sendCookiesInRequests ? 'include' : 'same-origin',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          method: 'POST',
        });
      } catch (error: any) {
        throw new AsgardeoAuthException(
          'JS-AUTH_CORE-RAT1-NE02',
          'Requesting access token failed',
          error ?? 'The request to get the access token from the server failed.',
        );
      }

      if (!tokenResponse.ok) {
        throw new AsgardeoAuthException(
          'JS-AUTH_CORE-RAT1-HE03',
          `Requesting access token failed with ${tokenResponse.statusText}`,
          (await tokenResponse.json()) as string,
        );
      }

      return await this._authenticationHelper.handleTokenResponse(tokenResponse, userId);
    };

    if (
      await this._storageManager.getTemporaryDataParameter(
        OIDCDiscoveryConstants.Storage.StorageKeys.OPENID_PROVIDER_CONFIG_INITIATED,
      )
    ) {
      return __TODO__();
    }

    return this.loadOpenIDProviderConfiguration(false).then(() => {
      return __TODO__();
    });
  }

  public async loadOpenIDProviderConfiguration(forceInit: boolean): Promise<void> {
    const configData: StrictAuthClientConfig = await this._config();

    if (
      !forceInit &&
      (await this._storageManager.getTemporaryDataParameter(
        OIDCDiscoveryConstants.Storage.StorageKeys.OPENID_PROVIDER_CONFIG_INITIATED,
      ))
    ) {
      return Promise.resolve();
    }

    const wellKnownEndpoint: string = (configData as any).wellKnownEndpoint;

    if (wellKnownEndpoint) {
      let response: Response;

      try {
        response = await fetch(wellKnownEndpoint);
        if (response.status !== 200 || !response.ok) {
          throw new Error();
        }
      } catch {
        throw new AsgardeoAuthException(
          'JS-AUTH_CORE-GOPMD-HE01',
          'Invalid well-known response',
          'The well known endpoint response has been failed with an error.',
        );
      }

      await this._storageManager.setOIDCProviderMetaData(
        await this._authenticationHelper.resolveEndpoints(await response.json()),
      );
      await this._storageManager.setTemporaryDataParameter(
        OIDCDiscoveryConstants.Storage.StorageKeys.OPENID_PROVIDER_CONFIG_INITIATED,
        true,
      );

      return Promise.resolve();
    } else if ((configData as any).baseUrl) {
      try {
        await this._storageManager.setOIDCProviderMetaData(
          await this._authenticationHelper.resolveEndpointsByBaseURL(),
        );
      } catch (error: any) {
        throw new AsgardeoAuthException(
          'JS-AUTH_CORE-GOPMD-IV02',
          'Resolving endpoints failed.',
          error ?? 'Resolving endpoints by base url failed.',
        );
      }
      await this._storageManager.setTemporaryDataParameter(
        OIDCDiscoveryConstants.Storage.StorageKeys.OPENID_PROVIDER_CONFIG_INITIATED,
        true,
      );

      return Promise.resolve();
    } else {
      await this._storageManager.setOIDCProviderMetaData(await this._authenticationHelper.resolveEndpointsExplicitly());

      await this._storageManager.setTemporaryDataParameter(
        OIDCDiscoveryConstants.Storage.StorageKeys.OPENID_PROVIDER_CONFIG_INITIATED,
        true,
      );

      return Promise.resolve();
    }
  }

  /**
   * This method returns the sign-out URL.
   *
   * @param userId - (Optional) A unique ID of the user to be authenticated. This is useful in multi-user
   * scenarios where each user should be uniquely identified.
   *
   * **This doesn't clear the authentication data.**
   *
   * @returns - A Promise that resolves with the sign-out URL.
   *
   * @example
   * ```
   * const signOutUrl = await auth.getSignOutUrl();
   * ```
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#getSignOutUrl}
   *
   * @preserve
   */
  public async getSignOutUrl(userId?: string): Promise<string> {
    const logoutEndpoint: string | undefined = (await this._oidcProviderMetaData())?.end_session_endpoint;
    const configData: StrictAuthClientConfig = await this._config();

    if (!logoutEndpoint || logoutEndpoint.trim().length === 0) {
      throw new AsgardeoAuthException(
        'JS-AUTH_CORE-GSOU-NF01',
        'Sign-out endpoint not found.',
        'No sign-out endpoint was found in the OIDC provider meta data returned by the well-known endpoint ' +
          'or the sign-out endpoint passed to the SDK is empty.',
      );
    }

    const callbackURL: string = configData?.afterSignOutUrl ?? configData?.afterSignInUrl;

    if (!callbackURL || callbackURL.trim().length === 0) {
      throw new AsgardeoAuthException(
        'JS-AUTH_CORE-GSOU-NF03',
        'No sign-out redirect URL found.',
        'The sign-out redirect URL cannot be found or the URL passed to the SDK is empty. ' +
          'No sign-in redirect URL has been found either. ',
      );
    }
    const queryParams: URLSearchParams = new URLSearchParams();

    queryParams.set('post_logout_redirect_uri', callbackURL);

    if (configData.sendIdTokenInLogoutRequest) {
      const idToken: string = (await this._storageManager.getSessionData(userId))?.id_token;

      if (!idToken || idToken.trim().length === 0) {
        throw new AsgardeoAuthException(
          'JS-AUTH_CORE-GSOU-NF02',
          'ID token not found.',
          'No ID token could be found. Either the session information is lost or you have not signed in.',
        );
      }
      queryParams.set('id_token_hint', idToken);
    } else {
      queryParams.set('client_id', configData.clientId);
    }

    queryParams.set('state', OIDCRequestConstants.Params.SIGN_OUT_SUCCESS);

    return `${logoutEndpoint}?${queryParams.toString()}`;
  }

  /**
   * This method returns OIDC service endpoints that are fetched from the `.well-known` endpoint.
   *
   * @returns - A Promise that resolves with an object containing the OIDC service endpoints.
   *
   * @example
   * ```
   * const endpoints = await auth.getOpenIDProviderEndpoints();
   * ```
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#getOpenIDProviderEndpoints}
   *
   * @preserve
   */
  public async getOpenIDProviderEndpoints(): Promise<Partial<OIDCEndpoints>> {
    const oidcProviderMetaData: OIDCDiscoveryApiResponse = await this._oidcProviderMetaData();

    return {
      authorizationEndpoint: oidcProviderMetaData.authorization_endpoint ?? '',
      checkSessionIframe: oidcProviderMetaData.check_session_iframe ?? '',
      endSessionEndpoint: oidcProviderMetaData.end_session_endpoint ?? '',
      introspectionEndpoint: oidcProviderMetaData.introspection_endpoint ?? '',
      issuer: oidcProviderMetaData.issuer ?? '',
      jwksUri: oidcProviderMetaData.jwks_uri ?? '',
      registrationEndpoint: oidcProviderMetaData.registration_endpoint ?? '',
      revocationEndpoint: oidcProviderMetaData.revocation_endpoint ?? '',
      tokenEndpoint: oidcProviderMetaData.token_endpoint ?? '',
      userinfoEndpoint: oidcProviderMetaData.userinfo_endpoint ?? '',
    };
  }

  /**
   * This method decodes a given JWT token and returns the payload.
   *
   * @param token - The token to be decoded.
   * @returns - A Promise that resolves with the decoded token payload.
   *
   * @example
   * ```
   * const decodedToken = await auth.decodeJwtToken(token);
   * ```
   */
  public async decodeJwtToken<T = Record<string, unknown>>(token: string): Promise<T> {
    return this._cryptoHelper.decodeJwtToken(token);
  }

  /**
   * This method decodes the payload of the ID token and returns it.
   *
   * @param userId - (Optional) A unique ID of the user to be authenticated. This is useful in multi-user
   * scenarios where each user should be uniquely identified.
   *
   * @returns - A Promise that resolves with the decoded ID token payload.
   *
   * @example
   * ```
   * const decodedIdToken = await auth.getDecodedIdToken();
   * ```
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#getDecodedIdToken}
   *
   * @preserve
   */
  public async getDecodedIdToken(userId?: string, idToken?: string): Promise<IdToken> {
    const _idToken: string = (await this._storageManager.getSessionData(userId)).id_token;
    const payload: IdToken = this._cryptoHelper.decodeJwtToken<IdToken>(_idToken ?? idToken);

    return payload;
  }

  /**
   * This method returns the ID token.
   *
   * @param userId - (Optional) A unique ID of the user to be authenticated. This is useful in multi-user
   * scenarios where each user should be uniquely identified.
   *
   * @returns - A Promise that resolves with the ID token.
   *
   * @example
   * ```
   * const idToken = await auth.getIdToken();
   * ```
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#getIdToken}
   *
   * @preserve
   */
  public async getIdToken(userId?: string): Promise<string> {
    return (await this._storageManager.getSessionData(userId)).id_token;
  }

  /**
   * This method returns the basic user information obtained from the ID token.
   *
   * @param userId - (Optional) A unique ID of the user to be authenticated. This is useful in multi-user
   * scenarios where each user should be uniquely identified.
   *
   * @returns - A Promise that resolves with an object containing the basic user information.
   *
   * @example
   * ```
   * const userInfo = await auth.getUser();
   * ```
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#getUser}
   *
   * @preserve
   */
  public async getUser(userId?: string): Promise<User> {
    const sessionData: SessionData = await this._storageManager.getSessionData(userId);
    const authenticatedUser: User = this._authenticationHelper.getAuthenticatedUserInfo(sessionData?.id_token);

    Object.keys(authenticatedUser).forEach((key: string) => {
      if (authenticatedUser[key] === undefined || authenticatedUser[key] === '' || authenticatedUser[key] === null) {
        delete authenticatedUser[key];
      }
    });

    return authenticatedUser;
  }

  public async getUserSession(userId?: string): Promise<UserSession> {
    const sessionData: SessionData = await this._storageManager.getSessionData(userId);

    return {
      scopes: sessionData?.scope?.split(' '),
      sessionState: sessionData?.session_state ?? '',
    };
  }

  /**
   * This method returns the crypto helper object.
   *
   * @returns - A Promise that resolves with a IsomorphicCrypto object.
   *
   * @example
   * ```
   * const cryptoHelper = await auth.IsomorphicCrypto();
   * ```
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#getCrypto}
   *
   * @preserve
   */
  public async getCrypto(): Promise<IsomorphicCrypto> {
    return this._cryptoHelper;
  }

  /**
   * This method revokes the access token.
   *
   * @param userId - (Optional) A unique ID of the user to be authenticated. This is useful in multi-user
   * scenarios where each user should be uniquely identified.
   *
   * **This method also clears the authentication data.**
   *
   * @returns - A Promise that returns the response of the revoke-access-token request.
   *
   * @example
   * ```
   * auth.revokeAccessToken().then((response)=>{
   *  // console.log(response);
   * }).catch((error)=>{
   *  // console.error(error);
   * });
   * ```
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#revokeAccessToken}
   *
   * @preserve
   */
  public async revokeAccessToken(userId?: string): Promise<Response> {
    const revokeTokenEndpoint: string | undefined = (await this._oidcProviderMetaData()).revocation_endpoint;
    const configData: StrictAuthClientConfig = await this._config();

    if (!revokeTokenEndpoint || revokeTokenEndpoint.trim().length === 0) {
      throw new AsgardeoAuthException(
        'JS-AUTH_CORE-RAT3-NF01',
        'No revoke access token endpoint found.',
        'No revoke access token endpoint was found in the OIDC provider meta data returned by ' +
          'the well-known endpoint or the revoke access token endpoint passed to the SDK is empty.',
      );
    }

    const body: string[] = [];

    body.push(`client_id=${configData.clientId}`);
    body.push(`token=${(await this._storageManager.getSessionData(userId)).access_token}`);
    body.push('token_type_hint=access_token');

    if (configData.clientSecret && configData.clientSecret.trim().length > 0) {
      body.push(`client_secret=${configData.clientSecret}`);
    }

    let response: Response;

    try {
      response = await fetch(revokeTokenEndpoint, {
        body: body.join('&'),
        credentials: configData.sendCookiesInRequests ? 'include' : 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      });
    } catch (error: any) {
      throw new AsgardeoAuthException(
        'JS-AUTH_CORE-RAT3-NE02',
        'The request to revoke access token failed.',
        error ?? 'The request sent to revoke the access token failed.',
      );
    }

    if (response.status !== 200 || !response.ok) {
      throw new AsgardeoAuthException(
        'JS-AUTH_CORE-RAT3-HE03',
        `Invalid response status received for revoke access token request (${response.statusText}).`,
        (await response.json()) as string,
      );
    }

    this._authenticationHelper.clearSession(userId);

    return Promise.resolve(response);
  }

  /**
   * This method refreshes the access token and returns a Promise that resolves with the new access
   * token and other relevant data.
   *
   * @param userId - (Optional) A unique ID of the user to be authenticated. This is useful in multi-user
   * scenarios where each user should be uniquely identified.
   *
   * @returns - A Promise that resolves with the token response.
   *
   * @example
   * ```
   * auth.refreshAccessToken().then((response)=>{
   *  // console.log(response);
   * }).catch((error)=>{
   *  // console.error(error);
   * });
   * ```
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#refreshAccessToken}
   *
   * @preserve
   */
  public async refreshAccessToken(userId?: string): Promise<TokenResponse> {
    const tokenEndpoint: string | undefined = (await this._oidcProviderMetaData()).token_endpoint;
    const configData: StrictAuthClientConfig = await this._config();
    const sessionData: SessionData = await this._storageManager.getSessionData(userId);

    if (!sessionData.refresh_token) {
      throw new AsgardeoAuthException(
        'JS-AUTH_CORE-RAT2-NF01',
        'No refresh token found.',
        "There was no refresh token found. Asgardeo doesn't return a " +
          'refresh token if the refresh token grant is not enabled.',
      );
    }

    if (!tokenEndpoint || tokenEndpoint.trim().length === 0) {
      throw new AsgardeoAuthException(
        'JS-AUTH_CORE-RAT2-NF02',
        'No refresh token endpoint found.',
        'No refresh token endpoint was in the OIDC provider meta data returned by the well-known ' +
          'endpoint or the refresh token endpoint passed to the SDK is empty.',
      );
    }

    const body: string[] = [];

    body.push(`client_id=${configData.clientId}`);
    body.push(`refresh_token=${sessionData.refresh_token}`);
    body.push('grant_type=refresh_token');

    if (configData.clientSecret && configData.clientSecret.trim().length > 0) {
      body.push(`client_secret=${configData.clientSecret}`);
    }

    let tokenResponse: Response;

    try {
      tokenResponse = await fetch(tokenEndpoint, {
        body: body.join('&'),
        credentials: configData.sendCookiesInRequests ? 'include' : 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      });
    } catch (error: any) {
      throw new AsgardeoAuthException(
        'JS-AUTH_CORE-RAT2-NR03',
        'Refresh access token request failed.',
        error ?? 'The request to refresh the access token failed.',
      );
    }

    if (!tokenResponse.ok) {
      throw new AsgardeoAuthException(
        'JS-AUTH_CORE-RAT2-HE04',
        `Refreshing access token failed with ${tokenResponse.statusText}`,
        (await tokenResponse.json()) as string,
      );
    }

    return this._authenticationHelper.handleTokenResponse(tokenResponse, userId);
  }

  /**
   * This method returns the access token.
   *
   * @param userId - (Optional) A unique ID of the user to be authenticated. This is useful in multi-user
   * scenarios where each user should be uniquely identified.
   *
   * @returns - A Promise that resolves with the access token.
   *
   * @example
   * ```
   * const accessToken = await auth.getAccessToken();
   * ```
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#getAccessToken}
   *
   * @preserve
   */
  public async getAccessToken(userId?: string): Promise<string> {
    return (await this._storageManager.getSessionData(userId))?.access_token;
  }

  /**
   * This method sends a custom-grant request and returns a Promise that resolves with the response
   * depending on the config passed.
   *
   * @param config - A config object containing the custom grant configurations.
   * @param userId - (Optional) A unique ID of the user to be authenticated. This is useful in multi-user
   * scenarios where each user should be uniquely identified.
   *
   * @returns - A Promise that resolves with the response depending
   * on your configurations.
   *
   * @example
   * ```
   * const config = {
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
   * }
   *
   * auth.exchangeToken(config).then((response)=>{
   *  // console.log(response);
   * }).catch((error)=>{
   *  // console.error(error);
   * });
   * ```
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#exchangeToken}
   *
   * @preserve
   */
  public async exchangeToken(config: TokenExchangeRequestConfig, userId?: string): Promise<TokenResponse | Response> {
    const oidcProviderMetadata: OIDCDiscoveryApiResponse = await this._oidcProviderMetaData();
    const configData: StrictAuthClientConfig = await this._config();

    let tokenEndpoint: string | undefined;

    if (config.tokenEndpoint && config.tokenEndpoint.trim().length !== 0) {
      tokenEndpoint = config.tokenEndpoint;
    } else {
      tokenEndpoint = oidcProviderMetadata.token_endpoint;
    }

    if (!tokenEndpoint || tokenEndpoint.trim().length === 0) {
      throw new AsgardeoAuthException(
        'JS-AUTH_CORE-RCG-NF01',
        'Token endpoint not found.',
        'No token endpoint was found in the OIDC provider meta data returned by the well-known endpoint ' +
          'or the token endpoint passed to the SDK is empty.',
      );
    }

    const data: string[] = await Promise.all(
      Object.entries(config.data).map(async ([key, value]: [key: string, value: any]) => {
        const newValue: string = await this._authenticationHelper.replaceCustomGrantTemplateTags(
          value as string,
          userId,
        );

        return `${key}=${newValue}`;
      }),
    );

    let requestHeaders: Record<string, any> = {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (config.attachToken) {
      requestHeaders = {
        ...requestHeaders,
        Authorization: `Bearer ${(await this._storageManager.getSessionData(userId)).access_token}`,
      };
    }

    const requestConfig: RequestInit = {
      body: data.join('&'),
      credentials: configData.sendCookiesInRequests ? 'include' : 'same-origin',
      headers: new Headers(requestHeaders),
      method: 'POST',
    };

    let response: Response;

    try {
      response = await fetch(tokenEndpoint, requestConfig);
    } catch (error: any) {
      throw new AsgardeoAuthException(
        'JS-AUTH_CORE-RCG-NE02',
        'The custom grant request failed.',
        error ?? 'The request sent to get the custom grant failed.',
      );
    }

    if (response.status !== 200 || !response.ok) {
      throw new AsgardeoAuthException(
        'JS-AUTH_CORE-RCG-HE03',
        `Invalid response status received for the custom grant request. (${response.statusText})`,
        (await response.json()) as string,
      );
    }

    if (config.returnsSession) {
      return this._authenticationHelper.handleTokenResponse(response, userId);
    } else {
      return Promise.resolve((await response.json()) as TokenResponse | Response);
    }
  }

  /**
   * This method returns if the user is authenticated or not.
   *
   * @param userId - (Optional) A unique ID of the user to be authenticated. This is useful in multi-user
   * scenarios where each user should be uniquely identified.
   *
   * @returns - A Promise that resolves with `true` if the user is authenticated, `false` otherwise.
   *
   * @example
   * ```
   * await auth.isSignedIn();
   * ```
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#isSignedIn}
   *
   * @preserve
   */
  public async isSignedIn(userId?: string): Promise<boolean> {
    const isAccessTokenAvailable: boolean = Boolean(await this.getAccessToken(userId));

    // Check if the access token is expired.
    const createdAt: number = (await this._storageManager.getSessionData(userId))?.created_at;

    // Get the expires in value.
    const expiresInString: string = (await this._storageManager.getSessionData(userId))?.expires_in;

    // If the expires in value is not available, the token is invalid and the user is not authenticated.
    if (!expiresInString) {
      return false;
    }

    // Convert to milliseconds.
    const expiresIn: number = parseInt(expiresInString) * 1000;
    const currentTime: number = new Date().getTime();
    const isAccessTokenValid: boolean = createdAt + expiresIn > currentTime;

    const isSignedIn: boolean = isAccessTokenAvailable && isAccessTokenValid;

    return isSignedIn;
  }

  /**
   * This method returns the PKCE code generated during the generation of the authentication URL.
   *
   * @param userId - (Optional) A unique ID of the user to be authenticated. This is useful in multi-user
   * scenarios where each user should be uniquely identified.
   * @param state - The state parameter that was passed in the authentication URL.
   *
   * @returns - A Promise that resolves with the PKCE code.
   *
   * @example
   * ```
   * const pkce = await getPKCECode();
   * ```
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#getPKCECode}
   *
   * @preserve
   */
  public async getPKCECode(state: string, userId?: string): Promise<string> {
    return (await this._storageManager.getTemporaryDataParameter(
      extractPkceStorageKeyFromState(state),
      userId,
    )) as string;
  }

  /**
   * This method sets the PKCE code to the data store.
   *
   * @param pkce - The PKCE code.
   * @param state - The state parameter that was passed in the authentication URL.
   * @param userId - (Optional) A unique ID of the user to be authenticated. This is useful in multi-user
   * scenarios where each user should be uniquely identified.
   *
   * @example
   * ```
   * await auth.setPKCECode("pkce_code")
   * ```
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#setPKCECode}
   *
   * @preserve
   */
  public async setPKCECode(pkce: string, state: string, userId?: string): Promise<void> {
    return await this._storageManager.setTemporaryDataParameter(extractPkceStorageKeyFromState(state), pkce, userId);
  }

  /**
   * This method returns if the sign-out is successful or not.
   *
   * @param signOutRedirectUrl - The URL to which the user has been redirected to after signing-out.
   *
   * **The server appends path parameters to the `afterSignOutUrl` and these path parameters
   *  are required for this method to function.**
   *
   * @returns - `true` if successful, `false` otherwise.
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#isSignOutSuccessful}
   *
   * @preserve
   */
  public static isSignOutSuccessful(afterSignOutUrl: string): boolean {
    const url: URL = new URL(afterSignOutUrl);
    const stateParam: string | null = url.searchParams.get(OIDCRequestConstants.Params.STATE);
    const error: boolean = Boolean(url.searchParams.get('error'));

    return stateParam ? stateParam === OIDCRequestConstants.Params.SIGN_OUT_SUCCESS && !error : false;
  }

  /**
   * This method returns if the sign-out has failed or not.
   *
   * @param signOutRedirectUrl - The URL to which the user has been redirected to after signing-out.
   *
   * **The server appends path parameters to the `afterSignOutUrl` and these path parameters
   *  are required for this method to function.**
   *
   * @returns - `true` if successful, `false` otherwise.
   *
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#didSignOutFail}
   *
   * @preserve
   */
  public static didSignOutFail(afterSignOutUrl: string): boolean {
    const url: URL = new URL(afterSignOutUrl);
    const stateParam: string | null = url.searchParams.get(OIDCRequestConstants.Params.STATE);
    const error: boolean = Boolean(url.searchParams.get('error'));

    return stateParam ? stateParam === OIDCRequestConstants.Params.SIGN_OUT_SUCCESS && error : false;
  }

  /**
   * This method updates the configuration that was passed into the constructor when instantiating this class.
   *
   * @param config - A config object to update the SDK configurations with.
   *
   * @example
   * ```
   * const config = {
   *     afterSignInUrl: "http://localhost:3000/sign-in",
   *     clientId: "client ID",
   *     baseUrl: "https://localhost:9443"
   * }
   *
   * await auth.reInitialize(config);
   * ```
   * {@link https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master#reInitialize}
   *
   * @preserve
   */
  public async reInitialize(config: Partial<AuthClientConfig<T>>): Promise<void> {
    await this._storageManager.setConfigData(config);
    await this.loadOpenIDProviderConfiguration(true);
  }

  public static async clearSession(userId?: string): Promise<void> {
    await this._authenticationHelper.clearSession(userId);
  }
}
