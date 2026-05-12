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

import exchangeToken from './api/exchangeToken';
import executeEmbeddedSignInFlow from './api/executeEmbeddedSignInFlow';
import initializeEmbeddedSignInFlow from './api/initializeEmbeddedSignInFlow';
import loadOpenIDProviderConfiguration from './api/loadOpenIDProviderConfiguration';
import refreshAccessToken from './api/refreshAccessToken';
import requestAccessToken from './api/requestAccessToken';
import revokeAccessToken from './api/revokeAccessToken';
import OIDCDiscoveryConstants from './constants/OIDCDiscoveryConstants';
import OIDCDiscoveryConstantsV2 from './constants/v2/OIDCDiscoveryConstants';
import OIDCRequestConstants from './constants/OIDCRequestConstants';
import PKCEConstants from './constants/PKCEConstants';
import {DefaultCacheStore} from './DefaultCacheStore';
import {DefaultCrypto} from './DefaultCrypto';
import {AsgardeoAuthException} from './errors/exception';
import {IsomorphicCrypto} from './IsomorphicCrypto';
import {AgentConfig} from './models/agent';
import {AuthCodeResponse} from './models/auth-code-response';
import {AuthClientConfig, StrictAuthClientConfig} from './models/auth-client-config';
import {AsgardeoClient} from './models/client';
import {Config, SignInOptions, SignOutOptions, SignUpOptions} from './models/config';
import {Crypto} from './models/crypto';
import {ExtendedAuthorizeRequestUrlParams} from './models/oauth-request';
import {
  EmbeddedFlowExecuteRequestConfig,
  EmbeddedFlowExecuteRequestPayload,
  EmbeddedFlowExecuteResponse,
} from './models/embedded-flow';
import {
  EmbeddedSignInFlowAuthenticator,
  EmbeddedSignInFlowHandleResponse,
  EmbeddedSignInFlowInitiateResponse,
  EmbeddedSignInFlowStatus,
} from './models/embedded-signin-flow';
import {OIDCDiscoveryApiResponse} from './models/oidc-discovery';
import {OIDCEndpoints} from './models/oidc-endpoints';
import {Platform} from './models/platforms';
import {SessionData, UserSession} from './models/session';
import {AllOrganizationsApiResponse, Organization} from './models/organization';
import {Storage, TemporaryStore} from './models/store';
import {TokenExchangeRequestConfig, TokenResponse, IdToken} from './models/token';
import {User, UserProfile} from './models/user';
import StorageManager from './StorageManager';
import clearSession from './utils/clearSession';
import deepMerge from './utils/deepMerge';
import extractPkceStorageKeyFromState from './utils/extractPkceStorageKeyFromState';
import generatePkceStorageKey from './utils/generatePkceStorageKey';
import getAuthenticatedUserInfo from './utils/getAuthenticatedUserInfo';
import getAuthorizeRequestUrlParams from './utils/getAuthorizeRequestUrlParams';
import processOpenIDScopes from './utils/processOpenIDScopes';

const DefaultOIDCConfig: Partial<AuthClientConfig<unknown>> = {
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

class AsgardeoJavaScriptClient<T = Config> implements AsgardeoClient<T> {
  private storageManager!: StorageManager<T>;

  private cryptoUtils: Crypto;

  private cryptoHelper: IsomorphicCrypto;

  private instanceIdValue: number;

  private baseURL: string;

  static _storageManager: StorageManager<any>;

  constructor(config?: AuthClientConfig<T>, store?: Storage, cryptoUtils?: Crypto, instanceId?: number) {
    const cacheStore: Storage = store ?? new DefaultCacheStore();

    this.cryptoUtils = cryptoUtils ?? new DefaultCrypto();
    this.cryptoHelper = new IsomorphicCrypto(this.cryptoUtils);
    this.instanceIdValue = instanceId ?? 0;
    this.baseURL = config?.baseUrl ?? '';

    if (config) {
      this._initStorage(config, cacheStore);
    }
  }

  public async initialize(config: T, storage?: Storage): Promise<boolean> {
    const store: Storage = storage ?? new DefaultCacheStore();

    this.baseURL = (config as any)?.baseUrl ?? '';
    await this._initStorage(config as unknown as AuthClientConfig<T>, store);

    return true;
  }

  private async _initStorage(config: AuthClientConfig<T>, store: Storage): Promise<void> {
    const {clientId} = config;

    if (!clientId) {
      this.storageManager = new StorageManager<T>(`instance_${this.instanceIdValue}`, store);
    } else {
      this.storageManager = new StorageManager<T>(`instance_${this.instanceIdValue}-${clientId}`, store);
    }

    AsgardeoJavaScriptClient._storageManager = this.storageManager;

    const {applicationId, platform, endpoints} = config;
    let resolvedApplicationId: string | undefined = applicationId;

    if (applicationId) {
      await this.storageManager.setPersistedData({applicationId});
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
      ...DefaultOIDCConfig,
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

  public async getDiscoveryResponse(): Promise<OIDCDiscoveryApiResponse | null> {
    if (!this.storageManager) {
      return null;
    }

    return this.storageManager.loadOpenIDProviderConfiguration();
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
      const configData: StrictAuthClientConfig = await this.storageManager.getConfigData();
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

    return loadOpenIDProviderConfiguration(this.storageManager, requestConfig?.forceInit as boolean).then(() =>
      buildSignInUrl(),
    );
  }

  public async requestAccessToken(
    authorizationCode: string,
    sessionState: string,
    state: string,
    userId?: string,
    tokenRequestConfig?: {params: Record<string, unknown>},
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
    return loadOpenIDProviderConfiguration(this.storageManager, forceInit);
  }

  public async getSignOutUrl(userId?: string): Promise<string> {
    const logoutEndpoint: string | undefined = (await this.storageManager.loadOpenIDProviderConfiguration())
      ?.end_session_endpoint;
    const configData: StrictAuthClientConfig = await this.storageManager.getConfigData();

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

    return this.cryptoHelper.decodeJwtToken<IdToken>(storedIdToken ?? idToken);
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
    const sessionData: SessionData = await this.storageManager.getSessionData(userId);
    const expiresInString: string = sessionData?.expires_in;

    if (!expiresInString) {
      return false;
    }

    const expiresIn: number = parseInt(expiresInString, 10) * 1000;
    const isAccessTokenValid: boolean = sessionData.created_at + expiresIn > new Date().getTime();

    return isAccessTokenAvailable && isAccessTokenValid;
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

  public async reInitialize(config: Partial<T>): Promise<boolean> {
    const currentConfig: T = this.storageManager.getConfigData() as unknown as T;
    const newConfig: T = deepMerge(currentConfig, config);

    await this.storageManager.setConfigData(newConfig as unknown as AuthClientConfig<T>);
    await loadOpenIDProviderConfiguration(this.storageManager, true);

    return true;
  }

  public clearSession(sessionId?: string): void {
    if (this.storageManager) {
      clearSession(this.storageManager, sessionId);
    }
  }

  public static async clearSession(userId?: string): Promise<void> {
    if (AsgardeoJavaScriptClient._storageManager) {
      await clearSession(AsgardeoJavaScriptClient._storageManager, userId);
    }
  }

  public async getAgentToken(agentConfig: AgentConfig): Promise<TokenResponse> {
    const customParam: Record<string, string> = {
      response_mode: 'direct',
    };

    const authorizeURL: URL = new URL(await this.getSignInUrl(customParam));

    const authorizeResponse: EmbeddedSignInFlowInitiateResponse = await initializeEmbeddedSignInFlow({
      payload: Object.fromEntries(authorizeURL.searchParams.entries()),
      url: `${authorizeURL.origin}${authorizeURL.pathname}`,
    });

    const authenticatorName: string = agentConfig.authenticatorName ?? AgentConfig.DEFAULT_AUTHENTICATOR_NAME;

    const targetAuthenticator: EmbeddedSignInFlowAuthenticator | undefined =
      authorizeResponse.nextStep.authenticators.find(
        (auth: EmbeddedSignInFlowAuthenticator) => auth.authenticator === authenticatorName,
      );

    if (!targetAuthenticator) {
      throw new Error(`Authenticator '${authenticatorName}' not found among authentication steps.`);
    }

    const authnRequest: EmbeddedFlowExecuteRequestConfig = {
      baseUrl: this.baseURL,
      payload: {
        flowId: authorizeResponse.flowId,
        selectedAuthenticator: {
          authenticatorId: targetAuthenticator.authenticatorId,
          params: {
            password: agentConfig.agentSecret,
            username: agentConfig.agentID,
          },
        },
      },
    };

    const authnResponse: EmbeddedSignInFlowHandleResponse = await executeEmbeddedSignInFlow(authnRequest);

    if (authnResponse.flowStatus !== EmbeddedSignInFlowStatus.SuccessCompleted) {
      throw new Error('Agent authentication failed.');
    }

    return this.requestAccessToken(
      authnResponse.authData['code'],
      authnResponse.authData['session_state'],
      authnResponse.authData['state'],
    );
  }

  public async getOBOSignInURL(agentConfig: AgentConfig): Promise<string> {
    const customParam: Record<string, string> = {
      requested_actor: agentConfig.agentID,
    };

    const authURL: string | undefined = await this.getSignInUrl(customParam);

    if (authURL) {
      return authURL.toString();
    }

    throw new Error('Could not build Authorize URL');
  }

  public async getOBOToken(agentConfig: AgentConfig, authCodeResponse: AuthCodeResponse): Promise<TokenResponse> {
    const agentToken: TokenResponse = await this.getAgentToken(agentConfig);

    return this.requestAccessToken(
      authCodeResponse.code,
      authCodeResponse.session_state,
      authCodeResponse.state,
      undefined,
      {params: {actor_token: agentToken.accessToken}},
    );
  }

  /* eslint-disable class-methods-use-this, @typescript-eslint/no-unused-vars */
  switchOrganization(_organization: Organization, _sessionId?: string): Promise<TokenResponse | Response> {
    throw new Error('Method not implemented.');
  }

  getAllOrganizations(_options?: any, _sessionId?: string): Promise<AllOrganizationsApiResponse> {
    throw new Error('Method not implemented.');
  }

  getMyOrganizations(_options?: any, _sessionId?: string): Promise<Organization[]> {
    throw new Error('Method not implemented.');
  }

  getCurrentOrganization(_sessionId?: string): Promise<Organization | null> {
    throw new Error('Method not implemented.');
  }

  getUserProfile(_options?: any): Promise<UserProfile> {
    throw new Error('Method not implemented.');
  }

  isLoading(): boolean {
    throw new Error('Method not implemented.');
  }

  updateUserProfile(_payload: any, _userId?: string): Promise<User> {
    throw new Error('Method not implemented.');
  }

  getConfiguration(): T {
    throw new Error('Method not implemented.');
  }

  recover(_payload: EmbeddedFlowExecuteRequestPayload): Promise<EmbeddedFlowExecuteResponse> {
    throw new Error('Method not implemented.');
  }

  signInSilently(_options?: SignInOptions): Promise<User | boolean> {
    throw new Error('Method not implemented.');
  }

  setSession(_sessionData: Record<string, unknown>, _sessionId?: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  signIn(_options?: SignInOptions): Promise<User> {
    throw new Error('Method not implemented.');
  }

  signOut(
    _options?: SignOutOptions,
    _sessionIdOrAfterSignOut?: string | ((afterSignOutUrl: string) => void),
    _afterSignOut?: (afterSignOutUrl: string) => void,
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }

  signUp(options?: SignUpOptions): Promise<void>;

  signUp(payload: EmbeddedFlowExecuteRequestPayload): Promise<EmbeddedFlowExecuteResponse>;

  signUp(
    _optionsOrPayload?: SignUpOptions | EmbeddedFlowExecuteRequestPayload,
  ): Promise<void | EmbeddedFlowExecuteResponse> {
    throw new Error('Method not implemented.');
  }
  /* eslint-enable class-methods-use-this, @typescript-eslint/no-unused-vars */
}

export default AsgardeoJavaScriptClient;
