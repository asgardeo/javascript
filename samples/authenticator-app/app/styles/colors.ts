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

import { StyleSheet } from 'react-native';
import { Colors } from '../models/theme';

/**
 * Creates color-based styles from the theme color configuration.
 * Provides utility styles for backgrounds, text colors, borders, and tint colors.
 *
 * @param colors - The color configuration from the current theme.
 * @returns StyleSheet object containing all color-based styles.
 */
export const createColorStyles = (colors: Colors) => StyleSheet.create({
  backgroundBody: {
    backgroundColor: colors.background.body.main,
  },
  backgroundSurface: {
    backgroundColor: colors.background.surface.main,
  },
  backgroundSurfaceLight: {
    backgroundColor: colors.background.surface.light,
  },
  backgroundSurfaceDark: {
    backgroundColor: colors.background.surface.dark,
  },
  backgroundSurfaceInverted: {
    backgroundColor: colors.background.surface.inverted,
  },

  backgroundPrimary: {
    backgroundColor: colors.primary.main,
  },
  backgroundPrimaryLight: {
    backgroundColor: colors.primary.light,
  },
  backgroundPrimaryDark: {
    backgroundColor: colors.primary.dark,
  },

  backgroundSecondary: {
    backgroundColor: colors.secondary.main,
  },
  backgroundSecondaryLight: {
    backgroundColor: colors.secondary.light,
  },
  backgroundSecondaryDark: {
    backgroundColor: colors.secondary.dark,
  },

  backgroundError: {
    backgroundColor: colors.alerts.error.main,
  },
  backgroundWarning: {
    backgroundColor: colors.alerts.warning.main,
  },
  backgroundInfo: {
    backgroundColor: colors.alerts.info.main,
  },
  backgroundNeutral: {
    backgroundColor: colors.alerts.neutral.main,
  },

  backgroundAccent1: {
    backgroundColor: colors.illustrations.accent1.main,
  },
  backgroundAccent2: {
    backgroundColor: colors.illustrations.accent2.main,
  },
  backgroundAccent3: {
    backgroundColor: colors.illustrations.accent3.main,
  },

  textPrimary: {
    color: colors.text.primary,
  },
  textSecondary: {
    color: colors.text.secondary,
  },
  textOnPrimary: {
    color: colors.primary.contrastText,
  },
  textOnSecondary: {
    color: colors.secondary.contrastText,
  },

  borderDefault: {
    borderColor: colors.outlined.default,
  },
  borderPrimary: {
    borderColor: colors.primary.main,
  },
  borderSecondary: {
    borderColor: colors.secondary.main,
  },

  tintPrimary: {
    tintColor: colors.primary.main,
  },
  tintSecondary: {
    tintColor: colors.secondary.main,
  },
  tintTextPrimary: {
    tintColor: colors.text.primary,
  },
  tintTextSecondary: {
    tintColor: colors.text.secondary,
  },
});

/**
 * Type definition for the color styles object returned by createColorStyles.
 */
export type ColorStylesType = ReturnType<typeof createColorStyles>;
