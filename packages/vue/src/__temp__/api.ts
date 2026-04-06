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
  AsgardeoSPAClient,
  AuthClientConfig,
  User,
  LegacyConfig as Config,
  IdToken,
  Hooks,
  HttpClient,
  HttpRequestConfig,
  HttpResponse,
  OIDCEndpoints,
  SignInConfig,
  SPACustomGrantConfig,
} from '@asgardeo/browser';
import {AuthStateInterface} from './models';

class AuthAPI {
  static DEFAULT_STATE: AuthStateInterface;

  private authState: AuthStateInterface = AuthAPI.DEFAULT_STATE;

  private client: AsgardeoSPAClient;

  private apiInstanceId: number;

  private loadingState: boolean;

  constructor(spaClient?: AsgardeoSPAClient, instanceId: number = 0) {
    this.apiInstanceId = instanceId;
    this.client = spaClient ?? AsgardeoSPAClient.getInstance(instanceId);

    this.getState = this.getState.bind(this);
    this.init = this.init.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.updateState = this.updateState.bind(this);
  }

  public getInstanceId(): number {
    return this.apiInstanceId;
  }

  public setLoadingState(isLoading: boolean): void {
    this.loadingState = isLoading;
  }

  public getLoadingState(): boolean {
    return this.loadingState;
  }

  public isLoading(): boolean {
    return this.getLoadingState();
  }

  public getState(): AuthStateInterface {
    return this.authState;
  }

  public async init(config: AuthClientConfig<Config>): Promise<boolean> {
    return this.client.initialize(config);
  }

  public async getConfigData(): Promise<AuthClientConfig<Config>> {
    return this.client.getConfigData();
  }

  public async getStorageManager(): Promise<any> {
    return this.client.getStorageManager();
  }

  public async isInitialized(): Promise<boolean> {
    return this.client.isInitialized();
  }

  public async signIn(
    config: SignInConfig,
    authorizationCode?: string,
    sessionState?: string,
    authState?: string,
    callback?: (response: User) => void,
    tokenRequestConfig?: {
      params: Record<string, unknown>;
    },
  ): Promise<any> {
    return this.client
      .signIn(config, authorizationCode, sessionState, authState, tokenRequestConfig)
      .then(async (response: User) => {
        if (!response) {
          return null;
        }

        if (await this.client.isSignedIn()) {
          const stateToUpdate: AuthStateInterface = {
            displayName: response.displayName,
            email: response.email,
            isLoading: false,
            isSignedIn: true,
            username: response.username,
          };

          this.updateState(stateToUpdate);
          this.setLoadingState(false);

          if (callback) {
            callback(response);
          }
        }

        return response;
      })
      .catch((error: Error) => Promise.reject(error));
  }

  public signOut(callback?: (response?: boolean) => void): Promise<boolean> {
    return this.client
      .signOut()
      .then((response: boolean) => {
        if (callback) {
          callback(response);
        }

        return response;
      })
      .catch((error: Error) => Promise.reject(error));
  }

  public updateState(state: AuthStateInterface): void {
    this.authState = {...this.authState, ...state};
  }

  public async getUser(): Promise<User> {
    return this.client.getUser();
  }

  public async httpRequest(config: HttpRequestConfig): Promise<HttpResponse<any>> {
    return this.client.httpRequest(config);
  }

  public async httpRequestAll(configs: HttpRequestConfig[]): Promise<HttpResponse<any>[]> {
    return this.client.httpRequestAll(configs);
  }

  public exchangeToken(
    config: SPACustomGrantConfig,
    callback: (response: User | Response) => void,
  ): Promise<User | Response> {
    return this.client
      .exchangeToken(config)
      .then((response: User | Response) => {
        if (!response) {
          return null;
        }

        if (config.returnsSession) {
          this.updateState({
            ...this.getState(),
            ...(response as User),
            isLoading: false,
            isSignedIn: true,
          });
        }

        if (callback) {
          callback(response);
        }

        return response;
      })
      .catch((error: Error) => Promise.reject(error));
  }

  public async getOpenIDProviderEndpoints(): Promise<OIDCEndpoints> {
    return this.client.getOpenIDProviderEndpoints();
  }

  public async getHttpClient(): Promise<HttpClient> {
    return this.client.getHttpClient();
  }

  public async decodeJwtToken<T = Record<string, unknown>>(token: string): Promise<T> {
    return this.client.decodeJwtToken<T>(token);
  }

  public async getDecodedIdToken(sessionId?: string): Promise<IdToken> {
    return this.client.getDecodedIdToken(sessionId);
  }

  public async getIdToken(): Promise<string> {
    return this.client.getIdToken();
  }

  public async getAccessToken(sessionId?: string): Promise<string> {
    return this.client.getAccessToken(sessionId);
  }

  public async refreshAccessToken(): Promise<User> {
    return this.client.refreshAccessToken();
  }

  public async isSignedIn(): Promise<boolean> {
    return this.client.isSignedIn();
  }

  public async enableHttpHandler(): Promise<boolean> {
    return this.client.enableHttpHandler();
  }

  public async disableHttpHandler(): Promise<boolean> {
    return this.client.disableHttpHandler();
  }

  public async reInitialize(config: Partial<AuthClientConfig<Config>>): Promise<void> {
    return this.client.reInitialize(config);
  }

  public on(hook: Hooks.CustomGrant, callback: (response?: any) => void, id: string): Promise<void>;
  public on(hook: Exclude<Hooks, Hooks.CustomGrant>, callback: (response?: any) => void): Promise<void>;
  public on(hook: Hooks, callback: (response?: any) => void, id?: string): Promise<void> {
    if (hook === Hooks.CustomGrant) {
      return this.client.on(hook, callback, id);
    }

    return this.client.on(hook, callback);
  }

  public async signInSilently(
    additionalParams?: Record<string, string | boolean>,
    tokenRequestConfig?: {params: Record<string, unknown>},
  ): Promise<User | boolean | undefined> {
    return this.client
      .signInSilently(additionalParams, tokenRequestConfig)
      .then(async (response: User | boolean) => {
        if (!response) {
          return false;
        }

        return response;
      })
      .catch((error: Error) => Promise.reject(error));
  }

  public clearSession(sessionId?: string): void {
    this.client.clearSession(sessionId);
  }
}

AuthAPI.DEFAULT_STATE = {
  displayName: '',
  email: '',
  isLoading: true,
  isSignedIn: false,
  username: '',
};

export default AuthAPI;
