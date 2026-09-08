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

import {AsgardeoError, Config, FederatedAssociation, Platform, User, identifyPlatform} from '@asgardeo/browser';
import {FC, ReactElement, useEffect, useState} from 'react';
// eslint-disable-next-line import/no-named-as-default
import BaseUserProfile, {BaseUserProfileProps} from './BaseUserProfile';
import getMeFederatedAssociations from '../../../api/getMeFederatedAssociations';
import updateMeProfile from '../../../api/updateMeProfile';
import useAsgardeo from '../../../contexts/Asgardeo/useAsgardeo';
import useUser from '../../../contexts/User/useUser';
import useTranslation from '../../../hooks/useTranslation';

/**
 * Props for the UserProfile component.
 * Extends BaseUserProfileProps but makes the user prop optional since it will be obtained from useAsgardeo
 */
export type UserProfileProps = Omit<
  BaseUserProfileProps,
  'user' | 'profile' | 'flattenedProfile' | 'schemas' | 'editable'
> & {
  /**
   * Whether the profile can be edited.
   *
   * `'auto'` decides per user: on Asgardeo, an account provisioned from a social or enterprise
   * connection is rendered read-only, because the identity provider owns its attributes and the
   * server rejects updates to them. Everywhere else the profile stays editable.
   */
  editable?: BaseUserProfileProps['editable'] | 'auto';
};

/**
 * UserProfile component displays the authenticated user's profile information in a
 * structured and styled format. It shows user details such as display name, email,
 * username, and other available profile information from Asgardeo.
 *
 * This component is the React-specific implementation that uses the BaseUserProfile
 * and automatically retrieves the user data from Asgardeo context if not provided.
 *
 * @example
 * ```tsx
 * // Basic usage - will use user from Asgardeo context
 * <UserProfile />
 *
 * // With explicit user data
 * <UserProfile user={specificUser} />
 *
 * // With card layout and custom fallback
 * <UserProfile
 *   cardLayout={true}
 *   fallback={<div>Please sign in to view your profile</div>}
 * />
 *
 * // With field filtering - only show specific fields
 * <UserProfile
 *   showFields={['name.givenName', 'name.familyName', 'emails']}
 * />
 *
 * // With field hiding - hide specific fields
 * <UserProfile
 *   hideFields={['phoneNumbers', 'addresses']}
 * />
 * ```
 */
const UserProfile: FC<UserProfileProps> = ({preferences, editable, ...rest}: UserProfileProps): ReactElement => {
  const {baseUrl, instanceId} = useAsgardeo();
  const {profile, flattenedProfile, schemas, onUpdateProfile} = useUser();
  const {t} = useTranslation(preferences?.i18n);

  const [error, setError] = useState<string | null>(null);
  /**
   * Resolved value of `editable="auto"`: `undefined` until the lookup finishes, so the profile stays
   * editable rather than flickering into a read-only state and back.
   */
  const [isFederatedAccount, setIsFederatedAccount] = useState<boolean | undefined>(undefined);
  const [identityProviderName, setIdentityProviderName] = useState<string | undefined>(undefined);

  // In popup mode the profile is mounted with the dropdown; don't spend a request until it is opened.
  const {mode: profileMode, open: isProfileOpen} = rest as {mode?: string; open?: boolean};

  useEffect((): (() => void) | undefined => {
    if (editable !== 'auto' || (profileMode === 'popup' && !isProfileOpen)) {
      return undefined;
    }

    // Only Asgardeo refuses these updates; on Identity Server the same account is editable.
    if (identifyPlatform({baseUrl} as Config) !== Platform.Asgardeo) {
      setIsFederatedAccount(false);
      return undefined;
    }

    let isStale: boolean = false;

    (async (): Promise<void> => {
      try {
        const associations: FederatedAssociation[] = await getMeFederatedAssociations({baseUrl, instanceId});

        if (isStale) {
          return;
        }

        setIsFederatedAccount(associations.length > 0);
        setIdentityProviderName(associations[0]?.idp?.displayName || associations[0]?.idp?.name);
      } catch {
        // The lookup is a convenience; if it fails, leave the profile editable and let the server decide.
        if (!isStale) {
          setIsFederatedAccount(false);
        }
      }
    })();

    return (): void => {
      isStale = true;
    };
  }, [editable, baseUrl, instanceId, profileMode, isProfileOpen]);

  const handleProfileUpdate = async (payload: any): Promise<void> => {
    setError(null);

    try {
      const response: User = await updateMeProfile({baseUrl, instanceId, payload});
      onUpdateProfile(response);
    } catch (caughtError: unknown) {
      let message: string = t('user.profile.update.generic.error');

      if (caughtError instanceof AsgardeoError) {
        message = caughtError?.message;
      }

      // The server owns the attributes of accounts linked to an identity provider and rejects the
      // update. Say so in plain words and stop offering edits for the rest of the session.
      if (String(message).includes('User attribute update is not allowed')) {
        message = t('user.profile.update.not.allowed.error');
        setIsFederatedAccount(true);
      }

      setError(message);
    }
  };

  // Until the lookup resolves the profile stays read-only, so a managed account never flashes
  // edit controls that the server would refuse.
  const resolvedEditable: BaseUserProfileProps['editable'] =
    editable === 'auto' ? isFederatedAccount === false : editable;

  const resolveReadOnlyNote = (): string | undefined => {
    if (isFederatedAccount !== true) {
      return undefined;
    }

    return identityProviderName
      ? t('user.profile.readonly.federated', {provider: identityProviderName})
      : t('user.profile.update.not.allowed.error');
  };

  const readOnlyNote: string | undefined = resolveReadOnlyNote();

  return (
    <BaseUserProfile
      profile={profile}
      flattenedProfile={flattenedProfile}
      schemas={schemas}
      onUpdate={handleProfileUpdate}
      error={error}
      editable={resolvedEditable}
      readOnlyNote={readOnlyNote}
      preferences={preferences}
      {...rest}
    />
  );
};

export default UserProfile;
