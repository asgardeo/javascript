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
 * Creates styles for the BaseSignIn component
 * @param theme - The theme object containing design tokens
 * @param colorScheme - The current color scheme (used for memoization)
 * @returns Object containing CSS class names for component styling
 */
const useStyles = (theme: Theme, colorScheme: string) => {
  return useMemo(() => {
    const signIn = css`
      min-width: 420px;
      margin: 0 auto;
    `;

    const card = css`
      background: ${theme.vars.colors.background.surface};
      border-radius: ${theme.vars.borderRadius.large};
      gap: calc(${theme.vars.spacing.unit} * 2);
      min-width: 420px;
    `;

    const logoContainer = css`
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: calc(${theme.vars.spacing.unit} * 3);
    `;

    const header = css`
      gap: 0;
    `;

    const title = css`
      margin: 0 0 calc(${theme.vars.spacing.unit} * 1) 0;
      color: ${theme.vars.colors.text.primary};
    `;

    const subtitle = css`
      margin-top: calc(${theme.vars.spacing.unit} * 1);
      color: ${theme.vars.colors.text.secondary};
    `;

    const messagesContainer = css`
      margin-top: calc(${theme.vars.spacing.unit} * 2);
    `;

    const messageItem = css`
      margin-bottom: calc(${theme.vars.spacing.unit} * 1);
    `;

    const errorContainer = css`
      margin-bottom: calc(${theme.vars.spacing.unit} * 2);
    `;

    const contentContainer = css`
      display: flex;
      flex-direction: column;
      gap: calc(${theme.vars.spacing.unit} * 2);
    `;

    const loadingContainer = css`
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: calc(${theme.vars.spacing.unit} * 4);
    `;

    const loadingText = css`
      margin-top: calc(${theme.vars.spacing.unit} * 2);
      color: ${theme.vars.colors.text.secondary};
    `;

    const divider = css`
      margin: calc(${theme.vars.spacing.unit} * 1) 0;
    `;

    const centeredContainer = css`
      text-align: center;
      padding: calc(${theme.vars.spacing.unit} * 4);
    `;

    const passkeyContainer = css`
      margin-bottom: calc(${theme.vars.spacing.unit} * 2);
    `;

    const passkeyText = css`
      margin-top: calc(${theme.vars.spacing.unit} * 1);
      color: ${theme.vars.colors.text.secondary};
    `;

    const form = css`
      display: flex;
      flex-direction: column;
      gap: calc(${theme.vars.spacing.unit} * 2);
    `;

    const formDivider = css`
      margin: calc(${theme.vars.spacing.unit} * 1) 0;
    `;

    const authenticatorSection = css`
      display: flex;
      flex-direction: column;
      gap: calc(${theme.vars.spacing.unit} * 1);
    `;

    const authenticatorItem = css`
      width: 100%;
    `;

    const noAuthenticatorCard = css`
      background: ${theme.vars.colors.background.surface};
      border-radius: ${theme.vars.borderRadius.large};
      padding: calc(${theme.vars.spacing.unit} * 2);
    `;

    const errorAlert = css`
      margin-bottom: calc(${theme.vars.spacing.unit} * 2);
    `;

    const messagesAlert = css`
      margin-bottom: calc(${theme.vars.spacing.unit} * 1);
    `;

    const flowMessagesContainer = css`
      margin-top: calc(${theme.vars.spacing.unit} * 2);
    `;

    const flowMessageItem = css`
      margin-bottom: calc(${theme.vars.spacing.unit} * 1);
    `;

    return {
      signIn,
      card,
      logoContainer,
      header,
      title,
      subtitle,
      messagesContainer,
      messageItem,
      errorContainer,
      contentContainer,
      loadingContainer,
      loadingText,
      divider,
      centeredContainer,
      passkeyContainer,
      passkeyText,
      form,
      formDivider,
      authenticatorSection,
      authenticatorItem,
      noAuthenticatorCard,
      errorAlert,
      messagesAlert,
      flowMessagesContainer,
      flowMessageItem,
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
