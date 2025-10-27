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

import {User} from '@asgardeo/browser';
import getMappedUserProfileValue from './getMappedUserProfileValue';

/**
 * Get the display name of a user by mapping their profile attributes.
 *
 * @param mergedMappings - The merged attribute mappings.
 * @param user - The user object containing profile information.
 *
 * @example
 * ```ts
 * const mergedMappings = {
 *   firstName: ['name.givenName', 'given_name'],
 *   lastName: ['name.familyName', 'family_name'],
 *   username: ['userName', 'username', 'user_name'],
 *   email: ['emails[0].value', 'email'],
 *   name: ['name', 'fullName'],
 * };
 *
 * const user: User = {
 *   id: '1',
 *   name: 'John Doe',
 *   email: 'john.doe@example.com',
 * };
 *
 * const displayName = getDisplayName(mergedMappings, user);
 * ```
 *
 * @returns The display name of the user.
 */
const getDisplayName = (mergedMappings: {[key: string]: string | string[] | undefined}, user: User): string => {
  const firstName = getMappedUserProfileValue('firstName', mergedMappings, user);
  const lastName = getMappedUserProfileValue('lastName', mergedMappings, user);

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  return (
    getMappedUserProfileValue('username', mergedMappings, user) ||
    getMappedUserProfileValue('email', mergedMappings, user) ||
    getMappedUserProfileValue('name', mergedMappings, user) ||
    'User'
  );
};

export default getDisplayName;
