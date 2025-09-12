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
import { Colors, Inputs, Typography } from '../../src/models/theme';

/**
 * Creates input field styles from theme input, color, and typography configurations.
 * Provides comprehensive form input styling including text inputs, textareas, checkboxes, radio buttons,
 * switches, and select dropdowns. Includes different states, sizes, and accessibility considerations.
 *
 * @param inputs - Input configuration from the current theme.
 * @param colors - Color configuration from the current theme.
 * @param typography - Typography configuration from the current theme.
 * @returns StyleSheet object containing all input-related styles.
 */
export const createInputStyles = (inputs: Inputs, colors: Colors, typography: Typography) => StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },

  input: {
    backgroundColor: inputs.base.background?.backgroundColor || colors.background.surface.main,
    borderRadius: parseFloat(inputs.base.border?.borderRadius?.replace('px', '') || '8'),
    borderWidth: 1,
    borderColor: inputs.base.border?.borderColor || colors.outlined.default,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: typography.font?.fontFamily || 'System',
    color: inputs.base.font?.color || colors.text.primary,
    minHeight: 48,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: typography.font?.fontFamily || 'System',
    color: inputs.base.labels?.font?.color || colors.text.primary,
    marginBottom: 8,
  },

  inputFocused: {
    borderColor: colors.primary.main,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.alerts.error.main,
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: colors.background.surface.light,
    opacity: 0.6,
  },

  inputSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 36,
  },
  inputLarge: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    minHeight: 56,
  },

  textarea: {
    backgroundColor: inputs.base.background?.backgroundColor || colors.background.surface.main,
    borderRadius: parseFloat(inputs.base.border?.borderRadius?.replace('px', '') || '8'),
    borderWidth: 1,
    borderColor: inputs.base.border?.borderColor || colors.outlined.default,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: typography.font?.fontFamily || 'System',
    color: inputs.base.font?.color || colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  searchInput: {
    backgroundColor: inputs.base.background?.backgroundColor || colors.background.surface.main,
    borderRadius: parseFloat(inputs.base.border?.borderRadius?.replace('px', '') || '8'),
    borderWidth: 1,
    borderColor: inputs.base.border?.borderColor || colors.outlined.default,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingLeft: 44,
    fontSize: 16,
    fontFamily: typography.font?.fontFamily || 'System',
    color: inputs.base.font?.color || colors.text.primary,
    minHeight: 48,
  },

  inputWithIcon: {
    paddingLeft: 44,
  },
  inputWithRightIcon: {
    paddingRight: 44,
  },

  inputIconLeft: {
    position: 'absolute',
    left: 12,
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputIconRight: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  helperText: {
    fontSize: 12,
    fontFamily: typography.font?.fontFamily || 'System',
    color: colors.text.secondary,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    fontFamily: typography.font?.fontFamily || 'System',
    color: colors.alerts.error.main,
    marginTop: 4,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.outlined.default,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  checkboxLabel: {
    fontSize: 16,
    fontFamily: typography.font?.fontFamily || 'System',
    color: colors.text.primary,
    flex: 1,
  },

  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.outlined.default,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary.main,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.main,
  },
  radioLabel: {
    fontSize: 16,
    fontFamily: typography.font?.fontFamily || 'System',
    color: colors.text.primary,
    flex: 1,
  },

  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: typography.font?.fontFamily || 'System',
    color: colors.text.primary,
    flex: 1,
  },

  selectInput: {
    position: 'relative',
  },
  select: {
    backgroundColor: inputs.base.background?.backgroundColor || colors.background.surface.main,
    borderRadius: parseFloat(inputs.base.border?.borderRadius?.replace('px', '') || '8'),
    borderWidth: 1,
    borderColor: inputs.base.border?.borderColor || colors.outlined.default,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 44,
    fontSize: 16,
    fontFamily: typography.font?.fontFamily || 'System',
    color: inputs.base.font?.color || colors.text.primary,
    minHeight: 48,
  },
  selectArrow: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/**
 * Type definition for the input styles object returned by createInputStyles.
 */
export type InputStylesType = ReturnType<typeof createInputStyles>;
