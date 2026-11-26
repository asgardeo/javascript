/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
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

import {getRequestURL, type H3Event} from 'h3';

/**
 * Resolve a possibly relative URL (e.g. the default `afterSignOutUrl` of `/`) against the incoming request origin.
 * The identity server only accepts an absolute `post_logout_redirect_uri`; a relative one fails sign-out with an
 * OAuth error page.
 */
export function resolveAgainstRequestOrigin(target: string, event: H3Event): string {
  const {origin}: URL = getRequestURL(event, {xForwardedHost: true, xForwardedProto: true});

  return new URL(target, origin).toString();
}

/** Path of the OAuth callback route that the module registers. */
export const CALLBACK_PATH: string = '/api/auth/callback';

/**
 * Build the OAuth `redirect_uri` (the callback route) from the incoming request origin. Honors `X-Forwarded-*`
 * headers so it works behind a reverse proxy. Resolve it for each request: the client is shared by every request, so
 * a value taken from one request must not be stored on it.
 */
export function resolveCallbackUrl(event: H3Event): string {
  return resolveAgainstRequestOrigin(CALLBACK_PATH, event);
}
