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
 * HTTP utility for making requests using the AsgardeoSPAClient instance.
 *
 * @remarks
 * This utility provides methods to make single or multiple HTTP requests.
 */
const http: {
  request: typeof AsgardeoSPAClient.prototype.httpRequest;
  requestAll: typeof AsgardeoSPAClient.prototype.httpRequestAll;
} = {
  /**
   * Makes a single HTTP request using the AsgardeoSPAClient instance.
   *
   * @param config - The HTTP request configuration object.
   * @returns A promise resolving to the HTTP response.
   */
  request: AsgardeoSPAClient.getInstance().httpRequest.bind(AsgardeoSPAClient.getInstance()),

  /**
   * Makes multiple HTTP requests in parallel using the AsgardeoSPAClient instance.
   *
   * @param configs - An array of HTTP request configuration objects.
   * @returns A promise resolving to an array of HTTP responses.
   */
  requestAll: AsgardeoSPAClient.getInstance().httpRequestAll.bind(AsgardeoSPAClient.getInstance()),
};

export default http;
