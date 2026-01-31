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

'use server';

import {IdToken} from '@asgardeo/node';
import AsgardeoNextClient from '../../AsgardeoNextClient';

/**
 * Get the decoded ID token from the current session.
 *
 * @param sessionId - Optional session ID to retrieve the decoded ID token for
 * @returns The decoded ID token payload
 * @throws {AsgardeoRuntimeError} If the decoded ID token cannot be retrieved
 */
const getDecodedIdToken = async (sessionId?: string): Promise<IdToken> => {
  const client = AsgardeoNextClient.getInstance();
  return client.getDecodedIdToken(sessionId);
};

export default getDecodedIdToken;
