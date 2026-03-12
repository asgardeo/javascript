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

export interface SelectOption {
  label: string;
  value: string;
}

const Select = defineComponent({
  name: 'AsgardeoSelect',
  props: {
    modelValue: {type: String, default: ''},
    label: {type: String, default: undefined},
    name: {type: String, default: undefined},
    options: {type: Array as PropType<SelectOption[]>, default: () => []},
    placeholder: {type: String, default: undefined},
    error: {type: String, default: undefined},
    helperText: {type: String, default: undefined},
    required: {type: Boolean, default: false},
    disabled: {type: Boolean, default: false},
  },
  emits: ['update:modelValue'],
  setup(props, {emit, attrs}) {
    return () => {
      const hasError = !!props.error;
      const wrapperClass = [
        withVendorCSSClassPrefix('select'),
        hasError ? withVendorCSSClassPrefix('select--error') : '',
        (attrs['class'] as string) || '',
      ]
        .filter(Boolean)
        .join(' ');

      return h('div', {class: wrapperClass, style: attrs['style']}, [
        props.label
          ? h(
              'label',
              {class: withVendorCSSClassPrefix('select__label'), for: props.name},
              [props.label, props.required ? h('span', {class: withVendorCSSClassPrefix('select__required')}, ' *') : null],
            )
          : null,
        h(
          'select',
          {
            class: withVendorCSSClassPrefix('select__input'),
            name: props.name,
            id: props.name,
            value: props.modelValue,
            required: props.required,
            disabled: props.disabled,
            'data-testid': attrs['data-testid'],
            onChange: (e: Event) => emit('update:modelValue', (e.target as HTMLSelectElement).value),
          },
          [
            props.placeholder ? h('option', {value: '', disabled: true}, props.placeholder) : null,
            ...props.options.map((opt) => h('option', {value: opt.value, key: opt.value}, opt.label)),
          ],
        ),
        hasError
          ? h('span', {class: withVendorCSSClassPrefix('select__error')}, props.error)
          : props.helperText
            ? h('span', {class: withVendorCSSClassPrefix('select__helper')}, props.helperText)
            : null,
      ]);
    };
  },
});

export default Select;
