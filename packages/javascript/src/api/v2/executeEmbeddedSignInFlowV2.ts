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

import {
  EmbeddedFlowExecuteRequestConfigV2,
  EmbeddedSignInFlowResponseV2,
  EmbeddedSignInFlowStatusV2,
} from '../../models/v2/embedded-signin-flow-v2';
import AsgardeoAPIError from '../../errors/AsgardeoAPIError';

const executeEmbeddedSignInFlowV2 = async ({
  url,
  baseUrl,
  payload,
  sessionDataKey,
  ...requestConfig
}: EmbeddedFlowExecuteRequestConfigV2): Promise<EmbeddedSignInFlowResponseV2> => {
  if (!payload) {
    throw new AsgardeoAPIError(
      'Authorization payload is required',
      'executeEmbeddedSignInFlow-ValidationError-002',
      'javascript',
      400,
      'If an authorization payload is not provided, the request cannot be constructed correctly.',
    );
  }

  let endpoint: string = url ?? `${baseUrl}/flow/execute`;

  const response: Response = await fetch(endpoint, {
    ...requestConfig,
    method: requestConfig.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...requestConfig.headers,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new AsgardeoAPIError(
      `Authorization request failed: ${errorText}`,
      'executeEmbeddedSignInFlow-ResponseError-001',
      'javascript',
      response.status,
      response.statusText,
    );
  }

  const flowResponse: EmbeddedSignInFlowResponseV2 = await response.json();

  // IMPORTANT: Only applicable for Asgardeo V2 platform.
  // Check if the flow is complete and has an assertion and sessionDataKey is provided, then call OAuth2 authorize.
  if (
    flowResponse.flowStatus === EmbeddedSignInFlowStatusV2.Complete &&
    (flowResponse as any).assertion &&
    sessionDataKey
  ) {
    try {
      const oauth2Response: Response = await fetch(`${baseUrl}/oauth2/authorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...requestConfig.headers,
        },
        body: JSON.stringify({
          assertion: (flowResponse as any).assertion,
          sessionDataKey,
        }),
        credentials: 'include',
      });

      if (!oauth2Response.ok) {
        const oauth2ErrorText: string = await oauth2Response.text();

        throw new AsgardeoAPIError(
          `OAuth2 authorization failed: ${oauth2ErrorText}`,
          'executeEmbeddedSignInFlow-OAuth2Error-002',
          'javascript',
          oauth2Response.status,
          oauth2Response.statusText,
        );
      }

      const oauth2Result = await oauth2Response.json();

      return {
        flowStatus: flowResponse.flowStatus,
        redirectUrl: oauth2Result.redirect_uri,
      } as any;
    } catch (authError) {
      throw new AsgardeoAPIError(
        `OAuth2 authorization failed: ${authError instanceof Error ? authError.message : 'Unknown error'}`,
        'executeEmbeddedSignInFlow-OAuth2Error-001',
        'javascript',
        500,
        'Failed to complete OAuth2 authorization after successful embedded sign-in flow.',
      );
    }
  }

  return flowResponse;
};

export default executeEmbeddedSignInFlowV2;
