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

import {EmbeddedFlowExecuteRequestPayload, EmbeddedFlowExecuteResponse, EmbeddedFlowStatus} from '@asgardeo/node';
import AsgardeoNextClient from '../../AsgardeoNextClient';
import autoSignInAfterSignUp, {extractSignUpCredentials, SignUpCredentials} from '../../utils/autoSignInAfterSignUp';

/**
 * Server action for signing in a user.
 * Handles the embedded sign-in flow and manages session cookies.
 *
 * @param payload - The embedded sign-in flow payload
 * @param request - The embedded flow execute request config
 * @returns Promise that resolves when sign-in is complete
 */
const signUpAction = async (
  payload?: EmbeddedFlowExecuteRequestPayload,
): Promise<{
  data?:
    | {
        afterSignUpUrl?: string;
        signUpUrl?: string;
      }
    | (EmbeddedFlowExecuteResponse & {afterSignUpUrl?: string; signedIn?: boolean});
  error?: string;
  success: boolean;
}> => {
  try {
    const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();

    // If no payload provided, redirect to sign-in URL for redirect-based sign-in.
    // If there's a payload, handle the embedded sign-in flow.
    if (!payload) {
      const defaultSignUpUrl: string = '';

      return {data: {signUpUrl: String(defaultSignUpUrl)}, success: true};
    }
    const response: any = await client.signUp(payload);

    if (response.flowStatus === EmbeddedFlowStatus.Complete) {
      const storageManager: Awaited<ReturnType<typeof client.getStorageManager>> = await client.getStorageManager();
      const afterSignUpUrl: string = String(
        (await storageManager.getConfigDataParameter('afterSignUpUrl')) ??
          (await storageManager.getConfigDataParameter('afterSignInUrl')),
      );

      // Sign the new user in with the credentials they just submitted so they land inside the app.
      // When that is not possible (MFA, app-native auth disabled, multi-step registration), they are
      // sent to `afterSignUpUrl` without a session and can sign in manually.
      const credentials: SignUpCredentials | undefined = extractSignUpCredentials(payload.inputs);
      const signedIn: boolean = credentials ? await autoSignInAfterSignUp(credentials) : false;

      // Return the completed flow response along with the URL so that client components
      // (e.g. `<SignUp />`) can finish their own lifecycle instead of receiving nothing.
      return {data: {...response, afterSignUpUrl: String(afterSignUpUrl), signedIn}, success: true};
    }

    return {data: response as EmbeddedFlowExecuteResponse, success: true};
  } catch (error) {
    return {error: String(error), success: false};
  }
};

export default signUpAction;
