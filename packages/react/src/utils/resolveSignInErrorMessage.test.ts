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
import resolveSignInErrorMessage from './resolveSignInErrorMessage';

const t = (key: string, params?: Record<string, string | number>): string =>
  key === 'errors.signin.redirect.uri.mismatch' ? `Register ${params?.['url']}` : key;

describe('resolveSignInErrorMessage', () => {
  it('maps an unregistered redirect URI rejection to the translated message with the URL', () => {
    const error: Error = new Error(
      '[AsgardeoAPIError] (code="initializeEmbeddedSignInFlow-ResponseError-001") (HTTP 400 - Bad Request)\nMessage: Authorization request failed: {"code":"ABA-60001","message":"Invalid authentication request.","description":"invalid_callback - callback.not.match"}',
    );

    expect(
      resolveSignInErrorMessage(error, {afterSignInUrl: 'http://localhost:3000/dashboard', fallback: 'x', t}),
    ).toBe('Register http://localhost:3000/dashboard');
  });

  it('resolves a relative afterSignInUrl against the current origin', () => {
    const error: Error = new Error(
      'Failed: {"code":"ABA-60001","description":"invalid_callback - callback.not.match"}',
    );

    expect(resolveSignInErrorMessage(error, {afterSignInUrl: '/dashboard', fallback: 'x', t})).toBe(
      `Register ${window.location.origin}/dashboard`,
    );
  });

  it('passes other server errors through', () => {
    const error: Error = new Error(
      'Failed: {"code":"ABA-60007","description":"App native authentication is not enabled."}',
    );

    expect(resolveSignInErrorMessage(error, {fallback: 'x', t})).toBe('App native authentication is not enabled.');
  });

  it('uses the fallback when the error is empty', () => {
    expect(resolveSignInErrorMessage(new Error(''), {fallback: 'Generic failure', t})).toBe('Generic failure');
  });
});
