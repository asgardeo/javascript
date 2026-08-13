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

import {OIDCDiscoveryApiResponse} from '../models/oidc-discovery';
import {StrictAuthClientConfig} from '../models/auth-client-config';
import StorageManager from '../StorageManager';

export default async function resolveEndpoints<T>(
  storageManager: StorageManager<T>,
  response: OIDCDiscoveryApiResponse,
): Promise<OIDCDiscoveryApiResponse> {
  const oidcProviderMetaData: OIDCDiscoveryApiResponse = {};
  const configData: StrictAuthClientConfig = await storageManager.getConfigData() as unknown as StrictAuthClientConfig;

  if (configData.endpoints) {
    Object.keys(configData.endpoints).forEach((endpointName: string) => {
      const snakeCasedName: string = endpointName.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);

      oidcProviderMetaData[snakeCasedName] = configData?.endpoints ? configData.endpoints[endpointName] : '';
    });
  }

  return {...response, ...oidcProviderMetaData};
}
