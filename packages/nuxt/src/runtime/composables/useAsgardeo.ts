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

import {computed, inject, readonly, ref} from 'vue';
import {useState, navigateTo} from '#app';
import {ASGARDEO_KEY} from '@asgardeo/vue';
import type {AsgardeoContext} from '@asgardeo/vue';
import type {AsgardeoAuthState} from '../types';

/**
 * Nuxt-aware primary composable for Asgardeo authentication.
 *
 * Thin wrapper around `@asgardeo/vue`'s inject-based context that:
 *  - Reads context provided at the app level by the Asgardeo Nuxt plugin.
 *  - Falls back to `useState('asgardeo:auth')` for lightweight SSR access
 *    when called outside a component setup (e.g. in a Nitro handler).
 *  - Overrides `signIn`/`signOut`/`signUp` with Nuxt-aware `navigateTo`
 *    so server-side redirects work correctly.
 *
 * @example
 * ```vue
 * <script setup>
 * const { isSignedIn, user, signIn, signOut } = useAsgardeo();
 * </script>
 * ```
 */
export function useAsgardeo(): AsgardeoContext {
  // Prefer the full Vue SDK context (provided at app level by the Nuxt plugin).
  const ctx = inject<AsgardeoContext>(ASGARDEO_KEY);

  if (ctx) {
    // Override navigation helpers with Nuxt-aware versions so SSR redirects
    // use the correct response mechanism instead of window.location.
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

    return {...ctx, signIn, signOut, signUp};
  }

  // ── Lightweight fallback ─────────────────────────────────────────────────
  // The inject context should always be present when the Nuxt plugin is
  // installed.  This branch guards against edge cases (e.g. unit tests that
  // don't run a full Nuxt app).
  const authState = useState<AsgardeoAuthState>('asgardeo:auth', () => ({
    isSignedIn: false,
    user: null,
    isLoading: true,
  }));

  const noop = async (): Promise<any> => undefined;

  return {
    afterSignInUrl: undefined,
    afterSignOutUrl: undefined,
    applicationId: undefined,
    baseUrl: undefined,
    clearSession: noop,
    clientId: undefined,
    exchangeToken: noop,
    getAccessToken: noop,
    getDecodedIdToken: noop,
    getIdToken: noop,
    http: {request: noop, requestAll: noop},
    instanceId: 0,
    isInitialized: readonly(ref(true)),
    isLoading: computed(() => authState.value.isLoading),
    isSignedIn: computed(() => authState.value.isSignedIn),
    organization: readonly(ref(null)),
    organizationHandle: undefined,
    platform: undefined,
    reInitialize: async () => false,
    signIn: async (opts?: any): Promise<void> => {
      const returnTo = opts?.returnTo ? `?returnTo=${encodeURIComponent(opts.returnTo)}` : '';
      await navigateTo(`/api/auth/signin${returnTo}`, {external: true});
    },
    signInOptions: undefined,
    signInSilently: noop,
    signInUrl: undefined,
    signOut: async (): Promise<void> => {
      await navigateTo('/api/auth/signout', {external: true});
    },
    signUp: async (): Promise<void> => {
      await navigateTo('/api/auth/signup', {external: true});
    },
    signUpUrl: undefined,
    storage: undefined,
    switchOrganization: noop,
    user: computed(() => authState.value.user),
  } as AsgardeoContext;
}
