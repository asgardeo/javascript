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

import {
  Userstore,
  getUserstores as baseGetUserstores,
  GetUserstoresConfig as BaseGetUserstoresConfig,
} from '@asgardeo/browser';
import {HttpInstance, AsgardeoSPAClient, HttpRequestConfig} from '@asgardeo/browser';

const httpClient: HttpInstance = AsgardeoSPAClient.getInstance().httpRequest.bind(AsgardeoSPAClient.getInstance());

export interface GetUserstoresConfig extends Omit<BaseGetUserstoresConfig, 'fetcher'> {
  fetcher?: (url: string, config: RequestInit) => Promise<Response>;
}

/**
 * Retrieves the userstores from the specified endpoint.
 * This function uses the Asgardeo SPA client's httpClient by default, but allows for custom fetchers.
 *
 * @param config - Request configuration object.
 * @returns A promise that resolves with the userstores information.
 */
const getUserstores = async ({fetcher, ...requestConfig}: GetUserstoresConfig): Promise<Userstore[]> => {
  const defaultFetcher = async (url: string, config: RequestInit): Promise<Response> => {
    const response = await httpClient({
      url,
      method: config.method || 'GET',
      headers: config.headers as Record<string, string>,
    } as HttpRequestConfig);
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText || '',
      json: () => Promise.resolve(response.data),
      text: () => Promise.resolve(typeof response.data === 'string' ? response.data : JSON.stringify(response.data)),
    } as Response;
  };
  return baseGetUserstores({
    ...requestConfig,
    fetcher: fetcher || defaultFetcher,
  });
};

export default getUserstores;
