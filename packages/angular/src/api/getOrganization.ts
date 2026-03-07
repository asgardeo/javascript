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

import {
  getOrganization as baseGetOrganization,
  GetOrganizationConfig as BaseGetOrganizationConfig,
  OrganizationDetails,
} from '@asgardeo/browser';
import {createDefaultFetcher} from '../utils/fetcher';

/**
 * Configuration for the getOrganization request (Angular-specific)
 */
export interface GetOrganizationConfig extends Omit<BaseGetOrganizationConfig, 'fetcher'> {
  /**
   * Optional custom fetcher function. If not provided, the Asgardeo SPA client's httpClient will be used
   * which is a wrapper around axios http.request
   */
  fetcher?: (url: string, config: RequestInit) => Promise<Response>;
  /**
   * Optional instance ID for multi-instance support. Defaults to 0.
   */
  instanceId?: number;
}

/**
 * Retrieves detailed information for a specific organization.
 * This function uses the Asgardeo SPA client's httpClient by default, but allows for custom fetchers.
 *
 * @param config - Configuration object containing baseUrl, organizationId, and request config.
 * @returns A promise that resolves with the organization details.
 * @example
 * ```typescript
 * // Using default Asgardeo SPA client httpClient
 * try {
 *   const organization = await getOrganization({
 *     baseUrl: "https://api.asgardeo.io/t/dxlab",
 *     organizationId: "0d5e071b-d3d3-475d-b3c6-1a20ee2fa9b1"
 *   });
 *   console.log(organization);
 * } catch (error) {
 *   if (error instanceof AsgardeoAPIError) {
 *     console.error('Failed to get organization:', error.message);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using custom fetcher
 * try {
 *   const organization = await getOrganization({
 *     baseUrl: "https://api.asgardeo.io/t/dxlab",
 *     organizationId: "0d5e071b-d3d3-475d-b3c6-1a20ee2fa9b1",
 *     fetcher: customFetchFunction
 *   });
 *   console.log(organization);
 * } catch (error) {
 *   if (error instanceof AsgardeoAPIError) {
 *     console.error('Failed to get organization:', error.message);
 *   }
 * }
 * ```
 */
const getOrganization = async ({
  fetcher,
  instanceId = 0,
  ...requestConfig
}: GetOrganizationConfig): Promise<OrganizationDetails> =>
  baseGetOrganization({
    ...requestConfig,
    fetcher: fetcher || createDefaultFetcher(instanceId),
  });

export default getOrganization;
