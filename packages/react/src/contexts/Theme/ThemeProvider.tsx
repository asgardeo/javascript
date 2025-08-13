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

import {FC, PropsWithChildren, ReactElement, useEffect, useMemo, useState, useCallback} from 'react';
import {
  createTheme,
  Theme,
  ThemeConfig,
  ThemeMode,
  RecursivePartial,
  detectThemeMode,
  createClassObserver,
  createMediaQueryListener,
  BrowserThemeDetection,
  ThemePreferences,
} from '@asgardeo/browser';
import ThemeContext from './ThemeContext';
import useBrandingContext from '../Branding/useBrandingContext';

export interface ThemeProviderProps {
  theme?: RecursivePartial<ThemeConfig>;
  /**
   * The theme mode to use for automatic detection
   * - 'light': Always use light theme
   * - 'dark': Always use dark theme
   * - 'system': Use system preference (prefers-color-scheme media query)
   * - 'class': Detect theme based on CSS classes on HTML element
   * - 'branding': Use active theme from branding preference (requires inheritFromBranding=true)
   */
  mode?: ThemeMode | 'branding';
  /**
   * Configuration for theme detection when using 'class' or 'system' mode
   */
  detection?: BrowserThemeDetection;
  /**
   * Configuration for branding integration
   */
  inheritFromBranding?: ThemePreferences['inheritFromBranding'];
}

const applyThemeToDOM = (theme: Theme) => {
  Object.entries(theme.cssVariables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
};

/**
 * ThemeProvider component that manages theme state and provides theme context to child components.
 *
 * This provider integrates with Asgardeo branding preferences to automatically apply
 * organization-specific themes while allowing for custom theme overrides.
 *
 * Features:
 * - Automatic theme mode detection (light/dark/system/class)
 * - Integration with Asgardeo branding API through useBranding hook
 * - Merging of branding themes with custom theme configurations
 * - CSS variable injection for easy styling
 * - Loading and error states for branding integration
 *
 * @example
 * Basic usage with branding integration:
 * ```tsx
 * <ThemeProvider inheritFromBranding={true}>
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * @example
 * With custom theme overrides:
 * ```tsx
 * <ThemeProvider
 *   theme={{
 *     colors: {
 *       primary: { main: '#custom-color' }
 *     }
 *   }}
 *   inheritFromBranding={true}
 * >
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * @example
 * With branding-driven theme mode:
 * ```tsx
 * <ThemeProvider
 *   mode="branding"
 *   inheritFromBranding={true}
 * >
 *   <App />
 * </ThemeProvider>
 * ```
 */
const ThemeProvider: FC<PropsWithChildren<ThemeProviderProps>> = ({
  children,
  theme: themeConfig,
  mode = 'light',
  detection = {},
  inheritFromBranding = true,
}: PropsWithChildren<ThemeProviderProps>): ReactElement => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(() => {
    // Initialize with detected theme mode or fallback to defaultMode
    if (mode === 'light' || mode === 'dark') {
      return mode;
    }
    // For 'branding' mode, start with system preference and update when branding loads
    if (mode === 'branding') {
      return detectThemeMode('system', detection);
    }
    return detectThemeMode(mode, detection);
  });

  // Use branding theme if inheritFromBranding is enabled
  // Handle case where BrandingProvider might not be available
  let brandingTheme = null;
  let brandingActiveTheme = null;
  let isBrandingLoading = false;
  let brandingError = null;

  try {
    const brandingContext = useBrandingContext();
    brandingTheme = brandingContext.theme;
    brandingActiveTheme = brandingContext.activeTheme;
    isBrandingLoading = brandingContext.isLoading;
    brandingError = brandingContext.error;
  } catch (error) {
    // BrandingProvider not available, fall back to no branding
    if (inheritFromBranding) {
      console.warn(
        'ThemeProvider: inheritFromBranding is enabled but BrandingProvider is not available. ' +
          'Make sure to wrap your app with BrandingProvider or AsgardeoProvider with branding preferences.',
      );
    }
  }

  // Update color scheme based on branding active theme when available
  useEffect(() => {
    if (inheritFromBranding && brandingActiveTheme) {
      // Update color scheme based on mode preference
      if (mode === 'branding') {
        // Always follow branding active theme
        setColorScheme(brandingActiveTheme);
      } else if (mode === 'system' && !isBrandingLoading) {
        // For system mode, prefer branding but allow system override if no branding
        setColorScheme(brandingActiveTheme);
      }
    }
  }, [inheritFromBranding, brandingActiveTheme, mode, isBrandingLoading]);

  // Merge user-provided theme config with branding theme
  const finalThemeConfig = useMemo(() => {
    if (!inheritFromBranding || !brandingTheme) {
      return themeConfig;
    }

    // Convert branding theme to our theme config format
    const brandingThemeConfig: RecursivePartial<ThemeConfig> = {
      colors: brandingTheme.colors,
      borderRadius: brandingTheme.borderRadius,
      shadows: brandingTheme.shadows,
      spacing: brandingTheme.spacing,
      images: brandingTheme.images,
      components: brandingTheme.components,
    };

    // Merge branding theme with user-provided theme config
    // User-provided config takes precedence over branding
    return {
      ...brandingThemeConfig,
      ...themeConfig,
      colors: {
        ...brandingThemeConfig.colors,
        ...themeConfig?.colors,
      },
      borderRadius: {
        ...brandingThemeConfig.borderRadius,
        ...themeConfig?.borderRadius,
      },
      shadows: {
        ...brandingThemeConfig.shadows,
        ...themeConfig?.shadows,
      },
      spacing: {
        ...brandingThemeConfig.spacing,
        ...themeConfig?.spacing,
      },
      images: {
        ...brandingThemeConfig.images,
        ...themeConfig?.images,
      },
      components: {
        ...brandingThemeConfig.components,
        ...themeConfig?.components,
      },
    };
  }, [inheritFromBranding, brandingTheme, themeConfig]);

  const theme = useMemo(() => createTheme(finalThemeConfig, colorScheme === 'dark'), [finalThemeConfig, colorScheme]);

  const handleThemeChange = useCallback((isDark: boolean) => {
    setColorScheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    setColorScheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    let observer: MutationObserver | null = null;
    let mediaQuery: MediaQueryList | null = null;

    // Don't set up automatic theme detection for branding mode
    if (mode === 'branding') {
      return null;
    }

    if (mode === 'class') {
      const targetElement = detection.targetElement || document.documentElement;
      if (targetElement) {
        observer = createClassObserver(targetElement, handleThemeChange, detection);
      }
    } else if (mode === 'system') {
      // Only set up system listener if not using branding or branding hasn't loaded yet
      if (!inheritFromBranding || !brandingActiveTheme) {
        mediaQuery = createMediaQueryListener(handleThemeChange);
      }
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (mediaQuery) {
        // Clean up media query listener
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleThemeChange as any);
        } else {
          // Fallback for older browsers
          mediaQuery.removeListener(handleThemeChange as any);
        }
      }
    };
  }, [mode, detection, handleThemeChange, inheritFromBranding, brandingActiveTheme]);

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const value = {
    theme,
    colorScheme,
    toggleTheme,
    isBrandingLoading,
    brandingError,
    inheritFromBranding,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
