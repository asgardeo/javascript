/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
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

import {I18nBundle} from '@asgardeo/i18n';
import {describe, expect, it} from 'vitest';
import bundleFromOverride, {deriveTextDirection} from './bundleFromOverride';

describe('bundleFromOverride', () => {
  it('derives the metadata from the locale code', () => {
    const bundle: I18nBundle = bundleFromOverride('fr-FR', {translations: {}}, {} as any);

    expect(bundle.metadata).toEqual({
      countryCode: 'FR',
      direction: 'ltr',
      displayName: 'fr-FR',
      languageCode: 'fr',
      localeCode: 'fr-FR',
    });
  });

  it('marks right-to-left languages as rtl', () => {
    expect(bundleFromOverride('ar-AE', {translations: {}}, {} as any).metadata.direction).toBe('rtl');
    expect(deriveTextDirection('he')).toBe('rtl');
    expect(deriveTextDirection('en_US')).toBe('ltr');
  });

  it('lets the override metadata win', () => {
    const bundle: I18nBundle = bundleFromOverride(
      'ar-AE',
      {metadata: {direction: 'ltr', displayName: 'Arabic'}, translations: {}},
      {} as any,
    );

    expect(bundle.metadata.direction).toBe('ltr');
    expect(bundle.metadata.displayName).toBe('Arabic');
  });
});
