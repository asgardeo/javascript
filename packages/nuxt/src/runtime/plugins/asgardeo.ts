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

import {defineNuxtPlugin, useState, useRequestEvent, useRuntimeConfig, navigateTo} from '#app';
import {computed} from 'vue';
import {AsgardeoPlugin, ASGARDEO_KEY} from '@asgardeo/vue';
import AsgardeoRoot from '../components/AsgardeoRoot';
import type {AsgardeoAuthState} from '../types';
import type {BrandingPreference, Organization, UserProfile} from '@asgardeo/node';

// Import H3 augmentation so event.context.asgardeo is typed
import '../types/augments.d';

/**
 * Universal Nuxt plugin (runs on both server and client) that wires up the
 * Asgardeo Vue SDK.
 *
 * Responsibilities — mirrors the split between `AsgardeoServerProvider` and
 * `AsgardeoClientProvider` in the Next.js SDK:
 *
 *  1. **Auth state** — hydrate `useState('asgardeo:auth')` from the Nitro
 *     plugin's `event.context.asgardeo` so SSR and client agree on signed-in
 *     status and the user object.
 *  2. **ASGARDEO_KEY** — provide the primary auth context at the app level.
 *     Action helpers (`signIn` / `signOut` / `signUp`) use Nuxt's
 *     `navigateTo` so redirects work on both server and client.
 *  3. **AsgardeoRoot** — register the wrapper component that mounts the rest
 *     of the provider tree (`I18nProvider`, `BrandingProvider`,
 *     `ThemeProvider`, `FlowProvider`, `UserProvider`, `OrganizationProvider`)
 *     so downstream composables receive real context values.
 *  4. **AsgardeoPlugin (delegated)** — install the Vue SDK plugin in
 *     delegated mode so it skips browser-only initialisation (SSR-safe).
 */
export default defineNuxtPlugin((nuxtApp) => {
  const publicConfig = useRuntimeConfig().public.asgardeo as {
    baseUrl: string;
    clientId: string;
    afterSignInUrl: string;
    afterSignOutUrl: string;
    scopes: string[];
    signInUrl?: string;
    signUpUrl?: string;
    organizationHandle?: string;
    applicationId?: string;
  };

  // Surface misconfiguration in the browser dev console only. The server
  // counterpart is handled by the asgardeo-ssr Nitro plugin; doing both
  // covers the two places a developer will actually look.
  if (import.meta.client && import.meta.dev) {
    if (!publicConfig?.baseUrl || !publicConfig?.clientId) {
      // eslint-disable-next-line no-console
      console.warn(
        '[@asgardeo/nuxt] Missing baseUrl or clientId. ' +
        'Set NUXT_PUBLIC_ASGARDEO_BASE_URL and NUXT_PUBLIC_ASGARDEO_CLIENT_ID, ' +
        'or configure `asgardeo` in nuxt.config. Auth endpoints will not function until this is resolved.',
      );
    }
  }

  // ── 1. Hydrate auth state family ────────────────────────────────────────
  //  Each key is written on the server inside `if (import.meta.server)` so
  //  Nuxt snapshots the values into the `__NUXT__` payload and the client
  //  hydrates automatically — no extra fetch needed.

  const authState = useState<AsgardeoAuthState>('asgardeo:auth', () => ({
    isSignedIn: false,
    user: null,
    isLoading: true,
  }));
  const userProfileState = useState<UserProfile | null>('asgardeo:user-profile', () => null);
  const currentOrgState = useState<Organization | null>('asgardeo:current-org', () => null);
  const myOrgsState = useState<Organization[]>('asgardeo:my-orgs', () => []);
  const brandingState = useState<BrandingPreference | null>('asgardeo:branding', () => null);

  if (import.meta.server) {
    const event = useRequestEvent();
    const ssr = event?.context?.asgardeo?.ssr;

    if (ssr) {
      // Seed from the rich SSR payload written by the asgardeo-ssr Nitro plugin.
      authState.value = {
        isSignedIn: ssr.isSignedIn,
        user: ssr.user,
        isLoading: false,
      };
      userProfileState.value = ssr.userProfile;
      currentOrgState.value = ssr.currentOrganization;
      myOrgsState.value = ssr.myOrganizations;
      brandingState.value = ssr.brandingPreference;
    } else {
      // Backwards-compat: fall back to the legacy context shape (pre-Step-2 plugin).
      const ssrContext = event?.context?.asgardeo;
      if (ssrContext) {
        authState.value = {
          isSignedIn: ssrContext.isSignedIn,
          user: ssrContext.session?.sub ? ({sub: ssrContext.session.sub} as AsgardeoAuthState['user']) : null,
          isLoading: false,
        };
      } else {
        const legacyAuth = event?.context?.['__asgardeoAuth'] as AsgardeoAuthState | undefined;
        authState.value = legacyAuth ?? {isSignedIn: false, user: null, isLoading: false};
      }
    }
  }

  if (import.meta.client) {
    authState.value = {...authState.value, isLoading: false};
  }

  // ── 2. Reactive refs over auth state ────────────────────────────────────
  const isSignedIn = computed(() => authState.value.isSignedIn);
  const isLoading = computed(() => authState.value.isLoading);
  const isInitialized = computed(() => !authState.value.isLoading);
  // `user` is backed by the dedicated state key so AsgardeoRoot can read it
  // reactively without going through the ASGARDEO_KEY indirection.
  const user = computed(() => authState.value.user ?? null);
  // `organization` reflects the SSR-resolved current org (hydrated from
  // 'asgardeo:current-org'). Kept readonly at the ASGARDEO_KEY level.
  const organizationRef = computed(() => currentOrgState.value);

  // ── 3. Action helpers (Nuxt-aware navigation) ───────────────────────────
  const signIn = async (options?: Record<string, unknown>): Promise<void> => {
    const returnTo = typeof options?.['returnTo'] === 'string' ? options['returnTo'] : undefined;
    const url = returnTo ? `/api/auth/signin?returnTo=${encodeURIComponent(returnTo)}` : '/api/auth/signin';
    await navigateTo(url, {external: true});
  };

  const signOut = async (): Promise<void> => {
    const res = await $fetch<{redirectUrl: string}>('/api/auth/signout', {method: 'POST'});
    await navigateTo(res.redirectUrl || '/', {external: true});
  };

  const signUp = async (): Promise<void> => {
    await navigateTo('/api/auth/signup', {external: true});
  };

  const getAccessToken = async (): Promise<string> => {
    try {
      const res = await $fetch<{accessToken: string}>('/api/auth/token');
      return res.accessToken ?? '';
    } catch {
      return '';
    }
  };

  const noop = async (): Promise<any> => undefined;

  // ── 4. Provide ASGARDEO_KEY at the app level ────────────────────────────
  nuxtApp.vueApp.provide(ASGARDEO_KEY, {
    // Config
    afterSignInUrl: publicConfig.afterSignInUrl,
    applicationId: publicConfig.applicationId,
    baseUrl: publicConfig.baseUrl,
    clientId: publicConfig.clientId,
    instanceId: 0,
    organizationHandle: publicConfig.organizationHandle,
    platform: undefined,
    signInOptions: undefined,
    signInUrl: publicConfig.signInUrl,
    signUpUrl: publicConfig.signUpUrl,
    storage: undefined,
    // Reactive state
    isInitialized,
    isLoading,
    isSignedIn,
    organization: organizationRef,
    user,
    // Actions
    clearSession: noop,
    exchangeToken: noop,
    getAccessToken,
    getDecodedIdToken: noop,
    getIdToken: noop,
    http: {request: noop, requestAll: noop},
    reInitialize: async () => false,
    signIn,
    signInSilently: noop,
    signOut,
    signUp,
    switchOrganization: noop,
  });

  // ── 5. Register AsgardeoRoot + install Vue plugin in delegated mode ─────
  nuxtApp.vueApp.component('AsgardeoRoot', AsgardeoRoot);
  nuxtApp.vueApp.use(AsgardeoPlugin, {mode: 'delegated'});
});
