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

import resolveMeta from './resolveMeta';
import {TranslationFn} from '../../models/v2/translation';
import {ResolveVarsOptions} from '../../models/v2/vars';

/**
 * Resolves all template expressions in a string.
 *
 * Supported patterns:
 *   - `{{ t(key) }}`       — resolved via the i18n translation function.
 *                            Colon-separated namespaces are converted to dots:
 *                            `{{ t(signin:heading.label) }}` → `t('signin.heading.label')`
 *   - `{{ meta(path) }}`   — resolved via a dot-path lookup on FlowMetadataResponse.
 *                            `{{ meta(application.name) }}` → `meta.application?.name`
 *
 * Template expressions can be embedded inside larger strings:
 *   `"Login using {{ meta(application.name) }}"` → `"Login using My App"`
 *
 * Unrecognised expressions are left unchanged.
 *
 * @template TFn - The concrete translation function type.
 *
 * @param text - The string to resolve (may contain zero or more template expressions)
 * @param options - Resolution context: translation function and optional flow metadata
 * @returns The resolved string
 */
export default function resolveVars<TFn extends TranslationFn = TranslationFn>(
  text: string | undefined,
  {t, meta}: ResolveVarsOptions<TFn>,
): string {
  if (!text) {
    return '';
  }

  return text.replace(/\{\{(.+?)\}\}/g, (match: string, content: string): string => {
    const trimmed: string = content.trim();

    const tMatch: RegExpMatchArray | null = trimmed.match(/^t\((.+)\)$/);
    if (tMatch) {
      let key: string = tMatch[1].trim();
      // Strip surrounding quotes if present
      if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
        key = key.slice(1, -1);
      }

      // Convert colon-separated namespace to dot-separated key
      // e.g. "signin:fields.password.label" → "signin.fields.password.label"
      return t(key.replace(/:/g, '.'));
    }

    if (meta) {
      const metaMatch: RegExpMatchArray | null = trimmed.match(/^meta\((.+)\)$/);
      if (metaMatch) {
        let path: string = metaMatch[1].trim();
        // Strip surrounding quotes if present
        if ((path.startsWith('"') && path.endsWith('"')) || (path.startsWith("'") && path.endsWith("'"))) {
          path = path.slice(1, -1);
        }
        return resolveMeta(path, meta);
      }
    }

    return match;
  });
}
