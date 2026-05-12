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

import {AsgardeoAuthException} from '../errors/exception';
import {IsomorphicCrypto} from '../IsomorphicCrypto';
import {StrictAuthClientConfig} from '../models/auth-client-config';
import {SessionData} from '../models/session';
import {TokenResponse} from '../models/token';
import StorageManager from '../StorageManager';
import handleTokenResponse from './handleTokenResponse';

export default async function refreshAccessToken<T>(
  storageManager: StorageManager<T>,
  cryptoHelper: IsomorphicCrypto,
  userId?: string,
): Promise<TokenResponse> {
  const tokenEndpoint: string | undefined = (await storageManager.loadOpenIDProviderConfiguration()).token_endpoint;
  const configData: StrictAuthClientConfig = await storageManager.getConfigData();
  const sessionData: SessionData = await storageManager.getSessionData(userId);

  if (!sessionData.refresh_token) {
    throw new AsgardeoAuthException(
      'JS-AUTH_CORE-RAT2-NF01',
      'No refresh token found.',
      "There was no refresh token found. Asgardeo doesn't return a " +
        'refresh token if the refresh token grant is not enabled.',
    );
  }

  if (!tokenEndpoint || tokenEndpoint.trim().length === 0) {
    throw new AsgardeoAuthException(
      'JS-AUTH_CORE-RAT2-NF02',
      'No refresh token endpoint found.',
      'No refresh token endpoint was in the OIDC provider meta data returned by the well-known ' +
        'endpoint or the refresh token endpoint passed to the SDK is empty.',
    );
  }

  const body: string[] = [];

  body.push(`client_id=${configData.clientId}`);
  body.push(`refresh_token=${sessionData.refresh_token}`);
  body.push('grant_type=refresh_token');

  if (configData.clientSecret && configData.clientSecret.trim().length > 0) {
    body.push(`client_secret=${configData.clientSecret}`);
  }

  let tokenResponse: Response;

  try {
    tokenResponse = await fetch(tokenEndpoint, {
      body: body.join('&'),
      credentials: configData.sendCookiesInRequests ? 'include' : 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });
  } catch (error: any) {
    throw new AsgardeoAuthException(
      'JS-AUTH_CORE-RAT2-NR03',
      'Refresh access token request failed.',
      error ?? 'The request to refresh the access token failed.',
    );
  }

  if (!tokenResponse.ok) {
    throw new AsgardeoAuthException(
      'JS-AUTH_CORE-RAT2-HE04',
      `Refreshing access token failed with ${tokenResponse.statusText}`,
      (await tokenResponse.json()) as string,
    );
  }

  return handleTokenResponse(storageManager, cryptoHelper, tokenResponse, userId);
}
