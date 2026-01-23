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
 * software distributed under an "AS IS" BASIS, WITHOUT WARRANTIES
 * OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and
 * limitations under the License.
 */

import {css} from '@emotion/css';
import {useMemo} from 'react';
import {Theme} from '@asgardeo/browser';

/**
 * Creates styles for the BaseInviteUser component
 * @param theme - The theme object containing design tokens
 * @param colorScheme - The current color scheme (used for memoization)
 * @returns Object containing CSS class names for component styling
 */
const useStyles = (theme: Theme, colorScheme: string) => {
  return useMemo(() => {
    const card = css`
      background: ${theme.vars.colors.background.surface};
      border-radius: ${theme.vars.borderRadius.large};
      gap: calc(${theme.vars.spacing.unit} * 2);
      min-width: 420px;
    `;

    const header = css`
      gap: 0;
      align-items: center;
    `;

    const title = css`
      margin: 0 0 calc(${theme.vars.spacing.unit} * 1) 0;
      color: ${theme.vars.colors.text.primary};
    `;

    const subtitle = css`
      margin-bottom: calc(${theme.vars.spacing.unit} * 1);
      color: ${theme.vars.colors.text.secondary};
    `;

    return {
      card,
      header,
      title,
      subtitle,
    };
  }, [
    theme.vars.colors.background.surface,
    theme.vars.colors.text.primary,
    theme.vars.colors.text.secondary,
    theme.vars.borderRadius.large,
    theme.vars.spacing.unit,
    colorScheme,
  ]);
};

export default useStyles;
