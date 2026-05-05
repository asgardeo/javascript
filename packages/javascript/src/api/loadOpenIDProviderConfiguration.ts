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
import OIDCDiscoveryConstantsV2 from '../constants/v2/OIDCDiscoveryConstants';
import {AsgardeoAuthException} from '../errors/exception';
import {StrictAuthClientConfig} from '../models/auth-client-config';
import {Platform} from '../models/platforms';
import StorageManager from '../StorageManager';
import resolveEndpoints from '../utils/resolveEndpoints';
import resolveEndpointsByBaseURL from '../utils/resolveEndpointsByBaseURL';
import resolveEndpointsExplicitly from '../utils/resolveEndpointsExplicitly';

export default async function loadOpenIDProviderConfiguration<T>(
  storageManager: StorageManager<T>,
  forceInit: boolean,
): Promise<void> {
  const configData: StrictAuthClientConfig = await storageManager.getConfigData();

  if (
    !forceInit &&
    (await storageManager.getTemporaryDataParameter(
      OIDCDiscoveryConstants.Storage.StorageKeys.OPENID_PROVIDER_CONFIG_INITIATED,
    ))
  ) {
    return;
  }

  const {wellKnownEndpoint, platform, discovery, baseUrl, endpoints} = configData as any;

  const resolvedWellKnownEndpoint: string | undefined =
    wellKnownEndpoint ||
    (platform === Platform.AsgardeoV2 && discovery?.wellKnown?.enabled
      ? `${baseUrl}${endpoints?.wellKnown ?? OIDCDiscoveryConstantsV2.Endpoints.WELL_KNOWN}`
      : undefined);

  if (resolvedWellKnownEndpoint) {
    let response: Response;

    try {
      response = await fetch(resolvedWellKnownEndpoint);
      if (response.status !== 200 || !response.ok) {
        throw new Error();
      }
    } catch {
      throw new AsgardeoAuthException(
        'JS-AUTH_CORE-GOPMD-HE01',
        'Invalid well-known response',
        'The well known endpoint response has been failed with an error.',
      );
    }

    await storageManager.setOIDCProviderMetaData(await resolveEndpoints(storageManager, await response.json()));
    await storageManager.setTemporaryDataParameter(
      OIDCDiscoveryConstants.Storage.StorageKeys.OPENID_PROVIDER_CONFIG_INITIATED,
      true,
    );

    return;
  }

  if ((configData as any).baseUrl) {
    try {
      await storageManager.setOIDCProviderMetaData(await resolveEndpointsByBaseURL(storageManager));
    } catch (error: any) {
      throw new AsgardeoAuthException(
        'JS-AUTH_CORE-GOPMD-IV02',
        'Resolving endpoints failed.',
        error ?? 'Resolving endpoints by base url failed.',
      );
    }
    await storageManager.setTemporaryDataParameter(
      OIDCDiscoveryConstants.Storage.StorageKeys.OPENID_PROVIDER_CONFIG_INITIATED,
      true,
    );

    return;
  }

  await storageManager.setOIDCProviderMetaData(await resolveEndpointsExplicitly(storageManager));
  await storageManager.setTemporaryDataParameter(
    OIDCDiscoveryConstants.Storage.StorageKeys.OPENID_PROVIDER_CONFIG_INITIATED,
    true,
  );
}
