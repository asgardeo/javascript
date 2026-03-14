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
import {defineComponent, h} from 'vue';
import useI18n from '../../../composables/useI18n';
import type {SelectOption} from '../../primitives/Select/Select';
import BaseLanguageSwitcher from './BaseLanguageSwitcher';

/**
 * LanguageSwitcher — styled language selection component.
 *
 * Retrieves current language and setLanguage from i18n context.
 */
const LanguageSwitcher = defineComponent({
  name: 'LanguageSwitcher',
  props: {
    className: {type: String, default: ''},
    languages: {
      type: Array as PropType<SelectOption[]>,
      default: () => [
        {label: 'English', value: 'en'},
        {label: 'French', value: 'fr'},
        {label: 'Spanish', value: 'es'},
        {label: 'Portuguese', value: 'pt'},
      ],
    },
  },
  setup(props, {slots}) {
    const {currentLanguage, setLanguage} = useI18n();

    return () =>
      h(
        BaseLanguageSwitcher,
        {
          class: withVendorCSSClassPrefix('language-switcher--styled'),
          className: props.className,
          currentLanguage: currentLanguage?.value ?? 'en',
          languages: props.languages,
          onLanguageChange: setLanguage,
        },
        slots,
      );
  },
});

export default LanguageSwitcher;
