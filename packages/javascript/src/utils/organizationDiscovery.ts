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

import {OrganizationDiscoveryStrategy} from '../models/config';

/**
 * Derives organization info from URL path parameter
 * Supports patterns like /o/<handle> or /<param>/<handle>
 */
const deriveFromUrlPath = (param: string): string | undefined => {
  if (typeof globalThis !== 'undefined' && typeof globalThis.window !== 'undefined') {
    const pathSegments = globalThis.window.location.pathname.split('/').filter(segment => segment);

    // Look for the parameter in the path segments
    const paramIndex = pathSegments.findIndex(segment => segment === param);

    if (paramIndex !== -1 && paramIndex + 1 < pathSegments.length) {
      return pathSegments[paramIndex + 1];
    }
  }

  return undefined;
};

/**
 * Derives organization info from URL query parameter
 */
const deriveFromUrlQuery = (param: string): string | undefined => {
  if (typeof globalThis !== 'undefined' && typeof globalThis.window !== 'undefined') {
    const urlParams = new URLSearchParams(globalThis.window.location.search);
    return urlParams.get(param) || undefined;
  }

  return undefined;
};

/**
 * Derives organization info from subdomain
 */
const deriveFromSubdomain = (): string | undefined => {
  if (typeof globalThis !== 'undefined' && typeof globalThis.window !== 'undefined') {
    const hostname = globalThis.window.location.hostname;
    const parts = hostname.split('.');

    // Return first part if it's not 'www' and has at least 3 parts (subdomain.domain.tld)
    if (parts.length >= 3 && parts[0] !== 'www') {
      return parts[0];
    }
  }

  return undefined;
};

/**
 * Resolves organization info based on the discovery strategy
 */
const organizationDiscovery = (
  strategy: OrganizationDiscoveryStrategy,
): string => {
  switch (strategy?.type) {
    case 'urlPath':
      return deriveFromUrlPath(strategy?.param);

    case 'urlQuery':
      return deriveFromUrlQuery(strategy?.param);

    case 'subdomain':
      return deriveFromSubdomain();

    case 'custom':
      return strategy?.resolver();

    default:
      return undefined;
  }
};

export default organizationDiscovery;
