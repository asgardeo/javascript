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

import {resolveEmojiUrisInHtml} from '@asgardeo/browser';
import {css} from '@emotion/css';
import DOMPurify from 'dompurify';
import {FC, ReactElement} from 'react';
import {AdapterProps} from '../../models/adapters';

const richTextClass: string = css`
  overflow-wrap: anywhere;
  & * {
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  & .rich-text-align-left {
    text-align: left;
  }
  & .rich-text-align-center {
    text-align: center;
  }
  & .rich-text-align-right {
    text-align: right;
  }
  & p {
    margin: 0;
  }
`;

/**
 * Drops `{{template}}` placeholders that were not resolved (e.g. branding URLs when no branding
 * metadata is available) so they never end up in the rendered markup as broken links.
 */
const stripUnresolvedTemplates = (html: string): string =>
  html.replace(/href="\{\{[^"]*\}\}"/g, 'href="#"').replace(/\{\{[^}]*\}\}/g, '');

/**
 * Renders a `RICH_TEXT` flow component (e.g. terms of service under a registration form).
 * The HTML comes from the identity server and is sanitized with DOMPurify before rendering.
 */
const RichText: FC<AdapterProps> = ({component}: AdapterProps): ReactElement | null => {
  const text: string = (component.config?.['text'] as string) || '';

  if (!text.trim()) {
    return null;
  }

  return (
    <div
      className={richTextClass}
      // Manually sanitized with `DOMPurify`. IMPORTANT: DO NOT REMOVE OR MODIFY THIS SANITIZATION STEP.
      dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(resolveEmojiUrisInHtml(stripUnresolvedTemplates(text)))}}
    />
  );
};

export default RichText;
