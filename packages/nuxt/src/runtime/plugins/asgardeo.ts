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
import {
  AsgardeoPlugin,
  ASGARDEO_KEY,
  USER_KEY,
  ORGANIZATION_KEY,
  THEME_KEY,
  BRANDING_KEY,
  I18N_KEY,
  FLOW_KEY,
  FLOW_META_KEY,
  type FlowMessage,
} from '@asgardeo/vue';
import type {Organization, Theme} from '@asgardeo/browser';
import type {AsgardeoAuthState} from '../types';

// Import H3 augmentation so event.context.asgardeo is typed
import '../types/augments.d';

/**
 * Universal Nuxt plugin (runs on both server and client) that wires up the
 * Asgardeo Vue SDK in delegated mode.
 *
 * Responsibilities:
 *  1. Hydrate `useState('asgardeo:auth')` from the SSR Nitro plugin context.
 *  2. Provide all Vue injection keys (ASGARDEO_KEY, USER_KEY, …) at the app
 *     level so that every `@asgardeo/vue` composable and component works
 *     without requiring `<AsgardeoProvider>` in user markup.
 *  3. Install AsgardeoPlugin in 'delegated' mode (styles are skipped server-
 *     side; components are registered via addComponent in module.ts).
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
      // Fallback for backward compat during migration
      const legacyAuth = event?.context?.['__asgardeoAuth'] as AsgardeoAuthState | undefined;
      authState.value = legacyAuth ?? {isSignedIn: false, user: null, isLoading: false};
    }
  }

  if (import.meta.client) {
    authState.value = {...authState.value, isLoading: false};
  }

  // ── 2. Build reactive refs from auth state ──────────────────────────────
  const isSignedIn = computed(() => authState.value.isSignedIn);
  const isLoading = computed(() => authState.value.isLoading);
  const isInitialized = computed(() => !authState.value.isLoading);
  const user = computed(() => authState.value.user ?? null);
  const organizationRef = readonly(ref<null>(null));

  // ── 3. Action helpers ───────────────────────────────────────────────────
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

  // ── 4. Provide ASGARDEO_KEY ─────────────────────────────────────────────
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

  // ── 5. Provide USER_KEY ─────────────────────────────────────────────────
  const userProfile = readonly(ref<null>(null));
  const userSchemas = readonly(ref<null>(null));

  nuxtApp.vueApp.provide(USER_KEY, {
    flattenedProfile: user,
    profile: userProfile,
    revalidateProfile: async (): Promise<void> => {
      try {
        const data = await $fetch<AsgardeoAuthState>('/api/auth/session');
        authState.value = data;
      } catch {
        /* ignore */
      }
    },
    schemas: userSchemas,
    updateProfile: async (): Promise<{data: {user: any}; error: string; success: boolean}> => ({
      data: {user: null},
      error: 'Not implemented in Phase 1',
      success: false,
    }),
  });

  // ── 6. Provide ORGANIZATION_KEY ─────────────────────────────────────────
  const orgLoading = readonly(ref(false));
  const orgError = readonly(ref<string | null>(null));
  const orgList = ref<Organization[]>([]);
  const currentOrg = readonly(ref<Organization | null>(null));

  nuxtApp.vueApp.provide(ORGANIZATION_KEY, {
    createOrganization: noop,
    currentOrganization: currentOrg,
    error: orgError,
    getAllOrganizations: async () => ({count: 0, organizations: []}),
    isLoading: orgLoading,
    myOrganizations: orgList,
    revalidateMyOrganizations: async () => [],
    switchOrganization: noop,
  });

  // ── 7. Provide THEME_KEY ────────────────────────────────────────────────
  const colorScheme = readonly(ref<'light' | 'dark'>('light'));
  const direction = readonly(ref<'ltr' | 'rtl'>('ltr'));
  const brandingError = readonly(ref<null>(null));
  // Provide a minimal default theme object that styled components can consume
  const defaultTheme = {colors: {}, fontFamily: ''} as unknown as Theme;
  const themeRef = readonly(ref<Theme>(defaultTheme));

  nuxtApp.vueApp.provide(THEME_KEY, {
    brandingError,
    colorScheme,
    direction,
    inheritFromBranding: false,
    isBrandingLoading: readonly(ref(false)),
    theme: themeRef,
    toggleTheme: (): void => {
      /* noop in Phase 1 */
    },
  });

  // ── 8. Provide BRANDING_KEY ─────────────────────────────────────────────
  nuxtApp.vueApp.provide(BRANDING_KEY, {
    activeTheme: readonly(ref<null>(null)),
    brandingPreference: readonly(ref<null>(null)),
    error: readonly(ref<null>(null)),
    fetchBranding: noop,
    isLoading: readonly(ref(false)),
    refetch: noop,
    theme: readonly(ref<null>(null)),
  });

  // ── 9. Provide I18N_KEY ─────────────────────────────────────────────────
  nuxtApp.vueApp.provide(I18N_KEY, {
    bundles: readonly(ref({})),
    currentLanguage: readonly(ref('en-US')),
    fallbackLanguage: 'en-US',
    injectBundles: (): void => {
      /* noop */
    },
    setLanguage: (): void => {
      /* noop */
    },
    t: (key: string): string => key,
  });

  // ── 10. Provide FLOW_KEY ────────────────────────────────────────────────
  nuxtApp.vueApp.provide(FLOW_KEY, {
    addMessage: (): void => {
      /* noop */
    },
    clearMessages: (): void => {
      /* noop */
    },
    currentStep: readonly(ref(null)),
    error: readonly(ref<null>(null)),
    isLoading: readonly(ref(false)),
    messages: ref<FlowMessage[]>([]),
    navigateToFlow: (): void => {
      /* noop */
    },
    onGoBack: readonly(ref(undefined)),
    removeMessage: (): void => {
      /* noop */
    },
    reset: (): void => {
      /* noop */
    },
    setCurrentStep: (): void => {
      /* noop */
    },
    setError: (): void => {
      /* noop */
    },
    setIsLoading: (): void => {
      /* noop */
    },
    setOnGoBack: (): void => {
      /* noop */
    },
    setShowBackButton: (): void => {
      /* noop */
    },
    setSubtitle: (): void => {
      /* noop */
    },
    setTitle: (): void => {
      /* noop */
    },
    showBackButton: readonly(ref(false)),
    subtitle: readonly(ref(undefined)),
    title: readonly(ref('')),
  });

  // ── 11. Provide FLOW_META_KEY ───────────────────────────────────────────
  nuxtApp.vueApp.provide(FLOW_META_KEY, {
    error: readonly(ref<null>(null)),
    fetchFlowMeta: noop,
    isLoading: readonly(ref(false)),
    meta: readonly(ref(null)),
    switchLanguage: noop,
  });

  // ── 12. Install AsgardeoPlugin in delegated mode ────────────────────────
  // This is a no-op (mode:'delegated') but documents the intent.
  // Components are registered individually via addComponent in module.ts.
  nuxtApp.vueApp.use(AsgardeoPlugin, {mode: 'delegated'});
});
