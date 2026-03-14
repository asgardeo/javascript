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

import {Schema, UpdateMeProfileConfig, User, UserProfile} from '@asgardeo/browser';
import {computed, defineComponent, h, provide, readonly, ref, type PropType, type Ref} from 'vue';
import {USER_KEY} from '../keys';
import type {UserContextValue} from '../models/contexts';

/**
 * UserProvider manages user profile state and makes it available via `useUser()`.
 *
 * It is a thin wrapper that receives profile data from a parent (typically
 * `<AsgardeoProvider>`) and surfaces it through the Vue inject system.
 *
 * @internal — This provider is mounted automatically by `<AsgardeoProvider>`.
 */
const UserProvider = defineComponent({
  name: 'UserProvider',
  props: {
    /** Optional callback run after the profile is updated locally. */
    onUpdateProfile: {type: Function as PropType<(payload: User) => void>, default: undefined},
    /** The full user profile data (nested + flat + schemas). */
    profile: {type: Object as PropType<UserProfile | null>, default: null},
    /** Re-fetch the user profile from the server. */
    revalidateProfile: {type: Function as PropType<() => Promise<void>>, default: async () => {}},
    /** Update the user profile via SCIM2 PATCH. */
    updateProfile: {
      type: Function as PropType<
        (
          requestConfig: UpdateMeProfileConfig,
          sessionId?: string,
        ) => Promise<{data: {user: User}; error: string; success: boolean}>
      >,
      default: undefined,
    },
    /** The flattened profile (top-level attribute map). */
    flattenedProfile: {type: Object as PropType<User | null>, default: null},
    /** The SCIM2 schemas describing user profile attributes. */
    schemas: {type: Array as PropType<Schema[] | null>, default: null},
  },
  setup(props, {slots}) {
    // Use computed refs so context stays in sync when props change
    const flattenedProfileRef = computed(() => props.flattenedProfile);
    const profileRef = computed(() => props.profile);
    const schemasRef = computed(() => props.schemas);

    const context: UserContextValue = {
      flattenedProfile: flattenedProfileRef as unknown as Readonly<Ref<User | null>>,
      profile: profileRef as unknown as Readonly<Ref<UserProfile | null>>,
      revalidateProfile: props.revalidateProfile,
      schemas: schemasRef as unknown as Readonly<Ref<Schema[] | null>>,
      updateProfile:
        props.updateProfile ??
        (() =>
          Promise.resolve({
            data: {user: {} as User},
            error: 'updateProfile callback not provided',
            success: false,
          })),
    };

    provide(USER_KEY, context);

    return () => h('div', {style: 'display:contents'}, slots['default']?.());
  },
});

export default UserProvider;
