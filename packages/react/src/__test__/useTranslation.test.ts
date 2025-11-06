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

import {renderHook} from '@testing-library/react';
import React from 'react';
import useTranslation from '../hooks/useTranslation';
import I18nContext, {I18nContextValue} from '../contexts/I18n/I18nContext';
import {I18nBundle, I18nTextDirection} from '@asgardeo/i18n';
import {vi, describe, it, expect} from 'vitest';

// --- MOCK @asgardeo/browser ---
vi.mock('@asgardeo/browser', () => ({
  deepMerge: vi.fn((a, b) => ({...a, ...b})),
  I18nPreferences: vi.fn(),
}));

// --- Mock Data ---
const globalBundles: Record<string, I18nBundle> = {
  en: {
    translations: {welcome: 'Welcome', goodbye: 'Goodbye', helloName: 'Hello, {name}!'} as any,
    metadata: {
      localeCode: 'en-US',
      countryCode: 'US',
      languageCode: 'en',
      displayName: 'English',
      direction: 'ltr' as I18nTextDirection,
    },
  },
  es: {
    translations: {welcome: 'Bienvenido', goodbye: 'Adiós'} as any,
    metadata: {
      localeCode: 'es-ES',
      countryCode: 'ES',
      languageCode: 'es',
      displayName: 'Spanish',
      direction: 'ltr' as I18nTextDirection,
    },
  },
};

const mockSetLanguage = vi.fn();

// --- Context helper ---
const createTFunction = (lang: 'en' | 'es') => (key: string, params?: Record<string, string>) => {
  const translation =
    (globalBundles[lang].translations as any)[key] || (globalBundles['en'].translations as any)[key] || key;
  if (!params) return translation;
  return Object.keys(params).reduce((str, p) => str.replace(`{${p}}`, params[p]), translation);
};

const contextValue: I18nContextValue = {
  t: createTFunction('en'),
  currentLanguage: 'en',
  setLanguage: mockSetLanguage,
  bundles: globalBundles,
  fallbackLanguage: 'en',
};

const wrapper: React.FC<{children: React.ReactNode}> = ({children}) =>
  React.createElement(I18nContext.Provider, {value: contextValue}, children);

const esContext: I18nContextValue = {
  ...contextValue,
  currentLanguage: 'es',
  t: createTFunction('es'),
};

const esWrapper: React.FC<{children: React.ReactNode}> = ({children}) =>
  React.createElement(I18nContext.Provider, {value: esContext}, children);

// --- Tests ---
describe('useTranslation hook', () => {
  it('returns translations for current language', () => {
    const {result} = renderHook(() => useTranslation(), {wrapper});
    const t = result.current.t;

    expect(t('welcome')).toBe('Welcome');
    expect(t('goodbye')).toBe('Goodbye');
    expect(t('nonexistent')).toBe('nonexistent');
  });

  it('supports translation parameters', () => {
    const {result} = renderHook(() => useTranslation(), {wrapper});
    const t = result.current.t;

    expect(t('helloName', {name: 'Alice'})).toBe('Hello, Alice!');
  });

  it('falls back to fallback language if key missing in current language', () => {
    const {result} = renderHook(() => useTranslation(), {wrapper: esWrapper});
    const t = result.current.t;

    expect(t('helloName', {name: 'Bob'})).toBe('Hello, Bob!');
  });

  it('allows changing language via setLanguage', () => {
    const {result} = renderHook(() => useTranslation(), {wrapper});

    result.current.setLanguage('es');
    expect(mockSetLanguage).toHaveBeenCalledWith('es');
  });

  it('merges component-level bundles correctly', () => {
    const componentBundles = {
      bundles: {
        en: {
          translations: {welcome: 'Welcome Component'} as any,
          metadata: {
            localeCode: 'en-US',
            countryCode: 'US',
            languageCode: 'en',
            displayName: 'English',
            direction: 'ltr' as I18nTextDirection,
          },
        },
      },
    };

    const {result} = renderHook(() => useTranslation(componentBundles), {wrapper});
    const t = result.current.t;

    expect(t('welcome')).toBe('Welcome Component');
    expect(t('goodbye')).toBe('Goodbye');
  });

  it('returns availableLanguages correctly', () => {
    const {result} = renderHook(() => useTranslation(), {wrapper});
    expect(result.current.availableLanguages).toEqual(['en', 'es']);
  });

  it('throws error if used outside of I18nProvider', () => {
    expect(() => renderHook(() => useTranslation())).toThrow(/useTranslation must be used within an I18nProvider/);
  });
});
