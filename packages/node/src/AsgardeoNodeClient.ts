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
  AsgardeoJavaScriptClient,
  AsgardeoRuntimeError,
  AuthClientConfig,
  Crypto,
  ExtendedAuthorizeRequestUrlParams,
  IdToken,
  OIDCEndpoints,
  SessionData,
  SignInOptions,
  SignOutOptions,
  Storage,
  StorageManager,
  TokenExchangeRequestConfig,
  TokenResponse,
  User,
} from '@asgardeo/javascript';
import {AuthURLCallback} from './models';
import {AsgardeoNodeConfig} from './models/config';
import {MemoryCacheStore} from './stores';
import {Logger, SessionUtils} from './utils';
import {NodeCryptoUtils} from './DefaultCrypto';

class AsgardeoNodeClient<T = AsgardeoNodeConfig> extends AsgardeoJavaScriptClient<T> {
  constructor(config?: AuthClientConfig<T>, store?: Storage) {
    const cacheStore: Storage = store ?? new MemoryCacheStore();
    const cryptoUtils: Crypto = new NodeCryptoUtils();
    super(config, cacheStore, cryptoUtils);
    if (config) {
      Logger.debug('Initialized AsgardeoNodeClient successfully');
    }
  }

  public override async initialize(config: T, storage?: Storage): Promise<boolean> {
    const store: Storage = storage ?? new MemoryCacheStore();
    const result = await super.initialize(config, store);
    Logger.debug('Initialized AsgardeoNodeClient successfully');
    return result;
  }

  public override signIn(
    authURLCallback: AuthURLCallback,
    userId: string,
    authorizationCode?: string,
    sessionState?: string,
    state?: string,
    signInConfig?: Record<string, string | boolean>,
  ): Promise<TokenResponse>;
  public override signIn(options?: SignInOptions): Promise<User>;
  public override async signIn(
    authURLCallbackOrOptions?: AuthURLCallback | SignInOptions,
    userId?: string,
    authorizationCode?: string,
    sessionState?: string,
    state?: string,
    signInConfig?: Record<string, string | boolean>,
  ): Promise<TokenResponse | User> {
    if (typeof authURLCallbackOrOptions !== 'function') {
      return super.signIn(authURLCallbackOrOptions);
    }

    const authURLCallback = authURLCallbackOrOptions as AuthURLCallback;

    if (!userId) {
      return Promise.reject(
        new AsgardeoRuntimeError(
          'No user ID was provided.',
          'NODE-AUTH_CORE-SI-NF01',
          '@asgardeo/node',
          'Unable to sign in the user as no user ID was provided.',
        ),
      );
    }

    if (await this.isSignedIn(userId)) {
      const sessionData: SessionData = await this.getStorageManager().getSessionData(userId);

      return {
        accessToken: sessionData.access_token,
        createdAt: sessionData.created_at,
        expiresIn: sessionData.expires_in,
        idToken: sessionData.id_token,
        refreshToken: sessionData.refresh_token ?? '',
        scope: sessionData.scope,
        tokenType: sessionData.token_type,
      };
    }

    if (!authorizationCode || !state) {
      const authURL: string = await this.getAuthURL(userId, signInConfig);
      authURLCallback(authURL);

      return {
        accessToken: '',
        createdAt: 0,
        expiresIn: '',
        idToken: '',
        refreshToken: '',
        scope: '',
        session: '',
        tokenType: '',
      };
    }

    return super.requestAccessToken(authorizationCode, sessionState ?? '', state, userId);
  }

  public override signOut(userId: string): Promise<string>;
  public override signOut(
    options?: SignOutOptions,
    sessionIdOrAfterSignOut?: string | ((afterSignOutUrl: string) => void),
    afterSignOut?: (afterSignOutUrl: string) => void,
  ): Promise<string>;
  public override async signOut(
    userIdOrOptions?: string | SignOutOptions,
    sessionIdOrAfterSignOut?: string | ((afterSignOutUrl: string) => void),
    afterSignOut?: (afterSignOutUrl: string) => void,
  ): Promise<string> {
    if (typeof userIdOrOptions === 'string') {
      const signOutURL: string = await this.getSignOutUrl(userIdOrOptions);

      if (!signOutURL) {
        return Promise.reject(
          new AsgardeoRuntimeError(
            'Signing out the user failed.',
            'NODE-AUTH_CORE-SO-NF01',
            '@asgardeo/node',
            'Could not obtain the sign-out URL from the server.',
          ),
        );
      }

      return signOutURL;
    }

    return super.signOut(userIdOrOptions, sessionIdOrAfterSignOut, afterSignOut);
  }

  public async getAuthURL(userId: string, signInConfig?: Record<string, string | boolean>): Promise<string> {
    const authURL: string | undefined = await super.getSignInUrl(signInConfig, userId);

    if (authURL) {
      return authURL.toString();
    }

    return Promise.reject(
      new AsgardeoRuntimeError(
        'Getting Authorization URL failed.',
        'NODE-AUTH_CORE-GAU-NF01',
        '@asgardeo/node',
        'No authorization URL was returned by the Asgardeo Auth JS SDK.',
      ),
    );
  }

  public override async isSignedIn(userId?: string): Promise<boolean> {
    try {
      if (!(await super.isSignedIn(userId))) {
        return false;
      }

      const storageManager: StorageManager<T> = this.getStorageManager();

      if (await SessionUtils.validateSession(await storageManager.getSessionData(userId))) {
        return true;
      }

      const refreshedToken: TokenResponse = await this.refreshAccessToken(userId);

      if (refreshedToken) {
        return true;
      }

      storageManager.removeSessionData(userId);
      await storageManager.getTemporaryData(userId);

      return false;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async getConfigData(): Promise<AuthClientConfig<T>> {
    return this.getStorageManager().getConfigData();
  }

  public override async getSignInUrl(
    requestConfig?: ExtendedAuthorizeRequestUrlParams,
    userId?: string,
  ): Promise<string> {
    return super.getSignInUrl(requestConfig, userId);
  }

  public override async getUser(userId?: string): Promise<User> {
    return super.getUser(userId);
  }

  public override async getOpenIDProviderEndpoints(): Promise<Partial<OIDCEndpoints>> {
    return super.getOpenIDProviderEndpoints();
  }

  public override async getDecodedIdToken(userId?: string, idToken?: string): Promise<IdToken> {
    return super.getDecodedIdToken(userId, idToken);
  }

  public override async getAccessToken(userId?: string): Promise<string> {
    return super.getAccessToken(userId);
  }

  public override async exchangeToken(
    config: TokenExchangeRequestConfig,
    userId?: string,
  ): Promise<TokenResponse | Response> {
    return super.exchangeToken(config, userId);
  }

  public override async reInitialize(config: Partial<T>): Promise<boolean> {
    return super.reInitialize(config);
  }

  public override async revokeAccessToken(userId?: string): Promise<Response> {
    return super.revokeAccessToken(userId);
  }

  public override async refreshAccessToken(userId?: string): Promise<TokenResponse> {
    return super.refreshAccessToken(userId);
  }

  public override async decodeJwtToken<K = Record<string, unknown>>(token: string): Promise<K> {
    return super.decodeJwtToken<K>(token);
  }

  public override getStorageManager(): StorageManager<T> {
    return super.getStorageManager();
  }
}

export default AsgardeoNodeClient;
