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

import {BrandingPreference, ThemeVariant} from '../models/branding-preference';
import {Theme, ThemeConfig} from '../theme/types';
import createTheme from '../theme/createTheme';

/**
 * Safely extracts a color value from the branding preference structure
 */
type ColorVariant = {main?: string; dark?: string; contrastText?: string};
type TextColors = {primary?: string; secondary?: string; dark?: string};

const extractColorValue = (colorVariant?: ColorVariant, preferDark = false, fallback = '#000000'): string => {
  if (preferDark && colorVariant?.dark && colorVariant.dark.trim()) {
    return colorVariant.dark;
  }
  return colorVariant?.main || fallback;
};

/**
 * Safely extracts contrast text color from the branding preference structure
 */
const extractContrastText = (colorVariant?: {main?: string; contrastText?: string}, fallback = '#ffffff'): string => {
  return colorVariant?.contrastText || fallback;
};

/**
 * Transforms a ThemeVariant from branding preference to ThemeConfig
 */
const transformThemeVariant = (themeVariant: ThemeVariant, isDark = false): Partial<ThemeConfig> => {
  const colors = themeVariant.colors;
  const buttons = themeVariant.buttons;
  const inputs = themeVariant.inputs;
  const images = themeVariant.images;

  const config: Partial<ThemeConfig> = {
    colors: {
      action: {
        active: isDark ? 'rgba(255, 255, 255, 0.70)' : 'rgba(0, 0, 0, 0.54)',
        hover: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
        hoverOpacity: 0.04,
        selected: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        selectedOpacity: 0.08,
        disabled: isDark ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.26)',
        disabledBackground: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
        disabledOpacity: 0.38,
        focus: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
        focusOpacity: 0.12,
        activatedOpacity: 0.12,
      },
      primary: {
        main: extractColorValue(colors?.primary as ColorVariant, isDark, '#1976d2'),
        contrastText: extractContrastText(colors?.primary, '#ffffff'),
        dark: colors?.primary?.dark || (colors?.primary as ColorVariant)?.main || '#1565c0',
      },
      secondary: {
        main: extractColorValue(colors?.secondary as ColorVariant, isDark, '#dc004e'),
        contrastText: extractContrastText(colors?.secondary, '#ffffff'),
        dark: colors?.secondary?.dark || (colors?.secondary as ColorVariant)?.main || '#9a0036',
      },
      background: {
        surface: extractColorValue(colors?.background?.surface as ColorVariant, isDark, '#ffffff'),
        disabled: extractColorValue(colors?.background?.surface as ColorVariant, isDark, '#f5f5f5'),
        dark:
          (colors?.background?.surface as ColorVariant)?.dark || (colors?.background?.surface as ColorVariant)?.main || '#303030',
        body: {
          main: extractColorValue(colors?.background?.body as ColorVariant, isDark, '#fafafa'),
          dark: (colors?.background?.body as ColorVariant)?.dark || (colors?.background?.body as ColorVariant)?.main || '#212121',
        },
      },
      text: {
        primary: (colors?.text as TextColors)?.primary || '#000000',
        secondary: (colors?.text as TextColors)?.secondary || '#666666',
        dark: (colors?.text as TextColors)?.dark || (colors?.text as TextColors)?.primary || '#000000',
      },
      border: colors?.outlined?.default || '#e0e0e0',
      error: {
        main: extractColorValue(colors?.alerts?.error as ColorVariant, isDark, '#d32f2f'),
        contrastText: extractContrastText(colors?.alerts?.error, '#ffffff'),
        dark: (colors?.alerts?.error as ColorVariant)?.dark || (colors?.alerts?.error as ColorVariant)?.main || '#c62828',
      },
      info: {
        main: extractColorValue(colors?.alerts?.info as ColorVariant, isDark, '#1976d2'),
        contrastText: extractContrastText(colors?.alerts?.info, '#ffffff'),
        dark: (colors?.alerts?.info as ColorVariant)?.dark || (colors?.alerts?.info as ColorVariant)?.main || '#1565c0',
      },
      success: {
        main: extractColorValue(colors?.alerts?.neutral as ColorVariant, isDark, '#2e7d32'),
        contrastText: extractContrastText(colors?.alerts?.neutral, '#ffffff'),
        dark: (colors?.alerts?.neutral as ColorVariant)?.dark || (colors?.alerts?.neutral as ColorVariant)?.main || '#1b5e20',
      },
      warning: {
        main: extractColorValue(colors?.alerts?.warning as ColorVariant, isDark, '#ed6c02'),
        contrastText: extractContrastText(colors?.alerts?.warning, '#ffffff'),
        dark: (colors?.alerts?.warning as ColorVariant)?.dark || (colors?.alerts?.warning as ColorVariant)?.main || '#e65100',
      },
    },
    images: {
      favicon: images?.favicon
        ? {
            url: images.favicon.imgURL,
            title: images.favicon.title,
            alt: images.favicon.altText,
          }
        : undefined,
      logo: images?.logo
        ? {
            url: images.logo.imgURL,
            title: images.logo.title,
            alt: images.logo.altText,
          }
        : undefined,
    },
  };

  /* |---------------------------------------------------------------| */
  /* |                       Components                              | */
  /* |---------------------------------------------------------------| */

  const buttonBorderRadius = buttons?.primary?.base?.border?.borderRadius;
  const fieldBorderRadius = inputs?.base?.border?.borderRadius;

  if (buttonBorderRadius || fieldBorderRadius) {
    config.components = {
      ...(buttonBorderRadius && {
        Button: {
          styleOverrides: {
            root: {
              borderRadius: buttonBorderRadius,
            },
          },
        },
      }),
      ...(fieldBorderRadius && {
        Field: {
          styleOverrides: {
            root: {
              borderRadius: fieldBorderRadius,
            },
          },
        },
      }),
    };
  }

  return config;
};

/**
 * Transforms branding preference response to Theme object
 *
 * @param brandingPreference - The branding preference response from getBrandingPreference
 * @param forceTheme - Optional parameter to force a specific theme ('light' or 'dark'),
 *                     if not provided, will use the activeTheme from branding preference
 * @returns Theme object that can be used with the theme system
 *
 * The function extracts the following from branding preference:
 * - Colors (primary, secondary, background, text, alerts, etc.)
 * - Border radius from buttons and inputs
 * - Images (logo and favicon with their URLs, titles, and alt text)
 * - Typography settings
 *
 * @example
 * ```typescript
 * const brandingPreference = await getBrandingPreference({ baseUrl: "..." });
 * const theme = transformBrandingPreferenceToTheme(brandingPreference);
 *
 * // Access image URLs via CSS variables
 * // Logo: var(--wso2-image-logo-url)
 * // Favicon: var(--wso2-image-favicon-url)
 *
 * // Force light theme regardless of branding preference activeTheme
 * const lightTheme = transformBrandingPreferenceToTheme(brandingPreference, 'light');
 * ```
 */
export const transformBrandingPreferenceToTheme = (
  brandingPreference: BrandingPreference,
  forceTheme?: 'light' | 'dark',
): Theme => {
  // Extract theme configuration
  const themeConfig = brandingPreference?.preference?.theme;

  if (!themeConfig) {
    // If no theme config is provided, return default light theme
    return createTheme({}, false);
  }

  // Determine which theme variant to use
  let activeThemeKey: string;
  if (forceTheme) {
    activeThemeKey = forceTheme.toUpperCase();
  } else {
    activeThemeKey = themeConfig.activeTheme || 'LIGHT';
  }

  // Get the theme variant (LIGHT or DARK)
  const themeVariant = themeConfig[activeThemeKey as keyof typeof themeConfig] as ThemeVariant;

  if (!themeVariant) {
    // If the specified theme variant doesn't exist, fallback to light theme
    const fallbackVariant = themeConfig.LIGHT || themeConfig.DARK;
    if (fallbackVariant) {
      const transformedConfig = transformThemeVariant(fallbackVariant, activeThemeKey === 'DARK');
      return createTheme(transformedConfig, activeThemeKey === 'DARK');
    }
    // If no theme variants exist, return default theme
    return createTheme({}, activeThemeKey === 'DARK');
  }

  // Transform the theme variant to ThemeConfig
  const transformedConfig = transformThemeVariant(themeVariant, activeThemeKey === 'DARK');

  // Create the theme using the transformed config
  return createTheme(transformedConfig, activeThemeKey === 'DARK');
};

export default transformBrandingPreferenceToTheme;
