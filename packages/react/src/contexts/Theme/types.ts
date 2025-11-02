/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com).
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

export interface ThemeColors {
  background: {
    body: {
      main: string;
    };
    disabled: string;
    surface: string;
  };
  border: string;
  error: {
    contrastText: string;
    main: string;
  };
  primary: {
    contrastText: string;
    main: string;
  };
  secondary: {
    contrastText: string;
    main: string;
  };
  success: {
    contrastText: string;
    main: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
  warning: {
    contrastText: string;
    main: string;
  };
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
  /**
   * The prefix used for CSS variables.
   * @default 'asgardeo' (from VendorConstants.VENDOR_PREFIX)
   */
  cssVarPrefix?: string;
}

export interface ThemeVars {
  colors: {
    primary: {
      main: string;
      contrastText: string;
    };
    secondary: {
      main: string;
      contrastText: string;
    };
    background: {
      surface: string;
      disabled: string;
      body: {
        main: string;
      };
    };
    error: {
      main: string;
      contrastText: string;
    };
    success: {
      main: string;
      contrastText: string;
    };
    warning: {
      main: string;
      contrastText: string;
    };
    text: {
      primary: string;
      secondary: string;
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
}

export interface Theme extends ThemeConfig {
  cssVariables: Record<string, string>;
  vars: ThemeVars;
}
