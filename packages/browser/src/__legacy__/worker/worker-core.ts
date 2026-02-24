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
  AuthClientConfig,
  AuthorizeRequestUrlParams,
  User,
  IsomorphicCrypto,
  TokenExchangeRequestConfig,
  IdToken,
  OIDCEndpoints,
  OIDCRequestConstants,
  SessionData,
  Storage,
} from '@asgardeo/javascript';
import {AuthenticationHelper, SPAHelper} from '../helpers';
import {HttpClient, HttpClientInstance} from '../http-client';
import {
  AuthorizationResponse,
  HttpRequestConfig,
  HttpResponse,
  WebWorkerClientConfig,
  WebWorkerCoreInterface,
} from '../models';
import {MemoryStore} from '../stores';
import {SPACryptoUtils} from '../utils/crypto-utils';

export const WebWorkerCore = async (
  instanceID: number,
  config: AuthClientConfig<WebWorkerClientConfig>,
  getAuthHelper: (
    authClient: AsgardeoAuthClient<WebWorkerClientConfig>,
    spaHelper: SPAHelper<WebWorkerClientConfig>,
  ) => AuthenticationHelper<WebWorkerClientConfig>,
): Promise<WebWorkerCoreInterface> => {
  const _store: Storage = new MemoryStore();
  const _cryptoUtils: SPACryptoUtils = new SPACryptoUtils();
  const _authenticationClient = new AsgardeoAuthClient<WebWorkerClientConfig>();
  await _authenticationClient.initialize(config, _store, _cryptoUtils, instanceID);

  const _spaHelper = new SPAHelper<WebWorkerClientConfig>(_authenticationClient);

  const _authenticationHelper: AuthenticationHelper<WebWorkerClientConfig> = getAuthHelper(
    _authenticationClient,
    _spaHelper,
  );

  const _dataLayer = _authenticationClient.getStorageManager();

  const _httpClient: HttpClientInstance = HttpClient.getInstance(instanceID);

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

  const httpRequest = async (requestConfig: HttpRequestConfig): Promise<HttpResponse> => {
    return await _authenticationHelper.httpRequest(_httpClient, requestConfig);
  };

  const httpRequestAll = async (requestConfigs: HttpRequestConfig[]): Promise<HttpResponse[] | undefined> => {
    return await _authenticationHelper.httpRequestAll(requestConfigs, _httpClient);
  };

  const enableHttpHandler = (): void => {
    _authenticationHelper.enableHttpHandler(_httpClient);
  };

  const disableHttpHandler = (): void => {
    _authenticationHelper.disableHttpHandler(_httpClient);
  };

  const getSignInUrl = async (params?: AuthorizeRequestUrlParams): Promise<AuthorizationResponse> => {
    return _authenticationClient
      .getSignInUrl(params)
      .then(async (url: string) => {
        const urlObject: URL = new URL(url);
        const state: string = urlObject.searchParams.get(OIDCRequestConstants.Params.STATE) ?? '';
        const pkce: string = await _authenticationClient.getPKCECode(state);

        return {authorizationURL: url, pkce: pkce};
      })
      .catch(error => Promise.reject(error));
  };

  const startAutoRefreshToken = async (): Promise<void> => {
    _spaHelper.clearRefreshTokenTimeout();
    _spaHelper.refreshAccessTokenAutomatically(_authenticationHelper);

    return;
  };

  const requestAccessToken = async (
    authorizationCode?: string,
    sessionState?: string,
    pkce?: string,
    state?: string,
  ): Promise<User> => {
    return await _authenticationHelper.requestAccessToken(authorizationCode, sessionState, undefined, pkce, state);
  };

  const signOut = async (): Promise<string> => {
    _spaHelper.clearRefreshTokenTimeout();

    return await _authenticationClient.getSignOutUrl();
  };

  const getSignOutUrl = async (): Promise<string> => {
    return await _authenticationClient.getSignOutUrl();
  };

  const exchangeToken = async (config: TokenExchangeRequestConfig): Promise<User | Response> => {
    return await _authenticationHelper.exchangeToken(config);
  };

  const refreshAccessToken = async (): Promise<User> => {
    try {
      return await _authenticationHelper.refreshAccessToken();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const revokeAccessToken = async (): Promise<boolean> => {
    const timer: number = await _spaHelper.getRefreshTimeoutTimer();

    return _authenticationClient
      .revokeAccessToken()
      .then(() => {
        _spaHelper.clearRefreshTokenTimeout(timer);

        return Promise.resolve(true);
      })
      .catch(error => Promise.reject(error));
  };

  const getUser = async (): Promise<User> => {
    return _authenticationHelper.getUser();
  };

  const getDecodedIdToken = async (sessionId?: string): Promise<IdToken> => {
    return _authenticationHelper.getDecodedIdToken(sessionId);
  };

  const getCrypto = async (): Promise<IsomorphicCrypto> => {
    return _authenticationHelper.getCrypto();
  };

  const getDecodedIDPIDToken = async (): Promise<IdToken> => {
    return _authenticationHelper.getDecodedIDPIDToken();
  };

  const getIdToken = async (): Promise<string> => {
    return _authenticationHelper.getIdToken();
  };
  const getOpenIDProviderEndpoints = async (): Promise<OIDCEndpoints> => {
    return _authenticationHelper.getOpenIDProviderEndpoints();
  };

  const getAccessToken = (): Promise<string> => {
    return _authenticationHelper.getAccessToken();
  };

  const isSignedIn = (): Promise<boolean> => {
    return _authenticationHelper.isSignedIn();
  };

  const setSessionState = async (sessionState: string): Promise<void> => {
    await _dataLayer.setSessionDataParameter(
      OIDCRequestConstants.Params.SESSION_STATE as keyof SessionData,
      sessionState,
    );

    return;
  };

  const reInitialize = async (config: Partial<AuthClientConfig<WebWorkerClientConfig>>): Promise<void> => {
    await _authenticationClient.reInitialize(config);

    return;
  };

  const getConfigData = async (): Promise<AuthClientConfig<WebWorkerClientConfig>> => {
    return _dataLayer.getConfigData();
  };

  return {
    disableHttpHandler,
    enableHttpHandler,
    getAccessToken,
    getSignInUrl,
    getUser,
    getConfigData,
    getCrypto,
    getDecodedIDPIDToken,
    getDecodedIdToken,
    getIdToken,
    getOpenIDProviderEndpoints,
    getSignOutUrl,
    httpRequest,
    httpRequestAll,
    isSignedIn,
    refreshAccessToken,
    requestAccessToken,
    exchangeToken,
    revokeAccessToken,
    setHttpRequestFinishCallback,
    setHttpRequestStartCallback,
    setHttpRequestSuccessCallback,
    setSessionState,
    signOut,
    startAutoRefreshToken,
    reInitialize,
  };
};
