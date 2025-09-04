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

/**
 * Configuration for the createUser request
 */
export interface CreateUserConfig extends Omit<RequestInit, 'method' | 'body'> {
  /**
   * The absolute API endpoint.
   * Defaults to https://api.asgardeo.io/t/dxlab/scim2/Users
   */
  url?: string;
  /**
   * The base path of the API endpoint (e.g., https://api.asgardeo.io/t/dxlab)
   */
  baseUrl?: string;
  /**
   * The user object to create (SCIM2 User schema)
   */
  payload: any;
  /**
   * Optional custom fetcher function.
   * If not provided, native fetch will be used
   */
  fetcher?: (url: string, config: RequestInit) => Promise<Response>;
}

/**
 * Creates a new user at the SCIM2 Users endpoint.
 *
 * @param config - Configuration object with URL, payload and optional request config.
 * @returns A promise that resolves with the created user profile information.
 * @example
 * ```typescript
 * await createUser({
 *   url: "https://api.asgardeo.io/t/dxlab/scim2/Users",
 *   payload: { ... }
 * });
 * ```
 */
const createUser = async ({url, baseUrl, payload, fetcher, ...requestConfig}: CreateUserConfig): Promise<User> => {
  try {
    new URL(url ?? baseUrl);
  } catch (error) {
    throw new AsgardeoAPIError(
      `Invalid URL provided. ${error?.toString()}`,
      'createUser-ValidationError-001',
      'javascript',
      400,
      'The provided `url` or `baseUrl` path does not adhere to the URL schema.',
    );
  }

  const fetchFn = fetcher || fetch;
  const resolvedUrl: string = url ?? `${baseUrl}/scim2/Users`;

  const requestInit: RequestInit = {
    method: 'POST',
    ...requestConfig,
    headers: {
      ...requestConfig.headers,
      'Content-Type': 'application/scim+json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  };

  try {
    const response: Response = await fetchFn(resolvedUrl, requestInit);

    if (!response?.ok) {
      const errorText = await response.text();

      throw new AsgardeoAPIError(
        `Failed to create user: ${errorText}`,
        'createUser-ResponseError-001',
        'javascript',
        response.status,
        response.statusText,
      );
    }

    return (await response.json()) as User;
  } catch (error) {
    if (error instanceof AsgardeoAPIError) {
      throw error;
    }

    throw new AsgardeoAPIError(
      error?.response?.data?.detail || 'An error occurred while creating the user. Please try again.',
      'createUser-NetworkError-001',
      'javascript',
      error?.data?.status,
      'Network Error',
    );
  }
};

export default createUser;
