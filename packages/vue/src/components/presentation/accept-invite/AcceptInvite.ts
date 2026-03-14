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
import useAsgardeo from '../../../composables/useAsgardeo';
import useI18n from '../../../composables/useI18n';
import BaseAcceptInvite from './BaseAcceptInvite';

/**
 * AcceptInvite — styled invitation acceptance component.
 *
 * Connects to Asgardeo context for invitation acceptance flow.
 */
const AcceptInvite = defineComponent({
  name: 'AcceptInvite',
  props: {
    className: {type: String, default: ''},
    invitationCode: {type: String, default: ''},
    size: {type: String as PropType<'small' | 'medium' | 'large'>, default: 'medium'},
    variant: {type: String as PropType<'elevated' | 'outlined' | 'flat'>, default: 'elevated'},
    onSuccess: {type: Function as PropType<() => void>, default: undefined},
    onError: {type: Function as PropType<(error: Error) => void>, default: undefined},
  },
  setup(props, {slots}) {
    const {signIn, isLoading} = useAsgardeo();
    const {t} = useI18n();

    const handleAccept = async (invitationCode: string) => {
      await signIn({invitation_code: invitationCode, response_mode: 'direct'});
    };

    return () =>
      h(
        BaseAcceptInvite,
        {
          class: withVendorCSSClassPrefix('accept-invite--styled'),
          className: props.className,
          invitationCode: props.invitationCode,
          isLoading: isLoading.value,
          size: props.size,
          variant: props.variant,
          onAccept: handleAccept,
          onSuccess: props.onSuccess,
          onError: props.onError,
        },
        slots,
      );
  },
});

export default AcceptInvite;
