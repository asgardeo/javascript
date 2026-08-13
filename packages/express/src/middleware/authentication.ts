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

import { AsgardeoAuthException, Storage, TokenResponse, Logger } from "@asgardeo/node";
import express from "express";
import { AsgardeoExpressClient } from "../LegacyAsgardeoExpressClient";
import { DEFAULT_LOGIN_PATH, DEFAULT_LOGOUT_PATH } from "../constants";
import { ExpressClientConfig } from "../models";

export const asgardeoExpressAuth = (
    asgardeoExpressClient: AsgardeoExpressClient,
    config: ExpressClientConfig,
    onSignIn: (res: express.Response, tokenResponse: TokenResponse) => void,
    onSignOut: (res: express.Response) => void,
    onError: (res: express.Response, exception: AsgardeoAuthException) => void
): any => {
    //Create the router
    const router = new express.Router();

    //Patch AuthClient to the request and the response
    router.use(async (req: express.Request, res: express.Response, next: express.nextFunction): Promise<void> => {
        req.asgardeoAuth = asgardeoExpressClient;
        res.asgardeoAuth = asgardeoExpressClient;
        next();
    });

    //Patch in '/login' route
    router.get(
        config.loginPath || DEFAULT_LOGIN_PATH,
        async (req: express.Request, res: express.Response, next: express.nextFunction): Promise<void> => {
            try {
                const response: TokenResponse = await asgardeoExpressClient.signIn(req, res, next, config.signInConfig);
                if (response.accessToken || response.idToken) {
                    onSignIn(res, response);
                }
            } catch (e: any) {
                Logger.error(e.message);
                onError(res, e);
            }
        }
    );

    //Patch in '/logout' route
    router.get(
        config.logoutPath || DEFAULT_LOGOUT_PATH,
        async (req: express.Request, res: express.Response, next: express.nextFunction): Promise<void> => {
            //Check if it is a logout success response
            if (req.query.state === "sign_out_success") {
                onSignOut(res);

                return;
            }

            //Check if the cookie exists
            if (req.cookies.ASGARDEO_SESSION_ID === undefined) {
                onError(
                    res,
                    new AsgardeoAuthException(
                        "EXPRESS-AUTH_MW-LOGOUT-NF01",
                        "No cookie found in the request",
                        "No cookie was sent with the request. The user may not have signed in yet."
                    )
                );

                return;
            } else {
                //Get the signout URL
                try {
                    const signOutURL = await req.asgardeoAuth.signOut(req.cookies.ASGARDEO_SESSION_ID);
                    if (signOutURL) {
                        res.cookie("ASGARDEO_SESSION_ID", null, { maxAge: 0 });
                        res.redirect(signOutURL);

                        return;
                    }
                } catch (e: any) {
                    onError(res, e);

                    return;
                }
            }
        }
    );

    return router;
};
