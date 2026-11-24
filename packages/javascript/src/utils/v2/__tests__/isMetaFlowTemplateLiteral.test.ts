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
import isMetaFlowTemplateLiteral, {META_FLOW_TEMPLATE_LITERAL_KEY_PATTERN} from '../isMetaFlowTemplateLiteral';

describe('isMetaFlowTemplateLiteral', () => {
  it('returns true for exact meta template literal strings', () => {
    expect(isMetaFlowTemplateLiteral('{{ meta(application.name) }}')).toBe(true);
    expect(isMetaFlowTemplateLiteral('{{meta(ou.logoUrl)}}')).toBe(true);
    expect(isMetaFlowTemplateLiteral('  {{  meta(application.tosUri)  }}  ')).toBe(true);
  });

  it('returns false for embedded templates, other literal types, or invalid syntax', () => {
    expect(isMetaFlowTemplateLiteral('Login to {{ meta(application.name) }}')).toBe(false);
    expect(isMetaFlowTemplateLiteral('{{ t(signin:heading) }}')).toBe(false);
    expect(isMetaFlowTemplateLiteral('{{ meta() }}')).toBe(false);
    expect(isMetaFlowTemplateLiteral('{{ meta(application.name)')).toBe(false);
    expect(isMetaFlowTemplateLiteral('hello world')).toBe(false);
    expect(isMetaFlowTemplateLiteral('')).toBe(false);
  });

  it('extracts the meta path via META_FLOW_TEMPLATE_LITERAL_KEY_PATTERN', () => {
    const match: RegExpExecArray | null = META_FLOW_TEMPLATE_LITERAL_KEY_PATTERN.exec('{{ meta(application.name) }}');

    expect(match?.[1]).toBe('application.name');
  });
});
