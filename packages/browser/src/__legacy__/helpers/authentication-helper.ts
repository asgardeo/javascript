/**
 * Copyright (c) 2022-2024, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
  User,
  IsomorphicCrypto,
  TokenExchangeRequestConfig,
  StorageManager,
  IdToken,
  ExtendedAuthorizeRequestUrlParams,
  OIDCEndpoints,
  TokenResponse,
  extractPkceStorageKeyFromState,
  Config,
} from '@asgardeo/javascript';
import {SPAHelper} from './spa-helper';
import {
  ACCESS_TOKEN_INVALID,
  CHECK_SESSION_SIGNED_IN,
  CHECK_SESSION_SIGNED_OUT,
  CUSTOM_GRANT_CONFIG,
  ERROR,
  ERROR_DESCRIPTION,
  PROMPT_NONE_IFRAME,
  REFRESH_ACCESS_TOKEN_ERR0R,
  RP_IFRAME,
} from '../constants';
import {
  AuthorizationInfo,
  HttpClientInstance,
  HttpError,
  HttpRequestConfig,
  HttpRequestInterface,
  HttpResponse,
  MainThreadClientConfig,
  Message,
  SessionManagementHelperInterface,
  WebWorkerClientConfig,
} from '../models';
import {SPACustomGrantConfig} from '../models/request-custom-grant';
import {BrowserStorage} from '../models/storage';
import {SPAUtils} from '../utils';

export class AuthenticationHelper<T extends MainThreadClientConfig | WebWorkerClientConfig> {
  protected _authenticationClient: AsgardeoAuthClient<T>;
  protected _storageManager: StorageManager<T>;
  protected _spaHelper: SPAHelper<T>;
  protected _instanceId: number;
  protected _isTokenRefreshing: boolean;

  public constructor(authClient: AsgardeoAuthClient<T>, spaHelper: SPAHelper<T>) {
    this._authenticationClient = authClient;
    this._storageManager = this._authenticationClient.getStorageManager();
    this._spaHelper = spaHelper;
    this._instanceId = this._authenticationClient.getInstanceId();
    this._isTokenRefreshing = false;
  }

  public enableHttpHandler(httpClient: HttpClientInstance): void {
    httpClient?.enableHandler && httpClient.enableHandler();
  }

  public disableHttpHandler(httpClient: HttpClientInstance): void {
    httpClient?.disableHandler && httpClient.disableHandler();
  }

  public initializeSessionManger(
    config: AuthClientConfig<T>,
    oidcEndpoints: OIDCEndpoints,
    getSessionState: () => Promise<string>,
    getAuthzURL: (params?: ExtendedAuthorizeRequestUrlParams) => Promise<string>,
    sessionManagementHelper: SessionManagementHelperInterface,
  ): void {
    sessionManagementHelper.initialize(
      config.clientId,
      oidcEndpoints.checkSessionIframe ?? '',
      getSessionState,
      config.checkSessionInterval ?? 3,
      config.sessionRefreshInterval ?? 300,
      config.afterSignInUrl,
      getAuthzURL,
    );
  }

  public async exchangeToken(
    config: SPACustomGrantConfig,
    enableRetrievingSignOutURLFromSession?: (config: SPACustomGrantConfig) => void,
  ): Promise<User | Response> {
    const _config: Config = (await this._storageManager.getConfigData()) as Config;
    let useDefaultEndpoint = true;
    let matches = false;

    // If the config does not contains a token endpoint, default token endpoint will be used.
    if (config?.tokenEndpoint) {
      useDefaultEndpoint = false;

      // Only validate URLs for WebWorker storage
      if (_config.storage === BrowserStorage.WebWorker) {
        for (const baseUrl of [...(_config?.allowedExternalUrls ?? []), (config as any).baseUrl]) {
          if (baseUrl && config.tokenEndpoint?.startsWith(baseUrl)) {
            matches = true;
            break;
          }
        }
      } else {
        matches = true;
      }
    }

    if (config.shouldReplayAfterRefresh) {
      this._storageManager.setTemporaryDataParameter(CUSTOM_GRANT_CONFIG, JSON.stringify(config));
    }

    if (useDefaultEndpoint || matches) {
      return this._authenticationClient
        .exchangeToken(config)
        .then(async (response: Response | TokenResponse) => {
          if (enableRetrievingSignOutURLFromSession && typeof enableRetrievingSignOutURLFromSession === 'function') {
            enableRetrievingSignOutURLFromSession(config);
          }

          if (config.returnsSession) {
            this._spaHelper.refreshAccessTokenAutomatically(this);

            return this._authenticationClient.getUser();
          } else {
            return response as Response;
          }
        })
        .catch(error => {
          return Promise.reject(error);
        });
    } else {
      return Promise.reject(
        new AsgardeoAuthException(
          'SPA-MAIN_THREAD_CLIENT-RCG-IV01',
          'Request to the provided endpoint is prohibited.',
          'Requests can only be sent to resource servers specified by the `allowedExternalUrls`' +
            ' attribute while initializing the SDK. The specified token endpoint in this request ' +
            'cannot be found among the `allowedExternalUrls`',
        ),
      );
    }
  }

  public async getCustomGrantConfigData(): Promise<AuthClientConfig<TokenExchangeRequestConfig> | null> {
    const configString = await this._storageManager.getTemporaryDataParameter(CUSTOM_GRANT_CONFIG);

    if (configString) {
      return JSON.parse(configString as string);
    } else {
      return null;
    }
  }

  public async refreshAccessToken(
    enableRetrievingSignOutURLFromSession?: (config: SPACustomGrantConfig) => void,
  ): Promise<User> {
    try {
      await this._authenticationClient.refreshAccessToken();
      const customGrantConfig = await this.getCustomGrantConfigData();
      if (customGrantConfig) {
        await this.exchangeToken(customGrantConfig, enableRetrievingSignOutURLFromSession);
      }
      this._spaHelper.refreshAccessTokenAutomatically(this);

      return this._authenticationClient.getUser();
    } catch (error) {
      const refreshTokenError: Message<string> = {
        type: REFRESH_ACCESS_TOKEN_ERR0R,
      };

      window.postMessage(refreshTokenError);
      return Promise.reject(error);
    }
  }

  protected async retryFailedRequests(failedRequest: HttpRequestInterface): Promise<HttpResponse> {
    const httpClient = failedRequest.httpClient;
    const requestConfig = failedRequest.requestConfig;
    const isHttpHandlerEnabled = failedRequest.isHttpHandlerEnabled;
    const httpErrorCallback = failedRequest.httpErrorCallback;
    const httpFinishCallback = failedRequest.httpFinishCallback;

    // Wait until the token is refreshed.
    await SPAUtils.until(() => !this._isTokenRefreshing);

    try {
      const httpResponse = await httpClient.request(requestConfig);

      return Promise.resolve(httpResponse);
    } catch (error: any) {
      if (isHttpHandlerEnabled) {
        if (typeof httpErrorCallback === 'function') {
          await httpErrorCallback(error);
        }
        if (typeof httpFinishCallback === 'function') {
          httpFinishCallback();
        }
      }

      return Promise.reject(error);
    }
  }

  public async httpRequest(
    httpClient: HttpClientInstance,
    requestConfig: HttpRequestConfig,
    isHttpHandlerEnabled?: boolean,
    httpErrorCallback?: (error: HttpError) => void | Promise<void>,
    httpFinishCallback?: () => void,
    enableRetrievingSignOutURLFromSession?: (config: SPACustomGrantConfig) => void,
  ): Promise<HttpResponse> {
    let matches = false;
    const config: Config = (await this._storageManager.getConfigData()) as Config;

    // Only validate URLs for WebWorker storage
    if (config.storage === BrowserStorage.WebWorker) {
      for (const baseUrl of [...(config?.allowedExternalUrls ?? []), (config as any).baseUrl]) {
        if (baseUrl && requestConfig?.url?.startsWith(baseUrl)) {
          matches = true;

          break;
        }
      }
    } else {
      matches = true;
    }

    if (matches) {
      return httpClient
        .request(requestConfig)
        .then((response: HttpResponse) => {
          return Promise.resolve(response);
        })
        .catch(async (error: HttpError) => {
          if (error?.response?.status === 401 || !error?.response) {
            if (this._isTokenRefreshing) {
              return this.retryFailedRequests({
                enableRetrievingSignOutURLFromSession,
                httpClient,
                httpErrorCallback,
                httpFinishCallback,
                isHttpHandlerEnabled,
                requestConfig,
              });
            }

            this._isTokenRefreshing = true;
            // Try to refresh the token
            let refreshAccessTokenResponse: User;
            try {
              refreshAccessTokenResponse = await this.refreshAccessToken(enableRetrievingSignOutURLFromSession);

              this._isTokenRefreshing = false;
            } catch (refreshError: any) {
              this._isTokenRefreshing = false;

              if (isHttpHandlerEnabled) {
                if (typeof httpErrorCallback === 'function') {
                  await httpErrorCallback({
                    ...error,
                    code: ACCESS_TOKEN_INVALID,
                  });
                }
                if (typeof httpFinishCallback === 'function') {
                  httpFinishCallback();
                }
              }

              throw new AsgardeoAuthException(
                'SPA-AUTH_HELPER-HR-SE01',
                refreshError?.name ?? 'Refresh token request failed.',
                refreshError?.message ??
                  'An error occurred while trying to refresh the ' +
                    'access token following a 401 response from the server.',
              );
            }

            // Retry the request after refreshing the token
            if (refreshAccessTokenResponse) {
              try {
                const httpResponse = await httpClient.request(requestConfig);
                return Promise.resolve(httpResponse);
              } catch (error: any) {
                if (isHttpHandlerEnabled) {
                  if (typeof httpErrorCallback === 'function') {
                    await httpErrorCallback(error);
                  }
                  if (typeof httpFinishCallback === 'function') {
                    httpFinishCallback();
                  }
                }
                return Promise.reject(error);
              }
            }
          }

          if (isHttpHandlerEnabled) {
            if (typeof httpErrorCallback === 'function') {
              await httpErrorCallback(error);
            }
            if (typeof httpFinishCallback === 'function') {
              httpFinishCallback();
            }
          }

          return Promise.reject(error);
        });
    } else {
      return Promise.reject(
        new AsgardeoAuthException(
          'SPA-AUTH_HELPER-HR-IV02',
          'Request to the provided endpoint is prohibited.',
          'Requests can only be sent to resource servers specified by the `allowedExternalUrls`' +
            ' attribute while initializing the SDK. The specified endpoint in this request ' +
            'cannot be found among the `allowedExternalUrls`',
        ),
      );
    }
  }

  public async httpRequestAll(
    requestConfigs: HttpRequestConfig[],
    httpClient: HttpClientInstance,
    isHttpHandlerEnabled?: boolean,
    httpErrorCallback?: (error: HttpError) => void | Promise<void>,
    httpFinishCallback?: () => void,
  ): Promise<HttpResponse[] | undefined> {
    let matches = true;
    const config: Config = (await this._storageManager.getConfigData()) as Config;

    // Only validate URLs for WebWorker storage
    if (config.storage === BrowserStorage.WebWorker) {
      for (const requestConfig of requestConfigs) {
        let urlMatches = false;

        for (const baseUrl of [...(config?.allowedExternalUrls ?? []), (config as any).baseUrl]) {
          if (baseUrl && requestConfig.url?.startsWith(baseUrl)) {
            urlMatches = true;

            break;
          }
        }

        if (!urlMatches) {
          matches = false;

          break;
        }
      }
    }

    const requests: Promise<HttpResponse<any>>[] = [];

    if (matches) {
      requestConfigs.forEach(request => {
        requests.push(httpClient.request(request));
      });

      return (
        httpClient?.all &&
        httpClient
          .all(requests)
          .then((responses: HttpResponse[]) => {
            return Promise.resolve(responses);
          })
          .catch(async (error: HttpError) => {
            if (error?.response?.status === 401 || !error?.response) {
              let refreshTokenResponse: TokenResponse | User;
              try {
                refreshTokenResponse = await this._authenticationClient.refreshAccessToken();
              } catch (refreshError: any) {
                if (isHttpHandlerEnabled) {
                  if (typeof httpErrorCallback === 'function') {
                    await httpErrorCallback({
                      ...error,
                      code: ACCESS_TOKEN_INVALID,
                    });
                  }
                  if (typeof httpFinishCallback === 'function') {
                    httpFinishCallback();
                  }
                }

                throw new AsgardeoAuthException(
                  'SPA-AUTH_HELPER-HRA-SE01',
                  refreshError?.name ?? 'Refresh token request failed.',
                  refreshError?.message ??
                    'An error occurred while trying to refresh the ' +
                      'access token following a 401 response from the server.',
                );
              }

              if (refreshTokenResponse) {
                return (
                  httpClient.all &&
                  httpClient
                    .all(requests)
                    .then(response => {
                      return Promise.resolve(response);
                    })
                    .catch(async error => {
                      if (isHttpHandlerEnabled) {
                        if (typeof httpErrorCallback === 'function') {
                          await httpErrorCallback(error);
                        }
                        if (typeof httpFinishCallback === 'function') {
                          httpFinishCallback();
                        }
                      }

                      return Promise.reject(error);
                    })
                );
              }
            }

            if (isHttpHandlerEnabled) {
              if (typeof httpErrorCallback === 'function') {
                await httpErrorCallback(error);
              }
              if (typeof httpFinishCallback === 'function') {
                httpFinishCallback();
              }
            }

            return Promise.reject(error);
          })
      );
    } else {
      throw new AsgardeoAuthException(
        'SPA-AUTH_HELPER-HRA-IV02',
        'Request to the provided endpoint is prohibited.',
        'Requests can only be sent to resource servers specified by the `allowedExternalUrls`' +
          ' attribute while initializing the SDK. The specified endpoint in this request ' +
          'cannot be found among the `allowedExternalUrls`',
      );
    }
  }

  public async requestAccessToken(
    authorizationCode?: string,
    sessionState?: string,
    checkSession?: () => Promise<void>,
    pkce?: string,
    state?: string,
    tokenRequestConfig?: {
      params: Record<string, unknown>;
    },
  ): Promise<User> {
    const config = await this._storageManager.getConfigData();

    if (config.storage === BrowserStorage.BrowserMemory && config.enablePKCE && sessionState) {
      const pkce = SPAUtils.getPKCE(extractPkceStorageKeyFromState(sessionState));

      await this._authenticationClient.setPKCECode(extractPkceStorageKeyFromState(sessionState), pkce);
    } else if (config.storage === BrowserStorage.WebWorker && pkce) {
      await this._authenticationClient.setPKCECode(pkce, state ?? '');
    }

    if (authorizationCode) {
      return this._authenticationClient
        .requestAccessToken(authorizationCode, sessionState ?? '', state ?? '', undefined, tokenRequestConfig)
        .then(async () => {
          // Disable this temporarily
          /* if (config.storage === Storage.BrowserMemory) {
                        SPAUtils.setSignOutURL(await _authenticationClient.getSignOutUrl());
                    } */
          if (config.storage !== BrowserStorage.WebWorker) {
            SPAUtils.setSignOutURL(await this._authenticationClient.getSignOutUrl(), config.clientId, this._instanceId);

            if (this._spaHelper) {
              this._spaHelper.clearRefreshTokenTimeout();
              this._spaHelper.refreshAccessTokenAutomatically(this);
            }

            // Enable OIDC Sessions Management only if it is set to true in the config.
            if (checkSession && typeof checkSession === 'function' && config.syncSession) {
              checkSession();
            }
          } else {
            if (this._spaHelper) {
              this._spaHelper.refreshAccessTokenAutomatically(this);
            }
          }

          return this._authenticationClient.getUser();
        })
        .catch(error => {
          return Promise.reject(error);
        });
    }

    return Promise.reject(
      new AsgardeoAuthException(
        'SPA-AUTH_HELPER-RAT1-NF01',
        'No authorization code.',
        'No authorization code was found.',
      ),
    );
  }

  public async signInSilently(
    constructSilentSignInUrl: (additionalParams?: Record<string, string | boolean>) => Promise<string>,
    requestAccessToken: (
      authzCode: string,
      sessionState: string,
      state: string,
      tokenRequestConfig?: {params: Record<string, unknown>},
    ) => Promise<User>,
    sessionManagementHelper: SessionManagementHelperInterface,
    additionalParams?: Record<string, string | boolean>,
    tokenRequestConfig?: {params: Record<string, unknown>},
  ): Promise<User | boolean> {
    // This block is executed by the iFrame when the server redirects with the authorization code.
    if (SPAUtils.isInitializedSilentSignIn()) {
      await sessionManagementHelper.receivePromptNoneResponse();

      return Promise.resolve({
        allowedScopes: '',
        displayName: '',
        email: '',
        sessionState: '',
        sub: '',
        tenantDomain: '',
        username: '',
      });
    }

    // This gets executed in the main thread and sends the prompt none request.
    const rpIFrame = document.getElementById(RP_IFRAME) as HTMLIFrameElement;

    const promptNoneIFrame: HTMLIFrameElement = rpIFrame?.contentDocument?.getElementById(
      PROMPT_NONE_IFRAME,
    ) as HTMLIFrameElement;

    try {
      const url = await constructSilentSignInUrl(additionalParams);

      promptNoneIFrame.src = url;
    } catch (error) {
      return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        resolve(false);
      }, 10000);

      const listenToPromptNoneIFrame = async (e: MessageEvent) => {
        const data: Message<AuthorizationInfo | null> = e.data;

        if (data?.type == CHECK_SESSION_SIGNED_OUT) {
          window.removeEventListener('message', listenToPromptNoneIFrame);
          clearTimeout(timer);
          resolve(false);
        }

        if (data?.type == CHECK_SESSION_SIGNED_IN && data?.data?.code) {
          requestAccessToken(data?.data?.code, data?.data?.sessionState, data?.data?.state, tokenRequestConfig)
            .then((response: User) => {
              window.removeEventListener('message', listenToPromptNoneIFrame);
              resolve(response);
            })
            .catch(error => {
              window.removeEventListener('message', listenToPromptNoneIFrame);
              reject(error);
            })
            .finally(() => {
              clearTimeout(timer);
            });
        }
      };

      window.addEventListener('message', listenToPromptNoneIFrame);
    });
  }

  public async handleSignIn(
    shouldStopAuthn: () => Promise<boolean>,
    checkSession: () => Promise<void>,
    tryRetrievingUserInfo?: () => Promise<User | undefined>,
  ): Promise<User | undefined> {
    const config = await this._storageManager.getConfigData();

    if (await shouldStopAuthn()) {
      return Promise.resolve({
        allowedScopes: '',
        displayName: '',
        email: '',
        sessionState: '',
        sub: '',
        tenantDomain: '',
        username: '',
      });
    }

    if (config.storage !== BrowserStorage.WebWorker) {
      if (await this._authenticationClient.isSignedIn()) {
        this._spaHelper.clearRefreshTokenTimeout();
        this._spaHelper.refreshAccessTokenAutomatically(this);

        // Enable OIDC Sessions Management only if it is set to true in the config.
        if (config.syncSession) {
          checkSession();
        }

        return Promise.resolve(await this._authenticationClient.getUser());
      }
    }

    const error = new URL(window.location.href).searchParams.get(ERROR);
    const errorDescription = new URL(window.location.href).searchParams.get(ERROR_DESCRIPTION);

    if (error) {
      const url = new URL(window.location.href);
      url.searchParams.delete(ERROR);
      url.searchParams.delete(ERROR_DESCRIPTION);

      history.pushState(null, document.title, url.toString());

      throw new AsgardeoAuthException('SPA-AUTH_HELPER-SI-SE01', error, errorDescription ?? '');
    }

    if (config.storage === BrowserStorage.WebWorker && tryRetrievingUserInfo) {
      const basicUserInfo = await tryRetrievingUserInfo();

      if (basicUserInfo) {
        return basicUserInfo;
      }
    }

    return Promise.resolve(undefined);
  }

  public async attachTokenToRequestConfig(request: HttpRequestConfig): Promise<void> {
    const requestConfig = {attachToken: true, ...request};
    if (requestConfig.attachToken) {
      if (requestConfig.shouldAttachIDPAccessToken) {
        request.headers = {
          ...request.headers,
          Authorization: `Bearer ${await this.getIDPAccessToken()}`,
        };
      } else {
        request.headers = {
          ...request.headers,
          Authorization: `Bearer ${await this.getAccessToken()}`,
        };
      }
    }
  }

  public async getUser(): Promise<User> {
    return this._authenticationClient.getUser();
  }

  public async getDecodedIdToken(sessionId?: string): Promise<IdToken> {
    return this._authenticationClient.getDecodedIdToken(sessionId);
  }

  public async getDecodedIDPIDToken(): Promise<IdToken> {
    return this._authenticationClient.getDecodedIdToken();
  }

  public async getCrypto(): Promise<IsomorphicCrypto> {
    return this._authenticationClient.getCrypto();
  }

  public async getIdToken(): Promise<string> {
    return this._authenticationClient.getIdToken();
  }

  public async getOpenIDProviderEndpoints(): Promise<OIDCEndpoints> {
    return this._authenticationClient.getOpenIDProviderEndpoints() as any;
  }

  public async getAccessToken(sessionId?: string): Promise<string> {
    return this._authenticationClient.getAccessToken(sessionId);
  }

  public async getIDPAccessToken(): Promise<string> {
    return (await this._storageManager.getSessionData())?.access_token;
  }

  public getStorageManager(): StorageManager<T> {
    return this._storageManager;
  }

  public async isSignedIn(): Promise<boolean> {
    return this._authenticationClient.isSignedIn();
  }
}
