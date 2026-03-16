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
import {defineComponent, h, ref} from 'vue';

const PasswordField = defineComponent({
  name: 'PasswordField',
  props: {
    modelValue: {type: String, default: ''},
    label: {type: String, default: undefined},
    name: {type: String, default: undefined},
    placeholder: {type: String, default: undefined},
    error: {type: String, default: undefined},
    required: {type: Boolean, default: false},
    disabled: {type: Boolean, default: false},
  },
  emits: ['update:modelValue', 'blur'],
  setup(props, {emit, attrs}) {
    const visible = ref(false);

    return () => {
      const hasError = !!props.error;
      const wrapperClass = [
        withVendorCSSClassPrefix('password-field'),
        hasError ? withVendorCSSClassPrefix('password-field--error') : '',
        (attrs['class'] as string) || '',
      ]
        .filter(Boolean)
        .join(' ');

      return h('div', {class: wrapperClass, style: attrs['style']}, [
        props.label
          ? h(
              'label',
              {
                class: withVendorCSSClassPrefix('password-field__label'),
                for: props.name,
              },
              [props.label, props.required ? h('span', {class: withVendorCSSClassPrefix('password-field__required')}, ' *') : null],
            )
          : null,
        h('div', {class: withVendorCSSClassPrefix('password-field__wrapper')}, [
          h('input', {
            class: withVendorCSSClassPrefix('password-field__input'),
            type: visible.value ? 'text' : 'password',
            name: props.name,
            id: props.name,
            value: props.modelValue,
            placeholder: props.placeholder,
            required: props.required,
            disabled: props.disabled,
            'data-testid': attrs['data-testid'],
            onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value),
            onBlur: () => emit('blur'),
          }),
          h(
            'button',
            {
              type: 'button',
              class: withVendorCSSClassPrefix('password-field__toggle'),
              'aria-label': visible.value ? 'Hide password' : 'Show password',
              tabindex: -1,
              onClick: () => {
                visible.value = !visible.value;
              },
            },
            visible.value ? '\u25CF' : '\u25CB',
          ),
        ]),
        hasError ? h('span', {class: withVendorCSSClassPrefix('password-field__error')}, props.error) : null,
      ]);
    };
  },
});

export default PasswordField;
