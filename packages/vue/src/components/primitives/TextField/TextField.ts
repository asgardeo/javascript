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

const TextField = defineComponent({
  name: 'TextField',
  props: {
    modelValue: {type: String, default: ''},
    type: {
      type: String as PropType<'text' | 'email' | 'number' | 'tel' | 'url'>,
      default: 'text',
    },
    label: {type: String, default: undefined},
    name: {type: String, default: undefined},
    placeholder: {type: String, default: undefined},
    error: {type: String, default: undefined},
    helperText: {type: String, default: undefined},
    required: {type: Boolean, default: false},
    disabled: {type: Boolean, default: false},
    autoComplete: {type: String, default: undefined},
  },
  emits: ['update:modelValue', 'blur'],
  setup(props, {emit, attrs}) {
    return () => {
      const hasError = !!props.error;
      const wrapperClass = [
        withVendorCSSClassPrefix('text-field'),
        hasError ? withVendorCSSClassPrefix('text-field--error') : '',
        (attrs['class'] as string) || '',
      ]
        .filter(Boolean)
        .join(' ');

      return h('div', {class: wrapperClass, style: attrs['style']}, [
        props.label
          ? h(
              'label',
              {
                class: withVendorCSSClassPrefix('text-field__label'),
                for: props.name,
              },
              [props.label, props.required ? h('span', {class: withVendorCSSClassPrefix('text-field__required')}, ' *') : null],
            )
          : null,
        h('input', {
          class: withVendorCSSClassPrefix('text-field__input'),
          type: props.type,
          name: props.name,
          id: props.name,
          value: props.modelValue,
          placeholder: props.placeholder,
          required: props.required,
          disabled: props.disabled,
          autocomplete: props.autoComplete,
          'data-testid': attrs['data-testid'],
          onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value),
          onBlur: () => emit('blur'),
        }),
        hasError
          ? h('span', {class: withVendorCSSClassPrefix('text-field__error')}, props.error)
          : props.helperText
            ? h('span', {class: withVendorCSSClassPrefix('text-field__helper')}, props.helperText)
            : null,
      ]);
    };
  },
});

export default TextField;
