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

/**
 * Inputs for {@link resolveRequestLanguage}.
 */
export interface ResolveRequestLanguageOptions {
  /** The request's `Accept-Language` header, if any. */
  acceptLanguage?: string | null;
  /** The language persisted by the i18n provider (its cookie), if any. */
  storedLanguage?: string | null;
}

/**
 * Resolves the UI language for a request the way the client-side i18n provider detects it: the persisted
 * preference first, then the browser's preferred language (`Accept-Language` corresponds to
 * `navigator.language`). Used on the server so that the server and client renders agree on the language
 * and hydration does not fail on translated texts.
 *
 * @returns The language tag (e.g. `en-US`), or `undefined` when nothing can be resolved.
 */
const resolveRequestLanguage = ({
  storedLanguage,
  acceptLanguage,
}: ResolveRequestLanguageOptions): string | undefined => {
  if (storedLanguage) {
    return storedLanguage;
  }

  const preferred: string | undefined = acceptLanguage
    ?.split(',')
    .map((part: string) => part.trim().split(';')[0]?.trim() ?? '')
    .find((tag: string) => tag !== '' && tag !== '*');

  return preferred || undefined;
};

export default resolveRequestLanguage;
