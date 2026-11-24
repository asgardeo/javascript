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
import {FlowMetadataResponse} from '../../../models/v2/flow-meta-v2';
import resolveMeta from '../resolveMeta';

describe('resolveMeta', () => {
  const baseMeta: FlowMetadataResponse = {
    application: {
      id: 'app-123',
      logoUrl: 'https://example.com/logo.png',
      name: 'Sample App',
    },
    design: {
      layout: {},
      theme: {
        defaultColorScheme: 'light',
        shape: {
          borderRadius: 0,
        },
      },
    },
    i18n: {
      language: 'en',
      languages: ['en'],
      translations: {},
    },
    isRegistrationFlowEnabled: false,
    ou: {
      handle: 'acme',
      id: 'ou-123',
      name: 'Acme Corp',
    },
  };

  it('resolves nested dot-path values', () => {
    expect(resolveMeta('application.name', baseMeta)).toBe('Sample App');
    expect(resolveMeta('ou.handle', baseMeta)).toBe('acme');
    expect(resolveMeta('design.theme.defaultColorScheme', baseMeta)).toBe('light');
  });

  it('falls back to snake_case keys when camelCase segment is absent', () => {
    const snakeCaseMeta: FlowMetadataResponse = {
      ...baseMeta,
      application: {
        id: 'app-123',
        logo_url: 'https://example.com/snake-logo.png',
        name: 'Snake App',
        tos_uri: 'https://example.com/tos',
      } as unknown as FlowMetadataResponse['application'],
    };

    expect(resolveMeta('application.logoUrl', snakeCaseMeta)).toBe('https://example.com/snake-logo.png');
    expect(resolveMeta('application.tosUri', snakeCaseMeta)).toBe('https://example.com/tos');
  });

  it('prefers direct camelCase match over snake_case when both exist', () => {
    const mixedMeta: FlowMetadataResponse = {
      ...baseMeta,
      application: {
        id: 'app-123',
        logoUrl: 'https://example.com/camel.png',
        logo_url: 'https://example.com/snake.png',
        name: 'Mixed App',
      } as unknown as FlowMetadataResponse['application'],
    };

    expect(resolveMeta('application.logoUrl', mixedMeta)).toBe('https://example.com/camel.png');
  });

  it('converts falsy non-nullish primitives like false and 0 to strings', () => {
    expect(resolveMeta('isRegistrationFlowEnabled', baseMeta)).toBe('false');
    expect(resolveMeta('design.theme.shape.borderRadius', baseMeta)).toBe('0');
  });

  it('returns an empty string for missing paths or non-object intermediate values', () => {
    expect(resolveMeta('application.missingField', baseMeta)).toBe('');
    expect(resolveMeta('application.name.nested', baseMeta)).toBe('');
    expect(resolveMeta('nonexistent.path', baseMeta)).toBe('');
  });
});
