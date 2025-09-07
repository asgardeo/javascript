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

import {BrandingPreference, AsgardeoRuntimeError, Organization, User, UserProfile} from '@asgardeo/node';
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
import AsgardeoClientProvider from '../client/contexts/Asgardeo/AsgardeoProvider';
import {AsgardeoNextConfig} from '../models/config';
import logger from '../utils/logger';

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
  const asgardeoClient = AsgardeoNextClient.getInstance();
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
  const sessionPayload = await getSessionPayload();
  const sessionId: string = sessionPayload?.sessionId || (await getSessionId()) || '';
  const _isSignedIn: boolean = sessionPayload ? true : await isSignedIn(sessionId);

  let user: User = {};
  let userProfile: UserProfile = {
    schemas: [],
    profile: {},
    flattenedProfile: {},
  };
  let currentOrganization: Organization = {
    id: '',
    name: '',
    orgHandle: '',
  };
  let myOrganizations: Organization[] = [];
  let brandingPreference: BrandingPreference | null = null;

  if (_isSignedIn) {
    let updatedBaseUrl = config?.baseUrl;

    if (sessionPayload?.organizationId) {
      updatedBaseUrl = `${config?.baseUrl}/o`;
      config = {...config, baseUrl: updatedBaseUrl};
    } else if (sessionId) {
      try {
        const idToken = await asgardeoClient.getDecodedIdToken(sessionId);
        if (idToken?.['user_org']) {
          updatedBaseUrl = `${config?.baseUrl}/o`;
          config = {...config, baseUrl: updatedBaseUrl};
        }
      } catch {
        // Continue without organization info
      }
    }

    try {
      const userResponse = await getUserAction(sessionId);
      const userProfileResponse = await getUserProfileAction(sessionId);
      const currentOrganizationResponse = await getCurrentOrganizationAction(sessionId);

      if (sessionId) {
        myOrganizations = await getMyOrganizations({}, sessionId);
      } else {
        console.warn('[AsgardeoServerProvider] No session ID available, skipping organization fetch');
      }

      user = userResponse.data?.user || {};
      userProfile = userProfileResponse.data?.userProfile;
      currentOrganization = currentOrganizationResponse?.data?.organization as Organization;
    } catch (error) {
      user = {};
      userProfile = {schemas: [], profile: {}, flattenedProfile: {}};
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
          name: config.applicationId || config.organizationHandle || config.rootOrganizationHandle,
          type: config.applicationId ? 'APP' : 'ORG',
        },
        sessionId,
      );
    } catch (error) {
      console.warn('[AsgardeoServerProvider] Failed to fetch branding preference:', error);
    }
  }

  return (
    <AsgardeoClientProvider
      rootOrganizationHandle={config?.rootOrganizationHandle}
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
      isSignedIn={_isSignedIn}
      myOrganizations={myOrganizations}
      getAllOrganizations={getAllOrganizations}
      switchOrganization={switchOrganization}
      brandingPreference={brandingPreference}
      createOrganization={createOrganization}
    >
      {children}
    </AsgardeoClientProvider>
  );
};

export default AsgardeoServerProvider;
