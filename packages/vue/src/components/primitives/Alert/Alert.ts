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
import {defineComponent, h, type PropType} from 'vue';

const Alert = defineComponent({
  name: 'Alert',
  props: {
    severity: {
      type: String as PropType<'success' | 'error' | 'warning' | 'info'>,
      default: 'info',
    },
    dismissible: {type: Boolean, default: false},
  },
  emits: ['dismiss'],
  setup(props, {slots, emit, attrs}) {
    return () =>
      h(
        'div',
        {
          role: 'alert',
          class: [
            withVendorCSSClassPrefix('alert'),
            withVendorCSSClassPrefix(`alert--${props.severity}`),
            (attrs['class'] as string) || '',
          ]
            .filter(Boolean)
            .join(' '),
          style: attrs['style'],
        },
        [
          h('div', {class: withVendorCSSClassPrefix('alert__content')}, slots['default']?.()),
          props.dismissible
            ? h(
                'button',
                {
                  type: 'button',
                  class: withVendorCSSClassPrefix('alert__dismiss'),
                  'aria-label': 'Dismiss',
                  onClick: () => emit('dismiss'),
                },
                '\u00d7',
              )
            : null,
        ],
      );
  },
});

export default Alert;
