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
 * Creates styles for the BaseUserDropdown component
 * @param theme - The theme object containing design tokens
 * @param colorScheme - The current color scheme (used for memoization)
 * @returns Object containing CSS class names for component styling
 */
const useStyles = (theme: Theme, colorScheme: string) => {
  return useMemo(() => {
    const trigger = css`
      display: inline-flex;
      align-items: center;
      gap: calc(${theme.vars.spacing.unit} * 0.75);
      padding: calc(${theme.vars.spacing.unit} * 0.5);
      background: none;
      border: none;
      cursor: pointer;
      border-radius: ${theme.vars.borderRadius.medium};
      transition: none;
      box-shadow: none;
      background-color: transparent;

      &:hover {
        background-color: ${theme.vars.colors.action?.hover || 'rgba(0, 0, 0, 0.05)'};
      }

      &:focus {
        outline: 2px solid ${theme.vars.colors.primary};
        outline-offset: 2px;
      }

      &:hover, &:focus, &:active, &:focus-visible {
        transition: none;
        box-shadow: none;
      }
    `;

    const userName = css`
      color: ${theme.vars.colors.text.primary};
      font-size: 0.875rem;
      font-weight: 500;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;

    const dropdownContent = css`
      background: ${theme.vars.colors.background.surface};
      border-radius: ${theme.vars.borderRadius.large};
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid ${theme.vars.colors.border};
      min-width: 250px;
      max-width: 600px;
      z-index: 1000;
      overflow: hidden;
    `;

    const dropdownMenu = css`
      display: flex;
      flex-direction: column;
      width: 100%;
    `;

    const menuItem = css`
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: ${theme.vars.spacing.unit};
      padding: calc(${theme.vars.spacing.unit} * 1.5) calc(${theme.vars.spacing.unit} * 2);
      width: 100%;
      color: ${theme.vars.colors.text.primary};
      text-decoration: none;
      border: none;
      cursor: pointer;
      font-size: 0.875rem;
      text-align: start;
      border-radius: ${theme.vars.borderRadius.medium};
      transition: none;
      box-shadow: none;
      background: transparent;


      &:hover {
        background-color: ${theme.vars.colors.action?.hover || 'rgba(0, 0, 0, 0.05)'};
      }

      &:hover, &:focus, &:active, &:focus-visible {
        transition: none;
        box-shadow: none;
      }
    `;

    const menuItemAnchor = css`
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: ${theme.vars.spacing.unit};
      padding: calc(${theme.vars.spacing.unit} * 1.5) calc(${theme.vars.spacing.unit} * 2);
      width: 100%;
      color: ${theme.vars.colors.text.primary};
      text-decoration: none;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 0.875rem;
      text-align: start;
      border-radius: ${theme.vars.borderRadius.medium};
      transition: background-color 0.15s ease-in-out;

      &:hover {
        background-color: ${theme.vars.colors.action?.hover || 'rgba(0, 0, 0, 0.05)'};
      }
    `;

    const divider = css`
      margin: calc(${theme.vars.spacing.unit} * 0.5) 0;
      border-bottom: 1px solid ${theme.vars.colors.border};
    `;

    const dropdownHeader = css`
      display: flex;
      align-items: center;
      gap: ${theme.vars.spacing.unit};
      padding: calc(${theme.vars.spacing.unit} * 1.5);
      border-bottom: 1px solid ${theme.vars.colors.border};
    `;

    const headerInfo = css`
      display: flex;
      flex-direction: column;
      gap: calc(${theme.vars.spacing.unit} / 4);
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;

    const headerName = css`
      color: ${theme.vars.colors.text.primary};
      font-size: 1rem;
      font-weight: 500;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;

    const headerEmail = css`
      color: ${theme.vars.colors.text.secondary};
      font-size: 0.875rem;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;

    const loadingContainer = css`
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80px;
      gap: ${theme.vars.spacing.unit};
    `;

    const loadingText = css`
      color: ${theme.vars.colors.text.secondary};
      font-size: 0.875rem;
    `;

    return {
      trigger,
      userName,
      dropdownContent,
      dropdownMenu,
      menuItem,
      menuItemAnchor,
      divider,
      dropdownHeader,
      headerInfo,
      headerName,
      headerEmail,
      loadingContainer,
      loadingText,
    };
  }, [
    theme.vars.colors.background.surface,
    theme.vars.colors.text.primary,
    theme.vars.colors.text.secondary,
    theme.vars.colors.border,
    theme.vars.colors.primary,
    theme.vars.colors.action?.hover,
    theme.vars.borderRadius.medium,
    theme.vars.borderRadius.large,
    theme.vars.spacing.unit,
    colorScheme,
  ]);
};

export default useStyles;
