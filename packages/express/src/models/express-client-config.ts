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

import {AuthClientConfig} from '@asgardeo/node';

export interface StrictExpressClientConfig {
  appURL: string;
  cookieConfig?: {
    maxAge?: number;
    httpOnly?: boolean;
    sameSite?: string;
    secure?: boolean;
  };
  globalAuth?: boolean;
  loginPath?: string;
  logoutPath?: string;
  signInConfig?: Record<string, string | boolean>;
}

export type ExpressClientConfig = Exclude<AuthClientConfig, 'afterSignInUrl' | 'afterSignOutUrl'> &
  StrictExpressClientConfig;
