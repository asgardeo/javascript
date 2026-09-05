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

'use client';

import {
  AllOrganizationsApiResponse,
  EmbeddedFlowExecuteRequestConfig,
  EmbeddedFlowExecuteRequestPayload,
  EmbeddedSignInFlowHandleRequestPayload,
  generateFlattenedUserProfile,
  Organization,
  UpdateMeProfileConfig,
  User,
  UserProfile,
  BrandingPreference,
  TokenResponse,
  CreateOrganizationPayload,
  AsgardeoRuntimeError,
  EmbeddedFlowStatus,
  HttpRequestConfig,
  HttpResponse,
} from '@asgardeo/node';
import {
  I18nProvider,
  FlowProvider,
  UserProvider,
  ThemeProvider,
  AsgardeoProviderProps,
  OrganizationProvider,
  BrandingProvider,
  getActiveTheme,
} from '@asgardeo/react';
import {ReadonlyURLSearchParams} from 'next/dist/client/components/navigation.react-server';
import {AppRouterInstance} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import {useRouter, useSearchParams} from 'next/navigation';
import {FC, PropsWithChildren, RefObject, useEffect, useMemo, useRef, useState} from 'react';
import AsgardeoContext, {AsgardeoContextProps} from './AsgardeoContext';
import {HttpRequestActionResult} from '../../../server/actions/httpRequestAction';
import {RefreshResult} from '../../../server/actions/refreshToken';
import logger from '../../../utils/logger';
import navigateTo from '../../../utils/navigateTo';

/**
 * Props interface of {@link AsgardeoClientProvider}
 */
export type AsgardeoClientProviderProps = Partial<Omit<AsgardeoProviderProps, 'baseUrl' | 'clientId'>> &
  Pick<AsgardeoProviderProps, 'baseUrl' | 'clientId'> & {
    afterSignInUrl?: string;
    applicationId: AsgardeoContextProps['applicationId'];
    brandingPreference?: BrandingPreference | null;
    clearSession: () => Promise<void>;
    createOrganization: (payload: CreateOrganizationPayload, sessionId: string) => Promise<Organization>;
    currentOrganization: Organization;
    getAllOrganizations: (options?: any, sessionId?: string) => Promise<AllOrganizationsApiResponse>;
    handleOAuthCallback: (
      code: string,
      state: string,
      sessionState?: string,
    ) => Promise<{error?: string; redirectUrl?: string; success: boolean}>;
    httpRequest?: (requestConfig: HttpRequestConfig) => Promise<HttpRequestActionResult>;
    isSignedIn: boolean;
    myOrganizations: Organization[];
    organizationHandle: AsgardeoContextProps['organizationHandle'];
    refreshToken: () => Promise<RefreshResult>;
    revalidateMyOrganizations?: (sessionId?: string) => Promise<Organization[]>;
    signIn: AsgardeoContextProps['signIn'];
    signOut: AsgardeoContextProps['signOut'];
    signUp: AsgardeoContextProps['signUp'];
    switchOrganization: (organization: Organization, sessionId?: string) => Promise<TokenResponse | Response>;
    updateProfile: (
      requestConfig: UpdateMeProfileConfig,
      sessionId?: string,
    ) => Promise<{data: {user: User}; error: string; success: boolean}>;
    user: User | null;
    userProfile: UserProfile;
  };

const AsgardeoClientProvider: FC<PropsWithChildren<AsgardeoClientProviderProps>> = ({
  baseUrl,
  children,
  signIn,
  clearSession,
  refreshToken,
  signOut,
  signUp,
  handleOAuthCallback,
  createOrganization,
  preferences,
  isSignedIn,
  signInUrl,
  signUpUrl,
  user: _user,
  userProfile: _userProfile,
  currentOrganization,
  updateProfile,
  applicationId,
  organizationHandle,
  myOrganizations,
  revalidateMyOrganizations,
  getAllOrganizations,
  switchOrganization,
  brandingPreference,
  afterSignInUrl,
  httpRequest,
}: PropsWithChildren<AsgardeoClientProviderProps>) => {
  const reRenderCheckRef: RefObject<boolean> = useRef(false);
  const router: AppRouterInstance = useRouter();
  const searchParams: ReadonlyURLSearchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(_user);
  const [userProfile, setUserProfile] = useState<UserProfile>(_userProfile);

  useEffect(() => {
    setUserProfile(_userProfile);
  }, [_userProfile]);

  useEffect(() => {
    setUser(_user);
  }, [_user]);

  // Handle OAuth callback automatically
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

    // Don't handle callback if already signed in
    if (isSignedIn) return;

    (async (): Promise<void> => {
      try {
        const code: string | null = searchParams.get('code');
        const state: string | null = searchParams.get('state');
        const sessionState: string | null = searchParams.get('session_state');
        const error: string | null = searchParams.get('error');

        // Check for OAuth errors first
        if (error) {
          logger.error('[AsgardeoClientProvider] An error was received for the initiated sign-in request.');

          return;
        }

        // Handle OAuth callback if code and state are present
        if (code && state) {
          setIsLoading(true);

          const result: {error?: string; redirectUrl?: string; success: boolean} = await handleOAuthCallback(
            code,
            state,
            sessionState || undefined,
          );

          if (result.success) {
            // Redirect to the success URL
            if (result.redirectUrl) {
              navigateTo(router, result.redirectUrl);
            } else {
              // Refresh the page to update authentication state
              window.location.reload();
            }
          } else {
            logger.error(
              `[AsgardeoClientProvider] An error occurred while signing in: ${result.error || 'Authentication failed'}`,
            );
          }
        }
      } catch (error) {
        logger.error('[AsgardeoClientProvider] Failed to handle OAuth callback:', error);
      }
    })();
  }, []);

  useEffect(() => {
    // Set loading to false when server has resolved authentication state
    setIsLoading(false);
  }, [isSignedIn, user]);

  const handleSignIn = async (
    payload: EmbeddedSignInFlowHandleRequestPayload,
    request: EmbeddedFlowExecuteRequestConfig,
  ): Promise<any> => {
    if (!signIn) {
      throw new AsgardeoRuntimeError(
        '`signIn` function is not available.',
        'AsgardeoClientProvider-handleSignIn-RuntimeError-001',
        'nextjs',
      );
    }

    const result: any = await signIn(payload, request);

    // Redirect based flow URL is sent as `signInUrl` in the response.
    if (result?.data?.signInUrl) {
      navigateTo(router, result.data.signInUrl);

      return undefined;
    }

    // After the Embedded flow is successful, the URL to navigate next is sent as `afterSignInUrl` in the response.
    if (result?.data?.afterSignInUrl) {
      navigateTo(router, result.data.afterSignInUrl);

      return undefined;
    }

    if (result?.error) {
      throw new Error(result.error);
    }

    return result?.data ?? result;
  };

  const handleSignUp = async (
    payload: EmbeddedFlowExecuteRequestPayload,
    request: EmbeddedFlowExecuteRequestConfig,
    options?: {afterSignUpUrl?: string},
  ): Promise<any> => {
    if (!signUp) {
      throw new AsgardeoRuntimeError(
        '`signUp` function is not available.',
        'AsgardeoClientProvider-handleSignUp-RuntimeError-001',
        'nextjs',
      );
    }

    const result: any = await signUp(payload, request);

    // Redirect based flow URL is sent as `signUpUrl` in the response.
    if (result?.data?.signUpUrl) {
      navigateTo(router, result.data.signUpUrl);

      return undefined;
    }

    // After the Embedded flow is successful, the URL to navigate next is sent as `afterSignUpUrl` in the response.
    if (result?.data?.afterSignUpUrl) {
      const {afterSignUpUrl, autoSignInSkippedReason, signedIn, ...flowResponse}: any = result.data;

      // A URL passed by the caller (e.g. the `afterSignUpUrl` prop of `<SignUp />`) wins over the configured one.
      navigateTo(router, options?.afterSignUpUrl || afterSignUpUrl);

      if (signedIn) {
        // A session cookie was set during sign-up; re-render server components so the signed-in state is picked up.
        router.refresh();
      } else if (autoSignInSkippedReason) {
        // Make the fallback visible where developers look first, not only in the server log.
        logger.warn(
          `[AsgardeoClientProvider] The user was registered but not signed in automatically: ${autoSignInSkippedReason} ` +
            'They will have to sign in manually.',
        );
      }

      // Hand the completed flow back to the caller (e.g. `<SignUp />`) so it can finish its lifecycle
      // while the navigation is in flight, instead of receiving `undefined` and crashing.
      return {...flowResponse, flowStatus: flowResponse.flowStatus ?? EmbeddedFlowStatus.Complete};
    }

    if (result?.error) {
      throw new Error(result.error);
    }

    return result?.data ?? result;
  };

  const handleSignOut = async (): Promise<any> => {
    logger.debug('[AsgardeoClientProvider][handleSignOut] `handleSignOut` called.');

    try {
      const result: any = await signOut();

      logger.debug('[AsgardeoClientProvider][handleSignOut] Sign out result:', result);

      if (result?.data?.afterSignOutUrl) {
        navigateTo(router, result.data.afterSignOutUrl);

        return {location: result.data.afterSignOutUrl, redirected: true};
      }

      if (result?.error) {
        logger.error(
          '[AsgardeoClientProvider][handleSignOut] Error result was returned during signing the user out with a button click:',
          result.error,
        );
      }

      return result?.data ?? result;
    } catch (error) {
      logger.error(
        '[AsgardeoClientProvider][handleSignOut] Error occurred during signing the user out with a button click:',
        error,
      );

      return undefined;
    }
  };

  /**
   * Performs an authenticated HTTP request through a server action so the access token stays on the server.
   * Mirrors `http.request` of the React SDK: resolves with the response, rejects with an `Error` carrying `response`.
   */
  const handleHttpRequest = async (requestConfig?: HttpRequestConfig): Promise<HttpResponse> => {
    if (!httpRequest) {
      throw new AsgardeoRuntimeError(
        '`http.request` is not available. Make sure the component is rendered inside `<AsgardeoProvider>`.',
        'AsgardeoClientProvider-handleHttpRequest-RuntimeError-001',
        'nextjs',
      );
    }

    const result: HttpRequestActionResult = await httpRequest(requestConfig ?? {});

    if (!result.success) {
      const error: Error & {response?: HttpResponse} = new Error(result.error ?? 'HTTP request failed.');

      error.response = result.data;

      throw error;
    }

    return result.data as HttpResponse;
  };

  const handleHttpRequestAll = async (requestConfigs?: HttpRequestConfig[]): Promise<HttpResponse[]> =>
    Promise.all((requestConfigs ?? []).map((requestConfig: HttpRequestConfig) => handleHttpRequest(requestConfig)));

  const contextValue: AsgardeoContextProps = useMemo(
    () => ({
      afterSignInUrl,
      applicationId,
      baseUrl,
      clearSession,
      http: {
        request: handleHttpRequest,
        requestAll: handleHttpRequestAll,
      },
      isLoading,
      isSignedIn,
      organizationHandle,
      refreshToken,
      signIn: handleSignIn,
      signInUrl,
      signOut: handleSignOut,
      signUp: handleSignUp,
      signUpUrl,
      user,
    }),
    [
      baseUrl,
      user,
      isSignedIn,
      isLoading,
      signInUrl,
      signUpUrl,
      applicationId,
      organizationHandle,
      afterSignInUrl,
      httpRequest,
    ],
  );

  const handleProfileUpdate = (payload: User): void => {
    setUser(payload);
    setUserProfile((prev: UserProfile) => ({
      ...prev,
      flattenedProfile: generateFlattenedUserProfile(payload, prev?.schemas),
      profile: payload,
    }));
  };

  return (
    <AsgardeoContext.Provider value={contextValue}>
      <I18nProvider preferences={preferences?.i18n}>
        <BrandingProvider brandingPreference={brandingPreference}>
          <ThemeProvider
            theme={preferences?.theme?.overrides}
            mode={getActiveTheme(preferences?.theme?.mode as any)}
            inheritFromBranding
          >
            <FlowProvider>
              <UserProvider profile={userProfile} onUpdateProfile={handleProfileUpdate} updateProfile={updateProfile}>
                <OrganizationProvider
                  createOrganization={createOrganization}
                  getAllOrganizations={getAllOrganizations}
                  myOrganizations={myOrganizations}
                  currentOrganization={currentOrganization}
                  onOrganizationSwitch={switchOrganization as any}
                  revalidateMyOrganizations={revalidateMyOrganizations as any}
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

export default AsgardeoClientProvider;
