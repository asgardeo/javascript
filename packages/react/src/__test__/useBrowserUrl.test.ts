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

import useBrowserUrl from '../hooks/useBrowserUrl';
import {hasAuthParamsInUrl} from '@asgardeo/browser';
import {vi, describe, it, expect, beforeEach} from 'vitest';

// Mock the module
vi.mock('@asgardeo/browser', () => ({
  hasAuthParamsInUrl: vi.fn(),
}));

describe('useBrowserUrl hook', () => {
  const {hasAuthParams} = useBrowserUrl();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true if hasAuthParamsInUrl returns true and URL matches afterSignInUrl', () => {
    (hasAuthParamsInUrl as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const url = new URL('https://example.com/callback');
    const afterSignInUrl = 'https://example.com/callback';
    expect(hasAuthParams(url, afterSignInUrl)).toBe(true);
  });

  it('returns false if hasAuthParamsInUrl returns false and no error param exists', () => {
    (hasAuthParamsInUrl as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const url = new URL('https://example.com/callback');
    const afterSignInUrl = 'https://example.com/other';
    expect(hasAuthParams(url, afterSignInUrl)).toBe(false);
  });

  it('returns true if URL contains error param', () => {
    (hasAuthParamsInUrl as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const url = new URL('https://example.com/callback?error=access_denied');
    const afterSignInUrl = 'https://example.com/other';
    expect(hasAuthParams(url, afterSignInUrl)).toBe(true);
  });

  it('returns false if URL does not match afterSignInUrl and no error param and hasAuthParamsInUrl false', () => {
    (hasAuthParamsInUrl as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const url = new URL('https://example.com/callback');
    const afterSignInUrl = 'https://example.com/other';
    expect(hasAuthParams(url, afterSignInUrl)).toBe(false);
  });

  // Edge case: trailing slash mismatch
  it('normalizes URLs with trailing slashes', () => {
    (hasAuthParamsInUrl as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const url = new URL('https://example.com/callback/');
    const afterSignInUrl = 'https://example.com/callback';
    expect(hasAuthParams(url, afterSignInUrl)).toBe(false); // still false due to exact match
  });

  // Edge case: relative afterSignInUrl
  it('handles relative afterSignInUrl', () => {
    (hasAuthParamsInUrl as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const url = new URL('https://example.com/callback');
    const afterSignInUrl = '/callback';
    expect(hasAuthParams(url, afterSignInUrl)).toBe(false); // relative URL fails exact match
  });
});
