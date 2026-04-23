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

import {getCookie, getRequestURL, type H3Event} from 'h3';
import {defineNitroPlugin} from 'nitropack/runtime';
import {useRuntimeConfig} from '#imports';
import AsgardeoNuxtClient from '../AsgardeoNuxtClient';
import {
  verifySessionToken,
  getSessionCookieName,
} from '../utils/session';
import type {AsgardeoAuthState} from '../../types';
import {createLogger} from '../../utils/log';

// Import augmentation so event.context.asgardeo is typed
import '../../types/augments.d';

const log = createLogger('auth-state');

const CALLBACK_PATH = '/api/auth/callback';

/**
 * Build the OAuth redirect_uri from the incoming request origin.
 * Honors X-Forwarded-* headers so it works correctly behind a reverse proxy.
 */
function resolveCallbackUrl(event: H3Event): string {
  const url = getRequestURL(event, {xForwardedHost: true, xForwardedProto: true});
  return `${url.origin}${CALLBACK_PATH}`;
}

/**
 * Nitro server plugin that:
 * 1. Initializes the singleton {@link AsgardeoNuxtClient} on the first request.
 *    Mirrors how `AsgardeoServerProvider` initializes the Next.js singleton.
 * 2. Resolves auth state during SSR and exposes it on `event.context.asgardeo`
 *    so the Nuxt client plugin can hydrate it into `useState('asgardeo:auth')`.
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('request', async (event) => {
    // Initialize the singleton on first request (idempotent).
    const client = AsgardeoNuxtClient.getInstance();
    if (!client.isInitialized) {
      const config = useRuntimeConfig(event);
      const publicConfig = config.public.asgardeo;
      const privateConfig = config.asgardeo;

      if (!publicConfig?.baseUrl || !publicConfig?.clientId) {
        log.error(
          'Missing required config: baseUrl and clientId. ' +
          'Set NUXT_PUBLIC_ASGARDEO_BASE_URL and NUXT_PUBLIC_ASGARDEO_CLIENT_ID.',
        );
        return;
      }

      try {
        await client.initialize({
          baseUrl: publicConfig.baseUrl,
          clientId: publicConfig.clientId,
          clientSecret: privateConfig?.clientSecret || undefined,
          afterSignInUrl: resolveCallbackUrl(event),
          afterSignOutUrl: publicConfig.afterSignOutUrl || '/',
          scopes: publicConfig.scopes || ['openid', 'profile'],
        });
      } catch (err) {
        log.error('Failed to initialize Asgardeo client:', err);
        return;
      }
    }

    // Skip auth-state resolution for API routes and Nuxt internals.
    const url = event.path || '';
    if (url.startsWith('/api/auth/') || url.startsWith('/_nuxt/')) {
      return;
    }

    const authState: AsgardeoAuthState = {
      isSignedIn: false,
      user: null,
      isLoading: false,
    };

    try {
      const sessionCookie = getCookie(event, getSessionCookieName());
      if (sessionCookie) {
        const sessionSecret = process.env['ASGARDEO_SESSION_SECRET'];
        const session = await verifySessionToken(sessionCookie, sessionSecret);
        const user = await client.getUser(session.sessionId);

        authState.isSignedIn = true;
        authState.user = user;

        event.context.asgardeo = {session, isSignedIn: true};
      } else {
        event.context.asgardeo = {session: null, isSignedIn: false};
      }
    } catch (err) {
      log.debug('Auth state resolution failed, treating as unauthenticated:', err);
      event.context.asgardeo = {session: null, isSignedIn: false};
    }

    event.context['__asgardeoAuth'] = authState;
  });
});
