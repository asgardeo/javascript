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

import {Schema, User} from '@asgardeo/node';
import {BaseUserProfile, BaseUserProfileProps, useTranslation, useUser} from '@asgardeo/react';
import {FC, useEffect, useState, ReactElement} from 'react';
import getFederatedProfileLock, {FederatedProfileLock} from '../../../../server/actions/getFederatedProfileLock';
import getSessionId from '../../../../server/actions/getSessionId';

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
 * ```
 */
const UserProfile: FC<UserProfileProps> = ({editable, preferences, ...rest}: UserProfileProps): ReactElement => {
  const {profile, flattenedProfile, schemas, onUpdateProfile, updateProfile} = useUser();
  const {t} = useTranslation(preferences?.i18n);

  const [error, setError] = useState<string | null>(null);
  const [lock, setLock] = useState<FederatedProfileLock | undefined>(undefined);

  // In popup mode the profile is mounted with the dropdown; don't spend a request until it is opened.
  const {mode: profileMode, open: isProfileOpen} = rest as {mode?: string; open?: boolean};

  useEffect((): (() => void) | undefined => {
    if (editable !== 'auto' || (profileMode === 'popup' && !isProfileOpen)) {
      return undefined;
    }

    let isStale: boolean = false;

    (async (): Promise<void> => {
      const resolved: FederatedProfileLock = await getFederatedProfileLock();

      if (!isStale) {
        setLock(resolved);
      }
    })();

    return (): void => {
      isStale = true;
    };
  }, [editable, profileMode, isProfileOpen]);

  const handleProfileUpdate = async (payload: any): Promise<void> => {
    setError(null);

    const result: {data: {user: User}; error: string; success: boolean} = await updateProfile(
      payload,
      (await getSessionId()) as string,
    );

    if (result?.success === false) {
      // The server owns the attributes of accounts linked to an identity provider and rejects the
      // update. Say so in plain words and stop offering edits for the rest of the session.
      if (String(result?.error ?? '').includes('User attribute update is not allowed')) {
        setError(t('user.profile.update.not.allowed.error'));
        setLock({readOnly: true});
      } else {
        setError(t('user.profile.update.generic.error'));
      }

      return;
    }

    onUpdateProfile(result?.data?.user);
  };

  // Until the lookup resolves the profile stays read-only, so a managed account never flashes
  // edit controls that the server would refuse.
  const resolvedEditable: BaseUserProfileProps['editable'] =
    editable === 'auto' ? lock !== undefined && !lock.readOnly : editable;

  const resolveReadOnlyNote = (): string | undefined => {
    if (!lock?.readOnly) {
      return undefined;
    }

    return lock.provider
      ? t('user.profile.readonly.federated', {provider: lock.provider})
      : t('user.profile.update.not.allowed.error');
  };

  const readOnlyNote: string | undefined = resolveReadOnlyNote();

  return (
    <BaseUserProfile
      profile={profile as User}
      flattenedProfile={flattenedProfile as User}
      schemas={schemas as Schema[]}
      onUpdate={handleProfileUpdate}
      editable={resolvedEditable}
      readOnlyNote={readOnlyNote}
      error={error}
      preferences={preferences}
      {...rest}
    />
  );
};

export default UserProfile;
