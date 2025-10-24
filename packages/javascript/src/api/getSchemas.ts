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

import {Schema} from '../models/scim2-schema';
import AsgardeoAPIError from '../errors/AsgardeoAPIError';

/**
 * Configuration for the getSchemas request
 */
export interface GetSchemasConfig extends Omit<RequestInit, 'method'> {
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
 * Retrieves the SCIM2 schemas from the specified endpoint.
 *
 * @param config - Request configuration object.
 * @returns A promise that resolves with the SCIM2 schemas information.
 * @example
 * ```typescript
 * // Using default fetch
 * try {
 *   const schemas = await getSchemas({
 *     url: "https://api.asgardeo.io/t/<ORGANIZATION>/scim2/Schemas",
 *   });
 *   console.log(schemas);
 * } catch (error) {
 *   if (error instanceof AsgardeoAPIError) {
 *     console.error('Failed to get schemas:', error.message);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using custom fetcher (e.g., axios-based httpClient)
 * try {
 *   const schemas = await getSchemas({
 *     url: "https://api.asgardeo.io/t/<ORGANIZATION>/scim2/Schemas",
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
 *   console.log(schemas);
 * } catch (error) {
 *   if (error instanceof AsgardeoAPIError) {
 *     console.error('Failed to get schemas:', error.message);
 *   }
 * }
 * ```
 */
const getSchemas = async ({url, baseUrl, fetcher, ...requestConfig}: GetSchemasConfig): Promise<Schema[]> => {
  const finalUrl = url ?? baseUrl;
  if (!finalUrl) {
    throw new AsgardeoAPIError(
      'Either url or baseUrl must be provided',
      'getSchemas-ValidationError-000',
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
      'getSchemas-ValidationError-001',
      'javascript',
      400,
      'The provided `url` or `baseUrl` path does not adhere to the URL schema.',
    );
  }

  const fetchFn = fetcher || fetch;
  const resolvedUrl: string = url ?? `${baseUrl}/scim2/Schemas`;

  const requestInit: RequestInit = {
    ...requestConfig,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...requestConfig.headers,
    },
  };

  try {
    const response: Response = await fetchFn(resolvedUrl, requestInit);

    if (!response?.ok) {
      const errorText = await response.text();

      throw new AsgardeoAPIError(
        `Failed to fetch SCIM2 schemas: ${errorText}`,
        'getSchemas-ResponseError-001',
        'javascript',
        response.status,
        response.statusText,
      );
    }

    return (await response.json()) as Schema[];
  } catch (error) {
    if (error instanceof AsgardeoAPIError) {
      throw error;
    }

    throw new AsgardeoAPIError(
      `Network or parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'getSchemas-NetworkError-001',
      'javascript',
      0,
      'Network Error',
    );
  }
};

export default getSchemas;
