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

import OIDCDiscoveryConstants from '../constants/OIDCDiscoveryConstants';
import {AsgardeoAuthException} from '../errors/exception';
import {OIDCDiscoveryEndpointsApiResponse, OIDCDiscoveryApiResponse} from '../models/oidc-discovery';
import {StrictAuthClientConfig} from '../models/auth-client-config';
import {Config} from '../models/config';
import {Platform} from '../models/platforms';
import StorageManager from '../StorageManager';

export default async function resolveEndpointsByBaseURL<T>(
  storageManager: StorageManager<T>,
): Promise<OIDCDiscoveryEndpointsApiResponse> {
  const oidcProviderMetaData: OIDCDiscoveryEndpointsApiResponse = {};
  const configData: StrictAuthClientConfig = await storageManager.getConfigData() as unknown as StrictAuthClientConfig;

  const {baseUrl} = configData as any;

  if (!baseUrl) {
    throw new AsgardeoAuthException(
      'JS-AUTH_HELPER_REBO-NF01',
      'Base URL not defined.',
      'Base URL is not defined in AuthClient config.',
    );
  }

  if (configData.endpoints) {
    Object.keys(configData.endpoints).forEach((endpointName: string) => {
      const snakeCasedName: string = endpointName.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);

      oidcProviderMetaData[snakeCasedName] = configData?.endpoints ? configData.endpoints[endpointName] : '';
    });
  }

  const endpointKeys: typeof OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints =
    OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints;
  const endpointPaths: typeof OIDCDiscoveryConstants.Endpoints = OIDCDiscoveryConstants.Endpoints;

  const defaultEndpoints: OIDCDiscoveryApiResponse = {
    [endpointKeys.AUTHORIZATION]: `${baseUrl}${endpointPaths.AUTHORIZATION}`,
    [endpointKeys.END_SESSION]: `${baseUrl}${endpointPaths.END_SESSION}`,
    [endpointKeys.ISSUER]: `${baseUrl}${endpointPaths.ISSUER}`,
    [endpointKeys.JWKS]: `${baseUrl}${endpointPaths.JWKS}`,
    [endpointKeys.SESSION_IFRAME]: `${baseUrl}${endpointPaths.SESSION_IFRAME}`,
    [endpointKeys.REVOCATION]: `${baseUrl}${endpointPaths.REVOCATION}`,
    [endpointKeys.TOKEN]: `${baseUrl}${endpointPaths.TOKEN}`,
    [endpointKeys.USERINFO]: `${baseUrl}${endpointPaths.USERINFO}`,
  };

  // For AsgardeoV2 (Thunder), the issuer must be the base URL (e.g., https://localhost:8090)
  // to comply with RFC 8414 (Section 2 & 3) and OpenID Connect Discovery specs.
  // The issuer should be a URL using "https" scheme with no query or fragment components.
  // The well-known metadata endpoint is derived by inserting "/.well-known/oauth-authorization-server"
  // between the host and path components of the issuer identifier.
  // Reference: https://datatracker.ietf.org/doc/html/rfc8414#section-2
  // Trackers:
  //     - https://github.com/asgardeo/thunder/issues/815
  //     - https://github.com/asgardeo/javascript/issues/322
  if ((configData as Config).platform === Platform.AsgardeoV2) {
    defaultEndpoints[OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.ISSUER] = `${baseUrl}`;
  }

  return {...defaultEndpoints, ...oidcProviderMetaData};
}
