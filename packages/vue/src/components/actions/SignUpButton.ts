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

import {AsgardeoRuntimeError, navigate, withVendorCSSClassPrefix} from '@asgardeo/browser';
import {defineComponent, h, ref} from 'vue';
import useAsgardeo from '../../composables/useAsgardeo';
import useI18n from '../../composables/useI18n';
import Button from '../primitives/Button';

/**
 * SignUpButton — styled sign-up button.
 *
 * When clicked, invokes `signUp()` from the Asgardeo context.
 * If a `signUpUrl` is available, navigates to it instead.
 */
const SignUpButton = defineComponent({
  name: 'SignUpButton',
  setup(_props, {slots}) {
    const {signUp, signUpUrl} = useAsgardeo();
    const {t} = useI18n();

    const loading = ref(false);

    const handleClick = async () => {
      if (signUpUrl) {
        navigate(signUpUrl);

        return;
      }

      loading.value = true;
      try {
        await signUp();
      } catch (error: unknown) {
        throw new AsgardeoRuntimeError(
          'vue-sign-up-button-error',
          'SignUpButton',
          `Failed to initiate sign-up: ${error instanceof Error ? error.message : String(error)}`,
        );
      } finally {
        loading.value = false;
      }
    };

    return () => {
      if (slots['default']) {
        return h(
          'span',
          {
            class: withVendorCSSClassPrefix('sign-up-button-wrapper'),
            onClick: handleClick,
          },
          slots['default']({isLoading: loading.value}),
        );
      }

      return h(
        Button,
        {
          class: withVendorCSSClassPrefix('sign-up-button'),
          disabled: loading.value,
          loading: loading.value,
          type: 'button' as const,
          color: 'primary' as const,
          variant: 'solid' as const,
          onClick: handleClick,
        },
        () => t('common.sign-up') || 'Sign Up',
      );
    };
  },
});

export default SignUpButton;
