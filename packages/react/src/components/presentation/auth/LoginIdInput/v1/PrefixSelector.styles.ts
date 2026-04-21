/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
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

import {Theme} from '@asgardeo/browser';
import {css} from '@emotion/css';
import {useMemo} from 'react';

const usePrefixSelectorStyles = (
  theme: Theme,
  colorScheme: string,
  disabled: boolean,
  hasError: boolean,
): Record<string, string> =>
  useMemo(() => {
    const borderColor: string = hasError ? theme.vars.colors.error.main : theme.vars.colors.border;

    const container: string = css`
      display: flex;
      align-items: stretch;
      flex-shrink: 0;
    `;

    const trigger: string = css`
      display: flex;
      align-items: center;
      gap: calc(${theme.vars.spacing.unit} * 0.5);
      padding-block: ${theme.vars.spacing.unit};
      padding-inline: calc(${theme.vars.spacing.unit} * 1.5);
      border: 1px solid ${borderColor};
      border-inline-end: none;
      border-radius: ${theme.vars.borderRadius.medium} 0 0 ${theme.vars.borderRadius.medium};
      background-color: ${disabled ? theme.vars.colors.background.disabled : theme.vars.colors.background.surface};
      font-size: ${theme.vars.typography.fontSizes.md};
      font-family: ${theme.vars.typography.fontFamily};
      color: ${theme.vars.colors.text.primary};
      cursor: ${disabled ? 'not-allowed' : 'pointer'};
      opacity: ${disabled ? 0.6 : 1};
      white-space: nowrap;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &:focus-visible {
        outline: 2px solid ${theme.vars.colors.primary.main};
        outline-offset: 2px;
        border-color: ${hasError ? theme.vars.colors.error.main : theme.vars.colors.primary.main};
      }

      &:hover:not(:disabled) {
        border-color: ${hasError ? theme.vars.colors.error.main : theme.vars.colors.primary.main};
      }
    `;

    const triggerError: string = css`
      border-color: ${theme.vars.colors.error.main};
    `;

    const triggerLabel: string = css`
      font-size: ${theme.vars.typography.fontSizes.md};
      color: ${theme.vars.colors.text.primary};
    `;

    const listbox: string = css`
      display: flex;
      flex-direction: column;
      min-width: 160px;
      max-height: 240px;
      overflow-y: auto;
      border: 1px solid ${theme.vars.colors.border};
      border-radius: ${theme.vars.borderRadius.medium};
      background-color: ${theme.vars.colors.background.surface};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      font-family: ${theme.vars.typography.fontFamily};
    `;

    const option: string = css`
      display: flex;
      align-items: center;
      gap: calc(${theme.vars.spacing.unit} * 1);
      padding: calc(${theme.vars.spacing.unit} * 0.75) calc(${theme.vars.spacing.unit} * 1.5);
      border: none;
      background: none;
      text-align: start;
      cursor: pointer;
      font-size: ${theme.vars.typography.fontSizes.md};
      font-family: ${theme.vars.typography.fontFamily};
      color: ${theme.vars.colors.text.primary};
      transition: background-color 0.15s ease;
      width: 100%;

      &:hover {
        background-color: ${theme.vars.colors.action.hover};
      }
    `;

    const optionActive: string = css`
      background-color: ${theme.vars.colors.action.selected};

      &:hover {
        background-color: ${theme.vars.colors.action.selected};
      }
    `;

    const optionLabel: string = css`
      color: ${theme.vars.colors.text.secondary};
    `;

    return {
      container,
      listbox,
      option,
      optionActive,
      optionLabel,
      trigger,
      triggerError,
      triggerLabel,
    };
  }, [theme, colorScheme, disabled, hasError]);

export default usePrefixSelectorStyles;
