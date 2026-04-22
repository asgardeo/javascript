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

import {getCookie} from 'h3';
import {defineNitroPlugin} from 'nitropack/runtime';
import {useAsgardeoServerClient} from '../utils/client';
import {
  verifySessionToken,
  getSessionCookieName,
} from '../utils/session';
import type {AsgardeoAuthState} from '../../types';
import {createLogger} from '../../utils/log';

// Import augmentation so event.context.asgardeo is typed
import '../../types/augments.d';

const log = createLogger('auth-state');

/**
 * Nitro server plugin that resolves auth state during SSR.
 * Sets the typed `event.context.asgardeo` so the Nuxt client plugin
 * can hydrate it into `useState('asgardeo:auth')`.
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('request', async (event) => {
    // Only process page requests (skip API routes and Nuxt internals)
    const url = event.path || '';
    if (url.startsWith('/api/') || url.startsWith('/_nuxt/')) {
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
        // Read session secret from environment directly (runtime config not available in Nitro plugins)
        const sessionSecret = process.env['ASGARDEO_SESSION_SECRET'];
        const session = await verifySessionToken(sessionCookie, sessionSecret);
        const client = useAsgardeoServerClient(event);
        const user = await client.getUser(session.sessionId);

        authState.isSignedIn = true;
        authState.user = user;

        // Populate typed context (no more `as any`)
        event.context.asgardeo = {session, isSignedIn: true};
      } else {
        event.context.asgardeo = {session: null, isSignedIn: false};
      }
    } catch (err) {
      // Session invalid or expired — leave as unauthenticated
      log.debug('Auth state resolution failed, treating as unauthenticated:', err);
      event.context.asgardeo = {session: null, isSignedIn: false};
    }

    // Keep the legacy key populated for backward compat during migration
    event.context['__asgardeoAuth'] = authState;
  });
});
