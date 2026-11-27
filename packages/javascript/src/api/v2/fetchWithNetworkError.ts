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

import AsgardeoAPIError from '../../errors/AsgardeoAPIError';

/**
 * Calls `fetch` and reports a failure to reach the server (or a request that never completes) as an
 * `AsgardeoAPIError` with the code `<operation>-NetworkError-001`, like the other API functions.
 *
 * @param operation - The name of the API function, used as the error code prefix.
 * @param input - The request URL.
 * @param init - The request options.
 * @returns The response. HTTP error statuses are returned as-is for the caller to handle.
 */
const fetchWithNetworkError = async (operation: string, input: string, init: RequestInit): Promise<Response> => {
  try {
    return await fetch(input, init);
  } catch (error) {
    throw new AsgardeoAPIError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      `${operation}-NetworkError-001`,
      'javascript',
      0,
      'Network Error',
    );
  }
};

export default fetchWithNetworkError;
