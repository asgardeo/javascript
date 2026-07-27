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

import {createError, getRequestURL} from 'h3';
import type {H3Event} from 'h3';
import type {AsgardeoNuxtConfig} from '../../types';
import {createLogger} from '../../utils/log';
import {useRuntimeConfig} from '#imports';

const log: ReturnType<typeof createLogger> = createLogger('asgardeo-ssr');

const CALLBACK_PATH: string = '/api/auth/callback';

/**
 * Build the OAuth redirect_uri from the incoming request origin.
 * Honors X-Forwarded-* headers so it works correctly behind a reverse proxy.
 *
 * The legacy SDK uses this value verbatim as the OAuth `redirect_uri` sent to
 * both `/authorize` and `/token` (see packages/javascript/src/__legacy__/client.ts:290,396),
 * so it must match exactly what's registered in the Asgardeo console — distinct
 * from `AsgardeoNuxtConfig.afterSignInUrl` (the public, post-login landing page
 * config consumed separately by `callback.get.ts`, defaulting to `/`).
 */
function resolveCallbackUrl(event: H3Event): string {
  const url: URL = getRequestURL(event, {xForwardedHost: true, xForwardedProto: true});
  return `${url.origin}${CALLBACK_PATH}`;
}

/**
 * Resolve and validate the config needed to initialise the singleton
 * {@link AsgardeoNuxtClient}, reading from Nuxt's runtime config.
 *
 * Throws an `H3Error` (instead of returning a `null` sentinel) when required
 * config is missing or invalid. Misconfiguration must surface immediately and
 * clearly here — silently skipping initialization leaves `isInitialized`
 * `false` with no signal, so the first unrelated route that calls into the
 * client (e.g. `signin.get.ts`) crashes later with a confusing
 * "Cannot read properties of undefined" error instead of this one.
 */
export function resolveAsgardeoServerConfig(event: H3Event): AsgardeoNuxtConfig {
  const config: ReturnType<typeof useRuntimeConfig> = useRuntimeConfig(event);
  const publicConfig: AsgardeoNuxtConfig = config.public.asgardeo as AsgardeoNuxtConfig;
  const privateConfig: typeof config.asgardeo = config.asgardeo;

  const missing: string[] = [];
  if (!publicConfig?.baseUrl) {
    missing.push('baseUrl (NUXT_PUBLIC_ASGARDEO_BASE_URL)');
  }
  if (!publicConfig?.clientId) {
    missing.push('clientId (NUXT_PUBLIC_ASGARDEO_CLIENT_ID)');
  }

  if (missing.length > 0) {
    const statusMessage: string = `[@asgardeo/nuxt] Missing required config: ${missing.join(', ')}.`;
    log.error(statusMessage);
    throw createError({statusCode: 500, statusMessage});
  }

  // Enforce session secret strictness at server runtime (not at build time).
  // In production the cookie must be signed with a real secret; in dev we
  // allow a warning + fallback so local development is frictionless.
  const sessionSecret: string | undefined = process.env['ASGARDEO_SESSION_SECRET'] || privateConfig?.sessionSecret;
  if (!sessionSecret) {
    if (process.env['NODE_ENV'] === 'production') {
      const statusMessage: string =
        '[@asgardeo/nuxt] ASGARDEO_SESSION_SECRET is required in production. Set it to a secure ' +
        'random string of at least 32 characters. Refusing to initialize Asgardeo client.';
      log.error(statusMessage);
      throw createError({statusCode: 500, statusMessage});
    }
    log.warn(
      'ASGARDEO_SESSION_SECRET is not set. Using an insecure default for development only. ' +
        'Set ASGARDEO_SESSION_SECRET before deploying.',
    );
  }

  return {
    afterSignInUrl: resolveCallbackUrl(event),
    afterSignOutUrl: publicConfig.afterSignOutUrl || '/',
    baseUrl: publicConfig.baseUrl,
    clientId: publicConfig.clientId,
    clientSecret: privateConfig?.clientSecret || undefined,
    platform: publicConfig.platform,
    scopes: publicConfig.scopes || ['openid', 'profile'],
    tokenRequest: publicConfig.tokenRequest,
  };
}
