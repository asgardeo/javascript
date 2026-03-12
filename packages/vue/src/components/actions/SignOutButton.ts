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

import {AsgardeoRuntimeError} from '@asgardeo/browser';
import {defineComponent, h, ref} from 'vue';
import BaseSignOutButton from './BaseSignOutButton';
import useAsgardeo from '../../composables/useAsgardeo';
import useI18n from '../../composables/useI18n';

/**
 * SignOutButton — triggers `signOut()` from the Asgardeo context.
 */
const SignOutButton = defineComponent({
  name: 'SignOutButton',
  emits: ['click', 'error'],
  setup(_, {slots, emit, attrs}) {
    const {signOut} = useAsgardeo();
    const {t} = useI18n();
    const isLoading = ref(false);

    const handleSignOut = async (e?: MouseEvent) => {
      try {
        isLoading.value = true;
        await signOut();
        if (e) emit('click', e);
      } catch (error) {
        emit('error', error);
        throw new AsgardeoRuntimeError(
          `Sign out failed: ${error instanceof Error ? error.message : String(error)}`,
          'SignOutButton-handleSignOut-RuntimeError-001',
          'vue',
          'Something went wrong while trying to sign out. Please try again later.',
        );
      } finally {
        isLoading.value = false;
      }
    };

    return () =>
      h(
        BaseSignOutButton,
        {
          class: attrs['class'],
          style: attrs['style'],
          isLoading: isLoading.value,
          onClick: handleSignOut,
        },
        slots['default'] ? () => slots['default']!({isLoading: isLoading.value}) : () => t('elements.buttons.signout.text'),
      );
  },
});

export default SignOutButton;
