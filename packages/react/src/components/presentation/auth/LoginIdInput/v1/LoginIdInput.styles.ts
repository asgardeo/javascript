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

const useLoginIdInputStyles = (
  theme: Theme,
  colorScheme: string,
  typeCount: number,
  hasPrefix: boolean,
  hasError: boolean,
  disabled: boolean,
): Record<string, string> =>
  useMemo(() => {
    // ≤3 types → all in one row; >3 types → 2-column grid
    const columns: number = typeCount <= 3 ? typeCount : 2;

    const root: string = css`
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: calc(${theme.vars.spacing.unit} * 1.5);
      font-family: ${theme.vars.typography.fontFamily};
    `;

    const label: string = css`
      /* Inherits InputLabel styling; no extra needed */
    `;

    const grid: string = css`
      display: grid;
      grid-template-columns: repeat(${columns}, 1fr);
      gap: ${theme.vars.spacing.unit};
    `;

    const tab: string = css`
      display: flex;
      align-items: center;
      justify-content: center;
      gap: calc(${theme.vars.spacing.unit} * 0.5);
      padding: calc(${theme.vars.spacing.unit} * 0.75) calc(${theme.vars.spacing.unit} * 1);
      border: 1px solid ${theme.vars.colors.border};
      border-radius: ${theme.vars.borderRadius.medium};
      background-color: ${theme.vars.colors.background.surface};
      font-size: ${theme.vars.typography.fontSizes.sm};
      font-family: ${theme.vars.typography.fontFamily};
      color: ${theme.vars.colors.text.primary};
      cursor: pointer;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;

      &:hover {
        border-color: ${theme.vars.colors.primary.main};
      }

      &:focus-visible {
        outline: 2px solid ${theme.vars.colors.primary.main};
        outline-offset: 2px;
      }
    `;

    const tabActive: string = css`
      background-color: ${theme.vars.colors.primary.main};
      border-color: ${theme.vars.colors.primary.main};
      color: ${theme.vars.colors.primary.contrastText};

      &:hover {
        border-color: ${theme.vars.colors.primary.main};
      }
    `;

    const tabIcon: string = css`
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
    `;

    const tabLabel: string = css`
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    `;

    const inputLabel: string = css`
      /* Inherits InputLabel styling; no extra needed */
    `;

    const fieldRow: string = css`
      display: flex;
      align-items: stretch;
      width: 100%;
    `;

    const borderColor: string = hasError ? theme.vars.colors.error.main : theme.vars.colors.border;
    const borderRadius: string = hasPrefix
      ? `0 ${theme.vars.borderRadius.medium} ${theme.vars.borderRadius.medium} 0`
      : theme.vars.borderRadius.medium;

    const input: string = css`
      flex: 1;
      min-width: 0;
      padding-block: ${theme.vars.spacing.unit};
      padding-inline: calc(${theme.vars.spacing.unit} * 1.5);
      border: 1px solid ${borderColor};
      border-radius: ${borderRadius};
      font-size: ${theme.vars.typography.fontSizes.md};
      font-family: ${theme.vars.typography.fontFamily};
      color: ${theme.vars.colors.text.primary};
      background-color: ${disabled ? theme.vars.colors.background.disabled : theme.vars.colors.background.surface};
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      opacity: ${disabled ? 0.6 : 1};
      cursor: ${disabled ? 'not-allowed' : 'text'};

      &:focus-visible {
        border-color: ${hasError ? theme.vars.colors.error.main : theme.vars.colors.primary.main};
        box-shadow: 0 0 0 2px ${hasError ? theme.vars.colors.error.main : theme.vars.colors.primary.main}40;
      }
    `;

    const staticPrefix: string = css`
      display: flex;
      align-items: center;
      padding-block: ${theme.vars.spacing.unit};
      padding-inline: calc(${theme.vars.spacing.unit} * 1.5);
      border: 1px solid ${theme.vars.colors.border};
      border-inline-end: none;
      border-radius: ${theme.vars.borderRadius.medium} 0 0 ${theme.vars.borderRadius.medium};
      background-color: ${theme.vars.colors.background.disabled};
      font-size: ${theme.vars.typography.fontSizes.md};
      font-family: ${theme.vars.typography.fontFamily};
      color: ${theme.vars.colors.text.secondary};
      white-space: nowrap;
      flex-shrink: 0;
    `;

    const inputWrapper: string = css`
      flex: 1;
      min-width: 0;

      /* Override the FormControl wrapper to remove its own bottom margin
         so error text is managed by the outer FormControl */
      & .asgardeo-form-control {
        margin-bottom: 0;
      }
    `;

    return {
      fieldRow,
      grid,
      input,
      inputLabel,
      inputWrapper,
      label,
      root,
      staticPrefix,
      tab,
      tabActive,
      tabIcon,
      tabLabel,
    };
  }, [theme, colorScheme, typeCount, hasPrefix, hasError, disabled]);

export default useLoginIdInputStyles;
