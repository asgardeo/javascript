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

import React, { useState, useMemo, PropsWithChildren } from 'react';
import { ThemeContext, ThemeContextType } from './ThemeContext';
import { Theme, ThemeMode, ThemeConfig } from '../../models/theme';
import { createColorStyles } from '../../styles/colors';
import { createButtonStyles } from '../../styles/buttons';
import { createTypographyStyles } from '../../styles/typography';
import { createInputStyles } from '../../styles/inputs';
import brandingConfig from './branding.json';

/**
 * Theme provider component that manages theme state and provides theme context to children.
 * Reads theme configuration from branding.json and supports switching between light and dark modes.
 *
 * @param props - The component props
 * @param props.children - Child components to wrap with theme context
 * @param props.initialTheme - Optional initial theme mode
 * @returns React functional component providing theme context
 */
export const ThemeProvider = ({
  children
}: PropsWithChildren) => {
  const themeData = brandingConfig.theme as Theme;
  const [themeMode, setThemeMode] = useState<ThemeMode>('LIGHT');

  const currentTheme: ThemeConfig = themeData[themeMode];

  /**
   * Creates global styles object.
   */
  const styles = useMemo(() => ({
    colors: createColorStyles(currentTheme.colors),
    buttons: createButtonStyles(currentTheme.buttons, currentTheme.colors),
    typography: createTypographyStyles(currentTheme.typography, currentTheme.colors),
    inputs: createInputStyles(currentTheme.inputs, currentTheme.colors, currentTheme.typography),
  }), [currentTheme]);

  /**
   * Toggles between light and dark theme modes.
   */
  const toggleTheme = (): void => {
    setThemeMode(prevMode => prevMode === 'LIGHT' ? 'DARK' : 'LIGHT');
  };

  /**
   * Constructs the theme context value.
   */
  const contextValue: ThemeContextType = useMemo(() => ({
    themeMode,
    toggleTheme,
    setThemeMode,
    styles
  }), [themeMode, styles]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
