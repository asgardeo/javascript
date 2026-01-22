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
  generateFlattenedUserProfile,
  Organization,
  SignInOptions,
  User,
  UserProfile,
  getBrandingPreference,
  GetBrandingPreferenceConfig,
  BrandingPreference,
  IdToken,
  getActiveTheme,
  Platform,
  extractUserClaimsFromIdToken,
  EmbeddedSignInFlowResponseV2,
  TokenResponse,
} from '@asgardeo/browser';
import {FC, RefObject, PropsWithChildren, ReactElement, useEffect, useMemo, useRef, useState, useCallback} from 'react';
import AsgardeoContext from './AsgardeoContext';
import AsgardeoReactClient from '../../AsgardeoReactClient';
import useBrowserUrl from '../../hooks/useBrowserUrl';
import {AsgardeoReactConfig} from '../../models/config';
import BrandingProvider from '../Branding/BrandingProvider';
import FlowProvider from '../Flow/FlowProvider';
import I18nProvider from '../I18n/I18nProvider';
import OrganizationProvider from '../Organization/OrganizationProvider';
import ThemeProvider from '../Theme/ThemeProvider';
import UserProvider from '../User/UserProvider';

/**
 * Props interface of {@link AsgardeoProvider}
 */
export type AsgardeoProviderProps = AsgardeoReactConfig;

const AsgardeoProvider: FC<PropsWithChildren<AsgardeoProviderProps>> = ({
  afterSignInUrl = window.location.origin,
  afterSignOutUrl = window.location.origin,
  baseUrl: initialBaseUrl,
  clientId,
  children,
  scopes,
  preferences,
  signInUrl,
  signUpUrl,
  organizationHandle,
  applicationId,
  signInOptions,
  syncSession,
  instanceId = 0,
  ...rest
}: PropsWithChildren<AsgardeoProviderProps>): ReactElement => {
  const reRenderCheckRef: RefObject<boolean> = useRef(false);
  const asgardeo: AsgardeoReactClient = useMemo(() => new AsgardeoReactClient(instanceId), [instanceId]);
  const {hasAuthParams, hasCalledForThisInstance} = useBrowserUrl();
  const [user, setUser] = useState<any | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);

  const [isSignedInSync, setIsSignedInSync] = useState<boolean>(false);
  const [isInitializedSync, setIsInitializedSync] = useState<boolean>(false);
  const [isLoadingSync, setIsLoadingSync] = useState<boolean>(true);

  const [myOrganizations, setMyOrganizations] = useState<Organization[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>(initialBaseUrl);
  const [config, setConfig] = useState<AsgardeoReactConfig>({
    afterSignInUrl,
    afterSignOutUrl,
    applicationId,
    baseUrl,
    clientId,
    organizationHandle,
    scopes,
    signInOptions,
    signInUrl,
    signUpUrl,
    syncSession,
    ...rest,
  });

  const [isUpdatingSession, setIsUpdatingSession] = useState<boolean>(false);

  // Branding state
  const [brandingPreference, setBrandingPreference] = useState<BrandingPreference | null>(null);
  const [isBrandingLoading, setIsBrandingLoading] = useState<boolean>(false);
  const [brandingError, setBrandingError] = useState<Error | null>(null);
  const [hasFetchedBranding, setHasFetchedBranding] = useState<boolean>(false);

  useEffect(() => {
    setBaseUrl(initialBaseUrl);
    // Reset branding state when baseUrl changes
    if (initialBaseUrl !== baseUrl) {
      setHasFetchedBranding(false);
      setBrandingPreference(null);
      setBrandingError(null);
    }
  }, [initialBaseUrl, baseUrl]);

  useEffect(() => {
    (async (): Promise<void> => {
      await asgardeo.initialize(config);
      const initializedConfig: AsgardeoReactConfig = await asgardeo.getConfiguration();
      setConfig(initializedConfig);

      if (initializedConfig?.platform) {
        sessionStorage.setItem('asgardeo_platform', initializedConfig.platform);
      }
      if (initializedConfig?.baseUrl) {
        sessionStorage.setItem('asgardeo_base_url', initializedConfig.baseUrl);
      }
    })();
  }, []);

  async function updateSession(): Promise<void> {
    try {
      // Set flag to prevent loading state tracking from interfering
      setIsUpdatingSession(true);
      setIsLoadingSync(true);
      let resolvedBaseUrl: string = baseUrl;

      const decodedToken: IdToken = await asgardeo.getDecodedIdToken();

      // If there's a `user_org` claim in the ID token,
      // Treat this login as a organization login.
      if (decodedToken?.['user_org']) {
        resolvedBaseUrl = `${(await asgardeo.getConfiguration()).baseUrl}/o`;
        setBaseUrl(resolvedBaseUrl);
      }

      // TEMPORARY: Asgardeo V2 platform does not support SCIM2, Organizations endpoints yet.
      // Tracker: https://github.com/asgardeo/javascript/issues/212
      if (config.platform === Platform.AsgardeoV2) {
        const claims: Record<string, any> = extractUserClaimsFromIdToken(decodedToken);
        setUser(claims);
        setUserProfile({
          flattenedProfile: claims as User,
          profile: claims as User,
          schemas: [],
        });
      } else {
        try {
          const fetchedUser: User = await asgardeo.getUser({baseUrl: resolvedBaseUrl});
          setUser(fetchedUser);
        } catch (error) {
          // TODO: Add an error log.
        }

        try {
          const fetchedUserProfile: UserProfile = await asgardeo.getUserProfile({baseUrl: resolvedBaseUrl});
          setUserProfile(fetchedUserProfile);
        } catch (error) {
          // TODO: Add an error log.
        }

        try {
          const fetchedOrganization: Organization = await asgardeo.getCurrentOrganization();
          setCurrentOrganization(fetchedOrganization);
        } catch (error) {
          // TODO: Add an error log.
        }

        try {
          const fetchedMyOrganizations: Organization[] = await asgardeo.getMyOrganizations();
          setMyOrganizations(fetchedMyOrganizations);
        } catch (error) {
          // TODO: Add an error log.
        }
      }

      // CRITICAL: Update sign-in status BEFORE setting loading to false
      // This prevents the race condition where ProtectedRoute sees isLoading=false but isSignedIn=false
      const currentSignInStatus: boolean = await asgardeo.isSignedIn();
      setIsSignedInSync(currentSignInStatus);
    } catch (error) {
      // TODO: Add an error log.
    } finally {
      // Clear the flag and set final loading state
      setIsUpdatingSession(false);
      setIsLoadingSync(asgardeo.isLoading());
    }
  }

  async function signIn(...args: any): Promise<User | EmbeddedSignInFlowResponseV2> {
    // Check if this is a V2 embedded flow request BEFORE calling signIn
    // This allows us to skip session checks entirely for V2 flows
    const arg1: any = args[0];
    const isV2FlowRequest: boolean =
      config.platform === Platform.AsgardeoV2 &&
      typeof arg1 === 'object' &&
      arg1 !== null &&
      ('flowId' in arg1 || 'applicationId' in arg1);

    try {
      if (!isV2FlowRequest) {
        setIsUpdatingSession(true);
        setIsLoadingSync(true);
      }

      const response: User | EmbeddedSignInFlowResponseV2 = await asgardeo.signIn(...args);

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
        'react',
        'An error occurred while trying to sign in.',
      );
    } finally {
      if (!isV2FlowRequest) {
        setIsUpdatingSession(false);
        setIsLoadingSync(asgardeo.isLoading());
      }
    }
  }

  /**
   * Try signing in when the component is mounted.
   */
  useEffect(() => {
    // React 18.x Strict.Mode has a new check for `Ensuring reusable state` to facilitate an upcoming react feature.
    // https://reactjs.org/docs/strict-mode.html#ensuring-reusable-state
    // This will remount all the useEffects to ensure that there are no unexpected side effects.
    // When react remounts the signIn hook of the AuthProvider, it will cause a race condition. Hence, we have to
    // prevent the re-render of this hook as suggested in the following discussion.
    // https://github.com/reactwg/react-18/discussions/18#discussioncomment-795623
    if (reRenderCheckRef.current) {
      return;
    }

    reRenderCheckRef.current = true;

    (async (): Promise<void> => {
      // User is already authenticated. Skip...
      const isAlreadySignedIn: boolean = await asgardeo.isSignedIn();

      if (isAlreadySignedIn) {
        await updateSession();
        return;
      }

      const currentUrl: URL = new URL(window.location.href);
      const hasAuthParamsResult: boolean = hasAuthParams(currentUrl, afterSignInUrl) && hasCalledForThisInstance(currentUrl, instanceId ?? 1);

      const isV2Platform: boolean = config.platform === Platform.AsgardeoV2;

      if (hasAuthParamsResult) {
        try {
          if (isV2Platform) {
            // For V2 platform, check if this is an embedded flow or traditional OAuth
            const urlParams: URLSearchParams = currentUrl.searchParams;
            const code: string | null = urlParams.get('code');
            const flowIdFromUrl: string | null = urlParams.get('flowId');
            const storedFlowId: string | null = sessionStorage.getItem('asgardeo_flow_id');

            // If there's a code and no flowId, exchange OAuth code for tokens
            if (code && !flowIdFromUrl && !storedFlowId) {
              await signIn();
            }
          } else {
            // If non-V2 platform, use traditional OAuth callback handling
            await signIn(
              {callOnlyOnRedirect: true},
              // authParams?.authorizationCode,
              // authParams?.sessionState,
              // authParams?.state,
            );
          }
          // setError(null);
        } catch (error) {
          throw new AsgardeoRuntimeError(
            `Sign in failed: ${error instanceof Error ? error.message : String(JSON.stringify(error))}`,
            'asgardeo-signIn-Error',
            'react',
            'An error occurred while trying to sign in.',
          );
        }
      } else {
        // TODO: Add a debug log to indicate that the user is not signed in
      }
    })();
  }, []);

  /**
   * Check if the user is signed in and update the state accordingly.
   * This will also set an interval to check for the sign-in status every second
   * until the user is signed in.
   */
  useEffect(() => {
    let interval: NodeJS.Timeout;

    (async (): Promise<void> => {
      try {
        const status: boolean = await asgardeo.isSignedIn();

        setIsSignedInSync(status);

        if (!status) {
          interval = setInterval(async () => {
            const newStatus: boolean = await asgardeo.isSignedIn();

            if (newStatus) {
              setIsSignedInSync(true);
              clearInterval(interval);
            }
          }, 1000);
        } else {
          // TODO: Add a debug log to indicate that the user is already signed in.
        }
      } catch (error) {
        setIsSignedInSync(false);
      }
    })();

    return (): void => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [asgardeo]);

  useEffect(() => {
    (async (): Promise<void> => {
      try {
        const status: boolean = await asgardeo.isInitialized();

        setIsInitializedSync(status);
      } catch (error) {
        setIsInitializedSync(false);
      }
    })();
  }, [asgardeo]);

  /**
   * Track loading state changes from the Asgardeo client
   */
  useEffect(() => {
    const checkLoadingState = (): void => {
      // Don't override loading state during critical session updates
      if (isUpdatingSession) {
        return;
      }

      // Don't set loading=false while auth params are in the URL and user isn't signed in yet.
      // This prevents ProtectedRoute from redirecting before the sign-in effect processes the auth code.
      const currentUrl: URL = new URL(window.location.href);
      if (!isSignedInSync && hasAuthParams(currentUrl, afterSignInUrl)) {
        return;
      }

      setIsLoadingSync(asgardeo.isLoading());
    };

    // Initial check
    checkLoadingState();

    // Set up an interval to check for loading state changes
    const interval: NodeJS.Timeout = setInterval(checkLoadingState, 100);

    return (): void => {
      clearInterval(interval);
    };
  }, [asgardeo, isLoadingSync, isSignedInSync, isUpdatingSession]);

  // Branding fetch function
  const fetchBranding: () => Promise<void> = useCallback(async (): Promise<void> => {
    if (!baseUrl) {
      return;
    }

    // Prevent multiple calls if already fetching
    if (isBrandingLoading) {
      return;
    }

    setIsBrandingLoading(true);
    setBrandingError(null);

    try {
      const getBrandingConfig: GetBrandingPreferenceConfig = {
        baseUrl,
        locale: preferences?.i18n?.language,
        // Add other branding config options as needed
      };

      const brandingData: BrandingPreference = await getBrandingPreference(getBrandingConfig);
      setBrandingPreference(brandingData);
      setHasFetchedBranding(true);
    } catch (err) {
      const errorMessage: Error = err instanceof Error ? err : new Error('Failed to fetch branding preference');
      setBrandingError(errorMessage);
      setBrandingPreference(null);
      setHasFetchedBranding(true); // Mark as fetched even on error to prevent retries
    } finally {
      setIsBrandingLoading(false);
    }
  }, [baseUrl, preferences?.i18n?.language]);

  // Refetch branding function
  const refetchBranding: () => Promise<void> = useCallback(async (): Promise<void> => {
    setHasFetchedBranding(false); // Reset the flag to allow refetching
    await fetchBranding();
  }, [fetchBranding]);

  // Auto-fetch branding when initialized and configured
  useEffect(() => {
    // TEMPORARY: Asgardeo V2 platform does not support branding preference yet.
    // Tracker: https://github.com/asgardeo/javascript/issues/212
    if (config.platform === Platform.AsgardeoV2) {
      return;
    }

    // Enable branding by default or when explicitly enabled
    const shouldFetchBranding: boolean = preferences?.theme?.inheritFromBranding !== false;

    if (shouldFetchBranding && isInitializedSync && baseUrl && !hasFetchedBranding && !isBrandingLoading) {
      fetchBranding();
    }
  }, [
    preferences?.theme?.inheritFromBranding,
    isInitializedSync,
    baseUrl,
    hasFetchedBranding,
    isBrandingLoading,
    fetchBranding,
  ]);

  const signInSilently = async (options?: SignInOptions): Promise<User | boolean> => {
    try {
      setIsUpdatingSession(true);
      setIsLoadingSync(true);
      const response: User | boolean = await asgardeo.signInSilently(options);

      if (await asgardeo.isSignedIn()) {
        await updateSession();
      }

      return response;
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Error while signing in silently: ${error instanceof Error ? error.message : String(JSON.stringify(error))}`,
        'asgardeo-signInSilently-Error',
        'react',
        'An error occurred while trying to sign in silently.',
      );
    } finally {
      setIsUpdatingSession(false);
      setIsLoadingSync(asgardeo.isLoading());
    }
  };

  const switchOrganization = async (organization: Organization): Promise<TokenResponse | Response> => {
    try {
      setIsUpdatingSession(true);
      setIsLoadingSync(true);
      const response: TokenResponse | Response = await asgardeo.switchOrganization(organization);

      if (await asgardeo.isSignedIn()) {
        await updateSession();
      }

      return response;
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Failed to switch organization: ${error instanceof Error ? error.message : String(JSON.stringify(error))}`,
        'asgardeo-switchOrganization-Error',
        'react',
        'An error occurred while switching to the specified organization.',
      );
    } finally {
      setIsUpdatingSession(false);
      setIsLoadingSync(asgardeo.isLoading());
    }
  };

  const handleProfileUpdate = (payload: User): void => {
    setUser(payload);
    setUserProfile((prev: UserProfile | null) => ({
      ...prev,
      flattenedProfile: generateFlattenedUserProfile(payload, prev?.schemas),
      profile: payload,
    }));
  };

  const getDecodedIdToken: () => Promise<IdToken> = useCallback(
    async (): Promise<IdToken> => asgardeo.getDecodedIdToken(),
    [asgardeo],
  );

  const getIdToken: () => Promise<string> = useCallback(async (): Promise<string> => asgardeo.getIdToken(), [asgardeo]);

  const getAccessToken: () => Promise<string> = useCallback(
    async (): Promise<string> => asgardeo.getAccessToken(),
    [asgardeo],
  );

  const request: (...args: any[]) => Promise<any> = useCallback(
    async (...args: any[]): Promise<any> => asgardeo.request(...args),
    [asgardeo],
  );

  const requestAll: (...args: any[]) => Promise<any> = useCallback(
    async (...args: any[]): Promise<any> => asgardeo.requestAll(...args),
    [asgardeo],
  );

  const exchangeToken: (exchangeConfig: any) => Promise<any> = useCallback(
    async (exchangeConfig: any): Promise<any> => asgardeo.exchangeToken(exchangeConfig),
    [asgardeo],
  );

  const signOut: (...args: any[]) => Promise<any> = useCallback(
    async (...args: any[]): Promise<any> => asgardeo.signOut(...args),
    [asgardeo],
  );

  const signUp: (...args: any[]) => Promise<any> = useCallback(
    async (...args: any[]): Promise<any> => asgardeo.signUp(...args),
    [asgardeo],
  );

  const clearSession: (...args: any[]) => Promise<any> = useCallback(
    async (...args: any[]): Promise<any> => asgardeo.clearSession(...args),
    [asgardeo],
  );

  const reInitialize: (reInitConfig: any) => Promise<any> = useCallback(
    async (reInitConfig: any): Promise<any> => asgardeo.reInitialize(reInitConfig),
    [asgardeo],
  );

  const value: any = useMemo(
    () => ({
      afterSignInUrl,
      applicationId,
      baseUrl,
      clearSession,
      exchangeToken,
      getAccessToken,
      getDecodedIdToken,
      getIdToken,
      http: {
        request,
        requestAll,
      },
      isInitialized: isInitializedSync,
      isLoading: isLoadingSync,
      isSignedIn: isSignedInSync,
      organization: currentOrganization,
      organizationHandle: config?.organizationHandle,
      platform: config?.platform,
      reInitialize,
      signIn,
      signInOptions,
      signInSilently,
      signInUrl,
      signOut,
      signUp,
      signUpUrl,
      switchOrganization,
      syncSession,
      user,
    }),
    [
      applicationId,
      config?.organizationHandle,
      signInUrl,
      signUpUrl,
      afterSignInUrl,
      baseUrl,
      isInitializedSync,
      isLoadingSync,
      isSignedInSync,
      currentOrganization,
      signIn,
      signInSilently,
      user,
      asgardeo,
      signInOptions,
      syncSession,
      switchOrganization,
      getDecodedIdToken,
      getAccessToken,
      request,
      requestAll,
      exchangeToken,
      signOut,
      signUp,
      clearSession,
      reInitialize,
    ],
  );

  return (
    <AsgardeoContext.Provider value={value}>
      <I18nProvider preferences={preferences?.i18n}>
        <BrandingProvider
          brandingPreference={brandingPreference}
          isLoading={isBrandingLoading}
          error={brandingError}
          enabled={preferences?.theme?.inheritFromBranding !== false}
          refetch={refetchBranding}
        >
          <ThemeProvider
            inheritFromBranding={preferences?.theme?.inheritFromBranding}
            theme={{
              ...preferences?.theme?.overrides,
              direction: preferences?.theme?.direction,
            }}
            mode={getActiveTheme(preferences?.theme?.mode)}
          >
            <FlowProvider>
              <UserProvider profile={userProfile} onUpdateProfile={handleProfileUpdate}>
                <OrganizationProvider
                  getAllOrganizations={async (): Promise<AllOrganizationsApiResponse> => asgardeo.getAllOrganizations()}
                  myOrganizations={myOrganizations}
                  currentOrganization={currentOrganization}
                  onOrganizationSwitch={switchOrganization}
                  revalidateMyOrganizations={async (): Promise<Organization[]> => asgardeo.getMyOrganizations()}
                >
                  {children}
                </OrganizationProvider>
              </UserProvider>
            </FlowProvider>
          </ThemeProvider>
        </BrandingProvider>
      </I18nProvider>
    </AsgardeoContext.Provider>
  );
};

export default AsgardeoProvider;
