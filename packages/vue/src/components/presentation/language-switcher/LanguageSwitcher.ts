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
import type {I18nBundle} from '@asgardeo/i18n';
import {type Component, type PropType, type VNode, computed, defineComponent, h} from 'vue';
import BaseLanguageSwitcher from './BaseLanguageSwitcher';
import useI18n from '../../../composables/useI18n';
import type {SelectOption} from '../../primitives/Select/Select';

interface LanguageSwitcherSetupProps {
  className: string;
  languages: SelectOption[] | undefined;
}

/**
 * LanguageSwitcher — styled language selection component.
 *
 * Retrieves current language and setLanguage from i18n context. Without a `languages` prop, it offers the languages
 * that have a loaded translation bundle, so every option can actually be applied.
 */
const LanguageSwitcher: Component = defineComponent({
  name: 'LanguageSwitcher',
  props: {
    className: {default: '', type: String},
    languages: {
      default: undefined,
      type: Array as PropType<SelectOption[]>,
    },
  },
  setup(props: LanguageSwitcherSetupProps, {slots}: {slots: any}): () => VNode {
    const {bundles, currentLanguage, setLanguage} = useI18n();

    const languageOptions = computed<SelectOption[]>(
      () =>
        props.languages ??
        Object.values(bundles?.value ?? {}).map((bundle: I18nBundle) => ({
          label: bundle.metadata?.displayName ?? bundle.metadata?.localeCode,
          value: bundle.metadata?.localeCode,
        })),
    );

    return (): VNode =>
      h(
        BaseLanguageSwitcher,
        {
          class: withVendorCSSClassPrefix('language-switcher--styled'),
          className: props.className,
          currentLanguage: currentLanguage?.value ?? 'en-US',
          languages: languageOptions.value,
          onLanguageChange: setLanguage,
        },
        slots,
      );
  },
});

export default LanguageSwitcher;
