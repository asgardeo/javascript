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
import { Buttons, Colors } from '../models/theme';

/**
 * Creates button styles from theme button and color configurations.
 * Provides comprehensive button styling including primary, secondary, external, outline, ghost, and icon buttons.
 * Also includes size variants, states, and accessibility considerations.
 *
 * @param buttons - Button configuration from the current theme.
 * @param colors - Color configuration from the current theme.
 * @returns StyleSheet object containing all button-related styles.
 */
export const createButtonStyles = (buttons: Buttons, colors: Colors) => StyleSheet.create({
  primaryButton: {
    backgroundColor: colors.primary.main,
    borderRadius: parseFloat(buttons.primary.base.border?.borderRadius?.replace('px', '') || '22'),
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  primaryButtonText: {
    color: buttons.primary.base.font?.color || colors.primary.contrastText,
    fontSize: 16,
    fontWeight: '600',
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: buttons.secondary.base.border?.borderColor || colors.secondary.main,
    borderWidth: 1,
    borderRadius: parseFloat(buttons.secondary.base.border?.borderRadius?.replace('px', '') || '22'),
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  secondaryButtonText: {
    color: buttons.secondary.base.font?.color || colors.secondary.main,
    fontSize: 16,
    fontWeight: '600',
  },

  externalButton: {
    backgroundColor: buttons.externalConnection.base.background?.backgroundColor || colors.background.surface.main,
    borderRadius: parseFloat(buttons.externalConnection.base.border?.borderRadius?.replace('px', '') || '22'),
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.outlined.default,
  },
  externalButtonText: {
    color: buttons.externalConnection.base.font?.color || colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.main,
    borderRadius: parseFloat(buttons.primary.base.border?.borderRadius?.replace('px', '') || '22'),
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  outlineButtonText: {
    color: colors.primary.main,
    fontSize: 16,
    fontWeight: '600',
  },

  ghostButton: {
    backgroundColor: 'transparent',
    borderRadius: parseFloat(buttons.primary.base.border?.borderRadius?.replace('px', '') || '22'),
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  ghostButtonText: {
    color: colors.primary.main,
    fontSize: 16,
    fontWeight: '600',
  },

  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 32,
  },
  smallButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  largeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },

  iconButton: {
    padding: 8,
    borderRadius: parseFloat(buttons.primary.base.border?.borderRadius?.replace('px', '') || '22'),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  iconButtonSmall: {
    padding: 6,
    minWidth: 32,
    minHeight: 32,
  },
  iconButtonLarge: {
    padding: 12,
    minWidth: 56,
    minHeight: 56,
  },
});

/**
 * Type definition for the button styles object returned by createButtonStyles.
 */
export type ButtonStylesType = ReturnType<typeof createButtonStyles>;
