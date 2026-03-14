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
import BaseInviteUser from './BaseInviteUser';

/**
 * InviteUser — styled admin invite component.
 *
 * Provides a form for inviting users to an organization.
 */
const InviteUser = defineComponent({
  name: 'InviteUser',
  props: {
    className: {type: String, default: ''},
    size: {type: String as PropType<'small' | 'medium' | 'large'>, default: 'medium'},
    variant: {type: String as PropType<'elevated' | 'outlined' | 'flat'>, default: 'elevated'},
    onInvite: {type: Function as PropType<(email: string, roles?: string[]) => Promise<void>>, default: undefined},
    onSuccess: {type: Function as PropType<() => void>, default: undefined},
    onError: {type: Function as PropType<(error: Error) => void>, default: undefined},
  },
  setup(props, {slots}) {
    return () =>
      h(
        BaseInviteUser,
        {
          class: withVendorCSSClassPrefix('invite-user--styled'),
          className: props.className,
          size: props.size,
          variant: props.variant,
          onInvite: props.onInvite,
          onSuccess: props.onSuccess,
          onError: props.onError,
        },
        slots,
      );
  },
});

export default InviteUser;
