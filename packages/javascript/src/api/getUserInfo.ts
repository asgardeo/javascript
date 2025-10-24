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
 * Retrieves the user information from the specified OIDC userinfo endpoint.
 *
 * @param requestConfig - Request configuration object.
 * @returns A promise that resolves with the user information.
 * @throw
 *   const userInfo = await getUserInfo({
 *     url: "https://api.asgardeo.io/t/<ORGANIZATION>/oauth2/userinfo",
 *   });
 *   console.log(userInfo);
 * } catch (error) {
 *   if (error instanceof AsgardeoAPIError) {
 *     console.error('Failed to get user info:', error.message);
 *   }
 * }
 * ```
 */
const getUserInfo = async ({url, ...requestConfig}: Partial<Request>): Promise<User> => {
  if (!url) {
    throw new AsgardeoAPIError(
      'URL is required',
      'getUserInfo-ValidationError-000',
      'javascript',
      400,
      'Invalid Request',
    );
  }

  try {
    new URL(url);
  } catch (error) {
    throw new AsgardeoAPIError(
      'Invalid endpoint URL provided',
      'getUserInfo-ValidationError-001',
      'javascript',
      400,
      'Invalid Request',
    );
  }

  // URL is guaranteed to be defined and valid due to validation above
  const baseHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  let finalHeaders: HeadersInit;
  if (requestConfig.headers instanceof Headers) {
    finalHeaders = requestConfig.headers;
  } else if (requestConfig.headers && typeof requestConfig.headers === 'object') {
    finalHeaders = { ...baseHeaders, ...(requestConfig.headers as Record<string, string>) };
  } else {
    finalHeaders = baseHeaders;
  }

  const response: Response = await fetch(url, {
    ...requestConfig,
    method: 'GET',
    headers: finalHeaders,
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new AsgardeoAPIError(
      `Failed to fetch user info: ${errorText}`,
      'getUserInfo-ResponseError-001',
      'javascript',
      response.status,
      response.statusText,
    );
  }

  return (await response.json()) as User;
};

export default getUserInfo;
