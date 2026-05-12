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
import {IsomorphicCrypto} from '../IsomorphicCrypto';
import {StrictAuthClientConfig} from '../models/auth-client-config';
import {TokenExchangeRequestConfig, TokenResponse} from '../models/token';
import StorageManager from '../StorageManager';
import replaceCustomGrantTemplateTags from '../utils/replaceCustomGrantTemplateTags';
import handleTokenResponse from './handleTokenResponse';
import loadOpenIDProviderConfiguration from './loadOpenIDProviderConfiguration';

export default async function exchangeToken<T>(
  storageManager: StorageManager<T>,
  cryptoHelper: IsomorphicCrypto,
  config: TokenExchangeRequestConfig,
  userId?: string,
): Promise<TokenResponse | Response> {
  if (
    !(await storageManager.getTemporaryDataParameter(
      OIDCDiscoveryConstants.Storage.StorageKeys.OPENID_PROVIDER_CONFIG_INITIATED,
    ))
  ) {
    await loadOpenIDProviderConfiguration(storageManager, false);
  }

  const oidcProviderMetadata = await storageManager.loadOpenIDProviderConfiguration();
  const configData: StrictAuthClientConfig = await storageManager.getConfigData();

  let tokenEndpoint: string | undefined;

  if (config.tokenEndpoint && config.tokenEndpoint.trim().length !== 0) {
    tokenEndpoint = config.tokenEndpoint;
  } else {
    tokenEndpoint = oidcProviderMetadata.token_endpoint;
  }

  if (!tokenEndpoint || tokenEndpoint.trim().length === 0) {
    throw new AsgardeoAuthException(
      'JS-AUTH_CORE-RCG-NF01',
      'Token endpoint not found.',
      'No token endpoint was found in the OIDC provider meta data returned by the well-known endpoint ' +
        'or the token endpoint passed to the SDK is empty.',
    );
  }

  const data: string[] = await Promise.all(
    Object.entries(config.data).map(async ([key, value]: [key: string, value: any]) => {
      const newValue: string = await replaceCustomGrantTemplateTags(storageManager, cryptoHelper, value as string, userId);

      return `${key}=${newValue}`;
    }),
  );

  let requestHeaders: Record<string, any> = {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (config.attachToken) {
    requestHeaders = {
      ...requestHeaders,
      Authorization: `Bearer ${(await storageManager.getSessionData(userId)).access_token}`,
    };
  }

  const requestConfig: RequestInit = {
    body: data.join('&'),
    credentials: configData.sendCookiesInRequests ? 'include' : 'same-origin',
    headers: new Headers(requestHeaders),
    method: 'POST',
  };

  let response: Response;

  try {
    response = await fetch(tokenEndpoint, requestConfig);
  } catch (error: any) {
    throw new AsgardeoAuthException(
      'JS-AUTH_CORE-RCG-NE02',
      'The custom grant request failed.',
      error ?? 'The request sent to get the custom grant failed.',
    );
  }

  if (response.status !== 200 || !response.ok) {
    throw new AsgardeoAuthException(
      'JS-AUTH_CORE-RCG-HE03',
      `Invalid response status received for the custom grant request. (${response.statusText})`,
      (await response.json()) as string,
    );
  }

  if (config.returnsSession) {
    return handleTokenResponse(storageManager, cryptoHelper, response, userId);
  }

  return (await response.json()) as TokenResponse | Response;
}
