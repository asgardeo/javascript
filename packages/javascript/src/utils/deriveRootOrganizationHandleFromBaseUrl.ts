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

import AsgardeoRuntimeError from '../errors/AsgardeoRuntimeError';

/**
 * Extracts the organization handle from an Asgardeo base URL.
 *
 * This function parses Asgardeo URLs with the standard pattern:
 * - https://dev.asgardeo.io/t/{orgHandle}
 * - https://stage.asgardeo.io/t/{orgHandle}
 * - https://prod.asgardeo.io/t/{orgHandle}
 * - https://{subdomain}.asgardeo.io/t/{orgHandle}
 *
 * @param baseUrl - The base URL of the Asgardeo identity server
 * @returns The extracted organization handle
 * @throws {AsgardeoRuntimeError} When the URL doesn't match the expected Asgardeo pattern,
 *   indicating a custom domain is configured and rootOrganizationHandle must be provided explicitly
 *
 * @example
 * ```typescript
 * // Standard Asgardeo URLs
 * const handle1 = deriveRootOrganizationHandleFromBaseUrl('https://dev.asgardeo.io/t/dxlab');
 * // Returns: 'dxlab'
 *
 * const handle2 = deriveRootOrganizationHandleFromBaseUrl('https://stage.asgardeo.io/t/myorg');
 * // Returns: 'myorg'
 *
 * // Custom domain - throws error
 * deriveRootOrganizationHandleFromBaseUrl('https://custom.example.com/auth');
 * // Throws: AsgardeoRuntimeError
 * ```
 */
const deriveRootOrganizationHandleFromBaseUrl = (baseUrl?: string): string => {
  if (!baseUrl) {
    throw new AsgardeoRuntimeError(
      'Base URL is required to derive organization handle.',
      'javascript-deriveRootOrganizationHandleFromBaseUrl-ValidationError-001',
      'javascript',
      'A valid base URL must be provided to extract the organization handle.',
    );
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(baseUrl);
  } catch (error) {
    throw new AsgardeoRuntimeError(
      `Invalid base URL format: ${baseUrl}`,
      'javascript-deriveRootOrganizationHandleFromBaseUrl-ValidationError-002',
      'javascript',
      'The provided base URL does not conform to valid URL syntax.',
    );
  }

  // Extract the organization handle from the path pattern: /t/{orgHandle}
  const pathSegments = parsedUrl.pathname?.split('/')?.filter(segment => segment?.length > 0);

  if (pathSegments.length < 2 || pathSegments[0] !== 't') {
    console.warn(
      new AsgardeoRuntimeError(
        'Organization handle is required since a custom domain is configured.',
        'javascript-deriveRootOrganizationHandleFromBaseUrl-CustomDomainError-002',
        'javascript',
        'The provided base URL does not follow the expected URL pattern (/t/{orgHandle}). Please provide the rootOrganizationHandle explicitly in the configuration.',
      ).toString(),
    );

    return '';
  }

  const rootOrganizationHandle = pathSegments[1];

  if (!rootOrganizationHandle || rootOrganizationHandle.trim().length === 0) {
    console.warn(
      new AsgardeoRuntimeError(
        'Organization handle is required since a custom domain is configured.',
        'javascript-deriveRootOrganizationHandleFromBaseUrl-CustomDomainError-003',
        'javascript',
        'The organization handle could not be extracted from the base URL. Please provide the rootOrganizationHandle explicitly in the configuration.',
      ).toString(),
    );

    return '';
  }

  return rootOrganizationHandle;
};

export default deriveRootOrganizationHandleFromBaseUrl;
