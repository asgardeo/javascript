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

import {AsgardeoAuthException, TokenResponse, Logger} from '@asgardeo/node';
import express from 'express';
import {AsgardeoExpressClient} from '../client';
import {DEFAULT_LOGIN_PATH, DEFAULT_LOGOUT_PATH} from '../constants';
import {ExpressClientConfig} from '../models';

export const asgardeoExpressAuth = (
  asgardeoExpressClient: AsgardeoExpressClient,
  config: ExpressClientConfig,
  onSignIn: (res: express.Response, tokenResponse: TokenResponse, req: express.Request) => void,
  onSignOut: (res: express.Response, req: express.Request) => void,
  onError: (res: express.Response, exception: AsgardeoAuthException, req: express.Request) => void,
): express.Router => {
  const router: express.Router = express.Router();

  // Make the client available on the request and the response.
  router.use((req: express.Request, res: express.Response, next: express.NextFunction): void => {
    req.asgardeoAuth = asgardeoExpressClient;
    res.asgardeoAuth = asgardeoExpressClient;
    next();
  });

  router.get(
    config.loginPath || DEFAULT_LOGIN_PATH,
    async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
      try {
        const response: TokenResponse = await asgardeoExpressClient.signIn(req, res, next, config.signInConfig);

        if (response.accessToken || response.idToken) {
          onSignIn(res, response, req);
        }
      } catch (e: any) {
        Logger.error(e.message);
        onError(res, e, req);
      }
    },
  );

  router.get(
    config.logoutPath || DEFAULT_LOGOUT_PATH,
    async (req: express.Request, res: express.Response): Promise<void> => {
      // The identity provider redirects back here with this state after a successful sign-out.
      if (req.query['state'] === 'sign_out_success') {
        onSignOut(res, req);

        return;
      }

      if (req.cookies.ASGARDEO_SESSION_ID === undefined) {
        onError(
          res,
          new AsgardeoAuthException(
            'EXPRESS-AUTH_MW-LOGOUT-NF01',
            'No cookie found in the request',
            'No cookie was sent with the request. The user may not have signed in yet.',
          ),
          req,
        );

        return;
      }

      try {
        // Builds the sign-out URL and removes the user's tokens from the store.
        const signOutURL: string = await asgardeoExpressClient.signOut(req.cookies.ASGARDEO_SESSION_ID);

        if (signOutURL) {
          res.clearCookie('ASGARDEO_SESSION_ID');
          res.redirect(signOutURL);
        }
      } catch (e: any) {
        onError(res, e, req);
      }
    },
  );

  return router;
};
