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
import {computed, readonly, ref} from 'vue';
import {AsgardeoPlugin, ASGARDEO_KEY} from '@asgardeo/vue';
import AsgardeoRoot from '../components/AsgardeoRoot';
import type {AsgardeoAuthState} from '../types';

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

  // ── 1. Hydrate auth state ───────────────────────────────────────────────
  const authState = useState<AsgardeoAuthState>('asgardeo:auth', () => ({
    isSignedIn: false,
    user: null,
    isLoading: true,
  }));

  if (import.meta.server) {
    const event = useRequestEvent();
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

  if (import.meta.client) {
    authState.value = {...authState.value, isLoading: false};
  }

  // ── 2. Reactive refs over auth state ────────────────────────────────────
  const isSignedIn = computed(() => authState.value.isSignedIn);
  const isLoading = computed(() => authState.value.isLoading);
  const isInitialized = computed(() => !authState.value.isLoading);
  const user = computed(() => authState.value.user ?? null);
  const organizationRef = readonly(ref(null));

  // ── 3. Action helpers (Nuxt-aware navigation) ───────────────────────────
  const signIn = async (options?: Record<string, unknown>): Promise<void> => {
    const returnTo = typeof options?.['returnTo'] === 'string' ? options['returnTo'] : undefined;
    const url = returnTo ? `/api/auth/signin?returnTo=${encodeURIComponent(returnTo)}` : '/api/auth/signin';
    await navigateTo(url, {external: true});
  };

  const signOut = async (): Promise<void> => {
    await navigateTo('/api/auth/signout', {external: true});
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
