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
import isTranslationFlowTemplateLiteral, {
  TRANSLATION_FLOW_TEMPLATE_LITERAL_KEY_PATTERN,
} from '../isTranslationFlowTemplateLiteral';

describe('isTranslationFlowTemplateLiteral', () => {
  it('returns true for exact translation template literal strings', () => {
    expect(isTranslationFlowTemplateLiteral('{{ t(signin:heading) }}')).toBe(true);
    expect(isTranslationFlowTemplateLiteral('{{t(common.submit)}}')).toBe(true);
    expect(isTranslationFlowTemplateLiteral('  {{  t(auth:title)  }}  ')).toBe(true);
  });

  it('returns false for embedded templates, other literal types, or invalid syntax', () => {
    expect(isTranslationFlowTemplateLiteral('Login via {{ t(signin:heading) }}')).toBe(false);
    expect(isTranslationFlowTemplateLiteral('{{ meta(application.name) }}')).toBe(false);
    expect(isTranslationFlowTemplateLiteral('{{ t() }}')).toBe(false);
    expect(isTranslationFlowTemplateLiteral('{{ t(signin:heading)')).toBe(false);
    expect(isTranslationFlowTemplateLiteral('hello world')).toBe(false);
    expect(isTranslationFlowTemplateLiteral('')).toBe(false);
  });

  it('extracts the translation key via TRANSLATION_FLOW_TEMPLATE_LITERAL_KEY_PATTERN', () => {
    const match: RegExpExecArray | null = TRANSLATION_FLOW_TEMPLATE_LITERAL_KEY_PATTERN.exec('{{ t(signin:heading) }}');

    expect(match?.[1]).toBe('signin:heading');
  });
});
