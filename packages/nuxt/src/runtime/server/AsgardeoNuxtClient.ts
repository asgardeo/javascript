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
  AsgardeoNodeClient,
  LegacyAsgardeoNodeClient,
  type AuthClientConfig,
  type IdToken,
  type Storage,
  type TokenExchangeRequestConfig,
  type TokenResponse,
  type User,
} from '@asgardeo/node';
import type {AsgardeoNuxtConfig} from '../types';

/**
 * Singleton Asgardeo client for Nuxt applications.
 *
 * Mirrors the {@link AsgardeoNextClient} pattern: a single shared instance per
 * server process that delegates OAuth/OIDC operations to an internal
 * {@link LegacyAsgardeoNodeClient}. The legacy client provisions its own default
 * in-memory store (`MemoryCacheStore`) for PKCE state and tokens so that state
 * persists across the sign-in → callback boundary.
 *
 * Consumers call {@link getInstance} directly from server routes and plugins —
 * there is no per-request wrapper factory. Initialization happens once per
 * process (guarded by {@link isInitialized}) from the `asgardeo-init` Nitro
 * plugin on the first request.
 *
 * @example
 * ```ts
 * // In a Nitro API route:
 * export default defineEventHandler(async (event) => {
 *   const client = AsgardeoNuxtClient.getInstance();
 *   return client.getUser(sessionId);
 * });
 * ```
 */
class AsgardeoNuxtClient extends AsgardeoNodeClient<AsgardeoNuxtConfig> {
  private static instance: AsgardeoNuxtClient;

  private legacy: LegacyAsgardeoNodeClient<AsgardeoNuxtConfig>;

  public isInitialized: boolean = false;

  private constructor() {
    super();
    this.legacy = new LegacyAsgardeoNodeClient<AsgardeoNuxtConfig>();
  }

  /**
   * Get the singleton instance of AsgardeoNuxtClient.
   */
  public static getInstance(): AsgardeoNuxtClient {
    if (!AsgardeoNuxtClient.instance) {
      AsgardeoNuxtClient.instance = new AsgardeoNuxtClient();
    }
    return AsgardeoNuxtClient.instance;
  }

  /**
   * Initializes the underlying legacy client with OAuth/OIDC settings derived
   * from the Nuxt module config. Idempotent — repeated calls are no-ops after
   * the first successful initialization.
   */
  override async initialize(config: AsgardeoNuxtConfig, storage?: Storage): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    const authConfig: AuthClientConfig<AsgardeoNuxtConfig> = {
      baseUrl: config.baseUrl as string,
      clientId: config.clientId as string,
      clientSecret: config.clientSecret || undefined,
      afterSignInUrl: config.afterSignInUrl as string,
      afterSignOutUrl: config.afterSignOutUrl || '/',
      scopes: config.scopes || ['openid', 'profile'],
      enablePKCE: true,
    } as AuthClientConfig<AsgardeoNuxtConfig>;

    const result = await this.legacy.initialize(authConfig, storage);
    this.isInitialized = true;
    return result;
  }

  override async reInitialize(config: Partial<AsgardeoNuxtConfig>): Promise<boolean> {
    await this.legacy.reInitialize(config as any);
    return true;
  }

  /**
   * Initiates the authorization code flow or exchanges a code for tokens.
   *
   * Legacy call signature (used by the Nuxt route handlers):
   * ```
   * signIn(authURLCallback, sessionId, code?, sessionState?, state?, config?)
   * ```
   */
  override signIn(...args: any[]): Promise<any> {
    return this.legacy.signIn(args[0], args[1], args[2], args[3], args[4], args[5]);
  }

  /**
   * Clears the session and returns the RP-Initiated Logout URL.
   * Accepts either `(sessionId: string)` or `(options?, sessionId?, callback?)`.
   */
  override async signOut(...args: any[]): Promise<string> {
    const sessionId: string = typeof args[0] === 'string' ? args[0] : (args[1] as string);
    return this.legacy.signOut(sessionId);
  }

  override getUser(sessionId?: string): Promise<User> {
    return this.legacy.getUser(sessionId as string);
  }

  override getAccessToken(sessionId?: string): Promise<string> {
    return this.legacy.getAccessToken(sessionId as string);
  }

  /**
   * Decodes and returns the ID token claims for the given session.
   * Exposed here (as on {@link AsgardeoNextClient}) so route handlers can
   * access ID token claims without falling back to the legacy client.
   */
  getDecodedIdToken(sessionId?: string, idToken?: string): Promise<IdToken> {
    return this.legacy.getDecodedIdToken(sessionId as string, idToken);
  }

  override isSignedIn(sessionId?: string): Promise<boolean> {
    return this.legacy.isSignedIn(sessionId as string);
  }

  override exchangeToken(
    config: TokenExchangeRequestConfig,
    sessionId?: string,
  ): Promise<TokenResponse | Response> {
    return this.legacy.exchangeToken(config, sessionId);
  }
}

export default AsgardeoNuxtClient;
export {AsgardeoNuxtClient};
