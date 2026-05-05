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
import {JWKInterface} from '../models/crypto';
import {IdToken} from '../models/token';
import StorageManager from '../StorageManager';

export default async function validateIdToken<T>(
  storageManager: StorageManager<T>,
  cryptoHelper: IsomorphicCrypto,
  idToken: string,
): Promise<boolean> {
  const jwksEndpoint: string | undefined = (await storageManager.loadOpenIDProviderConfiguration()).jwks_uri;
  const configData: StrictAuthClientConfig = await storageManager.getConfigData();

  if (!jwksEndpoint || jwksEndpoint.trim().length === 0) {
    throw new AsgardeoAuthException(
      'JS_AUTH_HELPER-VIT-NF01',
      'JWKS endpoint not found.',
      'No JWKS endpoint was found in the OIDC provider meta data returned by the well-known endpoint ' +
        'or the JWKS endpoint passed to the SDK is empty.',
    );
  }

  let response: Response;

  try {
    response = await fetch(jwksEndpoint, {
      credentials: configData.sendCookiesInRequests ? 'include' : 'same-origin',
    });
  } catch (error: any) {
    throw new AsgardeoAuthException(
      'JS-AUTH_HELPER-VIT-NE02',
      'Request to jwks endpoint failed.',
      error ?? 'The request sent to get the jwks from the server failed.',
    );
  }

  if (response.status !== 200 || !response.ok) {
    throw new AsgardeoAuthException(
      'JS-AUTH_HELPER-VIT-HE03',
      `Invalid response status received for jwks request (${response.statusText}).`,
      (await response.json()) as string,
    );
  }

  const {issuer} = await storageManager.loadOpenIDProviderConfiguration();

  const {keys}: {keys: JWKInterface[]} = (await response.json()) as {
    keys: JWKInterface[];
  };

  const jwk: any = await cryptoHelper.getJWKForTheIdToken(idToken.split('.')[0], keys);

  return cryptoHelper.isValidIdToken(
    idToken,
    jwk,
    configData.clientId,
    issuer ?? '',
    cryptoHelper.decodeJwtToken<IdToken>(idToken).sub,
    configData.tokenValidation?.idToken?.clockTolerance,
    configData.tokenValidation?.idToken?.validateIssuer ?? true,
  );
}
