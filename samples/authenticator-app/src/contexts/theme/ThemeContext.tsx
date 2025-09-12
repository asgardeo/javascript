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

import { createContext } from 'react';
import { ThemeMode } from '../../models/theme';
import { ButtonStylesType } from '../../styles/buttons';
import { ColorStylesType } from '../../styles/colors';
import { InputStylesType } from '../../styles/inputs';
import { TypographyStylesType } from '../../styles/typography';

/**
 * Theme context type providing access to theme values, functions, and styled components.
 */
export interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  styles: GlobalStyles;
}

/**
 * Global styles interface combining all style categories.
 */
export interface GlobalStyles {
  colors: ColorStylesType;
  buttons: ButtonStylesType;
  typography: TypographyStylesType;
  inputs: InputStylesType;
}

/**
 * React context for theme management.
 * Provides access to theme configuration, current mode, and theme switching functions.
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export default ThemeContext;
