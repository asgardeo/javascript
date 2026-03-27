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
import {computed, defineComponent, h, provide, type Component, type PropType, type Ref} from 'vue';
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
const UserProvider: Component = defineComponent({
  name: 'UserProvider',
  props: {
    /** The flattened profile (top-level attribute map). */
    flattenedProfile: {default: null, type: Object as PropType<User | null>},
    /** Optional callback run after the profile is updated locally. */
    onUpdateProfile: {default: undefined, type: Function as PropType<(payload: User) => void>},
    /** The full user profile data (nested + flat + schemas). */
    profile: {default: null, type: Object as PropType<UserProfile | null>},
    /** Re-fetch the user profile from the server. */
    revalidateProfile: {default: async () => {}, type: Function as PropType<() => Promise<void>>},
    /** The SCIM2 schemas describing user profile attributes. */
    schemas: {default: null, type: Array as PropType<Schema[] | null>},
    /** Update the user profile via SCIM2 PATCH. */
    updateProfile: {
      default: undefined,
      type: Function as PropType<
        (
          requestConfig: UpdateMeProfileConfig,
          sessionId?: string,
        ) => Promise<{data: {user: User}; error: string; success: boolean}>
      >,
    },
  },
  setup(props: any, {slots}: {slots: any}): any {
    // Use computed refs so context stays in sync when props change
    const flattenedProfileRef: Ref<User | null> = computed(() => props.flattenedProfile);
    const profileRef: Ref<UserProfile | null> = computed(() => props.profile);
    const schemasRef: Ref<Schema[] | null> = computed(() => props.schemas);

    const context: UserContextValue = {
      flattenedProfile: flattenedProfileRef as unknown as Readonly<Ref<User | null>>,
      profile: profileRef as unknown as Readonly<Ref<UserProfile | null>>,
      revalidateProfile: props.revalidateProfile,
      schemas: schemasRef as unknown as Readonly<Ref<Schema[] | null>>,
      updateProfile:
        props.updateProfile ??
        (async (): Promise<{data: {user: User}; error: string; success: boolean}> => ({
          data: {user: {} as User},
          error: 'updateProfile callback not provided',
          success: false,
        })),
    };

    provide(USER_KEY, context);

    return (): any => h('div', {style: 'display:contents'}, slots['default']?.());
  },
});

export default UserProvider;
