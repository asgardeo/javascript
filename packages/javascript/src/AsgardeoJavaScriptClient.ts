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

import {AsgardeoAuthClient} from './__legacy__/client';
import {AuthClientConfig} from './__legacy__/models/client-config';
import executeEmbeddedSignInFlow from './api/executeEmbeddedSignInFlow';
import initializeEmbeddedSignInFlow from './api/initializeEmbeddedSignInFlow';
import {DefaultCacheStore} from './DefaultCacheStore';
import {DefaultCrypto} from './DefaultCrypto';
import {AgentConfig} from './models/agent';
import {AuthCodeResponse} from './models/auth-code-response';
import {AsgardeoClient} from './models/client';
import {Config, SignInOptions, SignOutOptions, SignUpOptions} from './models/config';
import {Crypto} from './models/crypto';
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
import {AllOrganizationsApiResponse, Organization} from './models/organization';
import {Storage} from './models/store';
import {TokenExchangeRequestConfig, TokenResponse} from './models/token';
import {User, UserProfile} from './models/user';
import StorageManager from './StorageManager';

class AsgardeoJavaScriptClient<T = Config> implements AsgardeoClient<T> {
  private cacheStore: Storage;

  private cryptoUtils: Crypto;

  private auth: AsgardeoAuthClient<T>;

  private storageManager: StorageManager<T>;

  private baseURL: string;

  constructor(config?: AuthClientConfig<T>, cacheStore?: Storage, cryptoUtils?: Crypto) {
    this.cacheStore = cacheStore ?? new DefaultCacheStore();
    this.cryptoUtils = cryptoUtils ?? new DefaultCrypto();
    this.auth = new AsgardeoAuthClient();

    if (config) {
      this.auth.initialize(config, this.cacheStore, this.cryptoUtils);
      this.storageManager = this.auth.getStorageManager();
    }

    this.baseURL = config?.baseUrl ?? '';
  }

  /* eslint-disable class-methods-use-this, @typescript-eslint/no-unused-vars */
  switchOrganization(_organization: Organization, _sessionId?: string): Promise<TokenResponse | Response> {
    throw new Error('Method not implemented.');
  }

  initialize(_config: T, _storage?: Storage): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  reInitialize(_config: Partial<T>): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  getUser(_options?: any): Promise<User> {
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

  isSignedIn(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  updateUserProfile(_payload: any, _userId?: string): Promise<User> {
    throw new Error('Method not implemented.');
  }

  getConfiguration(): T {
    throw new Error('Method not implemented.');
  }

  exchangeToken(_config: TokenExchangeRequestConfig, _sessionId?: string): Promise<TokenResponse | Response> {
    throw new Error('Method not implemented.');
  }

  signInSilently(_options?: SignInOptions): Promise<User | boolean> {
    throw new Error('Method not implemented.');
  }

  getAccessToken(_sessionId?: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  clearSession(_sessionId?: string): void {
    throw new Error('Method not implemented.');
  }

  setSession(_sessionData: Record<string, unknown>, _sessionId?: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  decodeJwtToken<R = Record<string, unknown>>(_token: string): Promise<R> {
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

  public async getAgentToken(agentConfig: AgentConfig): Promise<TokenResponse> {
    const customParam: Record<string, string> = {
      response_mode: 'direct',
    };

    const authorizeURL: URL = new URL(await this.auth.getSignInUrl(customParam));

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

    return this.auth.requestAccessToken(
      authnResponse.authData['code'],
      authnResponse.authData['session_state'],
      authnResponse.authData['state'],
    );
  }

  public async getOBOSignInURL(agentConfig: AgentConfig): Promise<string> {
    const customParam: Record<string, string> = {
      requested_actor: agentConfig.agentID,
    };

    const authURL: string | undefined = await this.auth.getSignInUrl(customParam);

    if (authURL) {
      return authURL.toString();
    }

    throw new Error('Could not build Authorize URL');
  }

  public async getOBOToken(agentConfig: AgentConfig, authCodeResponse: AuthCodeResponse): Promise<TokenResponse> {
    const agentToken: TokenResponse = await this.getAgentToken(agentConfig);

    const tokenRequestConfig: {params: {actor_token: string}} = {
      params: {
        actor_token: agentToken.accessToken,
      },
    };

    return this.auth.requestAccessToken(
      authCodeResponse.code,
      authCodeResponse.session_state,
      authCodeResponse.state,
      undefined,
      tokenRequestConfig,
    );
  }
}

export default AsgardeoJavaScriptClient;
