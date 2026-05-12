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
import {AccessTokenApiResponse, TokenResponse} from '../models/token';
import StorageManager from '../StorageManager';
import validateIdToken from './validateIdToken';

export default async function handleTokenResponse<T>(
  storageManager: StorageManager<T>,
  cryptoHelper: IsomorphicCrypto,
  response: Response,
  userId?: string,
): Promise<TokenResponse> {
  if (response.status !== 200 || !response.ok) {
    throw new AsgardeoAuthException(
      'JS-AUTH_HELPER-HTR-NE01',
      `Invalid response status received for token request (${response.statusText}).`,
      (await response.json()) as string,
    );
  }

  const parsedResponse: AccessTokenApiResponse = (await response.json()) as AccessTokenApiResponse;

  parsedResponse.created_at = new Date().getTime();

  const shouldValidateIdToken: boolean | undefined = (await storageManager.getConfigData()).tokenValidation?.idToken
    ?.validate;

  const tokenResponse: TokenResponse = {
    accessToken: parsedResponse.access_token,
    createdAt: parsedResponse.created_at,
    expiresIn: parsedResponse.expires_in,
    idToken: parsedResponse.id_token,
    refreshToken: parsedResponse.refresh_token,
    scope: parsedResponse.scope,
    tokenType: parsedResponse.token_type,
  };

  if (shouldValidateIdToken) {
    await validateIdToken(storageManager, cryptoHelper, parsedResponse.id_token);
  }

  await storageManager.setSessionData(parsedResponse, userId);

  return tokenResponse;
}
