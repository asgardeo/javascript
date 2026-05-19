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

import {
  Config,
  EmbeddedFlowExecuteRequestPayload,
  EmbeddedFlowExecuteResponse,
  EmbeddedFlowStatus,
  getRedirectBasedSignUpUrl,
  isEmpty,
} from '@asgardeo/node';
import AsgardeoNextClient from '../../AsgardeoNextClient';

/**
 * Server action for signing up a user.
 * Handles the embedded sign-up flow.
 *
 * @param payload - The embedded sign-up flow payload
 * @returns Promise that resolves when sign-up is complete
 */
const signUpAction = async (
  payload?: EmbeddedFlowExecuteRequestPayload,
): Promise<{
  data?:
    | {
        afterSignUpUrl?: string;
        signUpUrl?: string;
      }
    | EmbeddedFlowExecuteResponse;
  error?: string;
  success: boolean;
}> => {
  try {
    const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();

    // If no payload provided, redirect to sign-up URL for redirect-based sign-up.
    // If there's a payload, handle the embedded sign-up flow.
    if (!payload || isEmpty(payload)) {
      const storageManager: any = await client.getStorageManager();
      const config: Config = (await storageManager.getConfigData()) as Config;
      const signUpUrl: string = config.signUpUrl || getRedirectBasedSignUpUrl(config);

      return {data: {signUpUrl}, success: true};
    }
    const response: any = await client.signUp(payload);

    if (response.flowStatus === EmbeddedFlowStatus.Complete) {
      const afterSignUpUrl: string = await (await client.getStorageManager()).getConfigDataParameter('afterSignInUrl');

      return {data: {afterSignUpUrl: String(afterSignUpUrl)}, success: true};
    }

    return {data: response as EmbeddedFlowExecuteResponse, success: true};
  } catch (error) {
    return {error: String(error), success: false};
  }
};

export default signUpAction;
