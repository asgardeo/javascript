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

import {UserProfile} from '@asgardeo/node';
import AsgardeoNextClient from '../../AsgardeoNextClient';

/**
 * Server action to get the current user.
 * Returns the user profile if signed in.
 */
const getUserProfileAction = async (sessionId: string) => {
  try {
    const client = AsgardeoNextClient.getInstance();
    const updatedProfile: UserProfile = await client.getUserProfile(sessionId);
    return {success: true, data: {userProfile: updatedProfile}, error: null};
  } catch (error) {
    return {
      success: false,
      data: {
        userProfile: {
          schemas: [],
          profile: {},
          flattenedProfile: {},
        },
      },
      error: 'Failed to get user profile',
    };
  }
};

export default getUserProfileAction;
