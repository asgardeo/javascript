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
import {type PropType, defineComponent, h} from 'vue';
import useUser from '../../../composables/useUser';
import BaseUserProfile from './BaseUserProfile';

/**
 * UserProfile — styled user profile component.
 *
 * Retrieves user profile data from context and delegates to BaseUserProfile.
 */
const UserProfile = defineComponent({
  name: 'UserProfile',
  props: {
    className: {type: String, default: ''},
    editable: {type: Boolean, default: true},
    cardLayout: {type: Boolean, default: true},
    title: {type: String, default: 'Profile'},
    showFields: {type: Array as PropType<string[]>, default: () => []},
    hideFields: {type: Array as PropType<string[]>, default: () => []},
  },
  setup(props, {slots}) {
    const {flattenedProfile, schemas, updateProfile} = useUser();

    return () =>
      h(
        BaseUserProfile,
        {
          class: withVendorCSSClassPrefix('user-profile--styled'),
          className: props.className,
          flattenedProfile: flattenedProfile?.value,
          schemas: schemas?.value,
          editable: props.editable,
          cardLayout: props.cardLayout,
          title: props.title,
          showFields: props.showFields,
          hideFields: props.hideFields,
          onUpdate: updateProfile,
        },
        slots,
      );
  },
});

export default UserProfile;
