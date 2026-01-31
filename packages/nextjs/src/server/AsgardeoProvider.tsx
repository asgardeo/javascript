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

'use server';

import {BrandingPreference, AsgardeoRuntimeError, IdToken, Organization, TokenExchangeRequestConfig, User, UserProfile} from '@asgardeo/node';
import {AsgardeoProviderProps} from '@asgardeo/react';
import {FC, PropsWithChildren, ReactElement} from 'react';
import createOrganization from './actions/createOrganization';
import getAllOrganizations from './actions/getAllOrganizations';
import getBrandingPreference from './actions/getBrandingPreference';
import getCurrentOrganizationAction from './actions/getCurrentOrganizationAction';
import getMyOrganizations from './actions/getMyOrganizations';
import getSessionId from './actions/getSessionId';
import getSessionPayload from './actions/getSessionPayload';
import getUserAction from './actions/getUserAction';
import getUserProfileAction from './actions/getUserProfileAction';
import handleOAuthCallbackAction from './actions/handleOAuthCallbackAction';
import isSignedIn from './actions/isSignedIn';
import signInAction from './actions/signInAction';
import signOutAction from './actions/signOutAction';
import signUpAction from './actions/signUpAction';
import switchOrganization from './actions/switchOrganization';
import updateUserProfileAction from './actions/updateUserProfileAction';
import AsgardeoNextClient from '../AsgardeoNextClient';
import AsgardeoClientProvider from '../client/contexts/Asgardeo/AsgardeoProvider.js';
import {AsgardeoNextConfig} from '../models/config';
import logger from '../utils/logger';
import {SessionTokenPayload} from '../utils/SessionManager';
import getAccessToken from './actions/getAccessToken';
import getIdToken from './actions/getIdToken';
import getDecodedIdToken from './actions/getDecodedIdToken';
import exchangeToken from './actions/exchangeToken';

/**
 * Props interface of {@link AsgardeoServerProvider}
 */
export type AsgardeoServerProviderProps = Partial<AsgardeoProviderProps> & {
  clientSecret?: string;
};

/**
 * Server-side provider component for Asgardeo authentication.
 * Wraps the client-side provider and handles server-side authentication logic.
 * Uses the singleton AsgardeoNextClient instance for consistent authentication state.
 *
 * @param props - Props injected into the component.
 *
 * @example
 * ```tsx
 * <AsgardeoServerProvider config={asgardeoConfig}>
 *   <YourApp />
 * </AsgardeoServerProvider>
 * ```
 *
 * @returns AsgardeoServerProvider component.
 */
const AsgardeoServerProvider: FC<PropsWithChildren<AsgardeoServerProviderProps>> = async ({
  children,
  afterSignInUrl,
  afterSignOutUrl,
  ..._config
}: PropsWithChildren<AsgardeoServerProviderProps>): Promise<ReactElement> => {
  const asgardeoClient: AsgardeoNextClient = AsgardeoNextClient.getInstance();
  let config: Partial<AsgardeoNextConfig> = {};

  try {
    await asgardeoClient.initialize(_config as AsgardeoNextConfig);

    logger.debug('[AsgardeoServerProvider] Asgardeo client initialized successfully.');

    config = await asgardeoClient.getConfiguration();
  } catch (error) {
    logger.error('[AsgardeoServerProvider] Failed to initialize Asgardeo client:', error?.toString());

    throw new AsgardeoRuntimeError(
      `Failed to initialize Asgardeo client: ${error?.toString()}`,
      'next-ConfigurationError-001',
      'next',
      'An error occurred while initializing the Asgardeo client. Please check your configuration.',
    );
  }

  if (!asgardeoClient.isInitialized) {
    return <></>;
  }

  // Try to get session information from JWT first, then fall back to legacy
  const sessionPayload: SessionTokenPayload | undefined = await getSessionPayload();
  const sessionId: string = sessionPayload?.sessionId || (await getSessionId()) || '';
  const signedIn: boolean = sessionPayload ? true : await isSignedIn(sessionId);

  let user: User = {};
  let userProfile: UserProfile = {
    flattenedProfile: {},
    profile: {},
    schemas: [],
  };
  let currentOrganization: Organization = {
    id: '',
    name: '',
    orgHandle: '',
  };
  let myOrganizations: Organization[] = [];
  let brandingPreference: BrandingPreference | null = null;

  if (signedIn) {
    let updatedBaseUrl: string | undefined = config?.baseUrl;

    if (sessionPayload?.organizationId) {
      updatedBaseUrl = `${config?.baseUrl}/o`;
      config = {...config, baseUrl: updatedBaseUrl};
    } else if (sessionId) {
      try {
        const idToken: IdToken = await asgardeoClient.getDecodedIdToken(sessionId);
        if (idToken?.['user_org']) {
          updatedBaseUrl = `${config?.baseUrl}/o`;
          config = {...config, baseUrl: updatedBaseUrl};
        }
      } catch {
        // Continue without organization info
      }
    }

    try {
      const userResponse: {
        data: {user: User | null};
        error: string | null;
        success: boolean;
      } = await getUserAction(sessionId);
      const userProfileResponse: {
        data: {userProfile: UserProfile};
        error: string | null;
        success: boolean;
      } = await getUserProfileAction(sessionId);
      const currentOrganizationResponse: {
        data: {organization?: Organization; user?: Record<string, unknown>};
        error: string | null;
        success: boolean;
      } = await getCurrentOrganizationAction(sessionId);

      if (sessionId) {
        myOrganizations = await getMyOrganizations({}, sessionId);
      } else {
        // eslint-disable-next-line no-console
        console.warn('[AsgardeoServerProvider] No session ID available, skipping organization fetch');
      }

      user = userResponse.data?.user || {};
      userProfile = userProfileResponse.data?.userProfile ?? userProfile;
      currentOrganization = currentOrganizationResponse?.data?.organization as Organization;
    } catch (error) {
      user = {};
      userProfile = {flattenedProfile: {}, profile: {}, schemas: []};
      currentOrganization = {id: '', name: '', orgHandle: ''};
      myOrganizations = [];
    }
  }

  // Fetch branding preference if branding is enabled in config
  if (config?.preferences?.theme?.inheritFromBranding !== false) {
    try {
      brandingPreference = await getBrandingPreference(
        {
          baseUrl: config?.baseUrl as string,
          locale: 'en-US',
          name: config.applicationId || config.organizationHandle,
          type: config.applicationId ? 'APP' : 'ORG',
        },
        sessionId,
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[AsgardeoServerProvider] Failed to fetch branding preference:', error);
    }
  }

  return (
    <AsgardeoClientProvider
      organizationHandle={config?.organizationHandle}
      applicationId={config?.applicationId}
      baseUrl={config?.baseUrl}
      signIn={signInAction}
      signOut={signOutAction}
      signUp={signUpAction}
      handleOAuthCallback={handleOAuthCallbackAction}
      signInUrl={config?.signInUrl}
      signUpUrl={config?.signUpUrl}
      preferences={config?.preferences}
      clientId={config?.clientId}
      user={user}
      currentOrganization={currentOrganization}
      userProfile={userProfile}
      updateProfile={updateUserProfileAction}
      isSignedIn={signedIn}
      myOrganizations={myOrganizations}
      getAllOrganizations={getAllOrganizations}
      switchOrganization={switchOrganization}
      brandingPreference={brandingPreference}
      createOrganization={createOrganization}
      getAccessToken={async () => {'use server'; return await getAccessToken();}}
      getIdToken={async () => {'use server'; return await getIdToken(sessionId);}}
      exchangeToken={async (exchangeConfig: TokenExchangeRequestConfig) => {
        'use server'; return await exchangeToken(exchangeConfig, sessionId)
      }}
      getDecodedIdToken={async () => {'use server'; return await getDecodedIdToken(sessionId);}}
    >
      {children}
    </AsgardeoClientProvider>
  );
};

export default AsgardeoServerProvider;
