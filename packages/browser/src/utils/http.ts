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

// eslint-disable-next-line import/no-cycle
import {AsgardeoSPAClient} from '../__legacy__/client';

/**
 * Creates an HTTP utility for making requests using a specific AsgardeoSPAClient instance.
 *
 * @param instanceId - Optional instance ID for multi-instance support. Defaults to 0.
 * @returns An object with request and requestAll methods bound to the specified instance.
 *
 * @remarks
 * This utility provides methods to make single or multiple HTTP requests for a specific instance.
 *
 * @example
 * ```typescript
 * // Use default instance
 * const httpClient = http();
 * 
 * // Use specific instance
 * const httpInstance1 = http(1);
 * const httpInstance2 = http(2);
 * ```
 */
export const http = (instanceId: number = 0): {
  request: typeof AsgardeoSPAClient.prototype.httpRequest;
  requestAll: typeof AsgardeoSPAClient.prototype.httpRequestAll;
} => {
  const client = AsgardeoSPAClient.getInstance(instanceId);
  
  return {
    /**
     * Makes a single HTTP request using the AsgardeoSPAClient instance.
     *
     * @param config - The HTTP request configuration object.
     * @returns A promise resolving to the HTTP response.
     */
    request: client.httpRequest.bind(client),

    /**
     * Makes multiple HTTP requests in parallel using the AsgardeoSPAClient instance.
     *
     * @param configs - An array of HTTP request configuration objects.
     * @returns A promise resolving to an array of HTTP responses.
     */
    requestAll: client.httpRequestAll.bind(client),
  };
};

/**
 * Default HTTP utility using instance 0.
 * For multi-instance support, use http(instanceId) instead.
 */
export default http();
