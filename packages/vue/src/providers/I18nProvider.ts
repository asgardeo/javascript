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

import {deepMerge, I18nPreferences, I18nStorageStrategy, createPackageComponentLogger} from '@asgardeo/browser';
import {
  I18nBundle,
  I18nTranslations,
  TranslationBundleConstants,
  getDefaultI18nBundles,
  normalizeTranslations,
} from '@asgardeo/i18n';
import {computed, defineComponent, h, provide, readonly, ref, watch, type PropType, type Ref} from 'vue';
import {I18N_KEY} from '../keys';
import type {I18nContextValue} from '../models/contexts';

const logger = createPackageComponentLogger('@asgardeo/vue', 'I18nProvider');

const DEFAULT_STORAGE_KEY = 'asgardeo-i18n-language';
const DEFAULT_URL_PARAM = 'lang';

// ── Storage helpers ──────────────────────────────────────────────────────────

const deriveRootDomain = (hostname: string): string => {
  const parts = hostname.split('.');
  return parts.length > 1 ? parts.slice(-2).join('.') : hostname;
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.*+?^${}()|[\]\\])/g, '\\$1')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const setCookie = (name: string, value: string, domain: string): void => {
  if (typeof document === 'undefined') return;
  const maxAge = 365 * 24 * 60 * 60;
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie =
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}` +
    `; Max-Age=${maxAge}` +
    `; Path=/` +
    `; Domain=${domain}` +
    `; SameSite=Lax${secure}`;
};

interface StorageAdapter {
  read: () => string | null;
  write: (language: string) => void;
}

const createStorageAdapter = (strategy: I18nStorageStrategy, key: string, cookieDomain?: string): StorageAdapter => {
  switch (strategy) {
    case 'cookie':
      return {
        read: () => getCookie(key),
        write: (language: string) => {
          const domain =
            cookieDomain ?? (typeof window !== 'undefined' ? deriveRootDomain(window.location.hostname) : '');
          if (domain) setCookie(key, language, domain);
        },
      };
    case 'localStorage':
      return {
        read: () => {
          if (typeof window === 'undefined' || !window.localStorage) return null;
          try {
            return window.localStorage.getItem(key);
          } catch {
            return null;
          }
        },
        write: (language: string) => {
          if (typeof window === 'undefined' || !window.localStorage) return;
          try {
            window.localStorage.setItem(key, language);
          } catch {
            logger.warn('Failed to persist language preference to localStorage.');
          }
        },
      };
    case 'none':
    default:
      return {read: () => null, write: () => {}};
  }
};

const detectUrlParamLanguage = (paramName: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return new URLSearchParams(window.location.search).get(paramName);
  } catch {
    return null;
  }
};

const detectBrowserLanguage = (): string => {
  if (typeof window !== 'undefined' && window.navigator) {
    return window.navigator.language || TranslationBundleConstants.FALLBACK_LOCALE;
  }
  return TranslationBundleConstants.FALLBACK_LOCALE;
};

// ── Component ────────────────────────────────────────────────────────────────

/**
 * I18nProvider manages internationalization state and provides translation
 * functions to child components via `useI18n()`.
 *
 * Language resolution order:
 *   URL param → stored preference → browser language → fallback locale
 *
 * @internal — This provider is mounted automatically by `<AsgardeoProvider>`.
 */
const I18nProvider = defineComponent({
  name: 'I18nProvider',
  props: {
    /** i18n preferences passed down from the AsgardeoProvider config. */
    preferences: {type: Object as PropType<I18nPreferences>, default: undefined},
  },
  setup(props, {slots}) {
    const defaultBundles: Record<string, I18nBundle> = getDefaultI18nBundles();

    const storageStrategy: I18nStorageStrategy = props.preferences?.storageStrategy ?? 'cookie';
    const storageKey: string = props.preferences?.storageKey ?? DEFAULT_STORAGE_KEY;
    const urlParamConfig: string | false =
      props.preferences?.urlParam === undefined ? DEFAULT_URL_PARAM : props.preferences.urlParam;

    const resolvedCookieDomain: string | undefined =
      storageStrategy === 'cookie'
        ? props.preferences?.cookieDomain ??
          (typeof window !== 'undefined' ? deriveRootDomain(window.location.hostname) : undefined)
        : undefined;

    const storage = createStorageAdapter(storageStrategy, storageKey, resolvedCookieDomain);

    // Determine initial language
    const determineInitialLanguage = (): string => {
      if (props.preferences?.language) return props.preferences.language;
      if (urlParamConfig !== false) {
        const urlLanguage = detectUrlParamLanguage(urlParamConfig);
        if (urlLanguage) {
          storage.write(urlLanguage);
          return urlLanguage;
        }
      }
      const storedLanguage = storage.read();
      if (storedLanguage) return storedLanguage;
      const browserLanguage = detectBrowserLanguage();
      if (browserLanguage) return browserLanguage;
      return props.preferences?.fallbackLanguage || TranslationBundleConstants.FALLBACK_LOCALE;
    };

    const currentLanguage: Ref<string> = ref(determineInitialLanguage());

    // Bundles injected at runtime (e.g., from flow metadata translations).
    const injectedBundles: Ref<Record<string, I18nBundle>> = ref({});

    const injectBundles = (newBundles: Record<string, I18nBundle>): void => {
      const merged: Record<string, I18nBundle> = {...injectedBundles.value};
      Object.entries(newBundles).forEach(([key, bundle]) => {
        const normalizedTranslations: I18nTranslations = normalizeTranslations(
          bundle.translations as unknown as Record<string, string | Record<string, string>>,
        );
        if (merged[key]) {
          merged[key] = {
            ...merged[key],
            translations: deepMerge(merged[key].translations, normalizedTranslations),
          };
        } else {
          merged[key] = {...bundle, translations: normalizedTranslations};
        }
      });
      injectedBundles.value = merged;
    };

    /**
     * Merge bundles: defaults → injected (meta) → prop-provided (highest priority)
     */
    const mergedBundles = computed<Record<string, I18nBundle>>(() => {
      const merged: Record<string, I18nBundle> = {};

      // 1. Default bundles
      Object.entries(defaultBundles).forEach(([key, bundle]) => {
        const languageKey = key.replace('_', '-');
        merged[languageKey] = bundle;
      });

      // 2. Injected bundles (from flow metadata)
      Object.entries(injectedBundles.value).forEach(([key, bundle]) => {
        const normalizedTranslations: I18nTranslations = normalizeTranslations(
          bundle.translations as unknown as Record<string, string | Record<string, string>>,
        );
        if (merged[key]) {
          merged[key] = {
            ...merged[key],
            translations: deepMerge(merged[key].translations, normalizedTranslations),
          };
        } else {
          merged[key] = {...bundle, translations: normalizedTranslations};
        }
      });

      // 3. User-provided bundles (highest priority)
      if (props.preferences?.bundles) {
        Object.entries(props.preferences.bundles).forEach(([key, userBundle]) => {
          const normalizedTranslations: I18nTranslations = normalizeTranslations(
            userBundle.translations as unknown as Record<string, string | Record<string, string>>,
          );
          if (merged[key]) {
            merged[key] = {
              ...merged[key],
              metadata: userBundle.metadata ? {...merged[key].metadata, ...userBundle.metadata} : merged[key].metadata,
              translations: deepMerge(merged[key].translations, normalizedTranslations),
            };
          } else {
            merged[key] = {...userBundle, translations: normalizedTranslations};
          }
        });
      }

      return merged;
    });

    const fallbackLanguage: string = props.preferences?.fallbackLanguage || TranslationBundleConstants.FALLBACK_LOCALE;

    // Persist language changes to storage
    watch(currentLanguage, (lang: string) => {
      storage.write(lang);
    });

    const t = (key: string, params?: Record<string, string | number>): string => {
      let translation: string | undefined;

      const currentBundle = mergedBundles.value[currentLanguage.value];
      if (currentBundle?.translations[key]) {
        translation = currentBundle.translations[key];
      }

      if (!translation && currentLanguage.value !== fallbackLanguage) {
        const fallbackBundle = mergedBundles.value[fallbackLanguage];
        if (fallbackBundle?.translations[key]) {
          translation = fallbackBundle.translations[key];
        }
      }

      if (!translation) {
        translation = key;
      }

      if (params && Object.keys(params).length > 0) {
        return Object.entries(params).reduce(
          (acc, [paramKey, paramValue]) => acc.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue)),
          translation,
        );
      }

      return translation;
    };

    const setLanguage = (language: string): void => {
      if (mergedBundles.value[language]) {
        currentLanguage.value = language;
      } else {
        logger.warn(
          `Language '${language}' is not available. Available languages: ${Object.keys(mergedBundles.value).join(
            ', ',
          )}`,
        );
      }
    };

    const context: I18nContextValue = {
      bundles: readonly(mergedBundles),
      currentLanguage: readonly(currentLanguage),
      fallbackLanguage,
      injectBundles,
      setLanguage,
      t,
    };

    provide(I18N_KEY, context);

    return () => h('div', {style: 'display:contents'}, slots['default']?.());
  },
});

export default I18nProvider;
