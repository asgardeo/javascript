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

import {ThemeDetection, ThemeMode, ThemeDetectionStrategy, DEFAULT_THEME} from '@asgardeo/javascript';

/**
 * Extended theme detection config that includes DOM-specific options
 */
export interface BrowserThemeDetection extends ThemeDetection {
  /**
   * The element to observe for changes (class or data attribute)
   * @default document.documentElement (html element)
   */
  targetElement?: HTMLElement;
}

/**
 * Detects theme from data attribute
 */
const detectFromDataAttribute = (
  targetElement: HTMLElement,
  config: BrowserThemeDetection,
): 'light' | 'dark' | null => {
  const attrName: string = config.dataAttribute?.name || 'theme';
  const lightValue: string = config.dataAttribute?.values?.light || 'light';
  const darkValue: string = config.dataAttribute?.values?.dark || 'dark';

  const attrValue: string | null = targetElement.getAttribute(`data-${attrName}`);

  if (attrValue === darkValue) return 'dark';
  if (attrValue === lightValue) return 'light';

  return null;
};

/**
 * Detects theme from CSS classes
 */
const detectFromClasses = (targetElement: HTMLElement, config: BrowserThemeDetection): 'light' | 'dark' | null => {
  const darkClass: string = config.classes?.dark || 'dark';
  const lightClass: string = config.classes?.light || 'light';

  const classList: DOMTokenList = targetElement.classList;

  if (classList.contains(darkClass)) return 'dark';
  if (classList.contains(lightClass)) return 'light';

  return null;
};

/**
 * Detects theme from system preference
 */
const detectFromSystem = (): ThemeMode => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return DEFAULT_THEME;
};

/**
 * Detects the current theme mode based on the specified method
 */
export const detectThemeMode = (mode: ThemeMode, config: BrowserThemeDetection = {}): ThemeMode => {
  const targetElement: HTMLElement | null = (config.targetElement ||
    (typeof document !== 'undefined' ? document.documentElement : null)) as HTMLElement | null;

  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';

  if (mode === 'system') {
    return detectFromSystem();
  }

  if (mode === 'auto') {
    if (!targetElement) {
      console.warn('ThemeDetection: targetElement is required for auto detection, falling back to system');
      return detectFromSystem();
    }

    // Get strategy and priority
    // For legacy 'class' mode, default to 'class' strategy
    const strategy: ThemeDetectionStrategy = config.strategy || 'auto';
    const priority: ThemeDetectionStrategy[] = config.priority || ['dataAttribute', 'class', 'system'];

    if (strategy === 'auto') {
      // Try detection methods in priority order
      for (const method of priority) {
        let result: ThemeMode | null = null;

        switch (method) {
          case 'dataAttribute':
            result = detectFromDataAttribute(targetElement, config);
            break;
          case 'class':
            result = detectFromClasses(targetElement, config);
            break;
          case 'system':
            result = detectFromSystem();
            break;
        }

        if (result !== null) {
          return result;
        }
      }

      // Fallback to light if nothing detected
      return DEFAULT_THEME;
    } else {
      // Use specific strategy
      switch (strategy) {
        case 'dataAttribute':
          return detectFromDataAttribute(targetElement, config) || DEFAULT_THEME;
        case 'class':
          return detectFromClasses(targetElement, config) || DEFAULT_THEME;
        case 'system':
          return detectFromSystem();
        case 'manual':
        default:
          return DEFAULT_THEME;
      }
    }
  }

  return DEFAULT_THEME;
};

/**
 * Creates a MutationObserver to watch for class changes on the target element
 */
export const createClassObserver = (
  targetElement: HTMLElement,
  callback: (isDark: boolean) => void,
  config: BrowserThemeDetection = {},
): MutationObserver => {
  const darkClass: string = config.classes?.dark || 'dark';
  const lightClass: string = config.classes?.light || 'light';

  const observer: MutationObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const classList: DOMTokenList = targetElement.classList;

        if (classList.contains(darkClass)) {
          callback(true);
        } else if (classList.contains(lightClass)) {
          callback(false);
        }
        // If neither class is present, we don't trigger the callback
        // to avoid unnecessary re-renders
      }
    });
  });

  observer.observe(targetElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  return observer;
};

/**
 * Creates a MutationObserver to watch for data attribute changes on the target element
 */
export const createDataAttributeObserver = (
  targetElement: HTMLElement,
  callback: (isDark: boolean) => void,
  config: BrowserThemeDetection = {},
): MutationObserver => {
  const attrName: string = config.dataAttribute?.name || 'theme';
  const lightValue: string = config.dataAttribute?.values?.light || 'light';
  const darkValue: string = config.dataAttribute?.values?.dark || 'dark';

  const observer: MutationObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes' && mutation.attributeName === `data-${attrName}`) {
        const attrValue: string | null = targetElement.getAttribute(`data-${attrName}`);

        if (attrValue === darkValue) {
          callback(true);
        } else if (attrValue === lightValue) {
          callback(false);
        }
        // If the value doesn't match expected values, don't trigger callback
      }
    });
  });

  observer.observe(targetElement, {
    attributes: true,
    attributeFilter: [`data-${attrName}`],
  });

  return observer;
};

/**
 * Creates observers for auto-detection based on priority
 */
export const createAutoObserver = (
  targetElement: HTMLElement,
  callback: (isDark: boolean) => void,
  config: BrowserThemeDetection = {},
): {observers: MutationObserver[]; mediaQuery: MediaQueryList | null} => {
  const priority: ThemeDetectionStrategy[] = config.priority || ['dataAttribute', 'class', 'system'];
  const observers: MutationObserver[] = [];
  let mediaQuery: MediaQueryList | null = null;

  for (const strategy of priority) {
    switch (strategy) {
      case 'dataAttribute':
        observers.push(createDataAttributeObserver(targetElement, callback, config));
        break;
      case 'class':
        observers.push(createClassObserver(targetElement, callback, config));
        break;
      case 'system':
        if (!mediaQuery) {
          mediaQuery = createMediaQueryListener(callback);
        }
        break;
    }
  }

  return {observers, mediaQuery};
};

/**
 * Creates a media query listener for system theme changes
 */
export const createMediaQueryListener = (callback: (isDark: boolean) => void): MediaQueryList | null => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return null;
  }

  const mediaQuery: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
  } else {
    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
  }

  return mediaQuery;
};
