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

import {describe, it, expect} from 'vitest';
import AsgardeoRuntimeError from '../../errors/AsgardeoRuntimeError';
import processOpenIDScopes from '../processOpenIDScopes';

vi.mock('../../constants/OIDCRequestConstants', () => ({
  default: {
    SignIn: {
      Payload: {
        DEFAULT_SCOPES: ['openid', 'email'],
      },
    },
  },
}));

describe('processOpenIDScopes', () => {
  it('should return the same string if it already includes all default scopes (no duplicates, preserves order)', () => {
    const input: string = 'email openid profile';
    const out: string = processOpenIDScopes(input);
    expect(out).toBe('email openid profile');
  });

  it('should add missing default scopes to a string input (appends to the end)', () => {
    const input: string = 'profile';
    const out: string = processOpenIDScopes(input);

    expect(out).toBe('profile openid email');
  });

  it('should append only the missing default scopes when some are already present', () => {
    const input: string = 'email profile';
    const out: string = processOpenIDScopes(input);
    expect(out).toBe('email profile openid');
  });

  it('should join an array of scopes and injects any missing defaults', () => {
    const input: string[] = ['profile', 'email'];
    const out: string = processOpenIDScopes(input);
    expect(out).toBe('profile email openid');
  });

  it('should not duplicate defaults when provided as array', () => {
    const input: string[] = ['openid', 'email'];
    const out: string = processOpenIDScopes(input);
    expect(out).toBe('openid email');
  });

  it('should handle an empty string by returning only defaults', () => {
    const input: string = '';
    const out: string = processOpenIDScopes(input);
    expect(out).toBe('openid email');
  });

  it('should handle an empty array by returning only defaults', () => {
    const input: string[] = [];
    const out: string = processOpenIDScopes(input);
    expect(out).toBe('openid email');
  });

  it('should throw AsgardeoRuntimeError for non-string/array input (number)', () => {
    expect(() => processOpenIDScopes(123)).toThrow(AsgardeoRuntimeError);
  });

  it('should throw AsgardeoRuntimeError for non-string/array input (object)', () => {
    expect(() => processOpenIDScopes({})).toThrow(AsgardeoRuntimeError);
  });

  it('should not trim or re-order user-provided string segments beyond default injection', () => {
    const input: string = 'custom-scope another';
    const out: string = processOpenIDScopes(input);
    expect(out).toBe('custom-scope another openid email');
  });
});
