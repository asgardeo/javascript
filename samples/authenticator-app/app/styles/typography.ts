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
import { Typography, Colors } from '../models/theme';

/**
 * Creates typography styles from theme typography and color configurations.
 * Provides comprehensive text styling including headings, body text, captions, states, and utilities.
 * Follows material design typography principles with proper hierarchy and readability.
 *
 * @param typography - Typography configuration from the current theme.
 * @param colors - Color configuration from the current theme.
 * @returns StyleSheet object containing all typography-related styles.
 */
export const createTypographyStyles = (typography: Typography, colors: Colors) => StyleSheet.create({
  baseFont: {
    fontFamily: typography.font?.fontFamily || 'System',
    color: colors.text.primary,
  },

  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: typography.heading?.font?.color || colors.text.primary,
    marginBottom: 16,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    color: typography.heading?.font?.color || colors.text.primary,
    marginBottom: 14,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: typography.heading?.font?.color || colors.text.primary,
    marginBottom: 12,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: typography.heading?.font?.color || colors.text.primary,
    marginBottom: 10,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    color: typography.heading?.font?.color || colors.text.primary,
    marginBottom: 8,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: typography.heading?.font?.color || colors.text.primary,
    marginBottom: 8,
  },

  body1: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.text.primary,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: colors.text.primary,
  },
  body3: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: colors.text.secondary,
  },

  subtitle1: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: colors.text.primary,
  },
  subtitle2: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    color: colors.text.secondary,
  },

  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.text.secondary,
  },
  overline: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.text.secondary,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonTextSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  buttonTextLarge: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
    textAlign: 'center',
  },

  link: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: colors.primary.main,
    textDecorationLine: 'underline',
  },

  error: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.alerts.error.main,
  },

  success: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.alerts.info.main,
  },

  warning: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.alerts.warning.main,
  },

  textCenter: {
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },
  textRight: {
    textAlign: 'right',
  },

  textUppercase: {
    textTransform: 'uppercase',
  },
  textLowercase: {
    textTransform: 'lowercase',
  },
  textCapitalize: {
    textTransform: 'capitalize',
  },

  fontLight: {
    fontWeight: '300',
  },
  fontNormal: {
    fontWeight: '400',
  },
  fontMedium: {
    fontWeight: '500',
  },
  fontSemiBold: {
    fontWeight: '600',
  },
  fontBold: {
    fontWeight: '700',
  },
  fontExtraBold: {
    fontWeight: '800',
  },
});

/**
 * Type definition for the typography styles object returned by createTypographyStyles.
 */
export type TypographyStylesType = ReturnType<typeof createTypographyStyles>;
