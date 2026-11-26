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
  AllOrganizationsApiResponse,
  AsgardeoRuntimeError,
  BrandingPreference,
  createOrganization as createOrganizationApi,
  CreateOrganizationPayload,
  UpdateMeProfileConfig,
  extractUserClaimsFromIdToken,
  getActiveTheme,
  getBrandingPreference,
  generateFlattenedUserProfile,
  hasAuthParamsInUrl,
  hasCalledForThisInstanceInUrl,
  HttpResponse,
  IdToken,
  Organization,
  Platform,
  Preferences,
  SignOutOptions,
  SignUpOptions,
  User,
  UserProfile,
  SignInOptions,
  TokenResponse,
  EmbeddedSignInFlowResponseV2,
} from '@asgardeo/browser';
import {
  type Component,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  provide,
  type Ref,
  ref,
  type SetupContext,
  type ShallowRef,
  shallowRef,
  type PropType,
  type VNode,
} from 'vue';
import BrandingProvider from './BrandingProvider';
import FlowMetaProvider from './FlowMetaProvider';
import FlowProvider from './FlowProvider';
import I18nProvider from './I18nProvider';
import OrganizationProvider from './OrganizationProvider';
import ThemeProvider from './ThemeProvider';
import UserProvider from './UserProvider';
import updateMeProfile from '../api/updateMeProfile';
import AsgardeoVueClient from '../AsgardeoVueClient';
import {ASGARDEO_KEY} from '../keys';
import type {AsgardeoVueConfig} from '../models/config';
import type {AsgardeoContext} from '../models/contexts';
import {registerAsgardeoContext} from '../router/contextRegistry';

interface AsgardeoProviderProps {
  afterSignInUrl: string;
  afterSignOutUrl: string;
  afterSignUpUrl: string | undefined;
  allowedExternalUrls: string[] | undefined;
  applicationId: string | undefined;
  baseUrl: string;
  clientId: string;
  instanceId: number;
  organizationChain: object | undefined;
  organizationHandle: string | undefined;
  platform: string | undefined;
  preferences: Preferences | undefined;
  scopes: string | string[] | undefined;
  signInOptions: SignInOptions | undefined;
  signInUrl: string | undefined;
  signOutOptions: SignOutOptions | undefined;
  signUpOptions: SignUpOptions | undefined;
  signUpUrl: string | undefined;
  storage: string | undefined;
  syncSession: boolean | undefined;
  tokenValidation: AsgardeoVueConfig['tokenValidation'] | undefined;
}

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
const AsgardeoProvider: Component = defineComponent({
  name: 'AsgardeoProvider',
  props: {
    /** The URL to redirect to after sign in. Defaults to `window.location.origin`. */
    afterSignInUrl: {
      default: () => window.location.origin,
      type: String,
    },
    /** The URL to redirect to after sign out. Defaults to `window.location.origin`. */
    afterSignOutUrl: {
      default: () => window.location.origin,
      type: String,
    },
    /** The URL to redirect to after sign up. */
    afterSignUpUrl: {
      default: undefined,
      type: String,
    },
    /**
     * External URLs (besides `baseUrl`) that `http.request()` may call with the access token, for the web worker
     * storage.
     */
    allowedExternalUrls: {
      default: undefined,
      type: Array as PropType<string[]>,
    },
    /** The Asgardeo application ID. */
    applicationId: {
      default: undefined,
      type: String,
    },
    /** The base URL of the Asgardeo tenant. */
    baseUrl: {
      required: true,
      type: String,
    },
    /** The OAuth2 client ID. */
    clientId: {
      required: true,
      type: String,
    },
    /** Instance ID for multi-instance support. */
    instanceId: {
      default: 0,
      type: Number,
    },
    /** Organization chain config. */
    organizationChain: {
      default: undefined,
      type: Object,
    },
    /** The organization handle. */
    organizationHandle: {
      default: undefined,
      type: String,
    },
    /** Platform type. */
    platform: {
      default: undefined,
      type: String,
    },
    /** UI preferences: theme, i18n and which user data to fetch. */
    preferences: {
      default: undefined,
      type: Object as PropType<Preferences>,
    },
    /** The scopes to request, as an array or a space-separated string. */
    scopes: {
      default: undefined,
      type: [Array, String] as PropType<string | string[]>,
    },
    /** Additional sign-in options. */
    signInOptions: {
      default: undefined,
      type: Object as PropType<SignInOptions>,
    },
    /** The sign-in URL. */
    signInUrl: {
      default: undefined,
      type: String,
    },
    /** Additional sign-out options. */
    signOutOptions: {
      default: undefined,
      type: Object as PropType<SignOutOptions>,
    },
    /** Additional sign-up options. */
    signUpOptions: {
      default: undefined,
      type: Object as PropType<SignUpOptions>,
    },
    /** The sign-up URL. */
    signUpUrl: {
      default: undefined,
      type: String,
    },
    /** Storage type. */
    storage: {
      default: undefined,
      type: String,
    },
    /** Whether to sync sessions across tabs. */
    syncSession: {
      default: undefined,
      type: Boolean,
    },
    /** ID token validation settings. */
    tokenValidation: {
      default: undefined,
      type: Object as PropType<AsgardeoVueConfig['tokenValidation']>,
    },
  },
  setup(props: AsgardeoProviderProps, {slots}: SetupContext): () => VNode {
    // ── Client ──
    const asgardeo: AsgardeoVueClient = new AsgardeoVueClient(props.instanceId);

    // ── Reactive State ──
    const isSignedIn: Ref<boolean> = ref<boolean>(false);
    const isInitialized: Ref<boolean> = ref<boolean>(false);
    const isLoading: Ref<boolean> = ref<boolean>(true);
    const user: ShallowRef<any | null> = shallowRef<any | null>(null);
    const currentOrganization: ShallowRef<Organization | null> = shallowRef<Organization | null>(null);
    const myOrganizations: ShallowRef<Organization[]> = shallowRef<Organization[]>([]);
    const userProfile: ShallowRef<UserProfile | null> = shallowRef<UserProfile | null>(null);
    const resolvedBaseUrl: Ref<string> = ref<string>(props.baseUrl);

    let isUpdatingSession: boolean = false;
    let signInCheckInterval: ReturnType<typeof setInterval> | undefined;
    let loadingCheckInterval: ReturnType<typeof setInterval> | undefined;

    // ── Build config from props ──
    function buildConfig(): AsgardeoVueConfig {
      return {
        afterSignInUrl: props.afterSignInUrl,
        afterSignOutUrl: props.afterSignOutUrl,
        afterSignUpUrl: props.afterSignUpUrl,
        allowedExternalUrls: props.allowedExternalUrls,
        applicationId: props.applicationId,
        baseUrl: props.baseUrl,
        clientId: props.clientId,
        organizationChain: props.organizationChain,
        organizationHandle: props.organizationHandle,
        platform: props.platform,
        preferences: props.preferences,
        scopes: props.scopes,
        signInOptions: props.signInOptions,
        signInUrl: props.signInUrl,
        signOutOptions: props.signOutOptions,
        signUpOptions: props.signUpOptions,
        signUpUrl: props.signUpUrl,
        storage: props.storage,
        syncSession: props.syncSession,
        tokenValidation: props.tokenValidation,
      } as AsgardeoVueConfig;
    }

    // ── Session Update ──
    async function updateSession(): Promise<void> {
      try {
        isUpdatingSession = true;
        isLoading.value = true;
        let baseUrl: string = resolvedBaseUrl.value;

        const decodedToken: IdToken = await asgardeo.getDecodedIdToken();

        if (decodedToken?.['user_org']) {
          baseUrl = `${(await asgardeo.getConfiguration()).baseUrl}/o`;
          resolvedBaseUrl.value = baseUrl;
        }

        const config: AsgardeoVueConfig = buildConfig();

        if (config.platform === Platform.AsgardeoV2) {
          const claims: User = extractUserClaimsFromIdToken(decodedToken);
          user.value = claims;
          const profileData: UserProfile = {
            flattenedProfile: claims,
            profile: claims,
            schemas: [],
          };
          userProfile.value = profileData;
        } else {
          try {
            const fetchedUser: User = await asgardeo.getUser({baseUrl});
            user.value = fetchedUser;
          } catch {
            // silent
          }

          // `preferences.user` can turn off the organization and profile requests, as in the React SDK.
          if (props.preferences?.user?.fetchOrganizations !== false) {
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
          }

          // Fetch user profile details for profile components
          if (props.preferences?.user?.fetchUserProfile !== false) {
            try {
              const profileData: UserProfile = await asgardeo.getUserProfile({baseUrl});
              userProfile.value = profileData;
            } catch {
              // silent
            }
          }
        }

        const currentSignInStatus: boolean = await asgardeo.isSignedIn();
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
      const arg1: any = args[0];
      const config: AsgardeoVueConfig = buildConfig();
      const isV2FlowRequest: boolean =
        config.platform === Platform.AsgardeoV2 &&
        typeof arg1 === 'object' &&
        arg1 !== null &&
        ('executionId' in arg1 || 'applicationId' in arg1);

      try {
        if (!isV2FlowRequest) {
          isUpdatingSession = true;
          isLoading.value = true;
        }

        const response: User | EmbeddedSignInFlowResponseV2 = await asgardeo.signIn(...args);

        if (isV2FlowRequest || (response && typeof response === 'object' && 'flowStatus' in response)) {
          return response;
        }

        if (await asgardeo.isSignedIn()) {
          await updateSession();
        }

        return response;
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
        const response: User | boolean = await asgardeo.signInSilently(options);

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
        const response: TokenResponse | Response = await asgardeo.switchOrganization(organization);

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
      clearSession: async (...args: any[]): Promise<void> => {
        await asgardeo.clearSession(...args);
      },
      clientId: props.clientId,
      exchangeToken: (config: any): Promise<TokenResponse | Response> => asgardeo.exchangeToken(config),
      getAccessToken: (): Promise<string> => asgardeo.getAccessToken(),
      getDecodedIdToken: (): Promise<IdToken> => asgardeo.getDecodedIdToken(),
      getIdToken: (): Promise<string> => asgardeo.getIdToken(),
      http: {
        request: (requestConfig?: any): Promise<HttpResponse<any>> => asgardeo.request(requestConfig),
        requestAll: (requestConfigs?: any[]): Promise<HttpResponse<any>[]> => asgardeo.requestAll(requestConfigs),
      },
      instanceId: props.instanceId,
      isInitialized,
      isLoading,
      isSignedIn,
      organization: currentOrganization,
      organizationHandle: props.organizationHandle,
      platform: props.platform as AsgardeoVueConfig['platform'],
      reInitialize: async (config: any): Promise<boolean> => {
        const result: boolean = await asgardeo.reInitialize(config);
        return typeof result === 'boolean' ? result : true;
      },
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

    // ── Branding ──
    // Fetched only when `preferences.theme.inheritFromBranding` is true, as in the React SDK. Not supported on
    // AsgardeoV2 yet.
    const brandingPreference: ShallowRef<BrandingPreference | null> = shallowRef<BrandingPreference | null>(null);
    const isBrandingLoading: Ref<boolean> = ref<boolean>(false);
    const brandingError: ShallowRef<Error | null> = shallowRef<Error | null>(null);

    const fetchBranding = async (): Promise<void> => {
      if (!resolvedBaseUrl.value || isBrandingLoading.value) {
        return;
      }

      isBrandingLoading.value = true;
      brandingError.value = null;

      try {
        brandingPreference.value = await getBrandingPreference({
          baseUrl: resolvedBaseUrl.value,
          locale: props.preferences?.i18n?.language,
        });
      } catch (error: unknown) {
        brandingError.value = error instanceof Error ? error : new Error('Failed to fetch branding preference');
        brandingPreference.value = null;
      } finally {
        isBrandingLoading.value = false;
      }
    };

    const shouldFetchBranding = (): boolean =>
      props.preferences?.theme?.inheritFromBranding === true && props.platform !== Platform.AsgardeoV2;

    // Keeps the user and the profile in sync after the profile is saved.
    const applyUpdatedUser = (updatedUser: User): void => {
      user.value = updatedUser;
      userProfile.value = {
        flattenedProfile: generateFlattenedUserProfile(updatedUser, userProfile.value?.schemas),
        profile: updatedUser,
        schemas: userProfile.value?.schemas ?? [],
      };
    };

    // Backs `useUser().updateProfile()`: saves the profile through SCIM2 and updates the user.
    const updateProfile = async (
      requestConfig: UpdateMeProfileConfig,
    ): Promise<{data: {user: User}; error: string; success: boolean}> => {
      try {
        const updatedUser: User = await updateMeProfile({
          ...requestConfig,
          baseUrl: requestConfig.baseUrl || resolvedBaseUrl.value,
          instanceId: props.instanceId,
        });

        applyUpdatedUser(updatedUser);

        return {data: {user: updatedUser}, error: '', success: true};
      } catch (error: unknown) {
        return {
          data: {user: {} as User},
          error: error instanceof Error ? error.message : 'Failed to update the user profile',
          success: false,
        };
      }
    };

    provide(ASGARDEO_KEY, context);

    // Router guards can't inject component-level context, so make it available to createAsgardeoGuard() too.
    const unregisterContext: () => void = registerAsgardeoContext(context);
    onUnmounted(unregisterContext);

    // ── Lifecycle ──
    onMounted(async (): Promise<void> => {
      // 1. Initialize the client
      const config: AsgardeoVueConfig = buildConfig();
      await asgardeo.initialize(config);

      const initializedConfig: any = asgardeo.getConfiguration();

      if (initializedConfig?.platform) {
        sessionStorage.setItem('asgardeo_platform', initializedConfig.platform);
      }
      if (initializedConfig?.baseUrl) {
        sessionStorage.setItem('asgardeo_base_url', initializedConfig.baseUrl);
      }

      // Load the branding preference for the theme, without waiting for it.
      if (shouldFetchBranding()) {
        fetchBranding();
      }

      // 2. Check initialization status
      try {
        const status: boolean = await asgardeo.isInitialized();
        isInitialized.value = status;
      } catch {
        isInitialized.value = false;
      }

      // 3. Try to sign in if already authenticated or if URL has auth params
      const alreadySignedIn: boolean = await asgardeo.isSignedIn();

      if (alreadySignedIn) {
        await updateSession();
      } else {
        const currentUrl: URL = new URL(window.location.href);
        const hasParams: boolean =
          hasAuthParams(currentUrl, props.afterSignInUrl) &&
          hasCalledForThisInstanceInUrl(props.instanceId ?? 0, currentUrl.search);

        if (hasParams) {
          try {
            const isV2Platform: boolean = config.platform === Platform.AsgardeoV2;

            if (isV2Platform) {
              const urlParams: URLSearchParams = currentUrl.searchParams;
              const code: string | null = urlParams.get('code');
              const executionIdFromUrl: string | null = urlParams.get('executionId');
              const storedExecutionId: string | null = sessionStorage.getItem('asgardeo_execution_id');

              if (code && !executionIdFromUrl && !storedExecutionId) {
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
        const status: boolean = await asgardeo.isSignedIn();
        isSignedIn.value = status;

        if (!status) {
          signInCheckInterval = setInterval(async (): Promise<void> => {
            const newStatus: boolean = await asgardeo.isSignedIn();
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
      loadingCheckInterval = setInterval((): void => {
        if (isUpdatingSession) return;

        const currentUrl: URL = new URL(window.location.href);
        if (!isSignedIn.value && hasAuthParams(currentUrl, props.afterSignInUrl)) return;

        isLoading.value = asgardeo.isLoading();
      }, 100);
    });

    onUnmounted((): void => {
      if (signInCheckInterval) {
        clearInterval(signInCheckInterval);
      }
      if (loadingCheckInterval) {
        clearInterval(loadingCheckInterval);
      }
    });

    // ── Render ──
    return (): any =>
      h(
        I18nProvider,
        {preferences: props.preferences?.i18n},
        {
          default: (): any =>
            h(
              FlowMetaProvider,
              {enabled: props.platform === Platform.AsgardeoV2},
              {
                default: (): any =>
                  h(
                    BrandingProvider,
                    {
                      brandingPreference: brandingPreference.value,
                      enabled: shouldFetchBranding(),
                      error: brandingError.value,
                      isLoading: isBrandingLoading.value,
                      refetch: fetchBranding,
                    },
                    {
                      default: (): any =>
                        h(
                          ThemeProvider,
                          {
                            inheritFromBranding: props.preferences?.theme?.inheritFromBranding,
                            mode: getActiveTheme(props.preferences?.theme?.mode),
                            theme: {
                              ...props.preferences?.theme?.overrides,
                              direction: props.preferences?.theme?.direction,
                            },
                          },
                          {
                            default: (): any =>
                              h(FlowProvider, null, {
                                default: (): any =>
                                  h(
                                    UserProvider,
                                    {
                                      onUpdateProfile: applyUpdatedUser,
                                      profile: userProfile.value,
                                      updateProfile: updateProfile,
                                      revalidateProfile: async (): Promise<void> => {
                                        const revalConfig: AsgardeoVueConfig = buildConfig();
                                        if (revalConfig.platform === Platform.AsgardeoV2) {
                                          try {
                                            const decodedToken: IdToken = await asgardeo.getDecodedIdToken();
                                            const claims: User = extractUserClaimsFromIdToken(decodedToken);
                                            user.value = claims;
                                            userProfile.value = {
                                              flattenedProfile: claims,
                                              profile: claims,
                                              schemas: [],
                                            };
                                          } catch {
                                            // silent
                                          }
                                          return;
                                        }
                                        try {
                                          const profileData: UserProfile = await asgardeo.getUserProfile({
                                            baseUrl: resolvedBaseUrl.value,
                                          });
                                          userProfile.value = profileData;
                                        } catch {
                                          // silent
                                        }
                                      },
                                    },
                                    {
                                      default: (): any =>
                                        h(
                                          OrganizationProvider,
                                          {
                                            createOrganization: async (
                                              payload: CreateOrganizationPayload,
                                            ): Promise<Organization> => {
                                              // Send the request through the SDK's HTTP client, so it carries the access token.
                                              const fetcher = async (
                                                url: string,
                                                config: RequestInit,
                                              ): Promise<Response> => {
                                                const response: HttpResponse<any> = await asgardeo.request({
                                                  data: config.body ? JSON.parse(config.body as string) : undefined,
                                                  headers: config.headers as Record<string, string>,
                                                  method: config.method || 'POST',
                                                  url,
                                                });

                                                return {
                                                  json: () => Promise.resolve(response.data),
                                                  ok: response.status >= 200 && response.status < 300,
                                                  status: response.status,
                                                  statusText: response.statusText || '',
                                                  text: () =>
                                                    Promise.resolve(
                                                      typeof response.data === 'string'
                                                        ? response.data
                                                        : JSON.stringify(response.data),
                                                    ),
                                                } as Response;
                                              };

                                              const organization: Organization = await createOrganizationApi({
                                                baseUrl: resolvedBaseUrl.value,
                                                fetcher,
                                                payload: {
                                                  ...payload,
                                                  // Create the organization under the current one unless a parent is given.
                                                  parentId: payload.parentId || currentOrganization.value?.id || '',
                                                },
                                              });

                                              try {
                                                myOrganizations.value =
                                                  (await asgardeo.getMyOrganizations({
                                                    baseUrl: resolvedBaseUrl.value,
                                                  })) || [];
                                              } catch {
                                                // The organization was created; a failed list refresh shouldn't hide that.
                                              }

                                              return organization;
                                            },
                                            currentOrganization: currentOrganization.value,
                                            getAllOrganizations: async (): Promise<AllOrganizationsApiResponse> =>
                                              asgardeo.getAllOrganizations({baseUrl: resolvedBaseUrl.value}),
                                            myOrganizations: myOrganizations.value,
                                            onOrganizationSwitch: switchOrganization,
                                            revalidateMyOrganizations: async (): Promise<Organization[]> => {
                                              const baseUrl: string = resolvedBaseUrl.value;
                                              try {
                                                const orgs: Organization[] = await asgardeo.getMyOrganizations({
                                                  baseUrl,
                                                });
                                                myOrganizations.value = orgs || [];
                                                return orgs || [];
                                              } catch {
                                                return [];
                                              }
                                            },
                                          },
                                          {
                                            default: (): any => slots['default']?.(),
                                          },
                                        ),
                                    },
                                  ),
                              }),
                          },
                        ),
                    },
                  ),
              },
            ),
        },
      );
  },
});

export default AsgardeoProvider;
