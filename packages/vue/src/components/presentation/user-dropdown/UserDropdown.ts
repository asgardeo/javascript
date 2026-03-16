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

import {withVendorCSSClassPrefix} from '@asgardeo/browser';
import {type Ref, type VNode, defineComponent, h, ref} from 'vue';
import BaseUserDropdown from './BaseUserDropdown';
import useAsgardeo from '../../../composables/useAsgardeo';
import UserProfileComponent from '../user-profile/UserProfile';

/**
 * UserDropdown — styled user dropdown component.
 *
 * Retrieves user and signOut from context and delegates to BaseUserDropdown.
 */
const UserDropdown: ReturnType<typeof defineComponent> = defineComponent({
  emits: ['profileClick'],
  name: 'UserDropdown',
  props: {
    className: {
      default: '',
      type: String,
    },
  },
  setup(props: {className: string}, {slots, emit}: {emit: any; slots: any}): () => VNode | VNode[] | null {
    const {user, signOut} = useAsgardeo();
    const isProfileModalOpen: Ref<boolean> = ref(false);

    return (): VNode | VNode[] | null =>
      h(
        BaseUserDropdown,
        {
          class: withVendorCSSClassPrefix('user-dropdown--styled'),
          className: props.className,
          isProfileModalOpen: isProfileModalOpen.value,
          onProfileClick: (): void => {
            isProfileModalOpen.value = true;
            emit('profileClick');
          },
          onProfileModalClose: (): void => {
            isProfileModalOpen.value = false;
          },
          onSignOut: (): void => { signOut(); },
          profileContent: isProfileModalOpen.value
            ? h(UserProfileComponent, {
                cardLayout: false,
                editable: true,
              })
            : null,
          user: user.value,
        },
        slots,
      );
  },
});

export default UserDropdown;
