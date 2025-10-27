/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
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

import { vi } from 'vitest';
import hasAuthParamsInUrl from '../hasAuthParamsInUrl';

describe('hasAuthParamsInUrl', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Delete the original location property and redefine it
    delete (window as any).location;
    (window as any).location = {
      search: '',
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Restore the original location
    (window as any).location = originalLocation;
  });

  describe('when using default window.location.search', () => {
    it('should return true when URL contains code parameter', () => {
      (window as any).location = {
        search: '?code=abc123&state=xyz',
      };

      expect(hasAuthParamsInUrl()).toBe(true);
    });

    it('should return true when code parameter is at the beginning', () => {
      (window as any).location = {
        search: '?code=abc123',
      };

      expect(hasAuthParamsInUrl()).toBe(true);
    });

    it('should return true when code parameter is in the middle', () => {
      (window as any).location = {
        search: '?state=xyz&code=abc123&other=value',
      };

      expect(hasAuthParamsInUrl()).toBe(true);
    });

    it('should return true when code parameter is at the end', () => {
      (window as any).location = {
        search: '?state=xyz&code=abc123',
      };

      expect(hasAuthParamsInUrl()).toBe(true);
    });

    it('should return false when URL does not contain code parameter', () => {
      (window as any).location = {
        search: '?state=xyz&other=value',
      };

      expect(hasAuthParamsInUrl()).toBe(false);
    });

    it('should return false when search is empty', () => {
      (window as any).location = {
        search: '',
      };

      expect(hasAuthParamsInUrl()).toBe(false);
    });

    it('should return false when search is just a question mark', () => {
      (window as any).location = {
        search: '?',
      };

      expect(hasAuthParamsInUrl()).toBe(false);
    });
  });

  describe('when providing custom params string', () => {
    it('should return true when custom params contain code parameter', () => {
      expect(hasAuthParamsInUrl('?code=abc123&state=xyz')).toBe(true);
    });

    it('should return true when code parameter has special characters', () => {
      expect(hasAuthParamsInUrl('?code=abc%20123&state=xyz')).toBe(true);
    });

    it('should return true when code parameter is empty but present', () => {
      expect(hasAuthParamsInUrl('?code=&state=xyz')).toBe(true);
    });

    it('should return false when custom params do not contain code parameter', () => {
      expect(hasAuthParamsInUrl('?state=xyz&other=value')).toBe(false);
    });

    it('should return false when custom params are empty', () => {
      expect(hasAuthParamsInUrl('')).toBe(false);
    });

    it('should return false when custom params are just a question mark', () => {
      expect(hasAuthParamsInUrl('?')).toBe(false);
    });

    it('should handle malformed URL parameters', () => {
      expect(hasAuthParamsInUrl('?code=abc123&')).toBe(true);
      expect(hasAuthParamsInUrl('?&code=abc123')).toBe(true);
    });

    it('should handle URL encoded parameters', () => {
      expect(hasAuthParamsInUrl('?code=abc%20123%26test')).toBe(true);
    });

    it('should handle parameters with equals signs in values', () => {
      expect(hasAuthParamsInUrl('?code=abc=123&state=xyz')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle very long parameter values', () => {
      const longCode = 'a'.repeat(1000);
      expect(hasAuthParamsInUrl(`?code=${longCode}`)).toBe(true);
    });

    it('should handle multiple code parameters (should match first occurrence)', () => {
      expect(hasAuthParamsInUrl('?code=first&code=second')).toBe(true);
    });

    it('should handle case sensitivity', () => {
      expect(hasAuthParamsInUrl('?Code=abc123')).toBe(false);
      expect(hasAuthParamsInUrl('?CODE=abc123')).toBe(false);
    });
  });
});