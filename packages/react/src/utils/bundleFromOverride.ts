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

import {I18nBundleOverride} from '@asgardeo/browser';
import {I18nBundle, I18nMetadata, I18nTextDirection, I18nTranslations} from '@asgardeo/i18n';

/**
 * Languages written right-to-left, by ISO 639-1 code.
 */
const RTL_LANGUAGES: Set<string> = new Set(['ar', 'dv', 'fa', 'he', 'ks', 'ku', 'ps', 'sd', 'ug', 'ur', 'yi']);

/**
 * Derives the text direction for a locale from its language code.
 */
export const deriveTextDirection = (locale: string): I18nTextDirection =>
  RTL_LANGUAGES.has(locale.split(/[-_]/)[0].toLowerCase()) ? 'rtl' : 'ltr';

/**
 * Builds a complete bundle from an application-supplied partial override for a locale that has
 * no built-in bundle, deriving the metadata from the locale code where it is not provided.
 */
const bundleFromOverride = (
  locale: string,
  override: I18nBundleOverride,
  translations: I18nTranslations,
): I18nBundle => {
  const [languageCode, countryCode = '']: string[] = locale.split(/[-_]/);

  return {
    metadata: {
      countryCode,
      direction: deriveTextDirection(locale),
      displayName: locale,
      languageCode,
      localeCode: locale,
      ...(override.metadata ?? {}),
    } as I18nMetadata,
    translations,
  };
};

export default bundleFromOverride;
