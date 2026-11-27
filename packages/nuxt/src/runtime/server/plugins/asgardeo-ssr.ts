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

import type {H3Event} from 'h3';
// `nitropack` ships with the host Nuxt app.
// eslint-disable-next-line import-x/no-extraneous-dependencies
import {defineNitroPlugin} from 'nitropack/runtime';
import type {AsgardeoAuthState, AsgardeoNuxtConfig, AsgardeoSSRData} from '../../types';
import {createLogger} from '../../utils/log';
import AsgardeoNuxtClient from '../AsgardeoNuxtClient';
import {resolveCallbackUrl} from '../utils/request-url';
import {verifyAndRehydrateSession} from '../utils/serverSession';
import {useRuntimeConfig} from '#imports';

const log: ReturnType<typeof createLogger> = createLogger('asgardeo-ssr');

/**
 * Nitro server plugin — the Nuxt equivalent of `AsgardeoServerProvider` in the
 * Next.js SDK.
 *
 * On every page request it:
 * 1. Initialises the singleton {@link AsgardeoNuxtClient} once (idempotent).
 * 2. Verifies the JWT session cookie → resolves `isSignedIn`.
 * 3. When signed in, detects org context from the ID token (`user_org`) and
 *    switches `resolvedBaseUrl` to `${baseUrl}/o` when the user is acting
 *    within an organisation.
 * 4. In parallel (gated by `preferences`):
 *    - Fetches user + SCIM2 user profile  (`preferences.user.fetchUserProfile !== false`)
 *    - Fetches current org + my orgs      (`preferences.user.fetchOrganizations !== false`)
 *    - Fetches branding preference        (`preferences.theme.inheritFromBranding !== false`)
 * 5. Writes the full {@link AsgardeoSSRData} to `event.context.asgardeo.ssr`
 *    so the Nuxt plugin can seed `useState` keys for zero-cost hydration.
 *
 * Each fetch is individually wrapped in try/catch so a broken SCIM or branding
 * call never crashes SSR — the client layer can recover via the existing
 * `/api/auth/*` routes.
 */
export default defineNitroPlugin((nitro: {hooks: {hook: Function}}) => {
  nitro.hooks.hook('request', async (event: H3Event) => {
    // ── 1. Initialise singleton (once per process) ─────────────────────────
    const client: AsgardeoNuxtClient = AsgardeoNuxtClient.getInstance();
    if (!client.isInitialized) {
      const config: ReturnType<typeof useRuntimeConfig> = useRuntimeConfig(event);
      const publicConfig: AsgardeoNuxtConfig = config.public.asgardeo as AsgardeoNuxtConfig;
      const privateConfig: typeof config.asgardeo = config.asgardeo;

      if (!publicConfig?.baseUrl || !publicConfig?.clientId) {
        log.error(
          'Missing required config: baseUrl and clientId. ' +
            'Set NUXT_PUBLIC_ASGARDEO_BASE_URL and NUXT_PUBLIC_ASGARDEO_CLIENT_ID.',
        );
        return;
      }

      // Enforce session secret strictness at server runtime (not at build time).
      // In production the cookie must be signed with a real secret; in dev we
      // allow a warning + fallback so local development is frictionless.
      const sessionSecret: string | undefined = process.env['ASGARDEO_SESSION_SECRET'] || privateConfig?.sessionSecret;
      if (!sessionSecret) {
        if (process.env['NODE_ENV'] === 'production') {
          log.error(
            'ASGARDEO_SESSION_SECRET is required in production. Set it to a secure ' +
              'random string of at least 32 characters. Refusing to initialize Asgardeo client.',
          );
          return;
        }
        log.warn(
          'ASGARDEO_SESSION_SECRET is not set. Using an insecure default for development only. ' +
            'Set ASGARDEO_SESSION_SECRET before deploying.',
        );
      }

      try {
        await client.initialize({
          // Only a fallback: each sign-in route passes the callback URL of its own request as `redirect_uri`.
          afterSignInUrl: resolveCallbackUrl(event),
          // Kept as configured: the client is shared by every request, so a destination derived from this request
          // must not be stored on it. The sign-out route resolves a relative destination for each request.
          afterSignOutUrl: publicConfig.afterSignOutUrl || '/',
          baseUrl: publicConfig.baseUrl,
          clientId: publicConfig.clientId,
          // Fall back to the runtime environment, so a secret that is only set at runtime (not at build time) works.
          clientSecret: privateConfig?.clientSecret || process.env['ASGARDEO_CLIENT_SECRET'] || undefined,
          platform: publicConfig.platform,
          scopes: publicConfig.scopes || ['openid', 'profile', 'internal_login'],
          tokenRequest: publicConfig.tokenRequest,
        });
      } catch (err) {
        log.error('Failed to initialize Asgardeo client:', err);
        return;
      }
    }

    // Skip Nuxt internals entirely.
    const url: string = event.path || '';
    if (url.startsWith('/_nuxt/') || url.startsWith('/__nuxt_')) {
      return;
    }

    // API routes get the session only (no SSR data fetches), so `getAsgardeoContext(event)` works in them too.
    if (url.startsWith('/api/')) {
      const apiSession: Awaited<ReturnType<typeof verifyAndRehydrateSession>> = await verifyAndRehydrateSession(
        event,
        process.env['ASGARDEO_SESSION_SECRET'] || useRuntimeConfig(event).asgardeo?.sessionSecret,
      );
      const apiEventContext: H3Event['context'] = event.context;
      apiEventContext.asgardeo = {isSignedIn: Boolean(apiSession), session: apiSession ?? null};

      return;
    }

    // ── 2. Verify session cookie + rehydrate legacy store ─────────────────
    const config: ReturnType<typeof useRuntimeConfig> = useRuntimeConfig(event);
    const publicConfig: AsgardeoNuxtConfig = config.public.asgardeo as AsgardeoNuxtConfig;
    const prefs: AsgardeoNuxtConfig['preferences'] | undefined = publicConfig?.preferences;
    const sessionSecret: string | undefined = process.env['ASGARDEO_SESSION_SECRET'] || config.asgardeo?.sessionSecret;

    const session: Awaited<ReturnType<typeof verifyAndRehydrateSession>> = await verifyAndRehydrateSession(
      event,
      sessionSecret,
    );
    if (!session) {
      const eventContext: H3Event['context'] = event.context;
      eventContext.asgardeo = {isSignedIn: false, session: null};
      return;
    }

    // ── 3. Resolve org-scoped base URL ─────────────────────────────────────
    const baseUrl: string = publicConfig?.baseUrl ?? '';
    let resolvedBaseUrl: string = baseUrl;

    try {
      if (session.organizationId) {
        // organizationId already stored in the session cookie
        resolvedBaseUrl = `${baseUrl}/o`;
      } else {
        // Fall back to inspecting the ID token's `user_org` claim
        const idToken: Awaited<ReturnType<AsgardeoNuxtClient['getDecodedIdToken']>> = await client.getDecodedIdToken(
          session.sessionId,
        );
        if (idToken?.['user_org']) {
          resolvedBaseUrl = `${baseUrl}/o`;
        }
      }
    } catch {
      // Continue with the default base URL — the client can refetch later
    }

    // ── 4. Parallel SSR data fetches (gated by preferences) ───────────────
    const shouldFetchProfile: boolean = prefs?.user?.fetchUserProfile !== false;
    const shouldFetchOrgs: boolean = prefs?.user?.fetchOrganizations !== false;
    const shouldFetchBranding: boolean = prefs?.theme?.inheritFromBranding !== false;

    const [userResult, userProfileResult, orgsResult, currentOrgResult, brandingResult] = await Promise.allSettled([
      // Always fetch the basic user object (needed for AsgardeoAuthState.user)
      client.getUser(session.sessionId),

      // SCIM2 user profile (flattened + schemas)
      shouldFetchProfile ? client.getUserProfile(session.sessionId) : Promise.resolve(null),

      // User's organisations
      shouldFetchOrgs ? client.getMyOrganizations(session.sessionId) : Promise.resolve([] as any[]),

      // Current organisation (derived from the ID token)
      shouldFetchOrgs ? client.getCurrentOrganization(session.sessionId) : Promise.resolve(null),

      // Branding preference (does not require a session)
      shouldFetchBranding ? client.getBrandingPreference({baseUrl: resolvedBaseUrl}) : Promise.resolve(null),
    ]);

    if (userResult.status === 'rejected') {
      log.debug('Failed to fetch user:', userResult.reason);
    }
    if (userProfileResult.status === 'rejected') {
      log.warn('Failed to fetch user profile (SCIM2):', userProfileResult.reason);
    }
    if (orgsResult.status === 'rejected') {
      log.warn('Failed to fetch my organisations:', orgsResult.reason);
    }
    if (currentOrgResult.status === 'rejected') {
      log.warn('Failed to resolve current organisation:', currentOrgResult.reason);
    }
    if (brandingResult.status === 'rejected') {
      log.warn('Failed to fetch branding preference:', brandingResult.reason);
    }

    // ── 5. Write to event context ──────────────────────────────────────────
    const ssrData: AsgardeoSSRData = {
      brandingPreference: brandingResult.status === 'fulfilled' ? brandingResult.value : null,
      currentOrganization: currentOrgResult.status === 'fulfilled' ? currentOrgResult.value : null,
      isSignedIn: true,
      myOrganizations: orgsResult.status === 'fulfilled' && Array.isArray(orgsResult.value) ? orgsResult.value : [],
      resolvedBaseUrl,
      session,
      user: userResult.status === 'fulfilled' ? userResult.value : null,
      userProfile: userProfileResult.status === 'fulfilled' ? userProfileResult.value : null,
    };

    const eventContext: H3Event['context'] = event.context;
    eventContext.asgardeo = {isSignedIn: true, session, ssr: ssrData};

    // Keep legacy __asgardeoAuth in place so the existing Nuxt plugin
    // (Step 3) can be updated independently without a runtime gap.
    const authState: AsgardeoAuthState = {
      isLoading: false,
      isSignedIn: true,
      organizationId: session.organizationId ?? null,
      scopes: (session.scopes || '').split(' ').filter(Boolean),
      user: ssrData.user,
    };
    eventContext['__asgardeoAuth'] = authState;
  });
});
