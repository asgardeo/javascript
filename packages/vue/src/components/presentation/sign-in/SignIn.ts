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
import BaseSignIn from './BaseSignIn';

/**
 * SignIn — styled sign-in presentation component.
 *
 * Connects to Asgardeo context for authentication flow handling.
 * Wraps BaseSignIn with composable-provided data.
 */
const SignIn = defineComponent({
  name: 'SignIn',
  props: {
    className: {type: String, default: ''},
    size: {type: String as PropType<'small' | 'medium' | 'large'>, default: 'medium'},
    variant: {type: String as PropType<'elevated' | 'outlined' | 'flat'>, default: 'elevated'},
    onSuccess: {type: Function as PropType<(authData: Record<string, unknown>) => void>, default: undefined},
    onError: {type: Function as PropType<(error: Error) => void>, default: undefined},
  },
  setup(props, {slots}) {
    const {signIn, afterSignInUrl, isLoading} = useAsgardeo();
    const {t} = useI18n();

    const handleInitialize = async () => signIn({response_mode: 'direct'});

    const handleSuccess = (authData: Record<string, unknown>) => {
      if (authData && afterSignInUrl) {
        const url = new URL(afterSignInUrl, window.location.origin);

        Object.entries(authData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });

        window.location.href = url.toString();
      }

      props.onSuccess?.(authData);
    };

    return () =>
      h(
        BaseSignIn,
        {
          class: withVendorCSSClassPrefix('sign-in--styled'),
          className: props.className,
          isLoading: isLoading.value,
          size: props.size,
          variant: props.variant,
          showLogo: true,
          showTitle: true,
          showSubtitle: true,
          onInitialize: handleInitialize,
          onSuccess: handleSuccess,
          onError: props.onError,
        },
        slots,
      );
  },
});

export default SignIn;
