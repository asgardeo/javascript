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

/**
 * Theme mode enumeration for light and dark themes.
 */
export type ThemeMode = 'LIGHT' | 'DARK';

/**
 * Color variant interface containing different shades and contrast values for accessibility.
 */
export interface ColorVariant {
  contrastText: string;
  dark: string;
  light: string;
  main: string;
  inverted: string;
}

/**
 * Alert color configuration for different notification states (error, info, neutral, warning).
 */
export interface AlertColors {
  error: ColorVariant;
  info: ColorVariant;
  neutral: ColorVariant;
  warning: ColorVariant;
}

/**
 * Background color configuration for different surfaces in the application.
 */
export interface BackgroundColors {
  body: ColorVariant;
  surface: ColorVariant;
}

/**
 * Illustration color configuration for decorative elements and accent colors.
 */
export interface IllustrationColors {
  accent1: ColorVariant;
  accent2: ColorVariant;
  accent3: ColorVariant;
  primary: ColorVariant;
  secondary: ColorVariant;
}

/**
 * Text color configuration for different text hierarchy levels.
 */
export interface TextColors {
  primary: string;
  secondary: string;
}

/**
 * Complete color palette configuration containing all color categories used in the theme.
 */
export interface Colors {
  alerts: AlertColors;
  background: BackgroundColors;
  illustrations: IllustrationColors;
  outlined: {
    default: string;
  };
  primary: ColorVariant;
  secondary: ColorVariant;
  text: TextColors;
}

/**
 * Font styling configuration with color and optional font family.
 */
export interface FontStyle {
  color: string;
  fontFamily?: string;
}

/**
 * Border styling configuration with optional color, radius, and width properties.
 */
export interface BorderStyle {
  borderColor?: string;
  borderRadius?: string;
  borderWidth?: string;
}

/**
 * Background styling configuration with optional background color.
 */
export interface BackgroundStyle {
  backgroundColor?: string;
}

/**
 * Button styling configuration combining background, border, and font styles.
 */
export interface ButtonStyle {
  background?: BackgroundStyle;
  border?: BorderStyle;
  font?: FontStyle;
}

/**
 * Complete button configuration for all button types used in the application.
 */
export interface Buttons {
  externalConnection: {
    base: ButtonStyle;
  };
  primary: {
    base: ButtonStyle;
  };
  secondary: {
    base: ButtonStyle;
  };
}

/**
 * Input field styling configuration with support for labels and various states.
 */
export interface InputStyle {
  background?: BackgroundStyle;
  border?: BorderStyle;
  font?: FontStyle;
  labels?: {
    font?: FontStyle;
  };
}

/**
 * Input components configuration containing base styling for all input types.
 */
export interface Inputs {
  base: InputStyle;
}

/**
 * Login box styling configuration for authentication forms.
 */
export interface LoginBoxStyle {
  background?: BackgroundStyle;
  border?: BorderStyle;
  font?: FontStyle;
}

/**
 * Login page styling configuration for authentication pages.
 */
export interface LoginPageStyle {
  background?: BackgroundStyle;
  font?: FontStyle;
}

/**
 * Footer styling configuration for page footers.
 */
export interface FooterStyle {
  border?: {
    borderColor?: string;
  };
  font?: FontStyle;
}

/**
 * Image configuration for different image assets with optional metadata.
 */
export interface ImageConfig {
  title?: string;
}

/**
 * Images configuration for different image assets used throughout the application.
 */
export interface Images {
  favicon: ImageConfig;
  logo: ImageConfig;
  myAccountLogo: ImageConfig;
}

/**
 * Typography configuration for text styling including base fonts and headings.
 */
export interface Typography {
  font?: FontStyle;
  heading?: {
    font?: FontStyle;
  };
}

/**
 * Complete theme configuration for a specific mode containing all styling categories.
 */
export interface ThemeConfig {
  buttons: Buttons;
  colors: Colors;
  footer: FooterStyle;
  images: Images;
  inputs: Inputs;
  loginBox: LoginBoxStyle;
  loginPage: LoginPageStyle;
  typography: Typography;
}

/**
 * Complete theme object containing both light and dark configurations with active theme mode.
 */
export interface Theme {
  activeTheme: ThemeMode;
  LIGHT: ThemeConfig;
  DARK: ThemeConfig;
}
