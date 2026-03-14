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
import type {PropType} from 'vue';
import {defineComponent, h, ref} from 'vue';
import Card from '../../primitives/Card';
import {ChevronDownIcon, GlobeIcon} from '../../primitives/Icons';
import type {SelectOption} from '../../primitives/Select/Select';
import Typography from '../../primitives/Typography';

const cls = (name: string): string => withVendorCSSClassPrefix(`language-switcher${name}`);

/**
 * BaseLanguageSwitcher — unstyled language selection component.
 *
 * Shows the current language and a dropdown to select another.
 */
const BaseLanguageSwitcher = defineComponent({
  name: 'BaseLanguageSwitcher',
  props: {
    className: {type: String, default: ''},
    currentLanguage: {type: String, default: 'en'},
    languages: {type: Array as PropType<SelectOption[]>, default: () => [{label: 'English', value: 'en'}]},
    onLanguageChange: {type: Function as PropType<(lang: string) => void>, default: undefined},
  },
  setup(props, {slots}) {
    const isOpen = ref(false);

    const toggle = (): void => {
      isOpen.value = !isOpen.value;
    };

    const handleSelect = (lang: string): void => {
      isOpen.value = false;
      props.onLanguageChange?.(lang);
    };

    return () => {
      if (slots['default']) {
        return slots['default']({
          currentLanguage: props.currentLanguage,
          languages: props.languages,
          isOpen: isOpen.value,
          toggle,
          handleSelect,
        });
      }

      const currentLabel =
        props.languages.find((l) => l.value === props.currentLanguage)?.label ?? props.currentLanguage;

      const triggerButton = h(
        'button',
        {
          type: 'button',
          class: cls('__trigger'),
          onClick: toggle,
          'aria-haspopup': 'listbox',
          'aria-expanded': isOpen.value,
        },
        [
          h(GlobeIcon, {size: 16}),
          h(Typography, {variant: 'body2', class: cls('__trigger-label')}, () => currentLabel),
          h(ChevronDownIcon, {size: 12}),
        ],
      );

      const dropdownItems = props.languages.map((lang) => {
        const isActive = lang.value === props.currentLanguage;
        return h(
          'button',
          {
            type: 'button',
            class: [cls('__item'), isActive ? cls('__item--active') : ''],
            onClick: () => handleSelect(lang.value),
            role: 'option',
            'aria-selected': isActive,
          },
          [h(Typography, {variant: 'body2'}, () => lang.label)],
        );
      });

      const dropdown = isOpen.value
        ? h('div', {class: cls('__dropdown'), role: 'listbox'}, dropdownItems)
        : null;

      return h(
        Card,
        {class: [cls(''), props.className].filter(Boolean).join(' ')},
        () => [triggerButton, dropdown],
      );
    };
  },
});

export default BaseLanguageSwitcher;
