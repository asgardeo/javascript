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

import {AllOrganizationsApiResponse} from './models/organization';
import {AsgardeoClient} from './models/client';
import {Config, SignInOptions, SignOutOptions, SignUpOptions} from './models/config';
import {Storage} from './models/store';
import {EmbeddedFlowExecuteRequestPayload, EmbeddedFlowExecuteResponse} from './models/embedded-flow';
import {EmbeddedSignInFlowHandleRequestPayload} from './models/embedded-signin-flow';
import {TokenExchangeRequestConfig, TokenResponse} from './models/token';
import {Organization} from './models/organization';
import {User, UserProfile} from './models/user';

/**
 * Base class for implementing Asgardeo clients.
 * This class provides the core functionality for managing user authentication and sessions.
 *
 * @typeParam T - Configuration type that extends Config.
 */
abstract class AsgardeoJavaScriptClient<T = Config> implements AsgardeoClient<T> {
  abstract switchOrganization(organization: Organization, sessionId?: string): Promise<TokenResponse | Response>;

  abstract initialize(config: T, storage?: Storage): Promise<boolean>;

  abstract reInitialize(config: Partial<T>): Promise<boolean>;

  abstract getUser(options?: any): Promise<User>;

  abstract getAllOrganizations(options?: any, sessionId?: string): Promise<AllOrganizationsApiResponse>;

  abstract getMyOrganizations(options?: any, sessionId?: string): Promise<Organization[]>;

  abstract getCurrentOrganization(sessionId?: string): Promise<Organization | null>;

  abstract getUserProfile(options?: any): Promise<UserProfile>;

  abstract isLoading(): boolean;

  abstract isSignedIn(): Promise<boolean>;

  abstract updateUserProfile(payload: any, userId?: string): Promise<User>;

  abstract getConfiguration(): T;

  abstract exchangeToken(config: TokenExchangeRequestConfig, sessionId?: string): Promise<TokenResponse | Response>;

  abstract signIn(
    options?: SignInOptions,
    sessionId?: string,
    onSignInSuccess?: (afterSignInUrl: string) => void,
  ): Promise<User>;
  abstract signIn(
    payload: EmbeddedSignInFlowHandleRequestPayload,
    request: Request,
    sessionId?: string,
    onSignInSuccess?: (afterSignInUrl: string) => void,
  ): Promise<User>;

  abstract signInSilently(options?: SignInOptions): Promise<User | boolean>;

  abstract signOut(options?: SignOutOptions, afterSignOut?: (afterSignOutUrl: string) => void): Promise<string>;
  abstract signOut(
    options?: SignOutOptions,
    sessionId?: string,
    afterSignOut?: (afterSignOutUrl: string) => void,
  ): Promise<string>;

  abstract signUp(options?: SignUpOptions): Promise<void>;
  abstract signUp(payload: EmbeddedFlowExecuteRequestPayload): Promise<EmbeddedFlowExecuteResponse>;
  abstract signUp(payload?: unknown): Promise<void> | Promise<EmbeddedFlowExecuteResponse>;

  abstract getAccessToken(sessionId?: string): Promise<string>;
}

export default AsgardeoJavaScriptClient;
