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

import {resolveTranslation} from './resolveTranslation';
import {UseTranslation} from '../../hooks/useTranslation';

/**
 * Resolves translation strings in an object's properties.
 * @param obj - The object to process
 * @param t - The translation function from useTranslation
 * @param properties - Array of property names to resolve (optional, defaults to common properties)
 * @returns A new object with resolved translations
 */
export const resolveTranslationsInObject = <T extends Record<string, any>>(
  obj: T,
  t: UseTranslation['t'],
  properties: string[] = ['label', 'placeholder', 'text', 'title', 'subtitle'],
): T => {
  const resolved: T = {...obj};

  properties.forEach((prop: string) => {
    if (resolved[prop] && typeof resolved[prop] === 'string') {
      (resolved as any)[prop] = resolveTranslation(resolved[prop], t);
    }
  });

  return resolved;
};

export default resolveTranslationsInObject;
