/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
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

'use server';

import {Config, FederatedAssociation, Platform, getMeFederatedAssociations, identifyPlatform} from '@asgardeo/node';
import AsgardeoNextClient from '../../AsgardeoNextClient';

/**
 * Whether the signed-in user's profile has to be rendered read-only, and which identity provider owns it.
 */
export interface FederatedProfileLock {
  provider?: string;
  readOnly: boolean;
}

/**
 * Works out whether the signed-in user's profile attributes are owned by an identity provider.
 *
 * Asgardeo refuses attribute updates for accounts provisioned from a social or enterprise connection,
 * so those profiles are rendered read-only. WSO2 Identity Server allows the same updates, so the lock
 * is never applied there. Any failure resolves to "editable" and lets the server have the final say.
 */
const getFederatedProfileLock = async (sessionId?: string): Promise<FederatedProfileLock> => {
  try {
    const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();
    const config: Config = (await client.getConfiguration()) as Config;

    if (identifyPlatform(config) !== Platform.Asgardeo) {
      return {readOnly: false};
    }

    let resolvedSessionId: string | undefined = sessionId;

    if (!resolvedSessionId) {
      const {default: getSessionId} = await import('./getSessionId');
      resolvedSessionId = await getSessionId();
    }

    if (!resolvedSessionId) {
      return {readOnly: false};
    }

    const accessToken: string = await client.getAccessToken(resolvedSessionId);

    if (!accessToken) {
      return {readOnly: false};
    }

    const associations: FederatedAssociation[] = await getMeFederatedAssociations({
      baseUrl: config.baseUrl,
      headers: {Authorization: `Bearer ${accessToken}`},
    });

    return {
      provider: associations[0]?.idp?.displayName || associations[0]?.idp?.name,
      readOnly: associations.length > 0,
    };
  } catch {
    return {readOnly: false};
  }
};

export default getFederatedProfileLock;
