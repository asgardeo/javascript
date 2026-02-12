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

import {
  HttpInstance,
  HttpResponse,
  AsgardeoSPAClient,
  HttpRequestConfig,
  getAllOrganizations as baseGetAllOrganizations,
  GetAllOrganizationsConfig as BaseGetAllOrganizationsConfig,
  AllOrganizationsApiResponse,
} from '@asgardeo/browser';

const httpClient: HttpInstance = AsgardeoSPAClient.getInstance().httpRequest.bind(AsgardeoSPAClient.getInstance());

/**
 * Configuration for the getAllOrganizations request (React-specific)
 */
export interface GetAllOrganizationsConfig extends Omit<BaseGetAllOrganizationsConfig, 'fetcher'> {
  /**
   * Optional custom fetcher function. If not provided, the Asgardeo SPA client's httpClient will be used
   * which is a wrapper around axios http.request
   */
  fetcher?: (url: string, config: RequestInit) => Promise<Response>;
}

/**
 * Retrieves all organizations with pagination support.
 * This function uses the Asgardeo SPA client's httpClient by default, but allows for custom fetchers.
 *
 * @param config - Configuration object containing baseUrl, optional query parameters, and request config.
 * @returns A promise that resolves with the paginated organizations information.
 * @example
 * ```typescript
 * // Using default Asgardeo SPA client httpClient
 * try {
 *   const response = await getAllOrganizations({
 *     baseUrl: "https://api.asgardeo.io/t/<ORGANIZATION>",
 *     filter: "",
 *     limit: 10,
 *     recursive: false
 *   });
 *   console.log(response.organizations);
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
 *   const response = await getAllOrganizations({
 *     baseUrl: "https://api.asgardeo.io/t/<ORGANIZATION>",
 *     filter: "",
 *     limit: 10,
 *     recursive: false,
 *     fetcher: customFetchFunction
 *   });
 *   console.log(response.organizations);
 * } catch (error) {
 *   if (error instanceof AsgardeoAPIError) {
 *     console.error('Failed to get organizations:', error.message);
 *   }
 * }
 * ```
 */
const getAllOrganizations = async ({
  fetcher,
  ...requestConfig
}: GetAllOrganizationsConfig): Promise<AllOrganizationsApiResponse> => {
  const defaultFetcher = async (url: string, config: RequestInit): Promise<Response> => {
    const response: HttpResponse<any> = await httpClient({
      headers: config.headers as Record<string, string>,
      method: config.method || 'GET',
      url,
    } as HttpRequestConfig);

    return {
      json: () => Promise.resolve(response.data),
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText || '',
      text: () => Promise.resolve(typeof response.data === 'string' ? response.data : JSON.stringify(response.data)),
    } as Response;
  };

  return baseGetAllOrganizations({
    ...requestConfig,
    fetcher: fetcher || defaultFetcher,
  });
};

export default getAllOrganizations;
