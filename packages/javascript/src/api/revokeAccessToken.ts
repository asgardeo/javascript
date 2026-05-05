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
import {StrictAuthClientConfig} from '../models/auth-client-config';
import StorageManager from '../StorageManager';
import clearSession from '../utils/clearSession';

export default async function revokeAccessToken<T>(
  storageManager: StorageManager<T>,
  userId?: string,
): Promise<Response> {
  const revokeTokenEndpoint: string | undefined = (
    await storageManager.loadOpenIDProviderConfiguration()
  ).revocation_endpoint;
  const configData: StrictAuthClientConfig = await storageManager.getConfigData();

  if (!revokeTokenEndpoint || revokeTokenEndpoint.trim().length === 0) {
    throw new AsgardeoAuthException(
      'JS-AUTH_CORE-RAT3-NF01',
      'No revoke access token endpoint found.',
      'No revoke access token endpoint was found in the OIDC provider meta data returned by ' +
        'the well-known endpoint or the revoke access token endpoint passed to the SDK is empty.',
    );
  }

  const body: string[] = [];

  body.push(`client_id=${configData.clientId}`);
  body.push(`token=${(await storageManager.getSessionData(userId)).access_token}`);
  body.push('token_type_hint=access_token');

  if (configData.clientSecret && configData.clientSecret.trim().length > 0) {
    body.push(`client_secret=${configData.clientSecret}`);
  }

  let response: Response;

  try {
    response = await fetch(revokeTokenEndpoint, {
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
      'JS-AUTH_CORE-RAT3-NE02',
      'The request to revoke access token failed.',
      error ?? 'The request sent to revoke the access token failed.',
    );
  }

  if (response.status !== 200 || !response.ok) {
    throw new AsgardeoAuthException(
      'JS-AUTH_CORE-RAT3-HE03',
      `Invalid response status received for revoke access token request (${response.statusText}).`,
      (await response.json()) as string,
    );
  }

  await clearSession(storageManager, userId);

  return response;
}
