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

import {useState, useRuntimeConfig} from '#imports';
import {
  BrandingProvider,
  FlowMetaProvider,
  FlowProvider,
  I18nProvider,
  OrganizationProvider,
  ThemeProvider,
  UserProvider,
} from '@asgardeo/vue';
import {generateFlattenedUserProfile} from '@asgardeo/node';
import type {
  AllOrganizationsApiResponse,
  BrandingPreference,
  CreateOrganizationPayload,
  Organization,
  UpdateMeProfileConfig,
  User,
  UserProfile,
} from '@asgardeo/node';
import {
  defineComponent,
  h,
  type Component,
  type SetupContext,
  type VNode,
} from 'vue';
import type {AsgardeoAuthState, AsgardeoNuxtConfig} from '../types';

/**
 * Nuxt root wrapper that mounts the full Asgardeo Vue provider tree.
 *
 * Mirrors `AsgardeoClientProvider` in the Next.js SDK — reads the SSR-hydrated
 * `useState` keys written by the universal Nuxt plugin and passes the resolved
 * data as props to each Vue provider:
 *
 * - {@link I18nProvider}      ← `preferences.i18n`
 * - {@link BrandingProvider}  ← `brandingPreference` (from `asgardeo:branding`)
 * - {@link ThemeProvider}     ← `inheritFromBranding`, `mode`
 * - {@link FlowProvider}
 * - {@link UserProvider}      ← `profile`, `flattenedProfile`, `schemas`,
 *                               `updateProfile`, `revalidateProfile`, `onUpdateProfile`
 * - {@link OrganizationProvider} ← `currentOrganization`, `myOrganizations`,
 *                                  `onOrganizationSwitch`, `getAllOrganizations`,
 *                                  `revalidateMyOrganizations`
 *
 * The `ASGARDEO_KEY` (config + auth state + actions) is still provided at the
 * app level by the Nuxt plugin; this component only supplies the auxiliary
 * provider contexts so downstream composables (`useUser`, `useOrganization`,
 * `useTheme`, `useBranding`, `useAsgardeoI18n`) receive real data.
 *
 * @example
 * ```vue
 * <!-- app.vue -->
 * <template>
 *   <AsgardeoRoot>
 *     <NuxtPage />
 *   </AsgardeoRoot>
 * </template>
 * ```
 */
const AsgardeoRoot: Component = defineComponent({
  name: 'AsgardeoRoot',
  setup(_props, {slots}: SetupContext): () => VNode {
    // ── Read SSR-hydrated state keys (seeded by the Nuxt plugin) ────────────
    const userProfileState = useState<UserProfile | null>('asgardeo:user-profile');
    const currentOrgState = useState<Organization | null>('asgardeo:current-org');
    const myOrgsState = useState<Organization[]>('asgardeo:my-orgs');
    const brandingState = useState<BrandingPreference | null>('asgardeo:branding');
    // Used by onUpdateProfile to keep the top-level auth user claim in sync.
    const authState = useState<AsgardeoAuthState>('asgardeo:auth');

    // ── Preferences from runtime config ────────────────────────────────────
    const prefs = (useRuntimeConfig().public.asgardeo as {
      preferences?: AsgardeoNuxtConfig['preferences'];
    })?.preferences;

    // Gate flags — mirror the same checks in asgardeo-ssr.ts so client props
    // always agree with what the Nitro plugin decided to fetch server-side.
    const shouldFetchProfile = prefs?.user?.fetchUserProfile !== false;
    const shouldFetchOrgs = prefs?.user?.fetchOrganizations !== false;
    const shouldFetchBranding = prefs?.theme?.inheritFromBranding !== false;
    // Defaults to 'light' — matches the Vue SDK's AsgardeoProvider, which
    // passes no mode and therefore uses ThemeProvider's `DEFAULT_THEME`.
    const themeMode = prefs?.theme?.mode ?? 'light';

    // ── Callbacks ──────────────────────────────────────────────────────────

    /**
     * Optimistic local update — mirrors `handleProfileUpdate` in
     * `AsgardeoClientProvider` (Next.js). Keeps reactive state fresh after a
     * successful SCIM2 PATCH without an extra server round-trip.
     */
    const onUpdateProfile = (payload: User): void => {
      const prev = userProfileState.value;
      userProfileState.value = prev
        ? {
            ...prev,
            flattenedProfile: generateFlattenedUserProfile(payload, prev.schemas),
            profile: payload,
          }
        : {
            flattenedProfile: generateFlattenedUserProfile(payload, []),
            profile: payload,
            schemas: [],
          };
      // Keep ASGARDEO_KEY `user` ref in sync so `useAsgardeo().user` reflects
      // the update immediately.
      authState.value = {...authState.value, user: payload};
    };

    /**
     * SCIM2 PATCH via the `/api/auth/user/profile` Nitro route.
     * Signature matches `UserProvider.updateProfile` exactly.
     *
     * On success, applies an optimistic local update via `onUpdateProfile`
     * so consumers of `useUser()` (e.g. `<AsgardeoUserProfile>`) and
     * `useAsgardeo().user` (e.g. `<AsgardeoUser>`) reflect the new value
     * without waiting for the next navigation/SSR refetch.
     */
    const updateProfile = async (
      requestConfig: UpdateMeProfileConfig,
      _sessionId?: string,
    ): Promise<{data: {user: User}; error: string; success: boolean}> => {
      try {
        const result: {data: {user: User}; error: string; success: boolean} = await $fetch(
          '/api/auth/user/profile',
          {method: 'PATCH', body: requestConfig},
        );
        if (result?.success && result.data?.user) {
          onUpdateProfile(result.data.user);
        }
        return result;
      } catch (err) {
        return {data: {user: {} as User}, error: String(err), success: false};
      }
    };

    /**
     * Re-fetch the full user profile from `/api/auth/user/profile`.
     */
    const revalidateProfile = async (): Promise<void> => {
      try {
        const res = await $fetch<UserProfile>('/api/auth/user/profile');
        if (res) userProfileState.value = res;
      } catch {
        // Non-fatal — profile stays stale until the next navigation.
      }
    };

    /**
     * Token-exchange org switch via the `/api/auth/organizations/switch` Nitro route.
     */
    const onOrganizationSwitch = async (organization: Organization): Promise<any> => {
      return $fetch('/api/auth/organizations/switch', {method: 'POST', body: {organization}});
    };

    /**
     * Paginated org list via the `/api/auth/organizations` Nitro route.
     */
    const getAllOrganizations = async (): Promise<AllOrganizationsApiResponse> => {
      return $fetch<AllOrganizationsApiResponse>('/api/auth/organizations');
    };

    /**
     * Refresh the user's org membership list and update local state so
     * `useOrganization().myOrganizations` stays reactive.
     */
    const revalidateMyOrganizations = async (): Promise<Organization[]> => {
      try {
        const res = await $fetch<Organization[]>('/api/auth/organizations/me');
        myOrgsState.value = res ?? [];
        return myOrgsState.value;
      } catch {
        return myOrgsState.value;
      }
    };

    /**
     * Create a new sub-organisation via the `POST /api/auth/organizations` route.
     */
    const createOrganization = async (payload: CreateOrganizationPayload): Promise<Organization> => {
      return $fetch<Organization>('/api/auth/organizations', {method: 'POST', body: payload});
    };

    /**
     * Refresh the current organisation from the session's ID token claims
     * and update local state so `useOrganization().currentOrganization` stays reactive.
     */
    const revalidateCurrentOrganization = async (): Promise<Organization | null> => {
      try {
        const res = await $fetch<Organization | null>('/api/auth/organizations/current');
        currentOrgState.value = res ?? null;
        return currentOrgState.value;
      } catch {
        return currentOrgState.value;
      }
    };

    /**
     * Refresh the branding preference and update local state so
     * `useBranding().brandingPreference` stays reactive.
     */
    const revalidateBranding = async (): Promise<void> => {
      try {
        const res = await $fetch<BrandingPreference | null>('/api/auth/branding');
        if (res) brandingState.value = res;
      } catch {
        // Non-fatal — branding stays stale until the next navigation.
      }
    };

    // ── Render tree — mirrors AsgardeoClientProvider (Next.js) ─────────────
    //
    // FlowMetaProvider is mounted unconditionally with `enabled: false` (V1
    // platform default). It still provides `FLOW_META_KEY` to descendants so
    // `useFlowMeta()` (called by `BaseSignUp`, v2 `BaseSignIn`,
    // `BaseAcceptInvite`, `BaseInviteUser`) returns a real context with
    // `meta: null` instead of throwing. When the Nuxt SDK gains a `platform`
    // config option, derive `enabled` from it the same way `AsgardeoProvider`
    // does (`enabled: platform === Platform.AsgardeoV2`).
    return (): VNode =>
      h(I18nProvider, {preferences: prefs?.i18n}, {
        default: (): VNode =>
          h(FlowMetaProvider, {enabled: false}, {
            default: (): VNode =>
              h(BrandingProvider, {
            // When inheritFromBranding is disabled, pass null so the provider
            // falls back to its own default theme without using SSR-fetched data.
            brandingPreference: shouldFetchBranding ? brandingState.value : null,
            revalidateBranding: shouldFetchBranding ? revalidateBranding : undefined,
          }, {
            default: (): VNode =>
              h(ThemeProvider, {
                // Mirror the same flag used in the Nitro plugin gate.
                inheritFromBranding: shouldFetchBranding,
                mode: themeMode as any,
              }, {
                default: (): VNode =>
                  h(FlowProvider, null, {
                    default: (): VNode =>
                      h(UserProvider, {
                        // When fetchUserProfile is false the Nitro plugin
                        // skips SCIM calls, so we must also pass empty values
                        // here to keep SSR and client in sync.
                        profile: shouldFetchProfile ? userProfileState.value : null,
                        flattenedProfile: shouldFetchProfile
                          ? (userProfileState.value?.flattenedProfile ?? null)
                          : null,
                        schemas: shouldFetchProfile
                          ? (userProfileState.value?.schemas ?? null)
                          : null,
                        onUpdateProfile: shouldFetchProfile ? onUpdateProfile : undefined,
                        updateProfile: shouldFetchProfile ? updateProfile : undefined,
                        revalidateProfile: shouldFetchProfile ? revalidateProfile : undefined,
                      }, {
                        default: (): VNode | VNode[] | undefined =>
                          h(OrganizationProvider, {
                            // When fetchOrganizations is false pass empty
                            // values so the provider renders without org data.
                            currentOrganization: shouldFetchOrgs ? currentOrgState.value : null,
                            myOrganizations: shouldFetchOrgs ? myOrgsState.value : [],
                            onOrganizationSwitch: shouldFetchOrgs
                              ? (onOrganizationSwitch as any)
                              : undefined,
                            getAllOrganizations: shouldFetchOrgs ? getAllOrganizations : undefined,
                            revalidateMyOrganizations: shouldFetchOrgs
                              ? revalidateMyOrganizations
                              : undefined,
                            createOrganization: shouldFetchOrgs
                              ? (createOrganization as any)
                              : undefined,
                            revalidateCurrentOrganization: shouldFetchOrgs
                              ? revalidateCurrentOrganization
                              : undefined,
                          }, {
                            default: (): VNode | VNode[] | undefined => slots['default']?.(),
                          }),
                      }),
                  }),
              }),
          }),
          }),
      });
  },
});

export default AsgardeoRoot;
