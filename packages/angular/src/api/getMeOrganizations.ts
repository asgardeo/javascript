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
  getMeOrganizations as baseGetMeOrganizations,
  GetMeOrganizationsConfig as BaseGetMeOrganizationsConfig,
} from '@asgardeo/browser';
import {createDefaultFetcher} from '../utils/fetcher';

/**
 * Configuration for the getMeOrganizations request (Angular-specific)
 */
export interface GetMeOrganizationsConfig extends Omit<BaseGetMeOrganizationsConfig, 'fetcher'> {
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
 * Retrieves the organizations associated with the current user.
 * This function uses the Asgardeo SPA client's httpClient by default, but allows for custom fetchers.
 *
 * @param config - Configuration object containing baseUrl, optional query parameters, and request config.
 * @returns A promise that resolves with the organizations information.
 * @example
 * ```typescript
 * // Using default Asgardeo SPA client httpClient
 * try {
 *   const organizations = await getMeOrganizations({
 *     baseUrl: "https://api.asgardeo.io/t/<ORGANIZATION>",
 *     after: "",
 *     before: "",
 *     filter: "",
 *     limit: 10,
 *     recursive: false
 *   });
 *   console.log(organizations);
 * } catch (error) {
 *   if (error instanceof AsgardeoAPIError) {
 *     console.error('Failed to get organizations:', error.message);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using custom fetcher
 * try {
 *   const organizations = await getMeOrganizations({
 *     baseUrl: "https://api.asgardeo.io/t/<ORGANIZATION>",
 *     after: "",
 *     before: "",
 *     filter: "",
 *     limit: 10,
 *     recursive: false,
 *     fetcher: customFetchFunction
 *   });
 *   console.log(organizations);
 * } catch (error) {
 *   if (error instanceof AsgardeoAPIError) {
 *     console.error('Failed to get organizations:', error.message);
 *   }
 * }
 * ```
 */
const getMeOrganizations = async ({
  fetcher,
  instanceId = 0,
  ...requestConfig
}: GetMeOrganizationsConfig): Promise<Organization[]> =>
  baseGetMeOrganizations({
    ...requestConfig,
    fetcher: fetcher || createDefaultFetcher(instanceId),
  });

export default getMeOrganizations;
