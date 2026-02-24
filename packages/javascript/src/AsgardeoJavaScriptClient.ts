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

import {EmbeddedSignInFlowInitiateResponse} from "./models/embedded-signin-flow";
import {AuthClientConfig} from './__legacy__/models/client-config';
import {EmbeddedFlowExecuteRequestConfig} from "./models/embedded-flow";
import {EmbeddedSignInFlowHandleResponse} from "./models/embedded-signin-flow";
import {EmbeddedSignInFlowStatus} from "./models/embedded-signin-flow";
import {Crypto} from "./models/crypto";
import {AsgardeoAuthClient} from "./__legacy__/client";
import StorageManager from "./StorageManager";
import executeEmbeddedSignInFlow from "./api/executeEmbeddedSignInFlow";
import {AsgardeoClient} from './models/client';
import {Config, SignInOptions, SignOutOptions, SignUpOptions} from './models/config';
import {EmbeddedFlowExecuteRequestPayload, EmbeddedFlowExecuteResponse} from './models/embedded-flow';
import {AllOrganizationsApiResponse, Organization} from './models/organization';
import {Storage} from './models/store';
import {TokenExchangeRequestConfig, TokenResponse} from './models/token';
import {User, UserProfile} from './models/user';
import initializeEmbeddedSignInFlow from './api/initializeEmbeddedSignInFlow';
import {DefaultCacheStore} from './DefaultCacheStore';
import {DefaultCrypto} from './DefaultCrypto';

interface AgentConfig {
  agentID: string;
  agentSecret: string;
}

export interface AuthCodeResponse {
  code: string;
  state: string;
  session_state: string;
}

/**
 * Base class for implementing Asgardeo clients.
 * This class provides the core functionality for managing user authentication and sessions.
 *
 * @typeParam T - Configuration type that extends Config.
 */
class AsgardeoJavaScriptClient<T = Config> implements AsgardeoClient<T> {

  private cacheStore: Storage;
  private cryptoUtils: Crypto;
  private auth: AsgardeoAuthClient<T>;
  private storageManager: StorageManager<T>;
  private baseURL: string;
  void: void;
  
  constructor(config?: AuthClientConfig<T>, cacheStore?: Storage, cryptoUtils?: Crypto) {
    this.cacheStore = cacheStore ?? new DefaultCacheStore();
    this.cryptoUtils =  cryptoUtils ?? new DefaultCrypto();
    this.auth = new AsgardeoAuthClient();
    this.auth.initialize(config, this.cacheStore, this.cryptoUtils);
    this.storageManager = this.auth.getStorageManager();

    this.baseURL = config.baseUrl ?? "";
  }

  switchOrganization(organization: Organization, sessionId?: string): Promise<TokenResponse | Response> {
    throw new Error("Method not implemented.");
  }

  initialize(config: T, storage?: Storage): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  reInitialize(config: Partial<T>): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  getUser(options?: any): Promise<User> {
    throw new Error("Method not implemented.");
  }

  getAllOrganizations(options?: any, sessionId?: string): Promise<AllOrganizationsApiResponse> {
    throw new Error("Method not implemented.");
  }

  getMyOrganizations(options?: any, sessionId?: string): Promise<Organization[]> {
    throw new Error("Method not implemented.");
  }

  getCurrentOrganization(sessionId?: string): Promise<Organization | null> {
    throw new Error("Method not implemented.");
  }

  getUserProfile(options?: any): Promise<UserProfile> {
    throw new Error("Method not implemented.");
  }

  isLoading(): boolean {
    throw new Error("Method not implemented.");
  }

  isSignedIn(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  updateUserProfile(payload: any, userId?: string): Promise<User> {
    throw new Error("Method not implemented.");
  }

  getConfiguration(): T {
    throw new Error("Method not implemented.");
  }

  exchangeToken(config: TokenExchangeRequestConfig, sessionId?: string): Promise<TokenResponse | Response> {
    throw new Error("Method not implemented.");
  }

  signInSilently(options?: SignInOptions): Promise<User | boolean> {
    throw new Error("Method not implemented.");
  }

  getAccessToken(sessionId?: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  clearSession(sessionId?: string): void {
    throw new Error("Method not implemented.");
  }

  setSession(sessionData: Record<string, unknown>, sessionId?: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  decodeJwtToken<R = Record<string, unknown>>(token: string): Promise<R> {
    throw new Error("Method not implemented.");
  }

  signIn(options?: SignInOptions): Promise<User> {
    throw new Error("Method not implemented.");
  }

  signOut(options?: SignOutOptions, sessionIdOrAfterSignOut?: string | ((afterSignOutUrl: string) => void), afterSignOut?: (afterSignOutUrl: string) => void): Promise<string> {
    throw new Error("Method not implemented.");
  }

  signUp(options?: SignUpOptions): Promise<void>;

  signUp(payload: EmbeddedFlowExecuteRequestPayload): Promise<EmbeddedFlowExecuteResponse>;

  signUp(optionsOrPayload?: SignUpOptions | EmbeddedFlowExecuteRequestPayload): Promise<void | EmbeddedFlowExecuteResponse> {
    throw new Error("Method not implemented.");
  }

  // Get Agent Token. (AI agent acting on its own)
  public async getAgentToken(agentConfig: AgentConfig): Promise<TokenResponse> {
    const customParam = {
      response_mode: "direct",
    };

    const authorizeURL: URL = new URL(await this.auth.getSignInUrl(customParam));

    const authorizeResponse: EmbeddedSignInFlowInitiateResponse = await initializeEmbeddedSignInFlow({
      url: `${authorizeURL.origin}${authorizeURL.pathname}`,
      payload: Object.fromEntries(authorizeURL.searchParams.entries()),
    });

    const usernamePasswordAuthenticator = authorizeResponse.nextStep.authenticators.find(
      (auth) => auth.authenticator === "Username & Password",
    );

    if (!usernamePasswordAuthenticator) {
      console.error("Basic authenticator not found among authentication steps.");
      return Promise.reject(new Error("Basic authenticator not found among authentication steps."));
    }

    const authnRequest: EmbeddedFlowExecuteRequestConfig = {
      baseUrl: this.baseURL,
      payload: {
        flowId: authorizeResponse.flowId,
        selectedAuthenticator: {
          authenticatorId: usernamePasswordAuthenticator.authenticatorId,
          params: {
            username: agentConfig.agentID,
            password: agentConfig.agentSecret,
          },
        },
      },
    };

    const authnResponse: EmbeddedSignInFlowHandleResponse = await executeEmbeddedSignInFlow(authnRequest);

    if (authnResponse.flowStatus != EmbeddedSignInFlowStatus.SuccessCompleted) {
      console.error("Agent Authentication Failed.");
      return Promise.reject(new Error("Agent Authentication Failed."));
    }

    const tokenResponse = await this.auth.requestAccessToken(
      authnResponse.authData['code'],
      authnResponse.authData['session_state'],
      authnResponse.authData['state'],
    );

    return tokenResponse;
  }

  // Build Authorize request for the OBO Flow
  public async getOBOSignInURL(agentConfig: AgentConfig): Promise<string> {
    // The authorize request must include requested_actor parameter from the agent configs
    const customParam = {
      requested_actor: agentConfig.agentID,
    };

    // Build authorize URL using AsgardeoAuthClient
    const authURL: string | undefined = await this.auth.getSignInUrl(customParam);

    if (authURL) {
      return Promise.resolve(authURL.toString());
    }
    return Promise.reject(new Error("Could not build Authorize URL"));
  }

  // Get OBO Token. (AI agent acting on behalf of a user)
  public async getOBOToken(agentConfig: AgentConfig, authCodeResponse: AuthCodeResponse): Promise<TokenResponse> {
    // Get Agent Token
    const agentToken = await this.getAgentToken(agentConfig);

    // Pass Agent Token when requesting access token
    const tokenRequestConfig = {
      params: {
        actor_token: agentToken.accessToken,
      },
    };

    // Return OBO Token
    return await this.auth.requestAccessToken(
      authCodeResponse.code,
      authCodeResponse.session_state,
      authCodeResponse.state,
      undefined,
      tokenRequestConfig
    );
  }
}

export default AsgardeoJavaScriptClient;
