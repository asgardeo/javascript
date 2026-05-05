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
import OIDCRequestConstants from '../constants/OIDCRequestConstants';
import {AsgardeoAuthException} from '../errors/exception';
import {IsomorphicCrypto} from '../IsomorphicCrypto';
import {StrictAuthClientConfig} from '../models/auth-client-config';
import {SessionData} from '../models/session';
import {TokenResponse} from '../models/token';
import StorageManager from '../StorageManager';
import extractPkceStorageKeyFromState from '../utils/extractPkceStorageKeyFromState';
import handleTokenResponse from './handleTokenResponse';
import loadOpenIDProviderConfiguration from './loadOpenIDProviderConfiguration';

export default async function requestAccessToken<T>(
  storageManager: StorageManager<T>,
  cryptoHelper: IsomorphicCrypto,
  authorizationCode: string,
  sessionState: string,
  state: string,
  userId?: string,
  tokenRequestConfig?: {params: Record<string, unknown>},
): Promise<TokenResponse> {
  if (
    !(await storageManager.getTemporaryDataParameter(
      OIDCDiscoveryConstants.Storage.StorageKeys.OPENID_PROVIDER_CONFIG_INITIATED,
    ))
  ) {
    await loadOpenIDProviderConfiguration(storageManager, false);
  }

  const tokenEndpoint: string | undefined = (await storageManager.loadOpenIDProviderConfiguration()).token_endpoint;
  const configData: StrictAuthClientConfig = await storageManager.getConfigData();

  if (!tokenEndpoint || tokenEndpoint.trim().length === 0) {
    throw new AsgardeoAuthException(
      'JS-AUTH_CORE-RAT1-NF01',
      'Token endpoint not found.',
      'No token endpoint was found in the OIDC provider meta data returned by the well-known endpoint ' +
        'or the token endpoint passed to the SDK is empty.',
    );
  }

  if (sessionState) {
    await storageManager.setSessionDataParameter(
      OIDCRequestConstants.Params.SESSION_STATE as keyof SessionData,
      sessionState,
      userId,
    );
  }

  const body: URLSearchParams = new URLSearchParams();

  body.set('client_id', configData.clientId);

  if (configData.clientSecret && configData.clientSecret.trim().length > 0) {
    body.set('client_secret', configData.clientSecret);
  }

  body.set('code', authorizationCode);
  body.set('grant_type', 'authorization_code');
  body.set('redirect_uri', configData.afterSignInUrl);

  if (tokenRequestConfig?.params) {
    Object.entries(tokenRequestConfig.params).forEach(([key, value]: [key: string, value: unknown]) => {
      body.append(key, value as string);
    });
  }

  if (configData.enablePKCE) {
    body.set(
      'code_verifier',
      `${await storageManager.getTemporaryDataParameter(extractPkceStorageKeyFromState(state), userId)}`,
    );

    await storageManager.removeTemporaryDataParameter(extractPkceStorageKeyFromState(state), userId);
  }

  let tokenResponse: Response;

  try {
    tokenResponse = await fetch(tokenEndpoint, {
      body,
      credentials: configData.sendCookiesInRequests ? 'include' : 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });
  } catch (error: any) {
    throw new AsgardeoAuthException(
      'JS-AUTH_CORE-RAT1-NE02',
      'Requesting access token failed',
      error ?? 'The request to get the access token from the server failed.',
    );
  }

  if (!tokenResponse.ok) {
    throw new AsgardeoAuthException(
      'JS-AUTH_CORE-RAT1-HE03',
      `Requesting access token failed with ${tokenResponse.statusText}`,
      (await tokenResponse.json()) as string,
    );
  }

  return handleTokenResponse(storageManager, cryptoHelper, tokenResponse, userId);
}
