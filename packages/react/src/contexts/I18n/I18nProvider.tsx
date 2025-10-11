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

import {FC, PropsWithChildren, ReactElement, useCallback, useEffect, useMemo, useState} from 'react';
import {I18nBundle, getDefaultI18nBundles} from '@asgardeo/i18n';
import {deepMerge, I18nPreferences} from '@asgardeo/browser';
import I18nContext, {I18nContextValue} from './I18nContext';

const I18N_LANGUAGE_STORAGE_KEY = 'asgardeo-i18n-language';

export interface I18nProviderProps {
  /**
   * The i18n preferences from the AsgardeoProvider
   */
  preferences?: I18nPreferences;
}

/**
 * Detects the browser's default language or returns a fallback
 */
const detectBrowserLanguage = (): string => {
  if (typeof window !== 'undefined' && window.navigator) {
    return window.navigator.language || 'en-US';
  }
  return 'en-US';
};

/**
 * Gets the stored language from localStorage or returns null
 */
const getStoredLanguage = (): string | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(I18N_LANGUAGE_STORAGE_KEY);
    } catch (error) {
      // localStorage might not be available or accessible
      return null;
    }
  }
  return null;
};

/**
 * Stores the language in localStorage
 */
const storeLanguage = (language: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(I18N_LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      // localStorage might not be available or accessible
      console.warn('Failed to store language preference:', error);
    }
  }
};

/**
 * I18nProvider component that manages internationalization state and provides
 * translation functions to child components.
 */
const I18nProvider: FC<PropsWithChildren<I18nProviderProps>> = ({
  children,
  preferences,
}: PropsWithChildren<I18nProviderProps>): ReactElement => {
  // Get default bundles from the browser package
  const defaultBundles = getDefaultI18nBundles();

  // Determine the initial language based on preference order:
  // 1. User preference from config
  // 2. Stored language in localStorage
  // 3. Browser's default language
  // 4. Fallback language
  const determineInitialLanguage = (): string => {
    const configLanguage = preferences?.language;
    const storedLanguage = getStoredLanguage();
    const browserLanguage = detectBrowserLanguage();
    const fallbackLanguage = preferences?.fallbackLanguage || 'en-US';

    return configLanguage || storedLanguage || browserLanguage || fallbackLanguage;
  };

  const [currentLanguage, setCurrentLanguage] = useState<string>(determineInitialLanguage);

  // Merge default bundles with user-provided bundles
  const mergedBundles = useMemo(() => {
    const merged: Record<string, I18nBundle> = {};

    // Add default bundles
    Object.entries(defaultBundles).forEach(([key, bundle]) => {
      // Convert key format (e.g., 'en_US' to 'en-US')
      const languageKey = key.replace('_', '-');
      merged[languageKey] = bundle;
    });

    // Add user-provided bundles using deepMerge for better merging
    if (preferences?.bundles) {
      Object.entries(preferences.bundles).forEach(([key, userBundle]) => {
        if (merged[key]) {
          // Deep merge user bundle with existing default bundle
          merged[key] = {
            ...merged[key],
            translations: deepMerge(merged[key].translations, userBundle.translations),
            metadata: userBundle.metadata ? {...merged[key].metadata, ...userBundle.metadata} : merged[key].metadata,
          };
        } else {
          // No default bundle for this language, use user bundle as-is
          merged[key] = userBundle;
        }
      });
    }

    return merged;
  }, [defaultBundles, preferences?.bundles]);

  const fallbackLanguage = preferences?.fallbackLanguage || 'en-US';

  // Update stored language when current language changes
  useEffect(() => {
    storeLanguage(currentLanguage);
  }, [currentLanguage]);

  // Sync language with preferences when they change (e.g., Storybook toolbar)
  useEffect(() => {
    if (preferences?.language && preferences.language !== currentLanguage) {
      setCurrentLanguage(preferences.language);
    }
  }, [preferences?.language, currentLanguage]);

  // Translation function
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let translation: string | undefined;

      // Try to get translation from current language bundle
      const currentBundle = mergedBundles[currentLanguage];
      if (currentBundle?.translations[key]) {
        translation = currentBundle.translations[key];
      }

      // Fallback to fallback language if translation not found
      if (!translation && currentLanguage !== fallbackLanguage) {
        const fallbackBundle = mergedBundles[fallbackLanguage];
        if (fallbackBundle?.translations[key]) {
          translation = fallbackBundle.translations[key];
        }
      }

      // If still no translation found, return the key itself
      if (!translation) {
        translation = key;
      }

      // Replace parameters if provided
      if (params && Object.keys(params).length > 0) {
        return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
          return acc.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
        }, translation);
      }

      return translation;
    },
    [mergedBundles, currentLanguage, fallbackLanguage],
  );

  // Language setter function
  const setLanguage = useCallback(
    (language: string) => {
      if (mergedBundles[language]) {
        setCurrentLanguage(language);
      } else {
        console.warn(
          `Language '${language}' is not available. Available languages: ${Object.keys(mergedBundles).join(', ')}`,
        );
      }
    },
    [mergedBundles],
  );

  const contextValue: I18nContextValue = useMemo(
    () => ({
      currentLanguage,
      fallbackLanguage,
      bundles: mergedBundles,
      setLanguage,
      t,
    }),
    [currentLanguage, fallbackLanguage, mergedBundles, setLanguage, t],
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
};

export default I18nProvider;
