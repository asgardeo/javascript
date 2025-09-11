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

import { useCallback } from 'react';
import { useThemeContext } from './ThemeContext';

/**
 * Enhanced theme hook that provides access to theme values and helper functions.
 * Extends the basic theme context with additional utility functions for easier theme usage.
 *
 * @returns Enhanced theme object with helper functions and quick access properties
 */
export const useTheme = () => {
  const context = useThemeContext();

  /**
   * Gets a color value by dot-notation path.
   *
   * @param path - Dot-separated path to the color (e.g., 'alerts.error.main')
   * @returns The color value or undefined if not found
   */
  const getColor = useCallback((path: string): string | undefined => {
    const keys = path.split('.');
    let value: any = context.colors;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }, [context.colors]);

  /**
   * Gets button style configuration for a specific button type.
   *
   * @param buttonType - The type of button ('primary', 'secondary', or 'externalConnection')
   * @returns Button style configuration object
   */
  const getButtonStyle = useCallback((buttonType: 'primary' | 'secondary' | 'externalConnection') => {
    return context.buttons[buttonType]?.base || {};
  }, [context.buttons]);

  /**
   * Gets the base input style configuration.
   *
   * @returns Input style configuration object
   */
  const getInputStyle = useCallback(() => {
    return context.inputs.base || {};
  }, [context.inputs]);

  return {
    ...context,
    // Helper functions
    getColor,
    getButtonStyle,
    getInputStyle,
    // Quick access to common theme values
    /** Primary brand color */
    primaryColor: context.colors.primary.main,
    /** Secondary brand color */
    secondaryColor: context.colors.secondary.main,
    /** Main background color */
    backgroundColor: context.colors.background.body.main,
    /** Surface background color */
    surfaceColor: context.colors.background.surface.main,
    /** Primary text color */
    textPrimaryColor: context.colors.text.primary,
    /** Secondary text color */
    textSecondaryColor: context.colors.text.secondary,
    /** Base font family */
    fontFamily: context.typography.font?.fontFamily || 'System',
  };
};
