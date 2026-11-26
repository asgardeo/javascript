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

import {mount} from '@vue/test-utils';
import {describe, expect, it, vi} from 'vitest';
import {ref} from 'vue';
import BaseSignInButton from '../../components/actions/BaseSignInButton';
import LanguageSwitcher from '../../components/presentation/language-switcher/LanguageSwitcher';
import {I18N_KEY} from '../../keys';
import type {I18nContextValue} from '../../models/contexts';

const createI18n = (translations: Record<string, string>): I18nContextValue =>
  ({
    bundles: ref({
      'en-US': {metadata: {displayName: 'English (United States)', localeCode: 'en-US'}, translations: {}},
      'fr-FR': {metadata: {displayName: 'Français (France)', localeCode: 'fr-FR'}, translations: {}},
    }),
    currentLanguage: ref('en-US'),
    fallbackLanguage: 'en-US',
    injectBundles: vi.fn(),
    setLanguage: vi.fn(),
    t: (key: string): string => translations[key] ?? key,
  }) as unknown as I18nContextValue;

describe('button labels', () => {
  it('uses the translation of the active language', () => {
    const wrapper = mount(BaseSignInButton, {
      global: {provide: {[I18N_KEY as symbol]: createI18n({'elements.buttons.signin.text': 'Se connecter'})}},
    });

    expect(wrapper.text()).toContain('Se connecter');
  });

  it('falls back to English outside the provider', () => {
    expect(mount(BaseSignInButton).text()).toContain('Sign In');
  });
});

describe('LanguageSwitcher', () => {
  it('offers the languages that have a loaded bundle by default', () => {
    const wrapper = mount(LanguageSwitcher, {
      global: {provide: {[I18N_KEY as symbol]: createI18n({})}},
    });
    const html: string = wrapper.html();

    expect(html).toContain('English (United States)');
    expect(html).not.toContain('Spanish');
  });
});
