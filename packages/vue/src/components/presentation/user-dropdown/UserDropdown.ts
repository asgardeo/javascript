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
import {defineComponent, h, ref} from 'vue';
import useAsgardeo from '../../../composables/useAsgardeo';
import useUser from '../../../composables/useUser';
import BaseUserDropdown from './BaseUserDropdown';
import UserProfileComponent from '../user-profile/UserProfile';

/**
 * UserDropdown — styled user dropdown component.
 *
 * Retrieves user and signOut from context and delegates to BaseUserDropdown.
 */
const UserDropdown = defineComponent({
  name: 'UserDropdown',
  props: {
    className: {type: String, default: ''},
  },
  emits: ['profileClick'],
  setup(props, {slots, emit}) {
    const {user, signOut} = useAsgardeo();
    const {flattenedProfile, schemas, updateProfile} = useUser();
    const isProfileModalOpen = ref(false);

    return () =>
      h(
        BaseUserDropdown,
        {
          class: withVendorCSSClassPrefix('user-dropdown--styled'),
          className: props.className,
          user: user.value,
          isProfileModalOpen: isProfileModalOpen.value,
          profileContent: isProfileModalOpen.value ? h(UserProfileComponent, {
            editable: true,
            cardLayout: false,
          }) : null,
          onSignOut: () => signOut(),
          onProfileClick: () => {
            isProfileModalOpen.value = true;
            emit('profileClick');
          },
          onProfileModalClose: () => {
            isProfileModalOpen.value = false;
          },
        },
        slots,
      );
  },
});

export default UserDropdown;
