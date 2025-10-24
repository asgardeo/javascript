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

import {css} from '@emotion/css';
import {useMemo} from 'react';
import {Theme} from '@asgardeo/browser';

/**
 * Creates styles for the Checkbox component using BEM methodology
 * @param theme - The theme object containing design tokens
 * @param colorScheme - The current color scheme (used for memoization)
 * @param hasError - Whether the checkbox has an error state
 * @param required - Whether the checkbox is required
 * @returns Object containing CSS class names for component styling
 */
const useStyles = (theme: Theme, colorScheme: string, hasError: boolean, required: boolean) => {
  return useMemo(() => {
    const containerStyles = css`
      display: flex;
      align-items: center;
    `;

    const inputStyles = css`
      width: calc(${theme.vars.spacing.unit} * 2.5);
      height: calc(${theme.vars.spacing.unit} * 2.5);
      margin-inline-end: ${theme.vars.spacing.unit};
      accent-color: ${theme.vars.colors.primary.main};
      cursor: pointer;

      &:focus {
        outline: 2px solid ${theme.vars.colors.primary.main};
        outline-offset: 2px;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
    `;

    const errorInputStyles = css`
      accent-color: ${theme.vars.colors.error.main};

      &:focus {
        outline-color: ${theme.vars.colors.error.main};
      }
    `;

    const labelStyles = css`
      color: ${theme.vars.colors.text.primary};
      font-size: ${theme.vars.typography.fontSizes.sm};
      cursor: pointer;

      &:hover {
        color: ${theme.vars.colors.text.primary};
      }
    `;

    const errorLabelStyles = css`
      color: ${theme.vars.colors.error.main};
    `;

    const requiredStyles = css`
      /* Required indicator styles will be handled by InputLabel */
    `;

    return {
      container: containerStyles,
      input: inputStyles,
      errorInput: hasError ? errorInputStyles : '',
      label: labelStyles,
      errorLabel: hasError ? errorLabelStyles : '',
      required: required ? requiredStyles : '',
    };
  }, [theme, colorScheme, hasError, required]);
};

export default useStyles;
