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

import {Config} from '@asgardeo/javascript';

/**
 * Configuration type for the Asgardeo Node.js SDK.
 * Extends the base Config type from @asgardeo/javascript with Node.js specific settings.
 *
 * @remarks
 * This type is used to configure the Node.js SDK with settings like:
 * - Server endpoints
 * - Authentication parameters
 * - Session management options
 */
export type AsgardeoNodeConfig = Config & {
  /**
   * Session cookie lifetime in seconds. Determines how long the session cookie
   * remains valid in the browser after sign-in.
   *
   * Resolution order (first defined value wins):
   *   1. This field — set programmatically at SDK initialisation.
   *   2. `ASGARDEO_SESSION_COOKIE_EXPIRY_TIME` environment variable.
   *   3. Built-in default of 86400 seconds (24 hours).
   *
   * @example
   * // 8-hour session cookie
   * { sessionCookieExpiryTime: 28800 }
   */
  sessionCookieExpiryTime?: number;
};
