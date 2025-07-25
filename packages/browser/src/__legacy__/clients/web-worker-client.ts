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
  User,
  IsomorphicCrypto,
  TokenExchangeRequestConfig,
  IdToken,
  ExtendedAuthorizeRequestUrlParams,
  OIDCEndpoints,
  OIDCRequestConstants,
  Storage,
  extractPkceStorageKeyFromState,
} from '@asgardeo/javascript';
import {
  DISABLE_HTTP_HANDLER,
  ENABLE_HTTP_HANDLER,
  GET_AUTH_URL,
  GET_BASIC_USER_INFO,
  GET_CONFIG_DATA,
  GET_CRYPTO_HELPER,
  GET_DECODED_IDP_ID_TOKEN,
  GET_DECODED_ID_TOKEN,
  GET_ID_TOKEN,
  GET_OIDC_SERVICE_ENDPOINTS,
  GET_SIGN_OUT_URL,
  HTTP_REQUEST,
  HTTP_REQUEST_ALL,
  INIT,
  IS_AUTHENTICATED,
  REFRESH_ACCESS_TOKEN,
  REQUEST_ACCESS_TOKEN,
  REQUEST_CUSTOM_GRANT,
  REQUEST_FINISH,
  REQUEST_START,
  REQUEST_SUCCESS,
  REVOKE_ACCESS_TOKEN,
  SET_SESSION_STATE,
  SIGN_OUT,
  SILENT_SIGN_IN_STATE,
  START_AUTO_REFRESH_TOKEN,
  UPDATE_CONFIG,
} from '../constants';
import {AuthenticationHelper, SPAHelper, SessionManagementHelper} from '../helpers';
import {
  AuthorizationInfo,
  AuthorizationResponse,
  HttpClient,
  HttpError,
  HttpRequestConfig,
  HttpResponse,
  Message,
  ResponseMessage,
  WebWorkerClientConfig,
  WebWorkerClientInterface,
} from '../models';
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

export const WebWorkerClient = async (
  instanceID: number,
  config: AuthClientConfig<WebWorkerClientConfig>,
  webWorker: new () => Worker,
  getAuthHelper: (
    authClient: AsgardeoAuthClient<WebWorkerClientConfig>,
    spaHelper: SPAHelper<WebWorkerClientConfig>,
  ) => AuthenticationHelper<WebWorkerClientConfig>,
): Promise<WebWorkerClientInterface> => {
  /**
   * HttpClient handlers
   */
  let httpClientHandlers: HttpClient;
  /**
   * API request time out.
   */
  const _requestTimeout: number = config?.requestTimeout ?? 60000;
  let _isHttpHandlerEnabled: boolean = true;
  let _getSignOutURLFromSessionStorage: boolean = false;

  const _store: Storage = initiateStore(config.storage as BrowserStorage);
  const _cryptoUtils: SPACryptoUtils = new SPACryptoUtils();
  const _authenticationClient = new AsgardeoAuthClient<WebWorkerClientConfig>();
  await _authenticationClient.initialize(config, _store, _cryptoUtils, instanceID);
  const _spaHelper = new SPAHelper<WebWorkerClientConfig>(_authenticationClient);

  const _sessionManagementHelper = await SessionManagementHelper(
    async () => {
      const message: Message<string> = {
        type: SIGN_OUT,
      };

      try {
        const signOutURL = await communicate<string, string>(message);

        return signOutURL;
      } catch {
        return SPAUtils.getSignOutUrl(config.clientId, instanceID);
      }
    },
    config.storage as BrowserStorage,
    (sessionState: string) => setSessionState(sessionState),
  );

  const _authenticationHelper: AuthenticationHelper<WebWorkerClientConfig> = getAuthHelper(
    _authenticationClient,
    _spaHelper,
  );

  const worker: Worker = new webWorker();

  const communicate = <T, R>(message: Message<T>): Promise<R> => {
    const channel = new MessageChannel();

    worker.postMessage(message, [channel.port2]);

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(
          new AsgardeoAuthException(
            'SPA-WEB_WORKER_CLIENT-COM-TO01',
            'Operation timed out.',
            'No response was received from the web worker for ' +
              _requestTimeout / 1000 +
              ' since dispatching the request',
          ),
        );
      }, _requestTimeout);

      return (channel.port1.onmessage = ({data}: {data: ResponseMessage<string>}) => {
        clearTimeout(timer);
        channel.port1.close();
        channel.port2.close();

        if (data?.success) {
          const responseData = data?.data ? JSON.parse(data?.data) : null;
          if (data?.blob) {
            responseData.data = data?.blob;
          }

          resolve(responseData);
        } else {
          reject(data.error ? JSON.parse(data.error) : null);
        }
      });
    });
  };

  /**
   * Allows using custom grant types.
   *
   * @param {CustomGrantRequestParams} requestParams Request Parameters.
   *
   * @returns {Promise<HttpResponse|boolean>} A promise that resolves with a boolean value or the request
   * response if the the `returnResponse` attribute in the `requestParams` object is set to `true`.
   */
  const exchangeToken = (requestParams: SPACustomGrantConfig): Promise<Response | User> => {
    const message: Message<TokenExchangeRequestConfig> = {
      data: requestParams,
      type: REQUEST_CUSTOM_GRANT,
    };

    return communicate<TokenExchangeRequestConfig, Response | User>(message)
      .then(response => {
        if (requestParams.preventSignOutURLUpdate) {
          _getSignOutURLFromSessionStorage = true;
        }

        return Promise.resolve(response);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  };

  /**
   *
   * Send the API request to the web worker and returns the response.
   *
   * @param {HttpRequestConfig} config The Http Request Config object
   *
   * @returns {Promise<HttpResponse>} A promise that resolves with the response data.
   */
  const httpRequest = <T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>> => {
    /**
     *
     * Currently FormData is not supported to send to a web worker
     *
     * Below workaround will represent FormData object as a JSON.
     * This workaround will not be needed once FormData object is made cloneable
     * Reference: https://github.com/whatwg/xhr/issues/55
     */
    if (config?.data && config?.data instanceof FormData) {
      config.data = {...Object.fromEntries((config?.data as any).entries()), formData: true};
    }

    const message: Message<HttpRequestConfig> = {
      data: config,
      type: HTTP_REQUEST,
    };

    return communicate<HttpRequestConfig, HttpResponse<T>>(message)
      .then(response => {
        return Promise.resolve(response);
      })
      .catch(async error => {
        if (_isHttpHandlerEnabled) {
          if (typeof httpClientHandlers.requestErrorCallback === 'function') {
            await httpClientHandlers.requestErrorCallback(error);
          }
          if (typeof httpClientHandlers.requestFinishCallback === 'function') {
            httpClientHandlers.requestFinishCallback();
          }
        }

        return Promise.reject(error);
      });
  };

  /**
   *
   * Send multiple API requests to the web worker and returns the response.
   * Similar `axios.spread` in functionality.
   *
   * @param {HttpRequestConfig[]} configs - The Http Request Config object
   *
   * @returns {Promise<HttpResponse<T>[]>} A promise that resolves with the response data.
   */
  const httpRequestAll = <T = any>(configs: HttpRequestConfig[]): Promise<HttpResponse<T>[]> => {
    const message: Message<HttpRequestConfig[]> = {
      data: configs,
      type: HTTP_REQUEST_ALL,
    };

    return communicate<HttpRequestConfig[], HttpResponse<T>[]>(message)
      .then(response => {
        return Promise.resolve(response);
      })
      .catch(async error => {
        if (_isHttpHandlerEnabled) {
          if (typeof httpClientHandlers.requestErrorCallback === 'function') {
            await httpClientHandlers.requestErrorCallback(error);
          }
          if (typeof httpClientHandlers.requestFinishCallback === 'function') {
            httpClientHandlers.requestFinishCallback();
          }
        }

        return Promise.reject(error);
      });
  };

  const enableHttpHandler = (): Promise<boolean> => {
    const message: Message<null> = {
      type: ENABLE_HTTP_HANDLER,
    };
    return communicate<null, null>(message)
      .then(() => {
        _isHttpHandlerEnabled = true;

        return Promise.resolve(true);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  };

  const disableHttpHandler = (): Promise<boolean> => {
    const message: Message<null> = {
      type: DISABLE_HTTP_HANDLER,
    };
    return communicate<null, null>(message)
      .then(() => {
        _isHttpHandlerEnabled = false;

        return Promise.resolve(true);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  };

  /**
   * Initializes the object with authentication parameters.
   *
   * @param {ConfigInterface} config The configuration object.
   *
   * @returns {Promise<boolean>} Promise that resolves when initialization is successful.
   *
   */
  const initialize = (): Promise<boolean> => {
    if (!httpClientHandlers) {
      httpClientHandlers = {
        requestErrorCallback: () => Promise.resolve(),
        requestFinishCallback: () => null,
        requestStartCallback: () => null,
        requestSuccessCallback: () => null,
      };
    }

    worker.onmessage = ({data}) => {
      switch (data.type) {
        case REQUEST_FINISH:
          httpClientHandlers?.requestFinishCallback && httpClientHandlers?.requestFinishCallback();
          break;
        case REQUEST_START:
          httpClientHandlers?.requestStartCallback && httpClientHandlers?.requestStartCallback();
          break;
        case REQUEST_SUCCESS:
          httpClientHandlers?.requestSuccessCallback &&
            httpClientHandlers?.requestSuccessCallback(data.data ? JSON.parse(data.data) : null);
          break;
      }
    };

    const message: Message<AuthClientConfig<WebWorkerClientConfig>> = {
      data: config,
      type: INIT,
    };

    return communicate<AuthClientConfig<WebWorkerClientConfig>, null>(message)
      .then(() => {
        return Promise.resolve(true);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  };

  const setSessionState = (sessionState: string | null): Promise<void> => {
    const message: Message<string | null> = {
      data: sessionState,
      type: SET_SESSION_STATE,
    };

    return communicate<string | null, void>(message);
  };

  const startAutoRefreshToken = (): Promise<void> => {
    const message: Message<null> = {
      type: START_AUTO_REFRESH_TOKEN,
    };

    return communicate<null, void>(message);
  };

  const checkSession = async (): Promise<void> => {
    const oidcEndpoints: OIDCEndpoints = await getOpenIDProviderEndpoints();
    const config: AuthClientConfig<WebWorkerClientConfig> = await getConfigData();

    _authenticationHelper.initializeSessionManger(
      config,
      oidcEndpoints,
      async () => (await _authenticationClient.getUserSession()).sessionState,
      async (params?: ExtendedAuthorizeRequestUrlParams): Promise<string> =>
        (await getSignInUrl(params)).authorizationURL,
      _sessionManagementHelper,
    );
  };

  const constructSilentSignInUrl = async (additionalParams: Record<string, string | boolean> = {}): Promise<string> => {
    const config: AuthClientConfig<WebWorkerClientConfig> = await getConfigData();
    const message: Message<ExtendedAuthorizeRequestUrlParams> = {
      data: {
        prompt: 'none',
        state: SILENT_SIGN_IN_STATE,
        ...additionalParams,
      },
      type: GET_AUTH_URL,
    };

    const response: AuthorizationResponse = await communicate<ExtendedAuthorizeRequestUrlParams, AuthorizationResponse>(
      message,
    );

    const pkceKey: string = extractPkceStorageKeyFromState(
      new URL(response.authorizationURL).searchParams.get(OIDCRequestConstants.Params.STATE) ?? '',
    );

    response.pkce && config.enablePKCE && SPAUtils.setPKCE(pkceKey, response.pkce);

    const urlString: string = response.authorizationURL;

    // Replace form_post with query
    const urlObject = new URL(urlString);
    urlObject.searchParams.set('response_mode', 'query');
    const url: string = urlObject.toString();

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
  ): Promise<User | boolean> => {
    return await _authenticationHelper.signInSilently(
      constructSilentSignInUrl,
      requestAccessToken,
      _sessionManagementHelper,
      additionalParams,
      tokenRequestConfig,
    );
  };

  /**
   * Generates an authorization URL.
   *
   * @param {ExtendedAuthorizeRequestUrlParams} params Authorization URL params.
   * @returns {Promise<string>} Authorization URL.
   */
  const getSignInUrl = async (params?: ExtendedAuthorizeRequestUrlParams): Promise<AuthorizationResponse> => {
    const config: AuthClientConfig<WebWorkerClientConfig> = await getConfigData();

    const message: Message<ExtendedAuthorizeRequestUrlParams> = {
      data: params,
      type: GET_AUTH_URL,
    };

    return communicate<ExtendedAuthorizeRequestUrlParams, AuthorizationResponse>(message).then(
      async (response: AuthorizationResponse) => {
        if (response.pkce && config.enablePKCE) {
          const pkceKey: string = extractPkceStorageKeyFromState(
            new URL(response.authorizationURL).searchParams.get(OIDCRequestConstants.Params.STATE) ?? '',
          );

          SPAUtils.setPKCE(pkceKey, response.pkce);
        }

        return Promise.resolve(response);
      },
    );
  };

  const requestAccessToken = async (
    resolvedAuthorizationCode: string,
    resolvedSessionState: string,
    resolvedState: string,
    tokenRequestConfig?: {
      params: Record<string, unknown>;
    },
  ): Promise<User> => {
    const config: AuthClientConfig<WebWorkerClientConfig> = await getConfigData();
    const pkceKey: string = extractPkceStorageKeyFromState(resolvedState);

    const message: Message<AuthorizationInfo> = {
      data: {
        code: resolvedAuthorizationCode,
        pkce: config.enablePKCE ? SPAUtils.getPKCE(pkceKey) : undefined,
        sessionState: resolvedSessionState,
        state: resolvedState,
        tokenRequestConfig,
      },
      type: REQUEST_ACCESS_TOKEN,
    };

    config.enablePKCE && SPAUtils.removePKCE(pkceKey);

    return communicate<AuthorizationInfo, User>(message)
      .then(response => {
        const message: Message<null> = {
          type: GET_SIGN_OUT_URL,
        };

        return communicate<null, string>(message)
          .then((url: string) => {
            SPAUtils.setSignOutURL(url, config.clientId, instanceID);

            // Enable OIDC Sessions Management only if it is set to true in the config.
            if (config.enableOIDCSessionManagement) {
              checkSession();
            }

            startAutoRefreshToken();

            return Promise.resolve(response);
          })
          .catch(error => {
            return Promise.reject(error);
          });
      })
      .catch(error => {
        return Promise.reject(error);
      });
  };

  const shouldStopAuthn = async (): Promise<boolean> => {
    return await _sessionManagementHelper.receivePromptNoneResponse(async (sessionState: string | null) => {
      return setSessionState(sessionState);
    });
  };

  const tryRetrievingUserInfo = async (): Promise<User | undefined> => {
    if (await isSignedIn()) {
      await startAutoRefreshToken();

      // Enable OIDC Sessions Management only if it is set to true in the config.
      if (config.enableOIDCSessionManagement) {
        checkSession();
      }

      return getUser();
    }

    return Promise.resolve(undefined);
  };

  /**
   * Initiates the authentication flow.
   *
   * @returns {Promise<UserInfo>} A promise that resolves when authentication is successful.
   */
  const signIn = async (
    params?: ExtendedAuthorizeRequestUrlParams,
    authorizationCode?: string,
    sessionState?: string,
    state?: string,
    tokenRequestConfig?: {
      params: Record<string, unknown>;
    },
  ): Promise<User> => {
    const basicUserInfo = await _authenticationHelper.handleSignIn(
      shouldStopAuthn,
      checkSession,
      tryRetrievingUserInfo,
    );

    if (basicUserInfo) {
      return basicUserInfo;
    } else {
      let resolvedAuthorizationCode: string;
      let resolvedSessionState: string;
      let resolvedState: string;

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
        return requestAccessToken(resolvedAuthorizationCode, resolvedSessionState, resolvedState, tokenRequestConfig);
      }

      return getSignInUrl(params)
        .then(async (response: AuthorizationResponse) => {
          location.href = response.authorizationURL;

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
        })
        .catch(error => {
          return Promise.reject(error);
        });
    }
  };

  /**
   * Initiates the sign out flow.
   *
   * @returns {Promise<boolean>} A promise that resolves when sign out is completed.
   */
  const signOut = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!_getSignOutURLFromSessionStorage) {
        const message: Message<null> = {
          type: SIGN_OUT,
        };

        return communicate<null, string>(message)
          .then(async response => {
            window.location.href = response;

            await SPAUtils.waitTillPageRedirect();

            return resolve(true);
          })
          .catch(error => {
            return reject(error);
          });
      } else {
        window.location.href = SPAUtils.getSignOutUrl(config.clientId, instanceID);

        return SPAUtils.waitTillPageRedirect().then(() => {
          return Promise.resolve(true);
        });
      }
    });
  };

  /**
   * Revokes token.
   *
   * @returns {Promise<boolean>} A promise that resolves when revoking is completed.
   */
  const revokeAccessToken = (): Promise<boolean> => {
    const message: Message<null> = {
      type: REVOKE_ACCESS_TOKEN,
    };

    return communicate<null, boolean>(message)
      .then(response => {
        _sessionManagementHelper.reset();
        return Promise.resolve(response);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  };

  const getOpenIDProviderEndpoints = (): Promise<OIDCEndpoints> => {
    const message: Message<null> = {
      type: GET_OIDC_SERVICE_ENDPOINTS,
    };

    return communicate<null, OIDCEndpoints>(message)
      .then(response => {
        return Promise.resolve(response);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  };

  const getConfigData = (): Promise<AuthClientConfig<WebWorkerClientConfig>> => {
    const message: Message<null> = {
      type: GET_CONFIG_DATA,
    };

    return communicate<null, AuthClientConfig<WebWorkerClientConfig>>(message)
      .then(response => {
        return Promise.resolve(response);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  };

  const getUser = (): Promise<User> => {
    const message: Message<null> = {
      type: GET_BASIC_USER_INFO,
    };

    return communicate<null, User>(message)
      .then(response => {
        return Promise.resolve(response);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  };

  const getDecodedIdToken = (sessionId?: string): Promise<IdToken> => {
    const message: Message<null> = {
      type: GET_DECODED_ID_TOKEN,
    };

    return communicate<null, IdToken>(message)
      .then(response => {
        return Promise.resolve(response);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  };

  const getDecodedIDPIDToken = (): Promise<IdToken> => {
    const message: Message<null> = {
      type: GET_DECODED_IDP_ID_TOKEN,
    };

    return communicate<null, IdToken>(message)
      .then(response => {
        return Promise.resolve(response);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  };

  const getCrypto = (): Promise<IsomorphicCrypto> => {
    const message: Message<null> = {
      type: GET_CRYPTO_HELPER,
    };

    return communicate<null, IsomorphicCrypto>(message)
      .then(response => {
        return Promise.resolve(response);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  };

  const getIdToken = (): Promise<string> => {
    const message: Message<null> = {
      type: GET_ID_TOKEN,
    };

    return communicate<null, string>(message)
      .then(response => {
        return Promise.resolve(response);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  };

  const isSignedIn = (): Promise<boolean> => {
    const message: Message<null> = {
      type: IS_AUTHENTICATED,
    };

    return communicate<null, boolean>(message)
      .then(response => {
        return Promise.resolve(response);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  };

  const refreshAccessToken = (): Promise<User> => {
    const message: Message<null> = {
      type: REFRESH_ACCESS_TOKEN,
    };

    return communicate<null, User>(message);
  };

  const setHttpRequestSuccessCallback = (callback: (response: HttpResponse) => void): void => {
    if (callback && typeof callback === 'function') {
      httpClientHandlers.requestSuccessCallback = callback;
    }
  };

  const setHttpRequestErrorCallback = (callback: (response: HttpError) => void | Promise<void>): void => {
    if (callback && typeof callback === 'function') {
      httpClientHandlers.requestErrorCallback = callback;
    }
  };

  const setHttpRequestStartCallback = (callback: () => void): void => {
    if (callback && typeof callback === 'function') {
      httpClientHandlers.requestStartCallback = callback;
    }
  };

  const setHttpRequestFinishCallback = (callback: () => void): void => {
    if (callback && typeof callback === 'function') {
      httpClientHandlers.requestFinishCallback = callback;
    }
  };

  const reInitialize = async (newConfig: Partial<AuthClientConfig<WebWorkerClientConfig>>): Promise<void> => {
    const existingConfig = await getConfigData();
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

    const message: Message<Partial<AuthClientConfig<WebWorkerClientConfig>>> = {
      data: config,
      type: UPDATE_CONFIG,
    };

    await communicate<Partial<AuthClientConfig<WebWorkerClientConfig>>, void>(message);

    // Re-initiates check session if the check session endpoint is updated.
    if (config.enableOIDCSessionManagement && isCheckSessionIframeDifferent) {
      _sessionManagementHelper.reset();

      checkSession();
    }
  };

  return {
    disableHttpHandler,
    enableHttpHandler,
    getUser,
    getConfigData,
    getCrypto,
    getDecodedIDPIDToken,
    getDecodedIdToken,
    getIdToken,
    getOpenIDProviderEndpoints,
    httpRequest,
    httpRequestAll,
    initialize,
    isSignedIn,
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
  };
};
