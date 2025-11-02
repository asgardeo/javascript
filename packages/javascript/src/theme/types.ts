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

export interface ThemeTypography {
  fontFamily: string;
  fontSizes: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface ThemeColors {
  action: {
    active: string;
    hover: string;
    hoverOpacity: number;
    selected: string;
    selectedOpacity: number;
    disabled: string;
    disabledBackground: string;
    disabledOpacity: number;
    focus: string;
    focusOpacity: number;
    activatedOpacity: number;
  };
  background: {
    body: {
      main: string;
      dark?: string;
    };
    disabled: string;
    surface: string;
    dark?: string;
  };
  border: string;
  error: {
    contrastText: string;
    main: string;
    dark?: string;
  };
  info: {
    contrastText: string;
    main: string;
    dark?: string;
  };
  primary: {
    contrastText: string;
    main: string;
    dark?: string;
  };
  secondary: {
    contrastText: string;
    main: string;
    dark?: string;
  };
  success: {
    contrastText: string;
    main: string;
    dark?: string;
  };
  text: {
    primary: string;
    secondary: string;
    dark?: string;
  };
  warning: {
    contrastText: string;
    main: string;
    dark?: string;
  };
}

export interface ThemeComponentStyleOverrides {
  /**
   * Style overrides for the root element or slots.
   * Example: { root: { borderRadius: '8px' } }
   */
  root?: Record<string, any>;
  [slot: string]: Record<string, any> | undefined;
}

export interface ThemeComponents {
  Button?: {
    styleOverrides?: {
      root?: {
        borderRadius?: string;
        [key: string]: any;
      };
      [slot: string]: Record<string, any> | undefined;
    };
    defaultProps?: Record<string, any>;
    variants?: Array<Record<string, any>>;
  };
  Field?: {
    styleOverrides?: {
      root?: {
        borderRadius?: string;
        [key: string]: any;
      };
      [slot: string]: Record<string, any> | undefined;
    };
    defaultProps?: Record<string, any>;
    variants?: Array<Record<string, any>>;
  };
  [componentName: string]:
    | {
        styleOverrides?: ThemeComponentStyleOverrides;
        defaultProps?: Record<string, any>;
        variants?: Array<Record<string, any>>;
      }
    | undefined;
}

export interface ThemeConfig {
  borderRadius: {
    large: string;
    medium: string;
    small: string;
  };
  colors: ThemeColors;
  /**
   * The text direction for the UI.
   * @default 'ltr'
   */
  direction?: 'ltr' | 'rtl';
  shadows: {
    large: string;
    medium: string;
    small: string;
  };
  spacing: {
    unit: number;
  };
  typography: {
    fontFamily: string;
    fontSizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeights: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeights: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  /**
   * Image assets configuration
   */
  images?: ThemeImages;
  /**
   * The prefix used for CSS variables.
   * @default 'asgardeo' (from VendorConstants.VENDOR_PREFIX)
   */
  cssVarPrefix?: string;
  /**
   * Component style overrides
   */
  components?: ThemeComponents;
}

export interface ThemeComponentVars {
  Button?: {
    root?: {
      borderRadius?: string;
      [key: string]: any;
    };
    [slot: string]: Record<string, any> | undefined;
  };
  Field?: {
    root?: {
      borderRadius?: string;
      [key: string]: any;
    };
    [slot: string]: Record<string, any> | undefined;
  };
  [componentName: string]:
    | {
        [slot: string]: Record<string, any> | undefined;
      }
    | undefined;
}

export interface ThemeVars {
  colors: {
    action: {
      active: string;
      hover: string;
      hoverOpacity: string;
      selected: string;
      selectedOpacity: string;
      disabled: string;
      disabledBackground: string;
      disabledOpacity: string;
      focus: string;
      focusOpacity: string;
      activatedOpacity: string;
    };
    primary: {
      main: string;
      contrastText: string;
      dark?: string;
    };
    secondary: {
      main: string;
      contrastText: string;
      dark?: string;
    };
    background: {
      surface: string;
      disabled: string;
      dark?: string;
      body: {
        main: string;
        dark?: string;
      };
    };
    error: {
      main: string;
      contrastText: string;
      dark?: string;
    };
    info: {
      contrastText: string;
      main: string;
      dark?: string;
    };
    success: {
      main: string;
      contrastText: string;
      dark?: string;
    };
    warning: {
      main: string;
      contrastText: string;
      dark?: string;
    };
    text: {
      primary: string;
      secondary: string;
      dark?: string;
    };
    border: string;
  };
  spacing: {
    unit: string;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  typography: {
    fontFamily: string;
    fontSizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeights: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    lineHeights: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  images?: {
    favicon?: {
      url?: string;
      title?: string;
      alt?: string;
    };
    logo?: {
      url?: string;
      title?: string;
      alt?: string;
    };
    [key: string]:
      | {
          url?: string;
          title?: string;
          alt?: string;
        }
      | undefined;
  };
  /**
   * Component CSS variable references (e.g., for overrides)
   */
  components?: ThemeComponentVars;
}

export interface Theme extends ThemeConfig {
  cssVariables: Record<string, string>;
  vars: ThemeVars;
}

export type ThemeMode = 'light' | 'dark' | 'system' | 'class';

export interface ThemeDetection {
  /**
   * The CSS class name to detect for dark mode (without the dot)
   * @default 'dark'
   */
  darkClass?: string;
  /**
   * The CSS class name to detect for light mode (without the dot)
   * @default 'light'
   */
  lightClass?: string;
}

export interface ThemeImage {
  /**
   * The URL of the image
   */
  url?: string;
  /**
   * The title/alt text for the image
   */
  title?: string;
  /**
   * Alternative text for accessibility
   */
  alt?: string;
}

export interface ThemeImages {
  /**
   * Favicon configuration
   */
  favicon?: ThemeImage;
  /**
   * Logo configuration
   */
  logo?: ThemeImage;
  /**
   * Allow for additional custom images
   */
  [key: string]: ThemeImage | undefined;
}
