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

import {Theme, ThemeConfig, ThemeMode, ThemeVars} from './types';
import {RecursivePartial} from '../models/utility-types';
import VendorConstants from '../constants/VendorConstants';

const lightTheme: ThemeConfig = {
  colors: {
    action: {
      active: 'rgba(0, 0, 0, 0.54)',
      hover: 'rgba(0, 0, 0, 0.04)',
      hoverOpacity: 0.04,
      selected: 'rgba(0, 0, 0, 0.08)',
      selectedOpacity: 0.08,
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
      disabledOpacity: 0.38,
      focus: 'rgba(0, 0, 0, 0.12)',
      focusOpacity: 0.12,
      activatedOpacity: 0.12,
    },
    primary: {
      main: '#1a73e8',
      contrastText: '#ffffff',
      dark: '#174ea6',
    },
    secondary: {
      main: '#424242',
      contrastText: '#ffffff',
      dark: '#212121',
    },
    background: {
      surface: '#ffffff',
      disabled: '#f0f0f0',
      dark: '#212121',
      body: {
        main: '#1a1a1a',
        dark: '#212121',
      },
    },
    error: {
      main: '#d32f2f',
      contrastText: '#d52828',
      dark: '#b71c1c',
    },
    info: {
      main: '#bbebff',
      contrastText: '#43aeda',
      dark: '#01579b',
    },
    success: {
      main: '#4caf50',
      contrastText: '#00a807',
      dark: '#388e3c',
    },
    warning: {
      main: '#ff9800',
      contrastText: '#be7100',
      dark: '#f57c00',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
      dark: '#212121',
    },
    border: '#e0e0e0',
  },
  spacing: {
    unit: 8,
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
  },
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.15)',
    large: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSizes: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      md: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '2.125rem', // 34px
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },
  images: {
    favicon: {},
    logo: {},
  },
};

const darkTheme: ThemeConfig = {
  colors: {
    action: {
      active: '#1c1c1c',
      hover: '#1c1c1c',
      hoverOpacity: 0.04,
      selected: '#1c1c1c',
      selectedOpacity: 0.08,
      disabled: 'rgba(255, 255, 255, 0.26)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
      disabledOpacity: 0.38,
      focus: '#1c1c1c',
      focusOpacity: 0.12,
      activatedOpacity: 0.12,
    },
    primary: {
      main: '#1a73e8',
      contrastText: '#ffffff',
      dark: '#174ea6',
    },
    secondary: {
      main: '#8b8b8b',
      contrastText: '#ffffff',
      dark: '#212121',
    },
    background: {
      surface: '#121212',
      disabled: '#1f1f1f',
      dark: '#212121',
      body: {
        main: '#ffffff',
        dark: '#212121',
      },
    },
    error: {
      main: '#d32f2f',
      contrastText: '#d52828',
      dark: '#b71c1c',
    },
    info: {
      main: '#bbebff',
      contrastText: '#43aeda',
      dark: '#01579b',
    },
    success: {
      main: '#4caf50',
      contrastText: '#00a807',
      dark: '#388e3c',
    },
    warning: {
      main: '#ff9800',
      contrastText: '#be7100',
      dark: '#f57c00',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
      dark: '#212121',
    },
    border: '#404040',
  },
  spacing: {
    unit: 8,
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
  },
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.4)',
    large: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSizes: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      md: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '2.125rem', // 34px
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },
  images: {
    favicon: {},
    logo: {},
  },
};

const toCssVariables = (theme: ThemeConfig): Record<string, string> => {
  const cssVars: Record<string, string> = {};
  const prefix = theme.cssVarPrefix || VendorConstants.VENDOR_PREFIX;

  // Colors - Action
  if (theme.colors?.action?.active) {
    cssVars[`--${prefix}-color-action-active`] = theme.colors.action.active;
  }
  if (theme.colors?.action?.hover) {
    cssVars[`--${prefix}-color-action-hover`] = theme.colors.action.hover;
  }
  if (theme.colors?.action?.hoverOpacity !== undefined) {
    cssVars[`--${prefix}-color-action-hoverOpacity`] = theme.colors.action.hoverOpacity.toString();
  }
  if (theme.colors?.action?.selected) {
    cssVars[`--${prefix}-color-action-selected`] = theme.colors.action.selected;
  }
  if (theme.colors?.action?.selectedOpacity !== undefined) {
    cssVars[`--${prefix}-color-action-selectedOpacity`] = theme.colors.action.selectedOpacity.toString();
  }
  if (theme.colors?.action?.disabled) {
    cssVars[`--${prefix}-color-action-disabled`] = theme.colors.action.disabled;
  }
  if (theme.colors?.action?.disabledBackground) {
    cssVars[`--${prefix}-color-action-disabledBackground`] = theme.colors.action.disabledBackground;
  }
  if (theme.colors?.action?.disabledOpacity !== undefined) {
    cssVars[`--${prefix}-color-action-disabledOpacity`] = theme.colors.action.disabledOpacity.toString();
  }
  if (theme.colors?.action?.focus) {
    cssVars[`--${prefix}-color-action-focus`] = theme.colors.action.focus;
  }
  if (theme.colors?.action?.focusOpacity !== undefined) {
    cssVars[`--${prefix}-color-action-focusOpacity`] = theme.colors.action.focusOpacity.toString();
  }
  if (theme.colors?.action?.activatedOpacity !== undefined) {
    cssVars[`--${prefix}-color-action-activatedOpacity`] = theme.colors.action.activatedOpacity.toString();
  }

  // Colors - Primary
  if (theme.colors?.primary?.main) {
    cssVars[`--${prefix}-color-primary-main`] = theme.colors.primary.main;
  }
  if (theme.colors?.primary?.contrastText) {
    cssVars[`--${prefix}-color-primary-contrastText`] = theme.colors.primary.contrastText;
  }

  // Colors - Secondary
  if (theme.colors?.secondary?.main) {
    cssVars[`--${prefix}-color-secondary-main`] = theme.colors.secondary.main;
  }
  if (theme.colors?.secondary?.contrastText) {
    cssVars[`--${prefix}-color-secondary-contrastText`] = theme.colors.secondary.contrastText;
  }

  // Colors - Background
  if (theme.colors?.background?.surface) {
    cssVars[`--${prefix}-color-background-surface`] = theme.colors.background.surface;
  }
  if (theme.colors?.background?.disabled) {
    cssVars[`--${prefix}-color-background-disabled`] = theme.colors.background.disabled;
  }
  if (theme.colors?.background?.body?.main) {
    cssVars[`--${prefix}-color-background-body-main`] = theme.colors.background.body.main;
  }

  // Colors - Error
  if (theme.colors?.error?.main) {
    cssVars[`--${prefix}-color-error-main`] = theme.colors.error.main;
  }
  if (theme.colors?.error?.contrastText) {
    cssVars[`--${prefix}-color-error-contrastText`] = theme.colors.error.contrastText;
  }

  // Colors - Success
  if (theme.colors?.success?.main) {
    cssVars[`--${prefix}-color-success-main`] = theme.colors.success.main;
  }
  if (theme.colors?.success?.contrastText) {
    cssVars[`--${prefix}-color-success-contrastText`] = theme.colors.success.contrastText;
  }

  // Colors - Warning
  if (theme.colors?.warning?.main) {
    cssVars[`--${prefix}-color-warning-main`] = theme.colors.warning.main;
  }
  if (theme.colors?.warning?.contrastText) {
    cssVars[`--${prefix}-color-warning-contrastText`] = theme.colors.warning.contrastText;
  }

  // Colors - Info
  if (theme.colors?.info?.main) {
    cssVars[`--${prefix}-color-info-main`] = theme.colors.info.main;
  }
  if (theme.colors?.info?.contrastText) {
    cssVars[`--${prefix}-color-info-contrastText`] = theme.colors.info.contrastText;
  }

  // Colors - Text
  if (theme.colors?.text?.primary) {
    cssVars[`--${prefix}-color-text-primary`] = theme.colors.text.primary;
  }
  if (theme.colors?.text?.secondary) {
    cssVars[`--${prefix}-color-text-secondary`] = theme.colors.text.secondary;
  }

  // Colors - Border
  if (theme.colors?.border) {
    cssVars[`--${prefix}-color-border`] = theme.colors.border;
  }

  // Spacing
  if (theme.spacing?.unit !== undefined) {
    cssVars[`--${prefix}-spacing-unit`] = `${theme.spacing.unit}px`;
  }

  // Border Radius
  if (theme.borderRadius?.small) {
    cssVars[`--${prefix}-border-radius-small`] = theme.borderRadius.small;
  }
  if (theme.borderRadius?.medium) {
    cssVars[`--${prefix}-border-radius-medium`] = theme.borderRadius.medium;
  }
  if (theme.borderRadius?.large) {
    cssVars[`--${prefix}-border-radius-large`] = theme.borderRadius.large;
  }

  // Shadows
  if (theme.shadows?.small) {
    cssVars[`--${prefix}-shadow-small`] = theme.shadows.small;
  }
  if (theme.shadows?.medium) {
    cssVars[`--${prefix}-shadow-medium`] = theme.shadows.medium;
  }
  if (theme.shadows?.large) {
    cssVars[`--${prefix}-shadow-large`] = theme.shadows.large;
  }

  // Typography - Font Family
  if (theme.typography?.fontFamily) {
    cssVars[`--${prefix}-typography-fontFamily`] = theme.typography.fontFamily;
  }

  // Typography - Font Sizes
  if (theme.typography?.fontSizes?.xs) {
    cssVars[`--${prefix}-typography-fontSize-xs`] = theme.typography.fontSizes.xs;
  }
  if (theme.typography?.fontSizes?.sm) {
    cssVars[`--${prefix}-typography-fontSize-sm`] = theme.typography.fontSizes.sm;
  }
  if (theme.typography?.fontSizes?.md) {
    cssVars[`--${prefix}-typography-fontSize-md`] = theme.typography.fontSizes.md;
  }
  if (theme.typography?.fontSizes?.lg) {
    cssVars[`--${prefix}-typography-fontSize-lg`] = theme.typography.fontSizes.lg;
  }
  if (theme.typography?.fontSizes?.xl) {
    cssVars[`--${prefix}-typography-fontSize-xl`] = theme.typography.fontSizes.xl;
  }
  if (theme.typography?.fontSizes?.['2xl']) {
    cssVars[`--${prefix}-typography-fontSize-2xl`] = theme.typography.fontSizes['2xl'];
  }
  if (theme.typography?.fontSizes?.['3xl']) {
    cssVars[`--${prefix}-typography-fontSize-3xl`] = theme.typography.fontSizes['3xl'];
  }

  // Typography - Font Weights
  if (theme.typography?.fontWeights?.normal !== undefined) {
    cssVars[`--${prefix}-typography-fontWeight-normal`] = theme.typography.fontWeights.normal.toString();
  }
  if (theme.typography?.fontWeights?.medium !== undefined) {
    cssVars[`--${prefix}-typography-fontWeight-medium`] = theme.typography.fontWeights.medium.toString();
  }
  if (theme.typography?.fontWeights?.semibold !== undefined) {
    cssVars[`--${prefix}-typography-fontWeight-semibold`] = theme.typography.fontWeights.semibold.toString();
  }
  if (theme.typography?.fontWeights?.bold !== undefined) {
    cssVars[`--${prefix}-typography-fontWeight-bold`] = theme.typography.fontWeights.bold.toString();
  }

  // Typography - Line Heights
  if (theme.typography?.lineHeights?.tight !== undefined) {
    cssVars[`--${prefix}-typography-lineHeight-tight`] = theme.typography.lineHeights.tight.toString();
  }
  if (theme.typography?.lineHeights?.normal !== undefined) {
    cssVars[`--${prefix}-typography-lineHeight-normal`] = theme.typography.lineHeights.normal.toString();
  }
  if (theme.typography?.lineHeights?.relaxed !== undefined) {
    cssVars[`--${prefix}-typography-lineHeight-relaxed`] = theme.typography.lineHeights.relaxed.toString();
  }

  // Images
  if (theme.images) {
    Object.keys(theme.images).forEach(imageKey => {
      const imageConfig = theme.images![imageKey];
      if (imageConfig?.url) {
        cssVars[`--${prefix}-image-${imageKey}-url`] = imageConfig.url;
      }
      if (imageConfig?.title) {
        cssVars[`--${prefix}-image-${imageKey}-title`] = imageConfig.title;
      }
      if (imageConfig?.alt) {
        cssVars[`--${prefix}-image-${imageKey}-alt`] = imageConfig.alt;
      }
    });
  }

  /* |---------------------------------------------------------------| */
  /* |                       Components                              | */
  /* |---------------------------------------------------------------| */

  // Button Overrides
  if (theme.components?.Button?.styleOverrides?.root?.borderRadius) {
    cssVars[`--${prefix}-component-button-root-borderRadius`] =
      theme.components.Button.styleOverrides.root.borderRadius;
  }

  // Field Overrides (Parent of `TextField`, `DatePicker`, `OtpField`, `Select`, etc.)
  if (theme.components?.Field?.styleOverrides?.root?.borderRadius) {
    cssVars[`--${prefix}-component-field-root-borderRadius`] = theme.components.Field.styleOverrides.root.borderRadius;
  }

  return cssVars;
};

const toThemeVars = (theme: ThemeConfig): ThemeVars => {
  const prefix = theme.cssVarPrefix || VendorConstants.VENDOR_PREFIX;

  const componentVars: ThemeVars['components'] = {};
  if (theme.components?.Button?.styleOverrides?.root?.borderRadius) {
    componentVars.Button = {
      root: {
        borderRadius: `var(--${prefix}-component-button-root-borderRadius)`,
      },
    };
  }
  if (theme.components?.Field?.styleOverrides?.root?.borderRadius) {
    componentVars.Field = {
      root: {
        borderRadius: `var(--${prefix}-component-field-root-borderRadius)`,
      },
    };
  }

  const themeVars: ThemeVars = {
    colors: {
      action: {
        active: `var(--${prefix}-color-action-active)`,
        hover: `var(--${prefix}-color-action-hover)`,
        hoverOpacity: `var(--${prefix}-color-action-hoverOpacity)`,
        selected: `var(--${prefix}-color-action-selected)`,
        selectedOpacity: `var(--${prefix}-color-action-selectedOpacity)`,
        disabled: `var(--${prefix}-color-action-disabled)`,
        disabledBackground: `var(--${prefix}-color-action-disabledBackground)`,
        disabledOpacity: `var(--${prefix}-color-action-disabledOpacity)`,
        focus: `var(--${prefix}-color-action-focus)`,
        focusOpacity: `var(--${prefix}-color-action-focusOpacity)`,
        activatedOpacity: `var(--${prefix}-color-action-activatedOpacity)`,
      },
      primary: {
        main: `var(--${prefix}-color-primary-main)`,
        contrastText: `var(--${prefix}-color-primary-contrastText)`,
      },
      secondary: {
        main: `var(--${prefix}-color-secondary-main)`,
        contrastText: `var(--${prefix}-color-secondary-contrastText)`,
      },
      background: {
        surface: `var(--${prefix}-color-background-surface)`,
        disabled: `var(--${prefix}-color-background-disabled)`,
        body: {
          main: `var(--${prefix}-color-background-body-main)`,
        },
      },
      error: {
        main: `var(--${prefix}-color-error-main)`,
        contrastText: `var(--${prefix}-color-error-contrastText)`,
      },
      info: {
        contrastText: `var(--${prefix}-color-info-contrastText)`,
        main: `var(--${prefix}-color-info-main)`,
      },
      success: {
        main: `var(--${prefix}-color-success-main)`,
        contrastText: `var(--${prefix}-color-success-contrastText)`,
      },
      warning: {
        main: `var(--${prefix}-color-warning-main)`,
        contrastText: `var(--${prefix}-color-warning-contrastText)`,
      },
      text: {
        primary: `var(--${prefix}-color-text-primary)`,
        secondary: `var(--${prefix}-color-text-secondary)`,
      },
      border: `var(--${prefix}-color-border)`,
    },
    spacing: {
      unit: `var(--${prefix}-spacing-unit)`,
    },
    borderRadius: {
      small: `var(--${prefix}-border-radius-small)`,
      medium: `var(--${prefix}-border-radius-medium)`,
      large: `var(--${prefix}-border-radius-large)`,
    },
    shadows: {
      small: `var(--${prefix}-shadow-small)`,
      medium: `var(--${prefix}-shadow-medium)`,
      large: `var(--${prefix}-shadow-large)`,
    },
    typography: {
      fontFamily: `var(--${prefix}-typography-fontFamily)`,
      fontSizes: {
        xs: `var(--${prefix}-typography-fontSize-xs)`,
        sm: `var(--${prefix}-typography-fontSize-sm)`,
        md: `var(--${prefix}-typography-fontSize-md)`,
        lg: `var(--${prefix}-typography-fontSize-lg)`,
        xl: `var(--${prefix}-typography-fontSize-xl)`,
        '2xl': `var(--${prefix}-typography-fontSize-2xl)`,
        '3xl': `var(--${prefix}-typography-fontSize-3xl)`,
      },
      fontWeights: {
        normal: `var(--${prefix}-typography-fontWeight-normal)`,
        medium: `var(--${prefix}-typography-fontWeight-medium)`,
        semibold: `var(--${prefix}-typography-fontWeight-semibold)`,
        bold: `var(--${prefix}-typography-fontWeight-bold)`,
      },
      lineHeights: {
        tight: `var(--${prefix}-typography-lineHeight-tight)`,
        normal: `var(--${prefix}-typography-lineHeight-normal)`,
        relaxed: `var(--${prefix}-typography-lineHeight-relaxed)`,
      },
    },
  };

  // Add images if they exist
  if (theme.images) {
    themeVars.images = {};
    Object.keys(theme.images).forEach(imageKey => {
      const imageConfig = theme.images![imageKey];
      themeVars.images![imageKey] = {
        url: imageConfig?.url ? `var(--${prefix}-image-${imageKey}-url)` : undefined,
        title: imageConfig?.title ? `var(--${prefix}-image-${imageKey}-title)` : undefined,
        alt: imageConfig?.alt ? `var(--${prefix}-image-${imageKey}-alt)` : undefined,
      };
    });
  }

  if (Object.keys(componentVars).length > 0) {
    themeVars.components = componentVars;
  }

  return themeVars;
};

/**
 * Theme configuration for createTheme function (excludes runtime detection properties)
 */
type CreateThemeConfig = Omit<ThemeConfig, 'mode' | 'detection'>;

const createTheme = (config: RecursivePartial<CreateThemeConfig> = {}, isDark = false): Theme => {
  const baseTheme = isDark ? darkTheme : lightTheme;

  const mergedConfig = {
    ...baseTheme,
    ...config,
    colors: {
      ...baseTheme.colors,
      ...config.colors,
      action: {
        ...baseTheme.colors.action,
        ...(config.colors?.action || {}),
      },
      secondary: {
        ...baseTheme.colors.secondary,
        ...(config.colors?.secondary || {}),
      },
    },
    spacing: {
      ...baseTheme.spacing,
      ...config.spacing,
    },
    borderRadius: {
      ...baseTheme.borderRadius,
      ...config.borderRadius,
    },
    shadows: {
      ...baseTheme.shadows,
      ...config.shadows,
    },
    typography: {
      ...baseTheme.typography,
      ...config.typography,
      fontSizes: {
        ...baseTheme.typography.fontSizes,
        ...(config.typography?.fontSizes || {}),
      },
      fontWeights: {
        ...baseTheme.typography.fontWeights,
        ...(config.typography?.fontWeights || {}),
      },
      lineHeights: {
        ...baseTheme.typography.lineHeights,
        ...(config.typography?.lineHeights || {}),
      },
    },
    images: {
      ...baseTheme.images,
      ...config.images,
    },
  } as ThemeConfig;

  return {
    ...mergedConfig,
    cssVariables: toCssVariables(mergedConfig),
    vars: toThemeVars(mergedConfig),
  };
};

export const DEFAULT_THEME: ThemeMode = 'light';

export default createTheme;
