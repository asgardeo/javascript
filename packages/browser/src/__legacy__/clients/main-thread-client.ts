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
  AsgardeoAuthClient,
  AuthClientConfig,
  User,
  IsomorphicCrypto,
  StorageManager,
  IdToken,
  ExtendedAuthorizeRequestUrlParams,
  OIDCEndpoints,
  OIDCRequestConstants,
  SessionData,
  Storage,
  extractPkceStorageKeyFromState,
  initializeEmbeddedSignInFlow,
} from '@asgardeo/javascript';
import {SILENT_SIGN_IN_STATE, TOKEN_REQUEST_CONFIG_KEY} from '../constants';
import {AuthenticationHelper} from '../helpers/authentication-helper';
import {SessionManagementHelper} from '../helpers/session-management-helper';
import {SPAHelper} from '../helpers/spa-helper';
import {HttpClient, HttpClientInstance} from '../http-client';
import {HttpError, HttpRequestConfig, HttpResponse, MainThreadClientConfig, MainThreadClientInterface} from '../models';
import {SPACustomGrantConfig} from '../models/request-custom-grant';
import {BrowserStorage} from '../models/storage';
import {LocalStore, MemoryStore, SessionStore} from '../stores';
import {SPAUtils} from '../utils';
import {SPACryptoUtils} from '../utils/crypto-utils';

const initiateStore = (store: BrowserStorage | undefined): Storage => {
  switch (store) {
    case BrowserStorage.LocalStorage:
      return new LocalStore();
    case BrowserStorage.SessionStorage:
      return new SessionStore();
    case BrowserStorage.BrowserMemory:
      return new MemoryStore();
    default:
      return new SessionStore();
  }
};

export const MainThreadClient = async (
  instanceId: number,
  config: AuthClientConfig<MainThreadClientConfig>,
  getAuthHelper: (
    authClient: AsgardeoAuthClient<MainThreadClientConfig>,
    spaHelper: SPAHelper<MainThreadClientConfig>,
  ) => AuthenticationHelper<MainThreadClientConfig>,
): Promise<MainThreadClientInterface> => {
  const _store: Storage = initiateStore(config.storage as BrowserStorage);
  const _cryptoUtils: SPACryptoUtils = new SPACryptoUtils();
  const _authenticationClient = new AsgardeoAuthClient<MainThreadClientConfig>();
  await _authenticationClient.initialize(config, _store, _cryptoUtils, instanceId);

  const _spaHelper = new SPAHelper<MainThreadClientConfig>(_authenticationClient);
  const _dataLayer = _authenticationClient.getStorageManager();
  const _sessionManagementHelper = await SessionManagementHelper(
    async () => _authenticationClient.getSignOutUrl(),
    (config.storage as BrowserStorage) ?? BrowserStorage.SessionStorage,
    (sessionState: string) =>
      _dataLayer.setSessionDataParameter(
        OIDCRequestConstants.Params.SESSION_STATE as keyof SessionData,
        sessionState ?? '',
      ),
  );

  const _authenticationHelper = getAuthHelper(_authenticationClient, _spaHelper);

  let _getSignOutURLFromSessionStorage: boolean = false;

  const _httpClient: HttpClientInstance = HttpClient.getInstance(instanceId);
  let _isHttpHandlerEnabled: boolean = true;
  let _httpErrorCallback: (error: HttpError) => void | Promise<void>;
  let _httpFinishCallback: () => void;

  const attachToken = async (request: HttpRequestConfig): Promise<void> => {
    await _authenticationHelper.attachTokenToRequestConfig(request);
  };

  _httpClient?.init && (await _httpClient.init(true, attachToken));

  const setHttpRequestStartCallback = (callback: () => void): void => {
    _httpClient?.setHttpRequestStartCallback && _httpClient.setHttpRequestStartCallback(callback);
  };

  const setHttpRequestSuccessCallback = (callback: (response: HttpResponse) => void): void => {
    _httpClient?.setHttpRequestSuccessCallback && _httpClient.setHttpRequestSuccessCallback(callback);
  };

  const setHttpRequestFinishCallback = (callback: () => void): void => {
    _httpClient?.setHttpRequestFinishCallback && _httpClient.setHttpRequestFinishCallback(callback);
  };

  const setHttpRequestErrorCallback = (callback: (error: HttpError) => void | Promise<void>): void => {
    _httpErrorCallback = callback;
  };

  const httpRequest = async (requestConfig: HttpRequestConfig): Promise<HttpResponse> =>
    _authenticationHelper.httpRequest(
      _httpClient,
      requestConfig,
      _isHttpHandlerEnabled,
      _httpErrorCallback,
      _httpFinishCallback,
    );

  const httpRequestAll = async (requestConfigs: HttpRequestConfig[]): Promise<HttpResponse[] | undefined> =>
    _authenticationHelper.httpRequestAll(
      requestConfigs,
      _httpClient,
      _isHttpHandlerEnabled,
      _httpErrorCallback,
      _httpFinishCallback,
    );

  const getHttpClient = (): HttpClientInstance => _httpClient;

  const enableHttpHandler = (): boolean => {
    _authenticationHelper.enableHttpHandler(_httpClient);
    _isHttpHandlerEnabled = true;

    return true;
  };

  const disableHttpHandler = (): boolean => {
    _authenticationHelper.disableHttpHandler(_httpClient);
    _isHttpHandlerEnabled = false;

    return true;
  };

  const checkSession = async (): Promise<void> => {
    const oidcEndpoints: OIDCEndpoints = (await _authenticationClient.getOpenIDProviderEndpoints()) as OIDCEndpoints;
    const config = await _dataLayer.getConfigData();

    _authenticationHelper.initializeSessionManger(
      config,
      oidcEndpoints,
      async () => (await _authenticationClient.getUserSession()).sessionState,
      async (params?: ExtendedAuthorizeRequestUrlParams): Promise<string> => _authenticationClient.getSignInUrl(params),
      _sessionManagementHelper,
    );
  };

  const shouldStopAuthn = async (): Promise<boolean> =>
    _sessionManagementHelper.receivePromptNoneResponse(async (sessionState: string | null) => {
      await _dataLayer.setSessionDataParameter(
        OIDCRequestConstants.Params.SESSION_STATE as keyof SessionData,
        sessionState ?? '',
      );
    });

  const setSessionStatus = async (sessionStatus: string): Promise<void> => {
    await _dataLayer.setSessionStatus(sessionStatus);
  };

  const signIn = async (
    signInConfig?: ExtendedAuthorizeRequestUrlParams,
    authorizationCode?: string,
    sessionState?: string,
    state?: string,
    tokenRequestConfig?: {
      params: Record<string, unknown>;
    },
  ): Promise<User> => {
    const basicUserInfo = await _authenticationHelper.handleSignIn(shouldStopAuthn, checkSession, undefined);

    if (basicUserInfo) {
      return basicUserInfo;
    }
    let resolvedAuthorizationCode: string;
    let resolvedSessionState: string;
    let resolvedState: string;
    let resolvedTokenRequestConfig: {
      params: Record<string, unknown>;
    } = {params: {}};

    if (config?.responseMode === 'form_post' && authorizationCode) {
      resolvedAuthorizationCode = authorizationCode;
      resolvedSessionState = sessionState ?? '';
      resolvedState = state ?? '';
    } else {
      resolvedAuthorizationCode =
        new URL(window.location.href).searchParams.get(OIDCRequestConstants.Params.AUTHORIZATION_CODE) ?? '';
      resolvedSessionState =
        new URL(window.location.href).searchParams.get(OIDCRequestConstants.Params.SESSION_STATE) ?? '';
      resolvedState = new URL(window.location.href).searchParams.get(OIDCRequestConstants.Params.STATE) ?? '';

      SPAUtils.removeAuthorizationCode();
    }

    if (resolvedAuthorizationCode && resolvedState) {
      setSessionStatus('true');
      const storedTokenRequestConfig = await _dataLayer.getTemporaryDataParameter(TOKEN_REQUEST_CONFIG_KEY);
      if (storedTokenRequestConfig && typeof storedTokenRequestConfig === 'string') {
        resolvedTokenRequestConfig = JSON.parse(storedTokenRequestConfig);
      }
      return requestAccessToken(
        resolvedAuthorizationCode,
        resolvedSessionState,
        resolvedState,
        resolvedTokenRequestConfig,
      );
    }

    return _authenticationClient.getSignInUrl(signInConfig).then(async (url: string) => {
      if (config.storage === BrowserStorage.BrowserMemory && config.enablePKCE) {
        const pkceKey: string = extractPkceStorageKeyFromState(resolvedState);

        SPAUtils.setPKCE(pkceKey, (await _authenticationClient.getPKCECode(resolvedState)) as string);
      }

      if (tokenRequestConfig) {
        _dataLayer.setTemporaryDataParameter(TOKEN_REQUEST_CONFIG_KEY, JSON.stringify(tokenRequestConfig));
      }

      // FIXME: This is a workaround to handle the `response_mode` as `direct` in the sign-in config.
      if (signInConfig && signInConfig['response_mode'] === 'direct') {
        const authorizeUrl: URL = new URL(url);

        return initializeEmbeddedSignInFlow({
          url: `${authorizeUrl.origin}${authorizeUrl.pathname}`,
          payload: Object.fromEntries(authorizeUrl.searchParams.entries()),
        });
      }

      location.href = url;

      await SPAUtils.waitTillPageRedirect();

      return Promise.resolve({
        allowedScopes: '',
        displayName: '',
        email: '',
        sessionState: '',
        sub: '',
        tenantDomain: '',
        username: '',
      });
    });
  };

  const signOut = async (): Promise<boolean> => {
    if ((await _authenticationClient.isSignedIn()) && !_getSignOutURLFromSessionStorage) {
      location.href = await _authenticationClient.getSignOutUrl();
    } else {
      location.href = SPAUtils.getSignOutUrl(config.clientId, instanceId);
    }

    _spaHelper.clearRefreshTokenTimeout();

    await _dataLayer.removeOIDCProviderMetaData();
    await _dataLayer.removeTemporaryData();
    await _dataLayer.removeSessionData();
    await _dataLayer.removeSessionStatus();

    await SPAUtils.waitTillPageRedirect();

    return true;
  };

  const enableRetrievingSignOutURLFromSession = (config: SPACustomGrantConfig) => {
    if (config.preventSignOutURLUpdate) {
      _getSignOutURLFromSessionStorage = true;
    }
  };

  const exchangeToken = async (config: SPACustomGrantConfig): Promise<User | Response> =>
    _authenticationHelper.exchangeToken(config, enableRetrievingSignOutURLFromSession);

  const refreshAccessToken = async (): Promise<User> => {
    try {
      return await _authenticationHelper.refreshAccessToken(enableRetrievingSignOutURLFromSession);
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const revokeAccessToken = async (): Promise<boolean> => {
    const timer: number = await _spaHelper.getRefreshTimeoutTimer();

    return _authenticationClient
      .revokeAccessToken()
      .then(() => {
        _sessionManagementHelper.reset();
        _spaHelper.clearRefreshTokenTimeout(timer);

        return Promise.resolve(true);
      })
      .catch(error => Promise.reject(error));
  };

  const requestAccessToken = async (
    resolvedAuthorizationCode: string,
    resolvedSessionState: string,
    resolvedState: string,
    tokenRequestConfig?: {
      params: Record<string, unknown>;
    },
  ): Promise<User> =>
    _authenticationHelper.requestAccessToken(
      resolvedAuthorizationCode,
      resolvedSessionState,
      checkSession,
      undefined,
      resolvedState,
      tokenRequestConfig,
    );

  const constructSilentSignInUrl = async (additionalParams: Record<string, string | boolean> = {}): Promise<string> => {
    const config = await _dataLayer.getConfigData();
    const urlString: string = await _authenticationClient.getSignInUrl({
      prompt: 'none',
      state: SILENT_SIGN_IN_STATE,
      ...additionalParams,
    });

    // Replace form_post with query
    const urlObject = new URL(urlString);
    urlObject.searchParams.set('response_mode', 'query');
    const url: string = urlObject.toString();

    if (config.storage === BrowserStorage.BrowserMemory && config.enablePKCE) {
      const state = urlObject.searchParams.get(OIDCRequestConstants.Params.STATE);

      SPAUtils.setPKCE(
        extractPkceStorageKeyFromState(state ?? ''),
        (await _authenticationClient.getPKCECode(state ?? '')) as string,
      );
    }

    return url;
  };

  /**
   * This method checks if there is an active user session in the server by sending a prompt none request.
   * If the user is signed in, this method sends a token request. Returns false otherwise.
   *
   * @return {Promise<User|boolean} Returns a Promise that resolves with the User
   * if the user is signed in or with `false` if there is no active user session in the server.
   */
  const signInSilently = async (
    additionalParams?: Record<string, string | boolean>,
    tokenRequestConfig?: {params: Record<string, unknown>},
  ): Promise<User | boolean> =>
    _authenticationHelper.signInSilently(
      constructSilentSignInUrl,
      requestAccessToken,
      _sessionManagementHelper,
      additionalParams,
      tokenRequestConfig,
    );

  const getUser = async (): Promise<User> => _authenticationHelper.getUser();

  const getDecodedIdToken = async (sessionId?: string): Promise<IdToken> =>
    _authenticationHelper.getDecodedIdToken(sessionId);

  const getCrypto = async (): Promise<IsomorphicCrypto> => _authenticationHelper.getCrypto();

  const getIdToken = async (): Promise<string> => _authenticationHelper.getIdToken();

  const getOpenIDProviderEndpoints = async (): Promise<OIDCEndpoints> =>
    _authenticationHelper.getOpenIDProviderEndpoints();

  const getAccessToken = async (sessionId?: string): Promise<string> => _authenticationHelper.getAccessToken(sessionId);

  const getStorageManager = async (): Promise<StorageManager<MainThreadClientConfig>> =>
    _authenticationHelper.getStorageManager();

  const getConfigData = async (): Promise<AuthClientConfig<MainThreadClientConfig>> => _dataLayer.getConfigData();

  const isSignedIn = async (): Promise<boolean> => _authenticationHelper.isSignedIn();

  const isSessionActive = async (): Promise<boolean> => (await _dataLayer.getSessionStatus()) === 'true';

  const reInitialize = async (newConfig: Partial<AuthClientConfig<MainThreadClientConfig>>): Promise<void> => {
    const existingConfig = await _dataLayer.getConfigData();
    const isCheckSessionIframeDifferent: boolean = !(
      existingConfig &&
      existingConfig.endpoints &&
      existingConfig.endpoints.checkSessionIframe &&
      newConfig &&
      newConfig.endpoints &&
      newConfig.endpoints.checkSessionIframe &&
      existingConfig.endpoints.checkSessionIframe === newConfig.endpoints.checkSessionIframe
    );
    const config = {...existingConfig, ...newConfig};
    await _authenticationClient.reInitialize(config);

    // Re-initiates check session if the check session endpoint is updated.
    if (config.syncSession && isCheckSessionIframeDifferent) {
      _sessionManagementHelper.reset();

      checkSession();
    }
  };

  const decodeJwtToken = async <T = Record<string, unknown>>(token: string): Promise<T> => {
    return _authenticationClient.decodeJwtToken<T>(token);
  };

  return {
    disableHttpHandler,
    enableHttpHandler,
    getAccessToken,
    getUser,
    getConfigData,
    getCrypto,
    getStorageManager,
    getDecodedIdToken,
    getHttpClient,
    getIdToken,
    getOpenIDProviderEndpoints,
    httpRequest,
    httpRequestAll,
    isSignedIn,
    isSessionActive,
    refreshAccessToken,
    exchangeToken,
    revokeAccessToken,
    setHttpRequestErrorCallback,
    setHttpRequestFinishCallback,
    setHttpRequestStartCallback,
    setHttpRequestSuccessCallback,
    signIn,
    signOut,
    signInSilently,
    reInitialize,
    decodeJwtToken,
  };
};
