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

import {AsgardeoAuthException} from '../errors/exception';
import OIDCDiscoveryConstants from '../constants/OIDCDiscoveryConstants';
import OIDCRequestConstants from '../constants/OIDCRequestConstants';
import {SessionData} from '../models/session';
import {TokenResponse} from '../models/token';
import {StrictAuthClientConfig} from '../models/auth-client-config';
import {Platform} from '../models/platforms';
import {TokenEndpointAuthMethod} from '../models/token-endpoint-auth';
import extractPkceStorageKeyFromState from '../utils/extractPkceStorageKeyFromState';
import base64Encode from '../utils/base64Encode';
import StorageManager from '../StorageManager';
import {IsomorphicCrypto} from '../IsomorphicCrypto';
import loadOpenIDProviderConfiguration from './loadOpenIDProviderConfiguration';
import handleTokenResponse from './handleTokenResponse';

export default async function requestAccessToken<T>(
  storageManager: StorageManager<T>,
  cryptoHelper: IsomorphicCrypto,
  authorizationCode: string,
  sessionState: string,
  state: string,
  userId?: string,
  tokenRequestConfig?: {
    params: Record<string, unknown>;
  },
): Promise<TokenResponse> {
  if (
    !(await storageManager.getTemporaryDataParameter(
      OIDCDiscoveryConstants.Storage.StorageKeys.OPENID_PROVIDER_CONFIG_INITIATED,
    ))
  ) {
    await loadOpenIDProviderConfiguration(storageManager, cryptoHelper, false);
  }

  const tokenEndpoint: string | undefined = (await storageManager.loadOpenIDProviderConfiguration()).token_endpoint;
  const configData: StrictAuthClientConfig = await storageManager.getConfigData() as unknown as StrictAuthClientConfig;

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

  const hasSecret: boolean = Boolean(configData.clientSecret && configData.clientSecret.trim().length > 0);
  const tokenEndpointAuthMethod: TokenEndpointAuthMethod =
    configData.tokenRequest?.authMethod ??
    ((configData as any).platform === Platform.AsgardeoV2 ? 'client_secret_basic' : 'client_secret_post');

  if (hasSecret && tokenEndpointAuthMethod === 'client_secret_post') {
    body.set('client_secret', configData.clientSecret);
  }

  const code: string = authorizationCode;

  body.set('code', code);

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

  const tokenRequestHeaders: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (hasSecret && tokenEndpointAuthMethod === 'client_secret_basic') {
    const credential: string = `${encodeURIComponent(configData.clientId)}:${encodeURIComponent(
      configData.clientSecret,
    )}`;
    tokenRequestHeaders['Authorization'] = `Basic ${base64Encode(credential)}`;
  }

  let tokenResponse: Response;

  try {
    tokenResponse = await fetch(tokenEndpoint, {
      body,
      credentials: configData.sendCookiesInRequests ? 'include' : 'same-origin',
      headers: tokenRequestHeaders,
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
