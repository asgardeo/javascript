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

import {HttpResponse, AsgardeoSPAClient, HttpRequestConfig} from '@asgardeo/browser';

/**
 * Creates a default fetcher function that bridges the Fetch API interface expected
 * by `@asgardeo/browser` API functions with the Axios-based AsgardeoSPAClient HTTP layer.
 *
 * @param instanceId - The Asgardeo client instance ID (for multi-instance support).
 * @returns A Fetch API-compatible function.
 */
export function createDefaultFetcher(instanceId: number): (url: string, config: RequestInit) => Promise<Response> {
  return async (url: string, config: RequestInit): Promise<Response> => {
    const client: AsgardeoSPAClient = AsgardeoSPAClient.getInstance(instanceId);
    const response: HttpResponse<unknown> = (await client.httpRequest({
      data: config.body ? JSON.parse(config.body as string) : undefined,
      headers: config.headers as Record<string, string>,
      method: (config.method as string) || 'GET',
      url,
    } as HttpRequestConfig)) as HttpResponse<unknown>;

    return {
      json: () => Promise.resolve(response.data),
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText || '',
      text: () => Promise.resolve(typeof response.data === 'string' ? response.data : JSON.stringify(response.data)),
    } as Response;
  };
}
