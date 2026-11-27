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

import {beforeEach, describe, expect, it, vi} from 'vitest';
import {resolveAgainstRequestOrigin, resolveCallbackUrl} from '../../src/runtime/server/utils/request-url';

const getRequestURL = vi.fn();

vi.mock('h3', () => ({getRequestURL: (...args: unknown[]) => getRequestURL(...args)}));

const event = {} as any;

describe('resolveAgainstRequestOrigin', () => {
  beforeEach(() => {
    getRequestURL.mockReturnValue(new URL('https://app.example.com/some/page?x=1'));
  });

  it('resolves the default "/" against the request origin', () => {
    expect(resolveAgainstRequestOrigin('/', event)).toBe('https://app.example.com/');
  });

  it('resolves a relative path against the request origin', () => {
    expect(resolveAgainstRequestOrigin('/goodbye', event)).toBe('https://app.example.com/goodbye');
  });

  it('keeps an absolute URL unchanged', () => {
    expect(resolveAgainstRequestOrigin('https://other.example.com/bye', event)).toBe('https://other.example.com/bye');
  });

  it('reads the origin with X-Forwarded-* support', () => {
    resolveAgainstRequestOrigin('/', event);

    expect(getRequestURL).toHaveBeenCalledWith(event, {xForwardedHost: true, xForwardedProto: true});
  });
});

describe('resolveCallbackUrl', () => {
  it('builds the callback URL from the origin of each request', () => {
    getRequestURL.mockReturnValueOnce(new URL('https://a.example.com/page'));
    expect(resolveCallbackUrl(event)).toBe('https://a.example.com/api/auth/callback');

    getRequestURL.mockReturnValueOnce(new URL('http://localhost:3000/'));
    expect(resolveCallbackUrl(event)).toBe('http://localhost:3000/api/auth/callback');
  });
});
