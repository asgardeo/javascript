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

import {Logger} from '@asgardeo/node';
import express from 'express';
import {AsgardeoExpressClient} from '../client';
import {UnauthenticatedCallback} from '../models';

/**
 * Creates a middleware that lets the request through only when the session cookie belongs to a signed-in user. An
 * expired access token is refreshed when possible.
 *
 * For an unauthenticated request it calls `callback`. Return `true` from the callback when it has handled the
 * response (for example, redirected to the sign-in route). Return `false` to let the request continue to the route
 * anyway, for routes that also serve signed-out users.
 */
export const protectRoute =
  (
    asgardeoExpressClient: AsgardeoExpressClient,
    callback: UnauthenticatedCallback,
  ): ((req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>) =>
  async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
    const sessionId: string | undefined = req.cookies?.ASGARDEO_SESSION_ID;

    if (sessionId === undefined) {
      Logger.debug('No session ID found in the request cookies');

      if (callback(res, 'Unauthenticated')) {
        return;
      }

      next();

      return;
    }

    let isSignedIn: boolean;

    try {
      isSignedIn = await asgardeoExpressClient.isSignedIn(sessionId);
    } catch (error) {
      next(error);

      return;
    }

    if (isSignedIn) {
      next();

      return;
    }

    Logger.debug('The session ID in the request cookies does not belong to a signed-in user');

    if (callback(res, 'Invalid session cookie')) {
      return;
    }

    next();
  };
