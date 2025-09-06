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
  generateFlattenedUserProfile,
  Organization,
  SignInOptions,
  User,
  UserProfile,
  getBrandingPreference,
  GetBrandingPreferenceConfig,
  BrandingPreference,
  IdToken,
} from '@asgardeo/browser';
import {FC, RefObject, PropsWithChildren, ReactElement, useEffect, useMemo, useRef, useState, useCallback} from 'react';
import AsgardeoContext from './AsgardeoContext';
import AsgardeoReactClient from '../../AsgardeoReactClient';
import useBrowserUrl from '../../hooks/useBrowserUrl';
import {AsgardeoReactConfig} from '../../models/config';
import FlowProvider from '../Flow/FlowProvider';
import I18nProvider from '../I18n/I18nProvider';
import OrganizationProvider from '../Organization/OrganizationProvider';
import ThemeProvider from '../Theme/ThemeProvider';
import BrandingProvider from '../Branding/BrandingProvider';
import UserProvider from '../User/UserProvider';

/**
 * Props interface of {@link AsgardeoProvider}
 */
export type AsgardeoProviderProps = AsgardeoReactConfig;

const AsgardeoProvider: FC<PropsWithChildren<AsgardeoProviderProps>> = ({
  afterSignInUrl = window.location.origin,
  afterSignOutUrl = window.location.origin,
  baseUrl: originalBaseUrl,
  clientId,
  children,
  scopes,
  preferences,
  signInUrl,
  signUpUrl,
  organizationHandle,
  rootOrganizationHandle,
  applicationId,
  signInOptions,
  syncSession,
  organizationDiscovery,
  ...rest
}: PropsWithChildren<AsgardeoProviderProps>): ReactElement => {
  const reRenderCheckRef: RefObject<boolean> = useRef(false);
  const reInitializeCheckRef: RefObject<boolean> = useRef(false);
  const asgardeo: AsgardeoReactClient = useMemo(() => new AsgardeoReactClient(), []);
  const {hasAuthParams} = useBrowserUrl();
  const [user, setUser] = useState<any | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);

  const [isSignedInSync, setIsSignedInSync] = useState<boolean>(false);
  const [isInitializedSync, setIsInitializedSync] = useState<boolean>(false);
  const [isLoadingSync, setIsLoadingSync] = useState<boolean>(true);

  const [myOrganizations, setMyOrganizations] = useState<Organization[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>(originalBaseUrl);
  const [config, setConfig] = useState<AsgardeoReactConfig>({
    applicationId,
    organizationHandle,
    rootOrganizationHandle,
    organizationDiscovery,
    afterSignInUrl,
    afterSignOutUrl,
    baseUrl,
    clientId,
    scopes,
    signUpUrl,
    signInUrl,
    signInOptions,
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
    setBaseUrl(originalBaseUrl);
    // Reset branding state when baseUrl changes
    if (originalBaseUrl !== baseUrl) {
      setHasFetchedBranding(false);
      setBrandingPreference(null);
      setBrandingError(null);
    }
  }, [originalBaseUrl, baseUrl]);

  useEffect(() => {
    // React 18.x Strict.Mode has a new check for `Ensuring reusable state` to facilitate an upcoming react feature.
    // https://reactjs.org/docs/strict-mode.html#ensuring-reusable-state
    // This will remount all the useEffects to ensure that there are no unexpected side effects.
    // When react remounts the signIn hook of the AuthProvider, it will cause a race condition. Hence, we have to
    // prevent the re-render of this hook as suggested in the following discussion.
    // https://github.com/reactwg/react-18/discussions/18#discussioncomment-795623
    if (reInitializeCheckRef.current) {
      return;
    }

    reInitializeCheckRef.current = true;

    (async (): Promise<void> => {
      await asgardeo.initialize(config);
      setConfig(await asgardeo.getConfiguration());
    })();
  }, []);

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
      const hasAuthParamsResult: boolean = hasAuthParams(currentUrl, afterSignInUrl);

      if (hasAuthParamsResult) {
        try {
          await signIn(
            {callOnlyOnRedirect: true},
            // authParams?.authorizationCode,
            // authParams?.sessionState,
            // authParams?.state,
          );
          // setError(null);
        } catch (error) {
          if (error && Object.prototype.hasOwnProperty.call(error, 'code')) {
            // setError(error);
          }
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
    let interval: NodeJS.Timeout;

    const checkInitializedState = async (): Promise<void> => {
      try {
        const status: boolean = await asgardeo.isInitialized();

        setIsInitializedSync(status);

        // If initialized, clear the interval
        if (status && interval) {
          clearInterval(interval);
        }
      } catch (error) {
        setIsInitializedSync(false);
      }
    };

    // Initial check
    checkInitializedState();

    // Set up an interval to check for initialization status changes
    interval = setInterval(checkInitializedState, 100);

    return (): void => {
      if (interval) {
        clearInterval(interval);
      }
    };
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

      setIsLoadingSync(asgardeo.isLoading());
    };

    // Initial check
    checkLoadingState();

    // Set up an interval to check for loading state changes
    const interval = setInterval(checkLoadingState, 100);

    return (): void => {
      clearInterval(interval);
    };
  }, [asgardeo, isLoadingSync, isSignedInSync, isUpdatingSession]);

  const updateSession = async (): Promise<void> => {
    try {
      // Set flag to prevent loading state tracking from interfering
      setIsUpdatingSession(true);
      setIsLoadingSync(true);
      let _baseUrl: string = baseUrl;

      const decodedToken: IdToken = await asgardeo.getDecodedIdToken();

      // If there's a `user_org` claim in the ID token,
      // Treat this login as a organization login.
      if (decodedToken?.['user_org']) {
        _baseUrl = `${(await asgardeo.getConfiguration()).baseUrl}/o`;
        setBaseUrl(_baseUrl);
      }

      const user: User = await asgardeo.getUser({baseUrl: _baseUrl});
      const userProfile: UserProfile = await asgardeo.getUserProfile({baseUrl: _baseUrl});
      const currentOrganization: Organization = await asgardeo.getCurrentOrganization();
      const myOrganizations: Organization[] = await asgardeo.getMyOrganizations();

      // Update user data first
      setUser(user);
      setUserProfile(userProfile);
      setCurrentOrganization(currentOrganization);
      setMyOrganizations(myOrganizations);

      // CRITICAL: Update sign-in status BEFORE setting loading to false
      // This prevents the race condition where ProtectedRoute sees isLoading=false but isSignedIn=false
      const currentSignInStatus = await asgardeo.isSignedIn();
      setIsSignedInSync(await asgardeo.isSignedIn());
    } catch (error) {
      // TODO: Add an error log.
    } finally {
      // Clear the flag and set final loading state
      setIsUpdatingSession(false);
      setIsLoadingSync(asgardeo.isLoading());
    }
  };

  // Branding fetch function
  const fetchBranding = useCallback(async (): Promise<void> => {
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
      // Transform base URL if organization discovery is enabled
      let transformedBaseUrl = baseUrl;

      if (config?.organizationDiscovery && config?.organizationDiscovery.enabled && config?.organizationHandle) {
        // Transform from https://localhost:9443/t/{tenant} to https://localhost:9443/o/{orgHandle}
        transformedBaseUrl = baseUrl.replace(/\/t\/[^\/]+/, `/o/${config.organizationHandle}`);
      }

      const getBrandingConfig: GetBrandingPreferenceConfig = {
        baseUrl: transformedBaseUrl,
        locale: preferences?.i18n?.language,
        name: config?.applicationId || config?.organizationHandle || config?.rootOrganizationHandle,
        type: config.applicationId ? 'APP' : 'ORG',
      };

      const brandingData = await getBrandingPreference(getBrandingConfig);
      setBrandingPreference(brandingData);
      setHasFetchedBranding(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Failed to fetch branding preference');
      setBrandingError(errorMessage);
      setBrandingPreference(null);
      setHasFetchedBranding(true); // Mark as fetched even on error to prevent retries
    } finally {
      setIsBrandingLoading(false);
    }
  }, [baseUrl, preferences?.i18n?.language, config?.organizationHandle, config?.rootOrganizationHandle]);

  // Refetch branding function
  const refetchBranding = useCallback(async (): Promise<void> => {
    setHasFetchedBranding(false); // Reset the flag to allow refetching
    await fetchBranding();
  }, [fetchBranding]);

  // Auto-fetch branding when initialized and configured
  useEffect(() => {
    // Enable branding by default or when explicitly enabled
    const shouldFetchBranding = preferences?.theme?.inheritFromBranding !== false;

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
    config?.organizationHandle,
    config?.rootOrganizationHandle,
  ]);

  const signIn = async (...args: any): Promise<User> => {
    try {
      setIsUpdatingSession(true);
      setIsLoadingSync(true);
      const response: User = await asgardeo.signIn(...args);

      if (await asgardeo.isSignedIn()) {
        await updateSession();
      }

      return response;
    } catch (error) {
      throw new Error(`Error while signing in: ${error}`);
    } finally {
      setIsUpdatingSession(false);
      setIsLoadingSync(asgardeo.isLoading());
    }
  };

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
        `Error while signing in silently: ${error.message || error}`,
        'asgardeo-signInSilently-Error',
        'react',
        'An error occurred while trying to sign in silently.',
      );
    } finally {
      setIsUpdatingSession(false);
      setIsLoadingSync(asgardeo.isLoading());
    }
  };

  const switchOrganization = async (organization: Organization): Promise<void> => {
    try {
      setIsUpdatingSession(true);
      setIsLoadingSync(true);
      await asgardeo.switchOrganization(organization);

      if (await asgardeo.isSignedIn()) {
        await updateSession();
      }
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Failed to switch organization: ${error.message || error}`,
        'asgardeo-switchOrganization-Error',
        'react',
        'An error occurred while switching to the specified organization.',
      );
    } finally {
      setIsUpdatingSession(false);
      setIsLoadingSync(asgardeo.isLoading());
    }
  };

  const isDarkMode: boolean = useMemo(() => {
    if (!preferences?.theme?.mode || preferences.theme.mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return preferences.theme.mode === 'dark';
  }, [preferences?.theme?.mode]);

  const handleProfileUpdate = (payload: User): void => {
    setUser(payload);
    setUserProfile(prev => ({
      ...prev,
      profile: payload,
      flattenedProfile: generateFlattenedUserProfile(payload, prev?.schemas),
    }));
  };

  const value = useMemo(
    () => ({
      applicationId: config?.applicationId,
      rootOrganizationHandle: config?.rootOrganizationHandle,
      organizationHandle: config?.organizationHandle,
      signInUrl: config?.signInUrl,
      signUpUrl: config?.signUpUrl,
      afterSignInUrl: config?.afterSignInUrl,
      baseUrl,
      getAccessToken: asgardeo.getAccessToken.bind(asgardeo),
      isInitialized: isInitializedSync,
      isLoading: isLoadingSync,
      isSignedIn: isSignedInSync,
      organization: currentOrganization,
      organizationDiscovery: config?.organizationDiscovery,
      signIn,
      signInSilently,
      signOut: asgardeo.signOut.bind(asgardeo),
      signUp: asgardeo.signUp.bind(asgardeo),
      user,
      http: {
        request: asgardeo.request.bind(asgardeo),
        requestAll: asgardeo.requestAll.bind(asgardeo),
      },
      signInOptions,
      getDecodedIdToken: asgardeo.getDecodedIdToken.bind(asgardeo),
      exchangeToken: asgardeo.exchangeToken.bind(asgardeo),
      syncSession,
    }),
    [
      config,
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
            theme={preferences?.theme?.overrides}
            mode={isDarkMode ? 'dark' : 'light'}
          >
            <FlowProvider>
              <UserProvider profile={userProfile} onUpdateProfile={handleProfileUpdate}>
                <OrganizationProvider
                  getAllOrganizations={async () => await asgardeo.getAllOrganizations()}
                  myOrganizations={myOrganizations}
                  currentOrganization={currentOrganization}
                  onOrganizationSwitch={switchOrganization}
                  revalidateMyOrganizations={async () => await asgardeo.getMyOrganizations()}
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
