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
  AsgardeoRuntimeError,
  AuthClientConfig,
  AuthURLCallback,
  Logger,
  SignInOptions,
  Storage,
  TokenResponse,
  User,
} from '@asgardeo/node';
import express from 'express';
import {v4 as generateUUID} from 'uuid';
import {CookieConfig, DEFAULT_LOGIN_PATH, DEFAULT_LOGOUT_PATH} from './constants';
import {AsgardeoExpressConfig} from './models/config';
import {UnauthenticatedCallback} from './models';
import {asgardeoExpressAuth, protectRoute} from './middleware';
import {ExpressClientConfig} from './models/express-client-config';
import {ExpressUtils} from './utils/ExpressUtils';

class AsgardeoExpressClient<T = AsgardeoExpressConfig> extends AsgardeoNodeClient<T> {
  private static _clientConfig: ExpressClientConfig;
  private static _instance: AsgardeoExpressClient;

  constructor(config: ExpressClientConfig, storage?: Storage) {
    const nodeClientConfig = {
      ...config,
      afterSignInUrl: config.appURL + (config.loginPath ?? DEFAULT_LOGIN_PATH),
      afterSignOutUrl: config.appURL + (config.logoutPath ?? DEFAULT_LOGOUT_PATH),
    } as unknown as AuthClientConfig<T>;

    super(nodeClientConfig, storage);
    AsgardeoExpressClient._clientConfig = {...config};
  }

  public static getInstance(config: ExpressClientConfig, storage?: Storage): AsgardeoExpressClient;
  public static getInstance(): AsgardeoExpressClient;
  public static getInstance(config?: ExpressClientConfig, storage?: Storage): AsgardeoExpressClient {
    if (!AsgardeoExpressClient._instance && config) {
      AsgardeoExpressClient._instance = new AsgardeoExpressClient(config, storage);
      Logger.debug('Initialized AsgardeoExpressClient successfully');
    }

    if (!AsgardeoExpressClient._instance && !config) {
      throw new AsgardeoRuntimeError(
        'User configuration is not found',
        'EXPRESS-CLIENT-GI1-NF01',
        '@asgardeo/express',
        'User config has not been passed to initialize AsgardeoExpressClient',
      );
    }

    return AsgardeoExpressClient._instance;
  }

  public override signIn(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    signInConfig?: Record<string, string | boolean>,
  ): Promise<TokenResponse>;
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
    reqOrCallbackOrOptions?: express.Request | AuthURLCallback | SignInOptions,
    resOrUserId?: express.Response | string,
    nextOrCode?: express.NextFunction | string,
    signInConfigOrSessionState?: Record<string, string | boolean> | string,
    state?: string,
    signInConfig?: Record<string, string | boolean>,
  ): Promise<TokenResponse | User> {
    if (resOrUserId !== undefined && typeof resOrUserId !== 'string') {
      return this._expressSignIn(
        reqOrCallbackOrOptions as express.Request,
        resOrUserId,
        nextOrCode as express.NextFunction,
        signInConfigOrSessionState as Record<string, string | boolean> | undefined,
      );
    }

    if (typeof reqOrCallbackOrOptions === 'function') {
      return super.signIn(
        reqOrCallbackOrOptions,
        resOrUserId as string,
        nextOrCode as string,
        signInConfigOrSessionState as string,
        state,
        signInConfig,
      );
    }

    return super.signIn(reqOrCallbackOrOptions as SignInOptions);
  }

  private async _expressSignIn(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    signInConfig?: Record<string, string | boolean>,
  ): Promise<TokenResponse> {
    if (ExpressUtils.hasErrorInURL(req.originalUrl)) {
      return Promise.reject(
        new AsgardeoRuntimeError(
          'Invalid login request URL',
          'EXPRESS-CLIENT-SI-IV01',
          '@asgardeo/express',
          'Login request contains an error query parameter in the URL',
        ),
      );
    }

    let userId: string = req.cookies.ASGARDEO_SESSION_ID;
    if (!userId) {
      userId = generateUUID();
    }

    const authRedirectCallback: AuthURLCallback = (url: string) => {
      if (url) {
        Logger.debug('Redirecting to: ' + url);
        res.cookie('ASGARDEO_SESSION_ID', userId, {
          maxAge: AsgardeoExpressClient._clientConfig.cookieConfig?.maxAge ?? CookieConfig.defaultMaxAge,
          httpOnly: AsgardeoExpressClient._clientConfig.cookieConfig?.httpOnly ?? CookieConfig.defaultHttpOnly,
          sameSite: AsgardeoExpressClient._clientConfig.cookieConfig?.sameSite ?? CookieConfig.defaultSameSite,
          secure: AsgardeoExpressClient._clientConfig.cookieConfig?.secure ?? CookieConfig.defaultSecure,
        });
        res.redirect(url);

        if (typeof next === 'function') {
          next();
        }
      }
    };

    const authResponse: TokenResponse = await super.signIn(
      authRedirectCallback,
      userId,
      req.query.code as string,
      req.query.session_state as string,
      req.query.state as string,
      signInConfig,
    );

    if (authResponse.accessToken || authResponse.idToken) {
      return authResponse;
    }

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

  public static protectRoute(
    callback: UnauthenticatedCallback,
  ): (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void> {
    if (!this._instance) {
      throw new AsgardeoRuntimeError(
        'AsgardeoExpressClient is not instantiated',
        'EXPRESS-CLIENT-PR-NF01',
        '@asgardeo/express',
        'Create an instance of AsgardeoExpressClient before calling this method.',
      );
    }

    return protectRoute(this._instance, callback);
  }

  public static asgardeoExpressAuth(
    onSignIn: (res: express.Response, response: TokenResponse) => void,
    onSignOut: (res: express.Response) => void,
    onError: (res: express.Response, exception: AsgardeoRuntimeError) => void,
  ): any {
    if (!this._instance) {
      throw new AsgardeoRuntimeError(
        'AsgardeoExpressClient is not instantiated',
        'EXPRESS-CLIENT-AEA-NF01',
        '@asgardeo/express',
        'Create an instance of AsgardeoExpressClient before calling this method.',
      );
    }

    return asgardeoExpressAuth(this._instance, AsgardeoExpressClient._clientConfig, onSignIn, onSignOut, onError);
  }
}

export {AsgardeoExpressClient};
export default AsgardeoExpressClient;
