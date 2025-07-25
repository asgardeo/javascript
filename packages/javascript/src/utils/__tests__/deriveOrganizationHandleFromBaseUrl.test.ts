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

import deriveOrganizationHandleFromBaseUrl from '../deriveOrganizationHandleFromBaseUrl';
import AsgardeoRuntimeError from '../../errors/AsgardeoRuntimeError';

describe('deriveOrganizationHandleFromBaseUrl', () => {
  describe('Valid Asgardeo URLs', () => {
    it('should extract organization handle from dev.asgardeo.io URL', () => {
      const result = deriveOrganizationHandleFromBaseUrl('https://dev.asgardeo.io/t/dxlab');
      expect(result).toBe('dxlab');
    });

    it('should extract organization handle from stage.asgardeo.io URL', () => {
      const result = deriveOrganizationHandleFromBaseUrl('https://stage.asgardeo.io/t/dxlab');
      expect(result).toBe('dxlab');
    });

    it('should extract organization handle from prod.asgardeo.io URL', () => {
      const result = deriveOrganizationHandleFromBaseUrl('https://prod.asgardeo.io/t/dxlab');
      expect(result).toBe('dxlab');
    });

    it('should extract organization handle from custom subdomain asgardeo.io URL', () => {
      const result = deriveOrganizationHandleFromBaseUrl('https://xxx.asgardeo.io/t/dxlab');
      expect(result).toBe('dxlab');
    });

    it('should extract organization handle with trailing slash', () => {
      const result = deriveOrganizationHandleFromBaseUrl('https://dev.asgardeo.io/t/dxlab/');
      expect(result).toBe('dxlab');
    });

    it('should extract organization handle with additional path segments', () => {
      const result = deriveOrganizationHandleFromBaseUrl('https://dev.asgardeo.io/t/dxlab/api/v1');
      expect(result).toBe('dxlab');
    });

    it('should handle different organization handles', () => {
      expect(deriveOrganizationHandleFromBaseUrl('https://dev.asgardeo.io/t/myorg')).toBe('myorg');
      expect(deriveOrganizationHandleFromBaseUrl('https://dev.asgardeo.io/t/test-org')).toBe('test-org');
      expect(deriveOrganizationHandleFromBaseUrl('https://dev.asgardeo.io/t/org123')).toBe('org123');
    });
  });

  describe('Invalid URLs - Custom Domains', () => {
    it('should throw error for custom domain without asgardeo.io', () => {
      expect(() => {
        deriveOrganizationHandleFromBaseUrl('https://custom.example.com/auth');
      }).toThrow(AsgardeoRuntimeError);

      expect(() => {
        deriveOrganizationHandleFromBaseUrl('https://custom.example.com/auth');
      }).toThrow('Organization handle is required since a custom domain is configured.');
    });

    it('should throw error for URLs without /t/ pattern', () => {
      expect(() => {
        deriveOrganizationHandleFromBaseUrl('https://auth.asgardeo.io/oauth2/token');
      }).toThrow(AsgardeoRuntimeError);

      expect(() => {
        deriveOrganizationHandleFromBaseUrl('https://auth.asgardeo.io/oauth2/token');
      }).toThrow('Organization handle is required since a custom domain is configured.');
    });

    it('should throw error for URLs with malformed /t/ pattern', () => {
      expect(() => {
        deriveOrganizationHandleFromBaseUrl('https://dev.asgardeo.io/t/');
      }).toThrow(AsgardeoRuntimeError);

      expect(() => {
        deriveOrganizationHandleFromBaseUrl('https://dev.asgardeo.io/t');
      }).toThrow(AsgardeoRuntimeError);
    });

    it('should throw error for URLs with empty organization handle', () => {
      expect(() => {
        deriveOrganizationHandleFromBaseUrl('https://dev.asgardeo.io/t//');
      }).toThrow(AsgardeoRuntimeError);
    });
  });

  describe('Invalid Input', () => {
    it('should throw error for undefined baseUrl', () => {
      expect(() => {
        deriveOrganizationHandleFromBaseUrl(undefined);
      }).toThrow(AsgardeoRuntimeError);

      expect(() => {
        deriveOrganizationHandleFromBaseUrl(undefined);
      }).toThrow('Base URL is required to derive organization handle.');
    });

    it('should throw error for empty baseUrl', () => {
      expect(() => {
        deriveOrganizationHandleFromBaseUrl('');
      }).toThrow(AsgardeoRuntimeError);

      expect(() => {
        deriveOrganizationHandleFromBaseUrl('');
      }).toThrow('Base URL is required to derive organization handle.');
    });

    it('should throw error for invalid URL format', () => {
      expect(() => {
        deriveOrganizationHandleFromBaseUrl('not-a-valid-url');
      }).toThrow(AsgardeoRuntimeError);

      expect(() => {
        deriveOrganizationHandleFromBaseUrl('not-a-valid-url');
      }).toThrow('Invalid base URL format');
    });
  });

  describe('Error Details', () => {
    it('should throw AsgardeoRuntimeError with correct error codes', () => {
      try {
        deriveOrganizationHandleFromBaseUrl(undefined);
      } catch (error) {
        expect(error).toBeInstanceOf(AsgardeoRuntimeError);
        expect(error.code).toBe('javascript-deriveOrganizationHandleFromBaseUrl-ValidationError-001');
        expect(error.origin).toBe('javascript');
      }

      try {
        deriveOrganizationHandleFromBaseUrl('invalid-url');
      } catch (error) {
        expect(error).toBeInstanceOf(AsgardeoRuntimeError);
        expect(error.code).toBe('javascript-deriveOrganizationHandleFromBaseUrl-ValidationError-002');
        expect(error.origin).toBe('javascript');
      }

      try {
        deriveOrganizationHandleFromBaseUrl('https://custom.domain.com/auth');
      } catch (error) {
        expect(error).toBeInstanceOf(AsgardeoRuntimeError);
        expect(error.code).toBe('javascript-deriveOrganizationHandleFromBaseUrl-CustomDomainError-001');
        expect(error.origin).toBe('javascript');
      }
    });
  });
});
