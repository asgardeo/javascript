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

import {describe, expect, it} from 'vitest';
import resolveRequestLanguage from '../resolveRequestLanguage';

describe('resolveRequestLanguage', () => {
  it('prefers the persisted language', () => {
    expect(resolveRequestLanguage({acceptLanguage: 'fr-FR,fr;q=0.9', storedLanguage: 'de-DE'})).toBe('de-DE');
  });

  it('falls back to the first language of the Accept-Language header', () => {
    expect(resolveRequestLanguage({acceptLanguage: 'fr-FR,fr;q=0.9,en-US;q=0.8'})).toBe('fr-FR');
    expect(resolveRequestLanguage({acceptLanguage: ' en-GB ; q=0.7 , en'})).toBe('en-GB');
  });

  it('ignores a wildcard and empty values', () => {
    expect(resolveRequestLanguage({acceptLanguage: '*'})).toBeUndefined();
    expect(resolveRequestLanguage({acceptLanguage: '*, ta-IN'})).toBe('ta-IN');
    expect(resolveRequestLanguage({acceptLanguage: '', storedLanguage: ''})).toBeUndefined();
  });

  it('returns undefined when nothing is known', () => {
    expect(resolveRequestLanguage({})).toBeUndefined();
    expect(resolveRequestLanguage({acceptLanguage: null, storedLanguage: null})).toBeUndefined();
  });
});
