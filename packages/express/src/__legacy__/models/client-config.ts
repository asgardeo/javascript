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

/** `Omit` applied to each member of a union, so the union of `AuthClientConfig` variants is kept. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export interface StrictExpressClientConfig {
  appURL: string;
  cookieConfig?: {
    /** Lifetime of the session cookie in milliseconds. Defaults to 24 hours. */
    maxAge?: number;
    httpOnly?: boolean;
    sameSite?: string;
    secure?: boolean;
  };
  /**
   * @deprecated Not used by the SDK. Protect routes with `protectRoute()` instead.
   */
  globalAuth?: boolean;
  loginPath?: string;
  logoutPath?: string;
  signInConfig?: Record<string, string | boolean>;
}

/**
 * Configuration for the Express SDK. `afterSignInUrl` and `afterSignOutUrl` are derived from `appURL`, `loginPath` and
 * `logoutPath`, so they are not part of it.
 */
export type ExpressClientConfig = DistributiveOmit<AuthClientConfig, 'afterSignInUrl' | 'afterSignOutUrl'> &
  StrictExpressClientConfig;
