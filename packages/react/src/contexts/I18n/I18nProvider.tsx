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

import {deepMerge, I18nPreferences, createPackageComponentLogger} from '@asgardeo/browser';
import {I18nBundle, getDefaultI18nBundles} from '@asgardeo/i18n';
import {FC, PropsWithChildren, ReactElement, useCallback, useEffect, useMemo, useState} from 'react';
import I18nContext, {I18nContextValue} from './I18nContext';

const logger: ReturnType<typeof createPackageComponentLogger> = createPackageComponentLogger(
  '@asgardeo/react',
  'I18nProvider',
);

const I18N_LANGUAGE_STORAGE_KEY: string = 'asgardeo-i18n-language';

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
      logger.warn('Failed to store language preference:');
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
  const defaultBundles: Record<string, I18nBundle> = getDefaultI18nBundles();

  // Determine the initial language based on preference order:
  // 1. User preference from config
  // 2. Stored language in localStorage
  // 3. Browser's default language
  // 4. Fallback language
  const determineInitialLanguage = (): string => {
    const configLanguage: string | undefined = preferences?.language;
    const storedLanguage: string | null = getStoredLanguage();
    const browserLanguage: string = detectBrowserLanguage();
    const fallbackLanguage: string = preferences?.fallbackLanguage || 'en-US';

    return configLanguage || storedLanguage || browserLanguage || fallbackLanguage;
  };

  const [currentLanguage, setCurrentLanguage] = useState<string>(determineInitialLanguage);

  // Bundles injected at runtime (e.g., from flow metadata i18n translations).
  // These take precedence over defaults but are overridden by prop-provided bundles.
  const [injectedBundles, setInjectedBundles] = useState<Record<string, I18nBundle>>({});

  const injectBundles: (newBundles: Record<string, I18nBundle>) => void = useCallback(
    (newBundles: Record<string, I18nBundle>): void => {
      setInjectedBundles((prev: Record<string, I18nBundle>) => {
        const merged: Record<string, I18nBundle> = {...prev};
        Object.entries(newBundles).forEach(([key, bundle]: [string, I18nBundle]) => {
          if (merged[key]) {
            merged[key] = {
              ...merged[key],
              translations: deepMerge(merged[key].translations, bundle.translations),
            };
          } else {
            merged[key] = bundle;
          }
        });
        return merged;
      });
    },
    [],
  );

  /**
   * Merge bundles in priority order: defaults → injected (meta) → prop-provided
   */
  const mergedBundles: Record<string, I18nBundle> = useMemo(() => {
    const merged: Record<string, I18nBundle> = {};

    // 1. Default bundles
    Object.entries(defaultBundles).forEach(([key, bundle]: [string, I18nBundle]) => {
      // Convert key format (e.g., 'en_US' to 'en-US')
      const languageKey: string = key.replace('_', '-');
      merged[languageKey] = bundle;
    });

    // 2. Injected bundles (e.g., from flow metadata) — override defaults
    Object.entries(injectedBundles).forEach(([key, bundle]: [string, I18nBundle]) => {
      if (merged[key]) {
        merged[key] = {
          ...merged[key],
          translations: deepMerge(merged[key].translations, bundle.translations),
        };
      } else {
        merged[key] = bundle;
      }
    });

    // 3. User-provided bundles (from props) — highest priority, override everything
    if (preferences?.bundles) {
      Object.entries(preferences.bundles).forEach(([key, userBundle]: [string, I18nBundle]) => {
        if (merged[key]) {
          merged[key] = {
            ...merged[key],
            metadata: userBundle.metadata ? {...merged[key].metadata, ...userBundle.metadata} : merged[key].metadata,
            translations: deepMerge(merged[key].translations, userBundle.translations),
          };
        } else {
          merged[key] = userBundle;
        }
      });
    }

    return merged;
  }, [defaultBundles, injectedBundles, preferences?.bundles]);

  const fallbackLanguage: string = preferences?.fallbackLanguage || 'en-US';

  // Update stored language when current language changes
  useEffect(() => {
    storeLanguage(currentLanguage);
  }, [currentLanguage]);

  // Translation function
  const t: (key: string, params?: Record<string, string | number>) => string = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let translation: string | undefined;

      // Try to get translation from current language bundle
      const currentBundle: I18nBundle | undefined = mergedBundles[currentLanguage];
      if (currentBundle?.translations[key]) {
        translation = currentBundle.translations[key];
      }

      // Fallback to fallback language if translation not found
      if (!translation && currentLanguage !== fallbackLanguage) {
        const fallbackBundle: I18nBundle | undefined = mergedBundles[fallbackLanguage];
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
        return Object.entries(params).reduce(
          (acc: string, [paramKey, paramValue]: [string, string | number]) =>
            acc.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue)),
          translation,
        );
      }

      return translation;
    },
    [mergedBundles, currentLanguage, fallbackLanguage],
  );

  // Language setter function
  const setLanguage: (language: string) => void = useCallback(
    (language: string) => {
      if (mergedBundles[language]) {
        setCurrentLanguage(language);
      } else {
        logger.warn(
          `Language '${language}' is not available. Available languages: ${Object.keys(mergedBundles).join(', ')}`,
        );
      }
    },
    [mergedBundles],
  );

  const contextValue: I18nContextValue = useMemo(
    () => ({
      bundles: mergedBundles,
      currentLanguage,
      fallbackLanguage,
      injectBundles,
      setLanguage,
      t,
    }),
    [currentLanguage, fallbackLanguage, injectBundles, mergedBundles, setLanguage, t],
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
};

export default I18nProvider;
