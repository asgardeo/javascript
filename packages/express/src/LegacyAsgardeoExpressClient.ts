/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com) All Rights Reserved.
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
  LegacyAsgardeoNodeClient,
  AuthClientConfig,
  AuthURLCallback,
  TokenResponse,
  Storage,
  User,
  OIDCEndpoints,
  IdToken,
  TokenExchangeRequestConfig,
  AsgardeoAuthException,
  Logger,
} from '@asgardeo/node';
import {CookieConfig, DEFAULT_LOGIN_PATH, DEFAULT_LOGOUT_PATH} from './constants';
import {ExpressClientConfig, UnauthenticatedCallback} from './models';
import express from 'express';
import {v4 as uuidv4} from 'uuid';
import {asgardeoExpressAuth, protectRoute} from './middleware';
import {ExpressUtils} from './utils/express-utils';

export class AsgardeoExpressClient {
  private _authClient: LegacyAsgardeoNodeClient<AuthClientConfig>;
  private _storage?: Storage;
  private static _clientConfig: ExpressClientConfig;

  private static _instance: AsgardeoExpressClient;

  private constructor(config: ExpressClientConfig, storage?: Storage) {
    //Set the client config
    AsgardeoExpressClient._clientConfig = {...config};

    //Add the afterSignInUrl and afterSignOutUrl
    //Add custom paths if the user has already declared any or else use the defaults
    const nodeClientConfig: AuthClientConfig = {
      ...config,
      afterSignInUrl: config.appURL + (config.loginPath || DEFAULT_LOGIN_PATH),
      afterSignOutUrl: config.appURL + (config.logoutPath || DEFAULT_LOGOUT_PATH),
    };

    //Initialize the user provided storage if there is any
    if (storage) {
      Logger.debug('Initializing user provided storage');
      this._storage = storage;
    }

    //Initialize the Auth Client
    this._authClient = new LegacyAsgardeoNodeClient();
    this._authClient.initialize(nodeClientConfig, this._storage);
  }

  public static getInstance(config: ExpressClientConfig, storage?: Storage): AsgardeoExpressClient;
  public static getInstance(): AsgardeoExpressClient;
  public static getInstance(config?: ExpressClientConfig, storage?: Storage): AsgardeoExpressClient {
    //Create a new instance if its not instantiated already
    if (!AsgardeoExpressClient._instance && config) {
      AsgardeoExpressClient._instance = new AsgardeoExpressClient(config, storage);
      Logger.debug('Initialized AsgardeoExpressClient successfully');
    }

    if (!AsgardeoExpressClient._instance && !config) {
      throw Error(
        new AsgardeoAuthException(
          'EXPRESS-CLIENT-GI1-NF01',
          'User configuration  is not found',
          'User config has not been passed to initialize AsgardeoExpressClient',
        ).toString(),
      );
    }

    return AsgardeoExpressClient._instance;
  }

  public async signIn(
    req: express.Request,
    res: express.Response,
    next: express.nextFunction,
    signInConfig?: Record<string, string | boolean>,
  ): Promise<TokenResponse> {
    if (ExpressUtils.hasErrorInURL(req.originalUrl)) {
      return Promise.reject(
        new AsgardeoAuthException(
          'EXPRESS-CLIENT-SI-IV01',
          'Invalid login request URL',
          'Login request contains an error query parameter in the URL',
        ),
      );
    }

    //Check if the user has a valid user ID and if not create one
    let userId = req.cookies.ASGARDEO_SESSION_ID;
    if (!userId) {
      userId = uuidv4();
    }

    //Handle signIn() callback
    const authRedirectCallback = (url: string) => {
      if (url) {
        //DEBUG
        Logger.debug('Redirecting to: ' + url);
        res.cookie('ASGARDEO_SESSION_ID', userId, {
          maxAge: AsgardeoExpressClient._clientConfig.cookieConfig?.maxAge
            ? AsgardeoExpressClient._clientConfig.cookieConfig.maxAge
            : CookieConfig.defaultMaxAge,
          httpOnly: AsgardeoExpressClient._clientConfig.cookieConfig?.httpOnly ?? CookieConfig.defaultHttpOnly,
          sameSite: AsgardeoExpressClient._clientConfig.cookieConfig?.sameSite ?? CookieConfig.defaultSameSite,
          secure: AsgardeoExpressClient._clientConfig.cookieConfig?.secure ?? CookieConfig.defaultSecure,
        });
        res.redirect(url);

        next && typeof next === 'function' && next();
      }
    };

    const authResponse: TokenResponse = await this._authClient.signIn(
      authRedirectCallback,
      userId,
      req.query.code,
      req.query.session_state,
      req.query.state,
      signInConfig,
    );

    if (authResponse.accessToken || authResponse.idToken) {
      return authResponse;
    } else {
      return {
        accessToken: '',
        createdAt: 0,
        expiresIn: '',
        idToken: '',
        refreshToken: '',
        scope: '',
        tokenType: '',
      };
    }
  }

  public async signOut(userId: string): Promise<string> {
    return this._authClient.signOut(userId);
  }

  public async isSignedIn(userId: string): Promise<boolean> {
    return this._authClient.isSignedIn(userId);
  }

  public async getIdToken(userId: string): Promise<string> {
    return this._authClient.getIdToken(userId);
  }

  public async getUser(userId: string): Promise<User> {
    return this._authClient.getUser(userId);
  }

  public async getOpenIDProviderEndpoints(): Promise<OIDCEndpoints> {
    return this._authClient.getOpenIDProviderEndpoints();
  }

  public async getDecodedIdToken(userId?: string): Promise<IdToken> {
    return this._authClient.getDecodedIdToken(userId);
  }

  public async getAccessToken(userId?: string): Promise<string> {
    return this._authClient.getAccessToken(userId);
  }

  public async exchangeToken(config: TokenExchangeRequestConfig, userId?: string): Promise<TokenResponse | Response> {
    return this._authClient.exchangeToken(config, userId);
  }

  public async reInitialize(config: Partial<AuthClientConfig>): Promise<void> {
    return this._authClient.reInitialize(config);
  }

  public async revokeAccessToken(userId?: string): Promise<Response> {
    return this._authClient.revokeAccessToken(userId);
  }

  public static didSignOutFail(afterSignOutUrl: string): boolean {
    return LegacyAsgardeoNodeClient.didSignOutFail(afterSignOutUrl);
  }

  public static isSignOutSuccessful(afterSignOutUrl: string): boolean {
    return LegacyAsgardeoNodeClient.isSignOutSuccessful(afterSignOutUrl);
  }

  public static protectRoute(
    callback: UnauthenticatedCallback,
  ): (req: express.Request, res: express.Response, next: express.nextFunction) => Promise<void> {
    if (!this._instance) {
      throw new AsgardeoAuthException(
        'EXPRESS-CLIENT-PR-NF01',
        'AsgardeoExpressClient is not instantiated',
        'Create an instance of AsgardeoExpressClient before using calling this method.',
      );
    }

    return protectRoute(this._instance, callback);
  }

  public static asgardeoExpressAuth(
    onSignIn: (response: TokenResponse) => void,
    onSignOut: () => void,
    onError: (exception: AsgardeoAuthException) => void,
  ): any {
    if (!this._instance) {
      throw new AsgardeoAuthException(
        'EXPRESS-CLIENT-AEA-NF01',
        'AsgardeoExpressClient is not instantiated',
        'Create an instance of AsgardeoExpressClient before using calling this method.',
      );
    }

    return asgardeoExpressAuth(this._instance, AsgardeoExpressClient._clientConfig, onSignIn, onSignOut, onError);
  }

  public async getStorageManager() {
    return this._authClient.getStorageManager();
  }
}
