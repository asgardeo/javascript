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
import {defineComponent, h, ref, nextTick} from 'vue';

const OtpField = defineComponent({
  name: 'OtpField',
  props: {
    modelValue: {type: String, default: ''},
    length: {type: Number, default: 6},
    label: {type: String, default: undefined},
    name: {type: String, default: undefined},
    error: {type: String, default: undefined},
    required: {type: Boolean, default: false},
    disabled: {type: Boolean, default: false},
  },
  emits: ['update:modelValue'],
  setup(props, {emit, attrs}) {
    const inputRefs = ref<HTMLInputElement[]>([]);

    const setRef = (el: any, index: number) => {
      if (el) inputRefs.value[index] = el as HTMLInputElement;
    };

    const handleInput = (index: number, e: Event) => {
      const target = e.target as HTMLInputElement;
      const val = target.value.replace(/\D/g, '').slice(0, 1);
      target.value = val;

      const current = (props.modelValue || '').split('');
      while (current.length < props.length) current.push('');
      current[index] = val;
      emit('update:modelValue', current.join(''));

      if (val && index < props.length - 1) {
        nextTick(() => inputRefs.value[index + 1]?.focus());
      }
    };

    const handleKeydown = (index: number, e: KeyboardEvent) => {
      if (e.key === 'Backspace' && !(e.target as HTMLInputElement).value && index > 0) {
        nextTick(() => inputRefs.value[index - 1]?.focus());
      }
    };

    return () => {
      const digits = (props.modelValue || '').split('');
      while (digits.length < props.length) digits.push('');

      return h('div', {class: [withVendorCSSClassPrefix('otp-field'), (attrs['class'] as string) || ''].filter(Boolean).join(' '), style: attrs['style']}, [
        props.label
          ? h('label', {class: withVendorCSSClassPrefix('otp-field__label')}, [
              props.label,
              props.required ? h('span', {class: withVendorCSSClassPrefix('otp-field__required')}, ' *') : null,
            ])
          : null,
        h(
          'div',
          {class: withVendorCSSClassPrefix('otp-field__inputs')},
          Array.from({length: props.length}, (_, i) =>
            h('input', {
              ref: (el: any) => setRef(el, i),
              key: i,
              class: withVendorCSSClassPrefix('otp-field__digit'),
              type: 'text',
              inputmode: 'numeric',
              maxlength: 1,
              value: digits[i],
              disabled: props.disabled,
              'aria-label': `Digit ${i + 1}`,
              onInput: (e: Event) => handleInput(i, e),
              onKeydown: (e: KeyboardEvent) => handleKeydown(i, e),
            }),
          ),
        ),
        props.error ? h('span', {class: withVendorCSSClassPrefix('otp-field__error')}, props.error) : null,
      ]);
    };
  },
});

export default OtpField;
