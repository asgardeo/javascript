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
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
  User,
  HttpInstance,
  AsgardeoSPAClient,
  HttpRequestConfig,
  createUser as baseCreateUser,
  CreateUserConfig as BaseCreateUserConfig,
} from '@asgardeo/browser';

const httpClient: HttpInstance = AsgardeoSPAClient.getInstance().httpRequest.bind(AsgardeoSPAClient.getInstance());

/**
 * Configuration for the createUser request (React-specific)
 */
export interface CreateUserConfig extends Omit<BaseCreateUserConfig, 'fetcher'> {
  /**
   * Optional custom fetcher function. If not provided, the Asgardeo SPA client's httpClient will be used
   * which is a wrapper around axios http.request
   */
  fetcher?: (url: string, config: RequestInit) => Promise<Response>;
}

/**
 * Creates a new user.
 * This function uses the Asgardeo SPA client's httpClient by default, but allows for custom fetchers.
 *
 * @param config - Configuration object containing baseUrl, payload and optional request config.
 * @returns A promise that resolves with the created user information.
 * @example
 * ```typescript
 * // Using default Asgardeo SPA client httpClient
 * try {
 *   const user = await createUser({
 *     baseUrl: "https://api.asgardeo.io/t/<ORGANIZATION>",
 *     payload: { ... }
 *   });
 *   console.log(user);
 * } catch (error) {
 *   if (error instanceof AsgardeoAPIError) {
 *     console.error('Failed to create user:', error.message);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using custom fetcher
 * try {
 *   const user = await createUser({
 *     baseUrl: "https://api.asgardeo.io/t/<ORGANIZATION>",
 *     payload: { ... },
 *     fetcher: customFetchFunction
 *   });
 *   console.log(user);
 * } catch (error) {
 *   if (error instanceof AsgardeoAPIError) {
 *     console.error('Failed to create user:', error.message);
 *   }
 * }
 * ```
 */
const createUser = async ({fetcher, ...requestConfig}: CreateUserConfig): Promise<User> => {
  const defaultFetcher = async (url: string, config: RequestInit): Promise<Response> => {
    const response = await httpClient({
      url,
      method: config.method || 'POST',
      headers: config.headers as Record<string, string>,
      data: config.body ? JSON.parse(config.body as string) : undefined,
    } as HttpRequestConfig);

    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText || '',
      json: () => Promise.resolve(response.data),
      text: () => Promise.resolve(typeof response.data === 'string' ? response.data : JSON.stringify(response.data)),
    } as Response;
  };

  return baseCreateUser({
    ...requestConfig,
    fetcher: fetcher || defaultFetcher,
  });
};

export default createUser;
