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
import containsMetaFlowTemplateLiteral, {replaceMetaFlowTemplateLiteral} from '../containsMetaFlowTemplateLiteral';

describe('containsMetaFlowTemplateLiteral', () => {
  it('returns true when the meta template literal is embedded in a string', () => {
    expect(
      containsMetaFlowTemplateLiteral('<a href="{{meta(application.signUpUrl)}}">Sign up</a>', 'application.signUpUrl'),
    ).toBe(true);
    expect(
      containsMetaFlowTemplateLiteral('Sign up at {{  meta(application.signUpUrl)  }}', 'application.signUpUrl'),
    ).toBe(true);
  });

  it('returns false when the key is absent or does not match', () => {
    expect(containsMetaFlowTemplateLiteral('<a href="https://example.com">Sign up</a>', 'application.signUpUrl')).toBe(
      false,
    );
    expect(containsMetaFlowTemplateLiteral('{{ meta(ou.name) }}', 'application.name')).toBe(false);
  });

  it('escapes regex special characters in the meta key', () => {
    expect(containsMetaFlowTemplateLiteral('{{ meta(applicationXsignUpUrl) }}', 'application.signUpUrl')).toBe(false);
    expect(containsMetaFlowTemplateLiteral('{{ meta(items[0].name) }}', 'items[0].name')).toBe(true);
  });
});

describe('replaceMetaFlowTemplateLiteral', () => {
  it('replaces all occurrences of the matching meta template literal', () => {
    const input: string =
      'Visit {{ meta(application.url) }} or <a href="{{meta(application.url)}}">{{ meta(application.name) }}</a>';

    expect(replaceMetaFlowTemplateLiteral(input, 'application.url', 'https://app.example.com')).toBe(
      'Visit https://app.example.com or <a href="https://app.example.com">{{ meta(application.name) }}</a>',
    );
  });

  it('escapes regex special characters when replacing', () => {
    expect(
      replaceMetaFlowTemplateLiteral(
        '{{ meta(applicationXurl) }} {{ meta(application.url) }}',
        'application.url',
        '/home',
      ),
    ).toBe('{{ meta(applicationXurl) }} /home');
  });
});
