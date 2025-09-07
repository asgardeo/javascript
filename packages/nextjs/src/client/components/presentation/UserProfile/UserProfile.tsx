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

import {FC, ReactElement, useState} from 'react';
import {BaseUserProfile, BaseUserProfileProps, useTranslation, useUser} from '@asgardeo/react';
import getSessionId from '../../../../server/actions/getSessionId';
import {AsgardeoError, Schema, User} from '@asgardeo/node';

/**
 * Props for the UserProfile component.
 * Extends BaseUserProfileProps but makes the user prop optional since it will be obtained from useAsgardeo
 */
export type UserProfileProps = Omit<BaseUserProfileProps, 'user' | 'profile' | 'flattenedProfile' | 'schemas'>;

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
const UserProfile: FC<UserProfileProps> = ({...rest}: UserProfileProps): ReactElement => {
  const {profile, flattenedProfile, schemas, onUpdateProfile, updateProfile} = useUser();
  const {t} = useTranslation();

  const [error, setError] = useState<string | null>(null);

  const handleProfileUpdate = async (payload: any): Promise<void> => {
    setError(null);

    try {
      const result = await updateProfile(payload, (await getSessionId()) as string);

      onUpdateProfile(result?.data?.user);
    } catch (error: unknown) {
      let message: string = t('user.profile.update.generic.error');

      if (error instanceof AsgardeoError) {
        message = error?.message;
      }

      setError(message);
    }
  };

  return (
    <BaseUserProfile
      profile={profile as User}
      flattenedProfile={flattenedProfile as User}
      schemas={schemas as Schema[]}
      onUpdate={handleProfileUpdate}
      error={error}
      {...rest}
    />
  );
};

export default UserProfile;
