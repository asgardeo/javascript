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

/**
 * Nitro server plugin that resolves auth state during SSR.
 * Sets the `event.context.__asgardeoAuth` so the Nuxt server plugin
 * can hydrate it into `useState('asgardeo:auth')`.
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('request', async (event) => {
    // Only process page requests (skip API routes)
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
      }
    } catch {
      // Session invalid or expired — leave as unauthenticated
    }

    event.context['__asgardeoAuth'] = authState;
  });
});
