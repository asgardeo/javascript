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

import {IsomorphicCrypto} from '../IsomorphicCrypto';
import {IdToken} from '../models/token';
import {User} from '../models/user';
import extractUserClaimsFromIdToken from './extractUserClaimsFromIdToken';

export default function getAuthenticatedUserInfo(cryptoHelper: IsomorphicCrypto, idToken: string): User {
  const payload: IdToken = cryptoHelper.decodeJwtToken<IdToken>(idToken);
  const username: string = payload?.['username'] ?? '';
  const givenName: string = payload?.['given_name'] ?? '';
  const familyName: string = payload?.['family_name'] ?? '';
  const fullName: string = givenName && familyName ? `${givenName} ${familyName}` : givenName || familyName || '';
  const displayName: string = payload.preferred_username ?? fullName;

  return {
    displayName,
    username,
    ...extractUserClaimsFromIdToken(payload),
  };
}
