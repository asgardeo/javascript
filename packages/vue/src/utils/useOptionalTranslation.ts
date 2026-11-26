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

import {inject} from 'vue';
import {I18N_KEY} from '../keys';
import type {I18nContextValue} from '../models/contexts';

/**
 * Returns a translator for components that may render outside `<AsgardeoProvider>` (for example, the `Base*`
 * components). Inside the provider it uses the active language; outside it, or when a key has no translation, it
 * returns the fallback.
 *
 * Call it in `setup()`.
 *
 * @returns A function that takes a translation key and a fallback text.
 */
const useOptionalTranslation = (): ((key: string, fallback: string) => string) => {
  const i18n: I18nContextValue | null = inject(I18N_KEY, null);

  return (key: string, fallback: string): string => {
    const translated: string | undefined = i18n?.t(key);

    // `t()` returns the key itself when there is no translation.
    return translated && translated !== key ? translated : fallback;
  };
};

export default useOptionalTranslation;
