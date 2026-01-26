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
  AuthClientConfig,
  User,
  IsomorphicCrypto,
  TokenExchangeRequestConfig,
  StorageManager,
  IdToken,
  OIDCEndpoints,
} from '@asgardeo/javascript';
import {
  HttpError,
  HttpRequestConfig,
  HttpResponse,
  MainThreadClientConfig,
  SignInConfig,
  WebWorkerClientConfig,
} from '.';
import {HttpClientInstance} from '../http-client';

export interface MainThreadClientInterface {
  setHttpRequestStartCallback(callback: () => void): void;
  setHttpRequestSuccessCallback(callback: (response: HttpResponse) => void): void;
  setHttpRequestFinishCallback(callback: () => void): void;
  setHttpRequestErrorCallback(callback: (error: HttpError) => void | Promise<void>): void;
  httpRequest(config: HttpRequestConfig): Promise<HttpResponse>;
  httpRequestAll(config: HttpRequestConfig[]): Promise<HttpResponse[] | undefined>;
  getHttpClient(): HttpClientInstance;
  enableHttpHandler(): boolean;
  disableHttpHandler(): boolean;
  signIn(
    config?: SignInConfig,
    authorizationCode?: string,
    sessionState?: string,
    afterSignInUrl?: string,
    tokenRequestConfig?: {
      params: Record<string, unknown>;
    },
  ): Promise<User>;
  signOut(afterSignOutUrl?: string): Promise<boolean>;
  exchangeToken(config: TokenExchangeRequestConfig): Promise<User | Response>;
  refreshAccessToken(): Promise<User>;
  revokeAccessToken(): Promise<boolean>;
  getUser(): Promise<User>;
  getDecodedIdToken(sessionId?: string): Promise<IdToken>;
  getCrypto(): Promise<IsomorphicCrypto>;
  getConfigData(): Promise<AuthClientConfig<MainThreadClientConfig>>;
  getIdToken(): Promise<string>;
  getOpenIDProviderEndpoints(): Promise<OIDCEndpoints>;
  getAccessToken(sessionId?: string): Promise<string>;
  getStorageManager(): Promise<StorageManager<MainThreadClientConfig>>;
  isSignedIn(): Promise<boolean>;
  reInitialize(config: Partial<AuthClientConfig<MainThreadClientConfig>>): Promise<void>;
  signInSilently(
    additionalParams?: Record<string, string | boolean>,
    tokenRequestConfig?: {params: Record<string, unknown>},
  ): Promise<User | boolean>;
  isSessionActive(): Promise<boolean>;
  decodeJwtToken: <T = Record<string, unknown>>(token: string) => Promise<T>;
}

export interface WebWorkerClientInterface {
  exchangeToken(requestParams: TokenExchangeRequestConfig): Promise<Response | User>;
  httpRequest<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>>;
  httpRequestAll<T = any>(configs: HttpRequestConfig[]): Promise<HttpResponse<T>[]>;
  enableHttpHandler(): Promise<boolean>;
  disableHttpHandler(): Promise<boolean>;
  initialize(): Promise<boolean>;
  signIn(
    params?: SignInConfig,
    authorizationCode?: string,
    sessionState?: string,
    afterSignInUrl?: string,
    tokenRequestConfig?: {
      params: Record<string, unknown>;
    },
  ): Promise<User>;
  signOut(afterSignOutUrl?: string): Promise<boolean>;
  revokeAccessToken(): Promise<boolean>;
  getOpenIDProviderEndpoints(): Promise<OIDCEndpoints>;
  getUser(): Promise<User>;
  getConfigData(): Promise<AuthClientConfig<WebWorkerClientConfig>>;
  getDecodedIdToken(sessionId?: string): Promise<IdToken>;
  getDecodedIDPIDToken(): Promise<IdToken>;
  getCrypto(): Promise<IsomorphicCrypto>;
  getIdToken(): Promise<string>;
  isSignedIn(): Promise<boolean>;
  setHttpRequestSuccessCallback(callback: (response: HttpResponse) => void): void;
  setHttpRequestErrorCallback(callback: (response: HttpError) => void | Promise<void>): void;
  setHttpRequestStartCallback(callback: () => void): void;
  setHttpRequestFinishCallback(callback: () => void): void;
  refreshAccessToken(): Promise<User>;
  reInitialize(config: Partial<AuthClientConfig<WebWorkerClientConfig>>): Promise<void>;
  signInSilently(
    additionalParams?: Record<string, string | boolean>,
    tokenRequestConfig?: {params: Record<string, unknown>},
  ): Promise<User | boolean>;
  decodeJwtToken: <T = Record<string, unknown>>(token: string) => Promise<T>;
}
