/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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

import OIDCDiscoveryConstants from '../constants/OIDCDiscoveryConstants';
import {AsgardeoAuthException} from '../errors/exception';
import {StrictAuthClientConfig} from '../models/auth-client-config';
import {OIDCDiscoveryApiResponse, OIDCDiscoveryEndpointsApiResponse} from '../models/oidc-discovery';
import StorageManager from '../StorageManager';

export default async function resolveEndpointsExplicitly<T>(
  storageManager: StorageManager<T>,
): Promise<OIDCDiscoveryEndpointsApiResponse> {
  const oidcProviderMetaData: OIDCDiscoveryApiResponse = {};
  const configData: StrictAuthClientConfig = await storageManager.getConfigData();

  const requiredEndpoints: string[] = [
    OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.AUTHORIZATION,
    OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.END_SESSION,
    OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.JWKS,
    OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.SESSION_IFRAME,
    OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.REVOCATION,
    OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.TOKEN,
    OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.ISSUER,
    OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.USERINFO,
  ];

  const isRequiredEndpointsContains: boolean = configData.endpoints
    ? requiredEndpoints.every((reqEndpointName: string) =>
        configData.endpoints
          ? Object.keys(configData.endpoints).some((endpointName: string) => {
              const snakeCasedName: string = endpointName.replace(
                /[A-Z]/g,
                (letter: string) => `_${letter.toLowerCase()}`,
              );

              return snakeCasedName === reqEndpointName;
            })
          : false,
      )
    : false;

  if (!isRequiredEndpointsContains) {
    throw new AsgardeoAuthException(
      'JS-AUTH_HELPER-REE-NF01',
      'Required endpoints missing',
      'Some or all of the required endpoints are missing in the object passed to the `endpoints` ' +
        'attribute of the`AuthConfig` object.',
    );
  }

  if (configData.endpoints) {
    Object.keys(configData.endpoints).forEach((endpointName: string) => {
      const snakeCasedName: string = endpointName.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);

      oidcProviderMetaData[snakeCasedName] = configData?.endpoints ? configData.endpoints[endpointName] : '';
    });
  }

  return {...oidcProviderMetaData};
}
