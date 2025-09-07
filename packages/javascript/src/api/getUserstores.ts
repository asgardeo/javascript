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

import AsgardeoAPIError from '../errors/AsgardeoAPIError';
import {Userstore, UserstoreProperty} from '../models/userstore';

export interface GetUserstoresConfig extends Omit<RequestInit, 'method'> {
  url?: string;
  baseUrl?: string;
  fetcher?: (url: string, config: RequestInit) => Promise<Response>;
  requiredAttributes?: string;
}

/**
 * Retrieves the userstores from the specified endpoint.
 * @param config - Request configuration object.
 * @returns A promise that resolves with the userstores information.
 */
const getUserstores = async ({
  url,
  baseUrl,
  fetcher,
  requiredAttributes,
  ...requestConfig
}: GetUserstoresConfig): Promise<Userstore[]> => {
  try {
    new URL(url ?? baseUrl);
  } catch (error) {
    throw new AsgardeoAPIError(
      `Invalid URL provided. ${error?.toString()}`,
      'getUserstores-ValidationError-001',
      'javascript',
      400,
      'The provided `url` or `baseUrl` path does not adhere to the URL schema.',
    );
  }

  const fetchFn = fetcher || fetch;
  let resolvedUrl: string = url ?? `${baseUrl}/api/server/v1/userstores`;
  if (requiredAttributes) {
    const sep = resolvedUrl.includes('?') ? '&' : '?';
    resolvedUrl += `${sep}requiredAttributes=${encodeURIComponent(requiredAttributes)}`;
  }

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
        errorText || 'Failed to fetch userstores.',
        'getUserstores-ResponseError-001',
        'javascript',
        response.status,
        response.statusText,
      );
    }
    return (await response.json()) as Userstore[];
  } catch (error) {
    if (error instanceof AsgardeoAPIError) {
      throw error;
    }
    throw new AsgardeoAPIError(
      error?.response?.data?.detail || 'An error occurred while fetching userstores. Please try again.',
      'getUserstores-NetworkError-001',
      'javascript',
      error?.data?.status,
      'Network Error',
    );
  }
};

export default getUserstores;
