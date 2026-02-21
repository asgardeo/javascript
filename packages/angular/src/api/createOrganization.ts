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
  Organization,
  createOrganization as baseCreateOrganization,
  CreateOrganizationConfig as BaseCreateOrganizationConfig,
} from '@asgardeo/browser';
import {createDefaultFetcher} from '../utils/fetcher';

/**
 * Configuration for the createOrganization request (Angular-specific)
 */
export interface CreateOrganizationConfig extends Omit<BaseCreateOrganizationConfig, 'fetcher'> {
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
 * Creates a new organization.
 * This function uses the Asgardeo SPA client's httpClient by default, but allows for custom fetchers.
 *
 * @param config - Configuration object containing baseUrl, payload and optional request config.
 * @returns A promise that resolves with the created organization information.
 * @example
 * ```typescript
 * // Using default Asgardeo SPA client httpClient
 * try {
 *   const organization = await createOrganization({
 *     baseUrl: "https://api.asgardeo.io/t/<ORGANIZATION>",
 *     payload: {
 *       description: "Share your screens",
 *       name: "Team Viewer",
 *       orgHandle: "team-viewer",
 *       parentId: "f4825104-4948-40d9-ab65-a960eee3e3d5",
 *       type: "TENANT"
 *     }
 *   });
 *   console.log(organization);
 * } catch (error) {
 *   if (error instanceof AsgardeoAPIError) {
 *     console.error('Failed to create organization:', error.message);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using custom fetcher
 * try {
 *   const organization = await createOrganization({
 *     baseUrl: "https://api.asgardeo.io/t/<ORGANIZATION>",
 *     payload: {
 *       description: "Share your screens",
 *       name: "Team Viewer",
 *       orgHandle: "team-viewer",
 *       parentId: "f4825104-4948-40d9-ab65-a960eee3e3d5",
 *       type: "TENANT"
 *     },
 *     fetcher: customFetchFunction
 *   });
 *   console.log(organization);
 * } catch (error) {
 *   if (error instanceof AsgardeoAPIError) {
 *     console.error('Failed to create organization:', error.message);
 *   }
 * }
 * ```
 */
const createOrganization = async ({
  fetcher,
  instanceId = 0,
  ...requestConfig
}: CreateOrganizationConfig): Promise<Organization> =>
  baseCreateOrganization({
    ...requestConfig,
    fetcher: fetcher || createDefaultFetcher(instanceId),
  });

export default createOrganization;
