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

/**
 * Defaults for the `ASGARDEO_SESSION_ID` cookie. They are passed straight to Express's `res.cookie()`, so `maxAge` is
 * in milliseconds and the flags are booleans.
 */
export const CookieConfig: {
  readonly defaultHttpOnly: boolean;
  readonly defaultMaxAge: number;
  readonly defaultSameSite: 'lax' | 'strict' | 'none';
  readonly defaultSecure: boolean;
} = {
  defaultHttpOnly: true,
  // 24 hours, matching the default session lifetime of the Next.js SDK.
  defaultMaxAge: 24 * 60 * 60 * 1000,
  defaultSameSite: 'lax',
  defaultSecure: false,
} as const;

export const DEFAULT_LOGIN_PATH = '/login';

export const DEFAULT_LOGOUT_PATH = '/logout';
