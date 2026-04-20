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

/**
 * Number of seconds before access token expiry at which the SDK proactively
 * refreshes the token. A 60-second buffer prevents races where the token is
 * valid when a request starts but expires mid-flight.
 */
export const REFRESH_BUFFER_SECONDS: number = 25;

/**
 * Default access token lifetime in seconds (1 hour).
 * Used as a fallback when the token endpoint does not return an `expires_in` value.
 */
export const DEFAULT_ACCESS_TOKEN_EXPIRY_SECONDS: number = 3600;

/**
 * Default session lifetime in seconds (24 hours).
 *
 * Used when no explicit session expiry is configured. The session lifetime
 * can be overridden in two ways (evaluated in this order):
 *
 *   1. `sessionExpirySeconds` in `AsgardeoNextConfig` — set programmatically
 *      when initialising the SDK.
 *   2. `ASGARDEO_SESSION_EXPIRY_SECONDS` environment variable — set in `.env`
 *      (e.g. `ASGARDEO_SESSION_EXPIRY_SECONDS=86400`).
 *   3. This constant — applied when neither of the above is present.
 *
 * Two independent expiry bounds apply to the session and they are generally
 * NOT the same value:
 *
 *   - JWT `exp` claim — set by `SessionManager.createSessionToken(...)` from
 *     the `accessTokenTtlSeconds` argument (i.e. the access token's `expires_in`
 *     returned by the auth server, typically ~1 hour). This controls when
 *     `verifySessionToken` rejects the token and is the trigger for a refresh.
 *   - Browser cookie `maxAge` — set by the caller (sign-in / refresh / org-switch
 *     actions) from `SessionManager.resolveSessionExpiry(...)`, which returns
 *     this constant by default (24 hours). This controls how long the browser
 *     holds the cookie before discarding it.
 */
export const DEFAULT_SESSION_EXPIRY_SECONDS: number = 86400;
