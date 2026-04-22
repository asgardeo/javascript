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

import {LegacyAsgardeoNodeClient, type AuthClientConfig} from '@asgardeo/node';
import {getRequestURL, type H3Event} from 'h3';
import {useRuntimeConfig} from '#imports';

export const CALLBACK_PATH = '/api/auth/callback';

let clientInstance: LegacyAsgardeoNodeClient<Record<string, string | boolean>> | null = null;
let initializedCallbackUrl: string | null = null;

/**
 * Build the OAuth redirect_uri from the incoming request origin.
 * Honors X-Forwarded-* headers so it works correctly behind a reverse proxy.
 */
export function resolveCallbackUrl(event: H3Event): string {
  const url = getRequestURL(event, {xForwardedHost: true, xForwardedProto: true});
  return `${url.origin}${CALLBACK_PATH}`;
}

/**
 * Get or create the singleton LegacyAsgardeoNodeClient instance.
 * Reads config from Nuxt runtime config (env vars + nuxt.config).
 *
 * The OAuth redirect_uri is derived from the request origin so it points at
 * the SDK's callback route (/api/auth/callback), NOT the user-facing
 * post-sign-in destination (publicConfig.afterSignInUrl), which is applied
 * inside the callback handler after token exchange.
 *
 * If the resolved callback URL differs from the one the singleton was
 * initialized with (e.g. origin change behind a proxy, dev vs. prod),
 * the client is re-initialized so the authorize and token-exchange requests
 * use the same redirect_uri (OAuth requires an exact match).
 */
export function useAsgardeoServerClient(
  eventOrCallbackUrl?: H3Event | string,
): LegacyAsgardeoNodeClient<Record<string, string | boolean>> {
  const config = useRuntimeConfig();
  const publicConfig = config.public.asgardeo;
  const privateConfig = config.asgardeo;

  if (!publicConfig?.baseUrl || !publicConfig?.clientId) {
    throw new Error(
      '[asgardeo] Missing required config: baseUrl and clientId. ' +
      'Set NUXT_PUBLIC_ASGARDEO_BASE_URL and NUXT_PUBLIC_ASGARDEO_CLIENT_ID.',
    );
  }

  let callbackUrl: string | undefined;
  if (typeof eventOrCallbackUrl === 'string') {
    callbackUrl = eventOrCallbackUrl;
  } else if (eventOrCallbackUrl) {
    callbackUrl = resolveCallbackUrl(eventOrCallbackUrl);
  }

  if (clientInstance && (!callbackUrl || callbackUrl === initializedCallbackUrl)) {
    return clientInstance;
  }

  if (!callbackUrl) {
    throw new Error(
      '[asgardeo] Cannot initialize the server client without a request context. ' +
      'Pass the H3 event to useAsgardeoServerClient().',
    );
  }

  const authConfig: AuthClientConfig<Record<string, string | boolean>> = {
    baseUrl: publicConfig.baseUrl,
    clientId: publicConfig.clientId,
    clientSecret: privateConfig?.clientSecret || undefined,
    afterSignInUrl: callbackUrl,
    afterSignOutUrl: publicConfig.afterSignOutUrl || '/',
    scopes: publicConfig.scopes || ['openid', 'profile'],
    enablePKCE: true,
  };

  clientInstance = new LegacyAsgardeoNodeClient<Record<string, string | boolean>>();
  clientInstance.initialize(authConfig);
  initializedCallbackUrl = callbackUrl;

  return clientInstance;
}
