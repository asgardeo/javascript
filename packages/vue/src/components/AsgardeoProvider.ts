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

import {
  AsgardeoRuntimeError,
  extractUserClaimsFromIdToken,
  hasAuthParamsInUrl,
  hasCalledForThisInstanceInUrl,
  IdToken,
  Organization,
  Platform,
  User,
  UserProfile,
  Schema,
  SignInOptions,
  TokenResponse,
  EmbeddedSignInFlowResponseV2,
} from '@asgardeo/browser';
import {
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  provide,
  ref,
  shallowRef,
  type PropType,
} from 'vue';
import AsgardeoVueClient from '../AsgardeoVueClient';
import {ASGARDEO_KEY} from '../keys';
import type {AsgardeoContext} from '../models/contexts';
import type {AsgardeoVueConfig} from '../models/config';
import I18nProvider from '../providers/I18nProvider';
import UserProvider from '../providers/UserProvider';
import OrganizationProvider from '../providers/OrganizationProvider';
import ThemeProvider from '../providers/ThemeProvider';
import BrandingProvider from '../providers/BrandingProvider';
import FlowProvider from '../providers/FlowProvider';
import FlowMetaProvider from '../providers/FlowMetaProvider';

/**
 * Checks if the current URL contains authentication parameters.
 */
function hasAuthParams(url: URL, afterSignInUrl: string): boolean {
  return (
    (hasAuthParamsInUrl() && new URL(url.origin + url.pathname).toString() === new URL(afterSignInUrl).toString()) ||
    url.searchParams.get('error') !== null
  );
}

/**
 * Root provider component for the Asgardeo Vue SDK.
 *
 * This component initializes the client, manages authentication state,
 * and provides the Asgardeo context to child components via Vue's provide/inject.
 *
 * @example
 * ```vue
 * <template>
 *   <AsgardeoProvider v-bind="config">
 *     <router-view />
 *   </AsgardeoProvider>
 * </template>
 * ```
 */
const AsgardeoProvider = defineComponent({
  name: 'AsgardeoProvider',
  props: {
    /** The base URL of the Asgardeo tenant. */
    baseUrl: {type: String, required: true},
    /** The OAuth2 client ID. */
    clientId: {type: String, required: true},
    /** The URL to redirect to after sign in. Defaults to `window.location.origin`. */
    afterSignInUrl: {type: String, default: () => window.location.origin},
    /** The URL to redirect to after sign out. Defaults to `window.location.origin`. */
    afterSignOutUrl: {type: String, default: () => window.location.origin},
    /** The scopes to request. */
    scopes: {type: Array as PropType<string[]>, default: undefined},
    /** The sign-in URL. */
    signInUrl: {type: String, default: undefined},
    /** The sign-up URL. */
    signUpUrl: {type: String, default: undefined},
    /** The organization handle. */
    organizationHandle: {type: String, default: undefined},
    /** The Asgardeo application ID. */
    applicationId: {type: String, default: undefined},
    /** Additional sign-in options. */
    signInOptions: {type: Object as PropType<SignInOptions>, default: undefined},
    /** Whether to sync sessions across tabs. */
    syncSession: {type: Boolean, default: undefined},
    /** Instance ID for multi-instance support. */
    instanceId: {type: Number, default: 0},
    /** Organization chain config. */
    organizationChain: {type: Object, default: undefined},
    /** Storage type. */
    storage: {type: String, default: undefined},
    /** Platform type. */
    platform: {type: String, default: undefined},
  },
  setup(props, {slots}) {
    // ── Client ──
    const asgardeo = new AsgardeoVueClient(props.instanceId);

    // ── Reactive State ──
    const isSignedIn = ref(false);
    const isInitialized = ref(false);
    const isLoading = ref(true);
    const user = shallowRef<any | null>(null);
    const currentOrganization = shallowRef<Organization | null>(null);
    const myOrganizations = shallowRef<Organization[]>([]);
    const userProfile = shallowRef<UserProfile | null>(null);
    const flattenedProfile = shallowRef<User | null>(null);
    const schemas = shallowRef<Schema[]>([]);
    const resolvedBaseUrl = ref(props.baseUrl);

    let isUpdatingSession = false;
    let signInCheckInterval: ReturnType<typeof setInterval> | undefined;
    let loadingCheckInterval: ReturnType<typeof setInterval> | undefined;

    // ── Build config from props ──
    function buildConfig(): AsgardeoVueConfig {
      return {
        afterSignInUrl: props.afterSignInUrl,
        afterSignOutUrl: props.afterSignOutUrl,
        applicationId: props.applicationId,
        baseUrl: props.baseUrl,
        clientId: props.clientId,
        organizationChain: props.organizationChain,
        organizationHandle: props.organizationHandle,
        scopes: props.scopes,
        signInOptions: props.signInOptions,
        signInUrl: props.signInUrl,
        signUpUrl: props.signUpUrl,
        storage: props.storage,
        syncSession: props.syncSession,
        platform: props.platform,
      } as AsgardeoVueConfig;
    }

    // ── Session Update ──
    async function updateSession(): Promise<void> {
      try {
        isUpdatingSession = true;
        isLoading.value = true;
        let baseUrl = resolvedBaseUrl.value;

        const decodedToken: IdToken = await asgardeo.getDecodedIdToken();

        if (decodedToken?.['user_org']) {
          baseUrl = `${(await asgardeo.getConfiguration()).baseUrl}/o`;
          resolvedBaseUrl.value = baseUrl;
        }

        const config = buildConfig();

        if (config.platform === Platform.AsgardeoV2) {
          const claims = extractUserClaimsFromIdToken(decodedToken);
          user.value = claims;
        } else {
          try {
            const fetchedUser: User = await asgardeo.getUser({baseUrl});
            user.value = fetchedUser;
          } catch {
            // silent
          }

          try {
            const fetchedOrg: Organization = await asgardeo.getCurrentOrganization();
            currentOrganization.value = fetchedOrg;
          } catch {
            // silent
          }

          // Fetch user's organizations for organization components
          try {
            const orgs: Organization[] = await asgardeo.getMyOrganizations({baseUrl});
            myOrganizations.value = orgs || [];
          } catch {
            // silent
          }

          // Fetch user profile details for profile components
          try {
            const profileData: UserProfile = await asgardeo.getUserProfile({baseUrl});
            userProfile.value = profileData;
            flattenedProfile.value = profileData.flattenedProfile || null;
            schemas.value = profileData.schemas || [];
          } catch {
            // silent
          }
        }

        const currentSignInStatus = await asgardeo.isSignedIn();
        isSignedIn.value = currentSignInStatus;
      } catch {
        // silent
      } finally {
        isUpdatingSession = false;
        isLoading.value = asgardeo.isLoading();
      }
    }

    // ── Sign In (wrapper) ──
    async function signIn(...args: any[]): Promise<User | EmbeddedSignInFlowResponseV2> {
      const arg1 = args[0];
      const config = buildConfig();
      const isV2FlowRequest =
        config.platform === Platform.AsgardeoV2 &&
        typeof arg1 === 'object' &&
        arg1 !== null &&
        ('flowId' in arg1 || 'applicationId' in arg1);

      try {
        if (!isV2FlowRequest) {
          isUpdatingSession = true;
          isLoading.value = true;
        }

        const response = await asgardeo.signIn(...args);

        if (isV2FlowRequest || (response && typeof response === 'object' && 'flowStatus' in response)) {
          return response;
        }

        if (await asgardeo.isSignedIn()) {
          await updateSession();
        }

        return response as User;
      } catch (error) {
        throw new AsgardeoRuntimeError(
          `Sign in failed: ${error instanceof Error ? error.message : String(JSON.stringify(error))}`,
          'asgardeo-signIn-Error',
          'vue',
          'An error occurred while trying to sign in.',
        );
      } finally {
        if (!isV2FlowRequest) {
          isUpdatingSession = false;
          isLoading.value = asgardeo.isLoading();
        }
      }
    }

    // ── Sign Out ──
    async function signOut(...args: any[]): Promise<any> {
      return asgardeo.signOut(...args);
    }

    // ── Sign Up ──
    async function signUp(...args: any[]): Promise<any> {
      return asgardeo.signUp(...args);
    }

    // ── Sign In Silently ──
    async function signInSilently(options?: SignInOptions): Promise<User | boolean> {
      try {
        isUpdatingSession = true;
        isLoading.value = true;
        const response = await asgardeo.signInSilently(options);

        if (await asgardeo.isSignedIn()) {
          await updateSession();
        }

        return response;
      } catch (error) {
        throw new AsgardeoRuntimeError(
          `Error while signing in silently: ${error instanceof Error ? error.message : String(JSON.stringify(error))}`,
          'asgardeo-signInSilently-Error',
          'vue',
          'An error occurred while trying to sign in silently.',
        );
      } finally {
        isUpdatingSession = false;
        isLoading.value = asgardeo.isLoading();
      }
    }

    // ── Switch Organization ──
    async function switchOrganization(organization: Organization): Promise<TokenResponse | Response> {
      try {
        isUpdatingSession = true;
        isLoading.value = true;
        const response = await asgardeo.switchOrganization(organization);

        if (await asgardeo.isSignedIn()) {
          await updateSession();
        }

        return response;
      } catch (error) {
        throw new AsgardeoRuntimeError(
          `Failed to switch organization: ${error instanceof Error ? error.message : String(JSON.stringify(error))}`,
          'asgardeo-switchOrganization-Error',
          'vue',
          'An error occurred while switching to the specified organization.',
        );
      } finally {
        isUpdatingSession = false;
        isLoading.value = asgardeo.isLoading();
      }
    }

    // ── Provide Context ──
    const context: AsgardeoContext = {
      afterSignInUrl: props.afterSignInUrl,
      applicationId: props.applicationId,
      baseUrl: props.baseUrl,
      clientId: props.clientId,
      clearSession: (...args: any[]) => asgardeo.clearSession(...args),
      exchangeToken: (config) => asgardeo.exchangeToken(config),
      getAccessToken: () => asgardeo.getAccessToken(),
      getDecodedIdToken: () => asgardeo.getDecodedIdToken(),
      getIdToken: () => asgardeo.getIdToken(),
      http: {
        request: (requestConfig) => asgardeo.request(requestConfig),
        requestAll: (requestConfigs) => asgardeo.requestAll(requestConfigs),
      },
      instanceId: props.instanceId,
      isInitialized,
      isLoading,
      isSignedIn,
      organization: currentOrganization,
      organizationHandle: props.organizationHandle,
      platform: props.platform as AsgardeoVueConfig['platform'],
      reInitialize: (config) => asgardeo.reInitialize(config),
      signIn,
      signInOptions: props.signInOptions,
      signInSilently,
      signInUrl: props.signInUrl,
      signOut,
      signUp,
      signUpUrl: props.signUpUrl,
      storage: props.storage as AsgardeoVueConfig['storage'],
      switchOrganization,
      user,
    };

    provide(ASGARDEO_KEY, context);

    // ── Lifecycle ──
    onMounted(async () => {
      // 1. Initialize the client
      const config = buildConfig();
      await asgardeo.initialize(config);

      const initializedConfig = asgardeo.getConfiguration();

      if (initializedConfig?.platform) {
        sessionStorage.setItem('asgardeo_platform', initializedConfig.platform);
      }
      if (initializedConfig?.baseUrl) {
        sessionStorage.setItem('asgardeo_base_url', initializedConfig.baseUrl);
      }

      // 2. Check initialization status
      try {
        const status = await asgardeo.isInitialized();
        isInitialized.value = status;
      } catch {
        isInitialized.value = false;
      }

      // 3. Try to sign in if already authenticated or if URL has auth params
      const alreadySignedIn = await asgardeo.isSignedIn();

      if (alreadySignedIn) {
        await updateSession();
      } else {
        const currentUrl = new URL(window.location.href);
        const hasParams =
          hasAuthParams(currentUrl, props.afterSignInUrl) &&
          hasCalledForThisInstanceInUrl(props.instanceId ?? 0, currentUrl.search);

        if (hasParams) {
          try {
            const isV2Platform = config.platform === Platform.AsgardeoV2;

            if (isV2Platform) {
              const urlParams = currentUrl.searchParams;
              const code = urlParams.get('code');
              const flowIdFromUrl = urlParams.get('flowId');
              const storedFlowId = sessionStorage.getItem('asgardeo_flow_id');

              if (code && !flowIdFromUrl && !storedFlowId) {
                await signIn();
              }
            } else {
              await signIn({callOnlyOnRedirect: true});
            }
          } catch (error) {
            throw new AsgardeoRuntimeError(
              `Sign in failed: ${error instanceof Error ? error.message : String(JSON.stringify(error))}`,
              'asgardeo-signIn-Error',
              'vue',
              'An error occurred while trying to sign in.',
            );
          }
        }
      }

      // 4. Set up polling for sign-in status
      try {
        const status = await asgardeo.isSignedIn();
        isSignedIn.value = status;

        if (!status) {
          signInCheckInterval = setInterval(async () => {
            const newStatus = await asgardeo.isSignedIn();
            if (newStatus) {
              isSignedIn.value = true;
              if (signInCheckInterval) {
                clearInterval(signInCheckInterval);
                signInCheckInterval = undefined;
              }
            }
          }, 1000);
        }
      } catch {
        isSignedIn.value = false;
      }

      // 5. Set up polling for loading state
      loadingCheckInterval = setInterval(() => {
        if (isUpdatingSession) return;

        const currentUrl = new URL(window.location.href);
        if (!isSignedIn.value && hasAuthParams(currentUrl, props.afterSignInUrl)) return;

        isLoading.value = asgardeo.isLoading();
      }, 100);
    });

    onUnmounted(() => {
      if (signInCheckInterval) {
        clearInterval(signInCheckInterval);
      }
      if (loadingCheckInterval) {
        clearInterval(loadingCheckInterval);
      }
    });

    // ── Render ──
    return () =>
      h(I18nProvider, null, {
        default: () =>
          h(UserProvider, {
            profile: userProfile.value,
            flattenedProfile: flattenedProfile.value,
            schemas: schemas.value,
            revalidateProfile: async () => {
              const baseUrl = resolvedBaseUrl.value;
              try {
                const profileData: UserProfile = await asgardeo.getUserProfile({baseUrl});
                userProfile.value = profileData;
                flattenedProfile.value = profileData.flattenedProfile || null;
                schemas.value = profileData.schemas || [];
              } catch {
                // silent
              }
            },
          }, {
            default: () =>
              h(OrganizationProvider, {
                currentOrganization: currentOrganization.value,
                myOrganizations: myOrganizations.value,
                onOrganizationSwitch: switchOrganization,
                getAllOrganizations: () => asgardeo.getAllOrganizations({baseUrl: resolvedBaseUrl.value}),
                revalidateMyOrganizations: async () => {
                  const baseUrl = resolvedBaseUrl.value;
                  try {
                    const orgs: Organization[] = await asgardeo.getMyOrganizations({baseUrl});
                    myOrganizations.value = orgs || [];
                    return orgs || [];
                  } catch {
                    return [];
                  }
                },
              }, {
                default: () =>
                  h(ThemeProvider, null, {
                    default: () =>
                      h(BrandingProvider, null, {
                        default: () =>
                          h(FlowMetaProvider, null, {
                            default: () =>
                              h(FlowProvider, null, {
                                default: () => slots['default']?.(),
                              }),
                          }),
                      }),
                  }),
              }),
          }),
      });
  },
});

export default AsgardeoProvider;
