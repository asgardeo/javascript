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

import {AsgardeoRuntimeError, navigate} from '@asgardeo/browser';
import {defineComponent, h, ref} from 'vue';
import BaseSignUpButton from './BaseSignUpButton';
import useAsgardeo from '../../composables/useAsgardeo';
import useI18n from '../../composables/useI18n';

/**
 * SignUpButton — triggers `signUp()` from the Asgardeo context.
 *
 * If a custom `signUpUrl` is configured, navigates to it instead.
 * Falls back to i18n translation for the button text.
 */
const SignUpButton = defineComponent({
  name: 'SignUpButton',
  emits: ['click', 'error'],
  setup(_, {slots, emit, attrs}) {
    const {signUp, signUpUrl} = useAsgardeo();
    const {t} = useI18n();
    const isLoading = ref(false);

    const handleSignUp = async (e?: MouseEvent) => {
      try {
        isLoading.value = true;
        if (signUpUrl) {
          navigate(signUpUrl);
        } else {
          await signUp();
        }
        if (e) emit('click', e);
      } catch (error) {
        emit('error', error);
        throw new AsgardeoRuntimeError(
          `Sign up failed: ${error instanceof Error ? error.message : String(error)}`,
          'SignUpButton-handleSignUp-RuntimeError-001',
          'vue',
          'Something went wrong while trying to sign up. Please try again later.',
        );
      } finally {
        isLoading.value = false;
      }
    };

    return () => {
      const slotContent = slots['default']
        ? () => slots['default']!({isLoading: isLoading.value})
        : undefined;

      return h(
        BaseSignUpButton,
        {
          class: attrs['class'],
          style: attrs['style'],
          isLoading: isLoading.value,
          onClick: handleSignUp,
        },
        slotContent,
      );
    };
  },
});

export default SignUpButton;
