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
import parseFlowTemplateLiteral, {
  FlowTemplateLiteralResult,
  FlowTemplateLiteralType,
} from '../parseFlowTemplateLiteral';

describe('parseFlowTemplateLiteral', () => {
  it('parses a translation template expression', () => {
    const result: FlowTemplateLiteralResult = parseFlowTemplateLiteral('t(signin:heading)');

    expect(result).toEqual({
      key: 'signin:heading',
      originalValue: 't(signin:heading)',
      type: FlowTemplateLiteralType.TRANSLATION,
    });
  });

  it('parses a meta template expression', () => {
    const result: FlowTemplateLiteralResult = parseFlowTemplateLiteral('meta(application.name)');

    expect(result).toEqual({
      key: 'application.name',
      originalValue: 'meta(application.name)',
      type: FlowTemplateLiteralType.META,
    });
  });

  it('strips surrounding single or double quotes and trims whitespace from the key', () => {
    expect(parseFlowTemplateLiteral('t("signin:heading")')).toEqual({
      key: 'signin:heading',
      originalValue: 't("signin:heading")',
      type: FlowTemplateLiteralType.TRANSLATION,
    });

    expect(parseFlowTemplateLiteral("meta('application.logoUrl')")).toEqual({
      key: 'application.logoUrl',
      originalValue: "meta('application.logoUrl')",
      type: FlowTemplateLiteralType.META,
    });

    expect(parseFlowTemplateLiteral('t(  common:buttons.submit  )')).toEqual({
      key: 'common:buttons.submit',
      originalValue: 't(  common:buttons.submit  )',
      type: FlowTemplateLiteralType.TRANSLATION,
    });
  });

  it('returns UNKNOWN for unrecognized function names', () => {
    const result: FlowTemplateLiteralResult = parseFlowTemplateLiteral('custom(some.key)');

    expect(result).toEqual({
      originalValue: 'custom(some.key)',
      type: FlowTemplateLiteralType.UNKNOWN,
    });
  });

  it('returns UNKNOWN for malformed or empty expressions', () => {
    expect(parseFlowTemplateLiteral('signin:heading')).toEqual({
      originalValue: 'signin:heading',
      type: FlowTemplateLiteralType.UNKNOWN,
    });

    expect(parseFlowTemplateLiteral('t()')).toEqual({
      originalValue: 't()',
      type: FlowTemplateLiteralType.UNKNOWN,
    });

    expect(parseFlowTemplateLiteral('')).toEqual({
      originalValue: '',
      type: FlowTemplateLiteralType.UNKNOWN,
    });
  });
});
