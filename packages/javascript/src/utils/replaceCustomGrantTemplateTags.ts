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

import TokenExchangeConstants from '../constants/TokenExchangeConstants';
import {AsgardeoAuthException} from '../errors/exception';
import {IsomorphicCrypto} from '../IsomorphicCrypto';
import {StrictAuthClientConfig} from '../models/auth-client-config';
import {SessionData} from '../models/session';
import StorageManager from '../StorageManager';
import getAuthenticatedUserInfo from './getAuthenticatedUserInfo';
import processOpenIDScopes from './processOpenIDScopes';

export default async function replaceCustomGrantTemplateTags<T>(
  storageManager: StorageManager<T>,
  cryptoHelper: IsomorphicCrypto,
  text: string,
  userId?: string,
): Promise<string> {
  const configData: StrictAuthClientConfig = await storageManager.getConfigData();

  const sourceInstanceId: number | null = configData.organizationChain?.sourceInstanceId ?? null;

  let sessionData: SessionData;

  if (sourceInstanceId) {
    const {clientId} = configData;
    const instanceKey: string = clientId ? `instance_${sourceInstanceId}-${clientId}` : `instance_${sourceInstanceId}`;

    sessionData = await storageManager.getSessionData(userId, instanceKey);

    if (!sessionData || !sessionData.access_token) {
      throw new AsgardeoAuthException(
        'JS-AUTH_HELPER-RCGTT-NE01',
        'No session data found for source instance.',
        'Failed to retrieve session data from the source organization context.',
      );
    }
  } else {
    sessionData = await storageManager.getSessionData(userId);
  }

  const scope: string = processOpenIDScopes(configData.scopes);

  if (typeof text !== 'string') {
    return text;
  }

  return text
    .replace(TokenExchangeConstants.Placeholders.ACCESS_TOKEN, sessionData.access_token)
    .replace(
      TokenExchangeConstants.Placeholders.USERNAME,
      getAuthenticatedUserInfo(cryptoHelper, sessionData.id_token).username,
    )
    .replace(TokenExchangeConstants.Placeholders.SCOPES, scope)
    .replace(TokenExchangeConstants.Placeholders.CLIENT_ID, configData.clientId)
    .replace(TokenExchangeConstants.Placeholders.CLIENT_SECRET, configData.clientSecret ?? '');
}
