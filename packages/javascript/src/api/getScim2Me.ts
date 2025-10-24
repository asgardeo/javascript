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

import {User} from '../models/user';
import AsgardeoAPIError from '../errors/AsgardeoAPIError';
import processUserUsername from '../utils/processUsername';

/**
 * Configuration for the getScim2Me request
 */
export interface GetScim2MeConfig extends Omit<RequestInit, 'method'> {
  /**
   * The absolute API endpoint.
   */
  url?: string;
  /**
   * The base path of the API endpoint.
   */
  baseUrl?: string;
  /**
   * Optional custom fetcher function.
   * If not provided, native fetch will be used
   */
  fetcher?: (url: string, config: RequestInit) => Promise<Response>;
}

/**
 * Retrieves the user profile information from the specified SCIM2 /Me endpoint.
 *
 * @param config - Request configuration object.
 * @returns A promise that resolves with the user profile information.
 * @example
 * ```typescript
 * // Using default fetch
 * try {
 *   const userProfile = await getScim2Me({
 *     url: "https://api.asgardeo.io/t/<ORGANIZATION>/scim2/Me",
 *   });
 *   console.log(userProfile);
 * } catch (error) {
 *   if (error instanceof AsgardeoAPIError) {
 *     console.error('Failed to get user profile:', error.message);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using custom fetcher (e.g., axios-based httpClient)
 * try {
 *   const userProfile = await getScim2Me({
 *     url: "https://api.asgardeo.io/t/<ORGANIZATION>/scim2/Me",
 *     fetcher: async (url, config) => {
 *       const response = await httpClient({
 *         url,
 *         method: config.method,
 *         headers: config.headers,
 *         ...config
 *       });
 *       // Convert axios-like response to fetch-like Response
 *       return {
 *         ok: response.status >= 200 && response.status < 300,
 *         status: response.status,
 *         statusText: response.statusText,
 *         json: () => Promise.resolve(response.data),
 *         text: () => Promise.resolve(typeof response.data === 'string' ? response.data : JSON.stringify(response.data))
 *       } as Response;
 *     }
 *   });
 *   console.log(userProfile);
 * } catch (error) {
 *   if (error instanceof AsgardeoAPIError) {
 *     console.error('Failed to get user profile:', error.message);
 *   }
 * }
 * ```
 */
const getScim2Me = async ({url, baseUrl, fetcher, ...requestConfig}: GetScim2MeConfig): Promise<User> => {
  const finalUrl = url ?? baseUrl;
  if (!finalUrl) {
    throw new AsgardeoAPIError(
      'Either url or baseUrl must be provided',
      'getScim2Me-ValidationError-000',
      'javascript',
      400,
      'Invalid Request',
    );
  }

  try {
    new URL(finalUrl);
  } catch (error) {
    throw new AsgardeoAPIError(
      `Invalid URL provided. ${error?.toString()}`,
      'getScim2Me-ValidationError-001',
      'javascript',
      400,
      'The provided `url` or `baseUrl` path does not adhere to the URL schema.',
    );
  }

  const fetchFn = fetcher || fetch;
  const resolvedUrl: string = url ?? `${baseUrl}/scim2/Me`;

  const requestInit: RequestInit = {
    ...requestConfig,
    method: 'GET',
    headers: {
      'Content-Type': 'application/scim+json',
      Accept: 'application/json',
      ...requestConfig.headers,
    },
  };

  try {
    const response: Response = await fetchFn(resolvedUrl, requestInit);

    if (!response?.ok) {
      const errorText = await response.text();

      throw new AsgardeoAPIError(
        `Failed to fetch user profile: ${errorText}`,
        'getScim2Me-ResponseError-001',
        'javascript',
        response.status,
        response.statusText,
      );
    }

    const user = (await response.json()) as User;

    return processUserUsername(user);
  } catch (error) {
    if (error instanceof AsgardeoAPIError) {
      throw error;
    }

    throw new AsgardeoAPIError(
      `Network or parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'getScim2Me-NetworkError-001',
      'javascript',
      0,
      'Network Error',
    );
  }
};

export default getScim2Me;
