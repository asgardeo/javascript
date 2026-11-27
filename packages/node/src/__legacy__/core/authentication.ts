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
  AsgardeoAuthClient,
  AsgardeoAuthException,
  AuthClientConfig,
  Crypto,
  TokenExchangeRequestConfig,
  StorageManager,
  IdToken,
  OIDCEndpoints,
  SessionData,
  Storage,
  TokenResponse,
  User,
} from '@asgardeo/javascript';
import {AuthURLCallback} from '../models';
import {MemoryCacheStore} from '../stores';
import {Logger, SessionUtils} from '../utils';
import {NodeCryptoUtils} from '../utils/crypto-utils';

export class AsgardeoNodeCore<T> {
  private auth: AsgardeoAuthClient<T>;

  private cryptoUtils: Crypto;

  private store: Storage;

  private storageManager: StorageManager<T>;

  private initialization: Promise<void>;

  constructor(config: AuthClientConfig<T>, store?: Storage) {
    // Initialize the default memory cache store if an external store is not passed.
    if (!store) {
      this.store = new MemoryCacheStore();
    } else {
      this.store = store;
    }
    this.cryptoUtils = new NodeCryptoUtils();
    this.auth = new AsgardeoAuthClient();
    this.initialization = this.auth.initialize(config, this.store, this.cryptoUtils);
    this.storageManager = this.auth.getStorageManager();
    // Avoid an unhandled rejection here; the error surfaces from the first method that awaits initialization.
    this.initialization.then(
      () => Logger.debug('Initialized AsgardeoAuthClient successfully'),
      () => undefined,
    );
  }

  /**
   * Resolves once the underlying client has finished initializing. Every public async method awaits this so that a
   * call made right after construction never reads configuration that an async store has not saved yet.
   */
  public async waitForInitialization(): Promise<void> {
    return this.initialization;
  }

  public async signIn(
    authURLCallback: AuthURLCallback,
    userId: string,
    authorizationCode?: string,
    sessionState?: string,
    state?: string,
    signInConfig?: Record<string, string | boolean>,
  ): Promise<TokenResponse> {
    await this.initialization;
    if (!userId) {
      return Promise.reject(
        new AsgardeoAuthException(
          'NODE-AUTH_CORE-SI-NF01',
          'No user ID was provided.',
          'Unable to sign in the user as no user ID was provided.',
        ),
      );
    }

    if (await this.isSignedIn(userId)) {
      const sessionData: SessionData = await this.storageManager.getSessionData(userId);

      return Promise.resolve({
        accessToken: sessionData.access_token,
        createdAt: sessionData.created_at,
        expiresIn: sessionData.expires_in,
        idToken: sessionData.id_token,
        refreshToken: sessionData.refresh_token ?? '',
        scope: sessionData.scope,
        tokenType: sessionData.token_type,
      });
    }

    // Check if the authorization code or session state is there.
    // If so, generate the access token, otherwise generate the auth URL and return with callback function.
    if (!authorizationCode || !state) {
      if (!authURLCallback || typeof authURLCallback !== 'function') {
        return Promise.reject(
          new AsgardeoAuthException(
            'NODE-AUTH_CORE-SI-NF02',
            'Invalid AuthURLCallback function.',
            'The AuthURLCallback is not defined or is not a function.',
          ),
        );
      }
      const authURL: string = await this.getAuthURL(userId, signInConfig);
      authURLCallback(authURL);

      return Promise.resolve({
        accessToken: '',
        createdAt: 0,
        expiresIn: '',
        idToken: '',
        refreshToken: '',
        scope: '',
        session: '',
        tokenType: '',
      });
    }

    return this.requestAccessToken(authorizationCode, sessionState ?? '', userId, state);
  }

  public async getAuthURL(userId: string, signInConfig?: Record<string, string | boolean>): Promise<string> {
    await this.initialization;
    const authURL: string | undefined = await this.auth.getSignInUrl(signInConfig, userId);

    if (authURL) {
      return Promise.resolve(authURL.toString());
    }
    return Promise.reject(
      new AsgardeoAuthException(
        'NODE-AUTH_CORE-GAU-NF01',
        'Getting Authorization URL failed.',
        'No authorization URL was returned by the Asgardeo Auth JS SDK.',
      ),
    );
  }

  public async requestAccessToken(
    authorizationCode: string,
    sessionState: string,
    userId: string,
    state: string,
  ): Promise<TokenResponse> {
    await this.initialization;
    return this.auth.requestAccessToken(authorizationCode, sessionState, state, userId);
  }

  public async getIdToken(userId: string): Promise<string> {
    await this.initialization;
    const isLoggedIn: boolean = await this.isSignedIn(userId);
    if (!isLoggedIn) {
      return Promise.reject(
        new AsgardeoAuthException(
          'NODE-AUTH_CORE-GIT-NF01',
          'The user is not logged in.',
          'No session ID was found for the requested user. User is not logged in.',
        ),
      );
    }
    const idToken: string = await this.auth.getIdToken(userId);
    if (idToken) {
      return Promise.resolve(idToken);
    }
    return Promise.reject(
      new AsgardeoAuthException(
        'NODE-AUTH_CORE-GIT-NF02',
        'Requesting ID Token Failed',
        'No ID Token was returned by the Asgardeo Auth JS SDK.',
      ),
    );
  }

  public async refreshAccessToken(userId?: string): Promise<TokenResponse> {
    await this.initialization;
    return this.auth.refreshAccessToken(userId);
  }

  public async isSignedIn(userId: string): Promise<boolean> {
    await this.initialization;

    const sessionData: SessionData = await this.storageManager.getSessionData(userId);

    if (!sessionData?.access_token) {
      return false;
    }

    if (await SessionUtils.validateSession(sessionData)) {
      return true;
    }

    // The access token has expired. Refresh it when a refresh token is available.
    if (sessionData.refresh_token) {
      try {
        const refreshedToken: TokenResponse = await this.refreshAccessToken(userId);

        if (refreshedToken?.accessToken) {
          return true;
        }
      } catch (error) {
        Logger.debug(`Refreshing the access token failed: ${error}`);
      }
    }

    await this.storageManager.removeSessionData(userId);

    return false;
  }

  public async signOut(userId: string): Promise<string> {
    await this.initialization;

    const signOutURL: string = await this.auth.getSignOutUrl(userId);

    if (!signOutURL) {
      return Promise.reject(
        new AsgardeoAuthException(
          'NODE-AUTH_CORE-SO-NF01',
          'Signing out the user failed.',
          'Could not obtain the sign-out URL from the server.',
        ),
      );
    }

    // The sign-out URL already carries the ID token hint, so the stored tokens are no longer needed.
    await this.storageManager.removeSessionData(userId);

    return signOutURL;
  }

  public async getUser(userId: string): Promise<User> {
    await this.initialization;
    return this.auth.getUser(userId);
  }

  public async getConfigData(): Promise<AuthClientConfig<T>> {
    await this.initialization;
    return this.storageManager.getConfigData();
  }

  public async getOpenIDProviderEndpoints(): Promise<OIDCEndpoints> {
    await this.initialization;
    return this.auth.getOpenIDProviderEndpoints() as Promise<OIDCEndpoints>;
  }

  public async getDecodedIdToken(userId?: string, idToken?: string): Promise<IdToken> {
    await this.initialization;
    return this.auth.getDecodedIdToken(userId, idToken);
  }

  public async getAccessToken(userId?: string): Promise<string> {
    await this.initialization;
    return this.auth.getAccessToken(userId);
  }

  public async exchangeToken(config: TokenExchangeRequestConfig, userId?: string): Promise<TokenResponse | Response> {
    await this.initialization;
    return this.auth.exchangeToken(config, userId);
  }

  public async reInitialize(config: Partial<AuthClientConfig<T>>): Promise<void> {
    await this.initialization;
    return this.auth.reInitialize(config);
  }

  public async revokeAccessToken(userId?: string): Promise<Response> {
    await this.initialization;
    return this.auth.revokeAccessToken(userId);
  }

  public static didSignOutFail(afterSignOutUrl: string): boolean {
    return AsgardeoAuthClient.didSignOutFail(afterSignOutUrl);
  }

  public static isSignOutSuccessful(afterSignOutUrl: string): boolean {
    return AsgardeoAuthClient.isSignOutSuccessful(afterSignOutUrl);
  }

  public getStorageManager(): StorageManager<T> {
    return this.storageManager;
  }

  public async decodeJwtToken<K = Record<string, unknown>>(token: string): Promise<K> {
    return this.auth.decodeJwtToken<K>(token);
  }
}
