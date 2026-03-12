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
import {defineComponent, h} from 'vue';
import Button from '../primitives/Button';

/**
 * BaseSignOutButton — unstyled sign-out button.
 *
 * Uses the default slot for custom content. When no slot is provided,
 * renders a default Button primitive.
 */
const BaseSignOutButton = defineComponent({
  name: 'BaseSignOutButton',
  props: {
    isLoading: {type: Boolean, default: false},
    disabled: {type: Boolean, default: false},
  },
  emits: ['click'],
  setup(props, {slots, emit, attrs}) {
    return () => {
      if (slots['default']) {
        return h(
          'span',
          {class: withVendorCSSClassPrefix('sign-out-button-wrapper')},
          slots['default']({isLoading: props.isLoading}),
        );
      }

      return h(
        Button,
        {
          class: [withVendorCSSClassPrefix('sign-out-button'), (attrs['class'] as string) || ''].filter(Boolean).join(' '),
          style: attrs['style'],
          disabled: props.disabled || props.isLoading,
          loading: props.isLoading,
          type: 'button' as const,
          onClick: (e: MouseEvent) => emit('click', e),
        },
        () => 'Sign Out',
      );
    };
  },
});

export default BaseSignOutButton;
