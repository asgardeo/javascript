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

import {describe, expect, it, vi} from 'vitest';
import {FlowMetadataResponse} from '../../../models/v2/flow-meta-v2';
import {TranslationFn} from '../../../models/v2/translation';
import resolveFlowTemplateLiterals from '../resolveFlowTemplateLiterals';

describe('resolveFlowTemplateLiterals', () => {
  const mockMeta: FlowMetadataResponse = {
    application: {
      id: 'app-1',
      name: 'My App',
      tos_uri: 'https://example.com/tos',
    } as unknown as FlowMetadataResponse['application'],
    design: {
      layout: {},
      theme: {},
    },
    i18n: {
      language: 'en',
      languages: ['en'],
      translations: {},
    },
    isRegistrationFlowEnabled: true,
  };

  it('returns an empty string when text is undefined or empty', () => {
    const t: TranslationFn = vi.fn((key: string): string => key);

    expect(resolveFlowTemplateLiterals(undefined, {t})).toBe('');
    expect(resolveFlowTemplateLiterals('', {t})).toBe('');
    expect(t).not.toHaveBeenCalled();
  });

  it('resolves translation template literals and converts colons to dots', () => {
    const dictionary: Record<string, string> = {
      'common.submit': 'Submit',
      'signin.fields.password.label': 'Password',
    };
    const t: TranslationFn = vi.fn((key: string): string => dictionary[key] ?? key);

    expect(resolveFlowTemplateLiterals('{{ t(signin:fields.password.label) }}', {t})).toBe('Password');
    expect(resolveFlowTemplateLiterals('{{t(common.submit)}}', {t})).toBe('Submit');
    expect(t).toHaveBeenCalledWith('signin.fields.password.label');
    expect(t).toHaveBeenCalledWith('common.submit');
  });

  it('resolves meta template literals including snake_case fallback', () => {
    const t: TranslationFn = vi.fn((key: string): string => key);

    expect(resolveFlowTemplateLiterals('Login using {{ meta(application.name) }}', {meta: mockMeta, t})).toBe(
      'Login using My App',
    );
    expect(resolveFlowTemplateLiterals('{{meta(application.tosUri)}}', {meta: mockMeta, t})).toBe(
      'https://example.com/tos',
    );
  });

  it('resolves multiple mixed template literals within the same string', () => {
    const t: TranslationFn = vi.fn((key: string): string => (key === 'auth.greeting' ? 'Welcome to' : key));

    const result: string = resolveFlowTemplateLiterals('{{ t(auth:greeting) }} {{ meta(application.name) }}!', {
      meta: mockMeta,
      t,
    });

    expect(result).toBe('Welcome to My App!');
  });

  it('preserves meta expressions when meta is omitted or null', () => {
    const t: TranslationFn = vi.fn((key: string): string => key);

    expect(resolveFlowTemplateLiterals('App: {{ meta(application.name) }}', {t})).toBe(
      'App: {{ meta(application.name) }}',
    );
    expect(resolveFlowTemplateLiterals('App: {{ meta(application.name) }}', {meta: null, t})).toBe(
      'App: {{ meta(application.name) }}',
    );
  });

  it('leaves unrecognized expressions and plain strings unchanged', () => {
    const t: TranslationFn = vi.fn((key: string): string => key);

    expect(resolveFlowTemplateLiterals('Value: {{ unknown(foo) }} and {{ plain }}', {meta: mockMeta, t})).toBe(
      'Value: {{ unknown(foo) }} and {{ plain }}',
    );
    expect(resolveFlowTemplateLiterals('Plain text without templates', {meta: mockMeta, t})).toBe(
      'Plain text without templates',
    );
    expect(t).not.toHaveBeenCalled();
  });
});
