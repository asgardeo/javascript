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
 * Configuration for the updateMeProfile request
 */
export interface UpdateMeProfileConfig extends Omit<RequestInit, 'method' | 'body'> {
  /**
   * The absolute API endpoint.
   */
  url?: string;
  /**
   * The base path of the API endpoint.
   */
  baseUrl?: string;
  /**
   * The value object to patch (SCIM2 PATCH value)
   */
  payload: any;
  /**
   * Optional custom fetcher function.
   * If not provided, native fetch will be used
   */
  fetcher?: (url: string, config: RequestInit) => Promise<Response>;
}

/**
 * Updates the user profile information at the specified SCIM2 Me endpoint.
 *
 * @param config - Configuration object with URL, payload and optional request config.
 * @returns A promise that resolves with the updated user profile information.
 * @example
 * ```typescript
 * // Using default fetch
 * await updateMeProfile({
 *   url: "https://api.asgardeo.io/t/<ORG>/scim2/Me",
 *   payload: { "urn:scim:wso2:schema": { mobileNumbers: ["0777933830"] } }
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Using custom fetcher (e.g., axios-based httpClient)
 * await updateMeProfile({
 *   url: "https://api.asgardeo.io/t/<ORG>/scim2/Me",
 *   payload: { "urn:scim:wso2:schema": { mobileNumbers: ["0777933830"] } },
 *   fetcher: async (url, config) => {
 *     const response = await httpClient({
 *       url,
 *       method: config.method,
 *       headers: config.headers,
 *       data: config.body,
 *       ...config
 *     });
 *     // Convert axios-like response to fetch-like Response
 *     return {
 *       ok: response.status >= 200 && response.status < 300,
 *       status: response.status,
 *       statusText: response.statusText,
 *       json: () => Promise.resolve(response.data),
 *       text: () => Promise.resolve(typeof response.data === 'string' ? response.data : JSON.stringify(response.data))
 *     } as Response;
 *   }
 * });
 * ```
 */
const updateMeProfile = async ({
  url,
  baseUrl,
  payload,
  fetcher,
  ...requestConfig
}: UpdateMeProfileConfig): Promise<User> => {
  const finalUrl = url ?? baseUrl;
  if (!finalUrl) {
    throw new AsgardeoAPIError(
      'Either url or baseUrl must be provided',
      'updateMeProfile-ValidationError-000',
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
      'updateMeProfile-ValidationError-001',
      'javascript',
      400,
      'The provided `url` or `baseUrl` path does not adhere to the URL schema.',
    );
  }

  const data = {
    Operations: [
      {
        op: 'replace',
        value: payload,
      },
    ],
    schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
  };

  const fetchFn = fetcher || fetch;
  const resolvedUrl: string = url ?? `${baseUrl}/scim2/Me`;

  const requestInit: RequestInit = {
    method: 'PATCH',
    ...requestConfig,
    headers: {
      ...requestConfig.headers,
      'Content-Type': 'application/scim+json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  };

  try {
    const response: Response = await fetchFn(resolvedUrl, requestInit);

    if (!response?.ok) {
      const errorText = await response.text();

      throw new AsgardeoAPIError(
        `Failed to update user profile: ${errorText}`,
        'updateMeProfile-ResponseError-001',
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

    // Type guard for error object with response/data properties
    const isErrorWithResponse = (err: unknown): err is { response?: { data?: { detail?: string } } } => {
      return typeof err === 'object' && err !== null;
    };

    const isErrorWithData = (err: unknown): err is { data?: { status?: number } } => {
      return typeof err === 'object' && err !== null;
    };

    const errorMessage = isErrorWithResponse(error) && error.response?.data?.detail 
      ? error.response.data.detail
      : 'An error occurred while updating the user profile. Please try again.';

    const errorStatus = isErrorWithData(error) && error.data?.status 
      ? error.data.status 
      : 500;

    throw new AsgardeoAPIError(
      errorMessage,
      'updateMeProfile-NetworkError-001',
      'javascript',
      errorStatus,
      'Network Error',
    );
  }
};

export default updateMeProfile;
