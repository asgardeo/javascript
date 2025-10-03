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

import AsgardeoAPIError from '../errors/AsgardeoAPIError';
import {EmbeddedFlowExecuteRequestConfig} from '../models/embedded-flow';
import {EmbeddedSignInFlowHandleResponse} from '../models/embedded-signin-flow';

const executeEmbeddedSignInFlow = async ({
  url,
  baseUrl,
  payload,
  ...requestConfig
}: EmbeddedFlowExecuteRequestConfig): Promise<EmbeddedSignInFlowHandleResponse> => {
  if (!payload) {
    throw new AsgardeoAPIError(
      'Authorization payload is required',
      'executeEmbeddedSignInFlow-ValidationError-002',
      'javascript',
      400,
      'If an authorization payload is not provided, the request cannot be constructed correctly.',
    );
  }

  const baseHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  let finalHeaders: HeadersInit;
  if (requestConfig.headers instanceof Headers) {
    finalHeaders = requestConfig.headers;
  } else if (requestConfig.headers && typeof requestConfig.headers === 'object') {
    finalHeaders = { ...baseHeaders, ...(requestConfig.headers as Record<string, string>) };
  } else {
    finalHeaders = baseHeaders;
  }

  const response: Response = await fetch(url ?? `${baseUrl}/oauth2/authn`, {
    ...requestConfig,
    method: requestConfig.method || 'POST',
    headers: finalHeaders,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new AsgardeoAPIError(
      `Authorization request failed: ${errorText}`,
      'initializeEmbeddedSignInFlow-ResponseError-001',
      'javascript',
      response.status,
      response.statusText,
    );
  }

  return (await response.json()) as EmbeddedSignInFlowHandleResponse;
};

export default executeEmbeddedSignInFlow;
