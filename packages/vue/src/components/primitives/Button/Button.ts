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
import {defineComponent, h, type PropType, type VNode} from 'vue';

const Button = defineComponent({
  name: 'Button',
  props: {
    variant: {
      type: String as PropType<'solid' | 'outline' | 'ghost' | 'text'>,
      default: 'solid',
    },
    color: {
      type: String as PropType<'primary' | 'secondary' | 'danger'>,
      default: 'primary',
    },
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium',
    },
    disabled: {type: Boolean, default: false},
    loading: {type: Boolean, default: false},
    fullWidth: {type: Boolean, default: false},
    type: {
      type: String as PropType<'button' | 'submit' | 'reset'>,
      default: 'button',
    },
    startIcon: {type: Object as PropType<VNode>, default: undefined},
    endIcon: {type: Object as PropType<VNode>, default: undefined},
  },
  emits: ['click'],
  setup(props, {slots, emit, attrs}) {
    return () => {
      const cssClass = [
        withVendorCSSClassPrefix('button'),
        withVendorCSSClassPrefix(`button--${props.variant}`),
        withVendorCSSClassPrefix(`button--${props.color}`),
        withVendorCSSClassPrefix(`button--${props.size}`),
        props.fullWidth ? withVendorCSSClassPrefix('button--full-width') : '',
        props.loading ? withVendorCSSClassPrefix('button--loading') : '',
        (attrs['class'] as string) || '',
      ]
        .filter(Boolean)
        .join(' ');

      return h(
        'button',
        {
          class: cssClass,
          style: attrs['style'],
          type: props.type,
          disabled: props.disabled || props.loading,
          onClick: (e: MouseEvent) => emit('click', e),
        },
        [
          props.startIcon
            ? h('span', {class: withVendorCSSClassPrefix('button__start-icon')}, [props.startIcon])
            : null,
          h('span', {class: withVendorCSSClassPrefix('button__content')}, slots['default']?.()),
          props.endIcon ? h('span', {class: withVendorCSSClassPrefix('button__end-icon')}, [props.endIcon]) : null,
          props.loading ? h('span', {class: withVendorCSSClassPrefix('button__spinner'), 'aria-hidden': 'true'}) : null,
        ],
      );
    };
  },
});

export default Button;
