/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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

import {AuthClientConfig, StrictAuthClientConfig} from './models/auth-client-config';
import OIDCDiscoveryConstants from './constants/OIDCDiscoveryConstants';
import OIDCRequestConstants from './constants/OIDCRequestConstants';
import PKCEConstants from './constants/PKCEConstants';
import OIDCDiscoveryConstantsV2 from './constants/v2/OIDCDiscoveryConstants';
import {AsgardeoAuthException} from './errors/exception';
import {IsomorphicCrypto} from './IsomorphicCrypto';
import {Crypto} from './models/crypto';
import {ExtendedAuthorizeRequestUrlParams} from './models/oauth-request';
import {OIDCDiscoveryApiResponse} from './models/oidc-discovery';
import {OIDCEndpoints} from './models/oidc-endpoints';
import {Platform} from './models/platforms';
import {SessionData, UserSession} from './models/session';
import {Storage, TemporaryStore} from './models/store';
import {TokenResponse, IdToken, TokenExchangeRequestConfig} from './models/token';
import {TokenEndpointAuthMethod} from './models/token-endpoint-auth';
import {User} from './models/user';
import StorageManager from './StorageManager';
import deepMerge from './utils/deepMerge';
import extractPkceStorageKeyFromState from './utils/extractPkceStorageKeyFromState';
import generatePkceStorageKey from './utils/generatePkceStorageKey';
import getAuthorizeRequestUrlParams from './utils/getAuthorizeRequestUrlParams';
import processOpenIDScopes from './utils/processOpenIDScopes';
import getAuthenticatedUserInfo from './utils/getAuthenticatedUserInfo';
import clearSession from './utils/clearSession';
import requestAccessToken from './api/requestAccessToken';
import loadOpenIDProviderConfiguration from './api/loadOpenIDProviderConfiguration';
import revokeAccessToken from './api/revokeAccessToken';
import refreshAccessToken from './api/refreshAccessToken';
import exchangeToken from './api/exchangeToken';

/**
 * Default configurations.
 */
const DefaultConfig: Partial<AuthClientConfig<unknown>> = {
  enablePKCE: true,
  responseMode: 'query',
  sendCookiesInRequests: true,
  tokenValidation: {
    idToken: {
      clockTolerance: 300,
      validate: true,
      validateIssuer: true,
    },
  },
};

/**
 * This class provides the necessary methods needed to implement authentication.
 */
export class AsgardeoAuthClient<T> {
  private storageManager!: StorageManager<T>;

  private cryptoUtils: Crypto;

  private cryptoHelper: IsomorphicCrypto;

  private instanceIdValue: number;

  static _storageManager: any;

  public constructor() {
    // intentionally empty
  }

  public async initialize(
    config: AuthClientConfig<T>,
    store: Storage,
    inputCryptoUtils: Crypto,
    instanceID?: number,
  ): Promise<void> {
    const {clientId} = config;

    if (!this.instanceIdValue) {
      this.instanceIdValue = 0;
    } else {
      this.instanceIdValue += 1;
    }

    if (instanceID !== undefined) {
      this.instanceIdValue = instanceID;
    }

    if (!clientId) {
      this.storageManager = new StorageManager<T>(`instance_${this.instanceIdValue}`, store);
    } else {
      this.storageManager = new StorageManager<T>(`instance_${this.instanceIdValue}-${clientId}`, store);
    }

    this.cryptoUtils = inputCryptoUtils;
    this.cryptoHelper = new IsomorphicCrypto(inputCryptoUtils);

    AsgardeoAuthClient._storageManager = this.storageManager;

    const {applicationId, platform, endpoints} = config;
    let resolvedApplicationId: string | undefined = applicationId;

    if (applicationId) {
      await this.storageManager.setPersistedData({
        applicationId,
      });
    } else {
      const persistedData: TemporaryStore = await this.storageManager.getPersistedData();

      if (persistedData['applicationId']) {
        resolvedApplicationId = persistedData['applicationId'] as string;
      }
    }

    const resolvedEndpoints: Partial<OIDCEndpoints> = endpoints || {};

    if (platform === Platform.AsgardeoV2) {
      if (!resolvedEndpoints['wellKnown']) {
        resolvedEndpoints['wellKnown'] = OIDCDiscoveryConstantsV2.Endpoints.WELL_KNOWN;
      }
    }

    await this.storageManager.setConfigData({
      ...DefaultConfig,
      ...config,
      applicationId: resolvedApplicationId,
      endpoints: resolvedEndpoints,
      scope: processOpenIDScopes(config.scopes),
    });
  }

  public getStorageManager(): StorageManager<T> {
    return this.storageManager;
  }

  public getInstanceId(): number {
    return this.instanceIdValue;
  }

  public async getSignInUrl(requestConfig?: ExtendedAuthorizeRequestUrlParams, userId?: string): Promise<string> {
    const authRequestConfig: ExtendedAuthorizeRequestUrlParams = {...requestConfig};

    delete authRequestConfig?.forceInit;

    const buildSignInUrl = async (): Promise<string> => {
      const authorizeEndpoint: string = (await this.storageManager.getOIDCProviderMetaDataParameter(
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
      const configData: StrictAuthClientConfig = await this.storageManager.getConfigData() as unknown as StrictAuthClientConfig;
      const tempStore: TemporaryStore = await this.storageManager.getTemporaryData(userId);
      const pkceKey: string = await generatePkceStorageKey(tempStore);

      let codeVerifier: string | undefined;
      let codeChallenge: string | undefined;

      if (configData.enablePKCE) {
        codeVerifier = this.cryptoHelper?.getCodeVerifier();
        codeChallenge = await this.cryptoHelper?.getCodeChallenge(codeVerifier);
        await this.storageManager.setTemporaryDataParameter(pkceKey, codeVerifier, userId);
      }

      if (authRequestConfig['client_secret']) {
        authRequestConfig['client_secret'] = configData.clientSecret;
      }

      const authorizeRequestParams: Map<string, string> = getAuthorizeRequestUrlParams(
        {
          clientId: configData.clientId,
          codeChallenge,
          codeChallengeMethod: PKCEConstants.DEFAULT_CODE_CHALLENGE_METHOD,
          instanceId: this.getInstanceId().toString(),
          prompt: configData.prompt,
          redirectUri: configData.afterSignInUrl,
          responseMode: configData.responseMode,
          scopes: processOpenIDScopes(configData.scopes),
        },
        {key: pkceKey},
        authRequestConfig,
      );

      Array.from(authorizeRequestParams.entries()).forEach(([paramKey, paramValue]: [string, string]) => {
        authorizeRequest.searchParams.append(paramKey, paramValue);
      });

      return authorizeRequest.toString();
    };

    if (
      await this.storageManager.getTemporaryDataParameter(
        OIDCDiscoveryConstants.Storage.StorageKeys.OPENID_PROVIDER_CONFIG_INITIATED,
      )
    ) {
      return buildSignInUrl();
    }

    return this.loadOpenIDProviderConfiguration(requestConfig?.forceInit as boolean).then(() => buildSignInUrl());
  }

  public async requestAccessToken(
    authorizationCode: string,
    sessionState: string,
    state: string,
    userId?: string,
    tokenRequestConfig?: {
      params: Record<string, unknown>;
    },
  ): Promise<TokenResponse> {
    return requestAccessToken(
      this.storageManager,
      this.cryptoHelper,
      authorizationCode,
      sessionState,
      state,
      userId,
      tokenRequestConfig,
    );
  }

  public async loadOpenIDProviderConfiguration(forceInit: boolean): Promise<void> {
    return loadOpenIDProviderConfiguration(this.storageManager, this.cryptoHelper, forceInit);
  }

  public async getSignOutUrl(userId?: string): Promise<string> {
    const logoutEndpoint: string | undefined = (await this.storageManager.loadOpenIDProviderConfiguration())?.end_session_endpoint;
    const configData: StrictAuthClientConfig = await this.storageManager.getConfigData() as unknown as StrictAuthClientConfig;

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
      const idToken: string = (await this.storageManager.getSessionData(userId))?.id_token;

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

  public async getOpenIDProviderEndpoints(): Promise<Partial<OIDCEndpoints>> {
    const oidcProviderMetaData: OIDCDiscoveryApiResponse = await this.storageManager.loadOpenIDProviderConfiguration();

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

  public async decodeJwtToken<U = Record<string, unknown>>(token: string): Promise<U> {
    return this.cryptoHelper.decodeJwtToken(token);
  }

  public async getDecodedIdToken(userId?: string, idToken?: string): Promise<IdToken> {
    const storedIdToken: string = (await this.storageManager.getSessionData(userId)).id_token;
    const payload: IdToken = this.cryptoHelper.decodeJwtToken<IdToken>(storedIdToken ?? idToken);

    return payload;
  }

  public async getIdToken(userId?: string): Promise<string> {
    return (await this.storageManager.getSessionData(userId)).id_token;
  }

  public async getUser(userId?: string): Promise<User> {
    const sessionData: SessionData = await this.storageManager.getSessionData(userId);
    const authenticatedUser: User = getAuthenticatedUserInfo(this.cryptoHelper, sessionData?.id_token);

    Object.keys(authenticatedUser).forEach((key: string) => {
      if (authenticatedUser[key] === undefined || authenticatedUser[key] === '' || authenticatedUser[key] === null) {
        delete authenticatedUser[key];
      }
    });

    return authenticatedUser;
  }

  public async getUserSession(userId?: string): Promise<UserSession> {
    const sessionData: SessionData = await this.storageManager.getSessionData(userId);

    return {
      scopes: sessionData?.scope?.split(' '),
      sessionState: sessionData?.session_state ?? '',
    };
  }

  public async getCrypto(): Promise<IsomorphicCrypto> {
    return this.cryptoHelper;
  }

  public async revokeAccessToken(userId?: string): Promise<Response> {
    return revokeAccessToken(this.storageManager, userId);
  }

  public async refreshAccessToken(userId?: string): Promise<TokenResponse> {
    return refreshAccessToken(this.storageManager, this.cryptoHelper, userId);
  }

  public async getAccessToken(userId?: string): Promise<string> {
    return (await this.storageManager.getSessionData(userId))?.access_token;
  }

  public async exchangeToken(config: TokenExchangeRequestConfig, userId?: string): Promise<TokenResponse | Response> {
    return exchangeToken(this.storageManager, this.cryptoHelper, config, userId);
  }

  public async isSignedIn(userId?: string): Promise<boolean> {
    const isAccessTokenAvailable: boolean = Boolean(await this.getAccessToken(userId));

    // Check if the access token is expired.
    const createdAt: number = (await this.storageManager.getSessionData(userId))?.created_at;

    // Get the expires in value.
    const expiresInString: string = (await this.storageManager.getSessionData(userId))?.expires_in;

    // If the expires in value is not available, the token is invalid and the user is not authenticated.
    if (!expiresInString) {
      return false;
    }

    // Convert to milliseconds.
    const expiresIn: number = parseInt(expiresInString, 10) * 1000;
    const currentTime: number = new Date().getTime();
    const isAccessTokenValid: boolean = createdAt + expiresIn > currentTime;

    const isSignedIn: boolean = isAccessTokenAvailable && isAccessTokenValid;

    return isSignedIn;
  }

  public async getPKCECode(state: string, userId?: string): Promise<string> {
    return (await this.storageManager.getTemporaryDataParameter(
      extractPkceStorageKeyFromState(state),
      userId,
    )) as string;
  }

  public async setPKCECode(pkce: string, state: string, userId?: string): Promise<void> {
    return this.storageManager.setTemporaryDataParameter(extractPkceStorageKeyFromState(state), pkce, userId);
  }

  public static isSignOutSuccessful(afterSignOutUrl: string): boolean {
    const url: URL = new URL(afterSignOutUrl);
    const stateParam: string | null = url.searchParams.get(OIDCRequestConstants.Params.STATE);
    const error: boolean = Boolean(url.searchParams.get('error'));

    return stateParam ? stateParam === OIDCRequestConstants.Params.SIGN_OUT_SUCCESS && !error : false;
  }

  public static didSignOutFail(afterSignOutUrl: string): boolean {
    const url: URL = new URL(afterSignOutUrl);
    const stateParam: string | null = url.searchParams.get(OIDCRequestConstants.Params.STATE);
    const error: boolean = Boolean(url.searchParams.get('error'));

    return stateParam ? stateParam === OIDCRequestConstants.Params.SIGN_OUT_SUCCESS && error : false;
  }

  public async reInitialize(config: Partial<AuthClientConfig<T>>): Promise<void> {
    const currentConfig: AuthClientConfig<T> = await this.storageManager.getConfigData() as unknown as AuthClientConfig<T>;
    const newConfig: AuthClientConfig<T> = deepMerge(currentConfig, config);

    await this.storageManager.setConfigData(newConfig);
    await this.loadOpenIDProviderConfiguration(true);
  }

  public static async clearSession(userId?: string): Promise<void> {
    if (AsgardeoAuthClient._storageManager) {
      await clearSession(AsgardeoAuthClient._storageManager, userId);
    }
  }
}
