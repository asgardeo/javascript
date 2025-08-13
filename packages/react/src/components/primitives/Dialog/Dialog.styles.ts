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
import {Theme, bem} from '@asgardeo/browser';

/**
 * Creates styles for the Dialog component using BEM methodology
 * @param theme - The theme object containing design tokens
 * @param colorScheme - The current color scheme (used for memoization)
 * @returns Object containing CSS class names for component styling
 */
const useStyles = (theme: Theme, colorScheme: string) => {
  return useMemo(() => {
    const overlay = css`
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;

    const content = css`
      background: ${theme.vars.colors.background.surface};
      border-radius: ${theme.vars.borderRadius.large};
      box-shadow: 0 2px 8px ${colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.15)'};
      outline: none;
      overflow-y: auto;
      z-index: 10000;
    `;

    const dropdownContent = css`
      background: ${theme.vars.colors.background.surface};
      border-radius: ${theme.vars.borderRadius.large};
      box-shadow: 0 2px 8px ${colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.15)'};
      outline: none;
      overflow-y: auto;
      z-index: 10000;
    `;

    const header = css`
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: calc(${theme.vars.spacing.unit} * 3) calc(${theme.vars.spacing.unit} * 4.5);
      border-bottom: 1px solid ${theme.vars.colors.border};
    `;

    const headerTitle = css`
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: ${theme.vars.colors.text.primary};
    `;

    const contentBody = css`
      padding: calc(${theme.vars.spacing.unit} * 2);
    `;

    const description = css`
      margin: 0;
      color: ${theme.vars.colors.text.secondary};
      font-size: ${theme.vars.typography.fontSizes.sm};
      line-height: 1.5;
    `;

    return {
      overlay,
      content,
      dropdownContent,
      header,
      headerTitle,
      contentBody,
      description,
    };
  }, [theme, colorScheme]);
};

export default useStyles;
