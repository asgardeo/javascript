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

import {IdToken} from '@asgardeo/node';
import getSessionId from './getSessionId';
import AsgardeoNextClient from '../../AsgardeoNextClient';

/**
 * Server action that returns the decoded ID token (its claims) of the signed-in user.
 *
 * Only the decoded claims cross the server boundary; the raw tokens stay in the HttpOnly session cookie.
 * Backs `useAsgardeo().getDecodedIdToken()` in Client Components.
 *
 * @param sessionId - Optional session ID; resolved from the session cookie when omitted.
 */
const getDecodedIdTokenAction = async (
  sessionId?: string,
): Promise<{data: {idToken?: IdToken}; error: string | null; success: boolean}> => {
  try {
    const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();
    const idToken: IdToken = await client.getDecodedIdToken(sessionId ?? (await getSessionId()));

    return {data: {idToken}, error: null, success: true};
  } catch (error) {
    return {
      data: {},
      error: error instanceof Error ? error.message : String(error),
      success: false,
    };
  }
};

export default getDecodedIdTokenAction;
