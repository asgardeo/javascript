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

import AsgardeoAPIError from '../../errors/AsgardeoAPIError';
import {FlowMetadataResponse, GetFlowMetaRequestConfig} from '../../models/v2/flow-meta-v2';

/**
 * Fetches aggregated flow metadata from the `GET /flow/meta` endpoint.
 *
 * The response includes:
 * - Application or OU details depending on the `type` parameter
 * - Resolved design configuration (theme and layout)
 * - i18n translations filtered by `language` and `namespace`
 * - Registration flow enablement status
 *
 * @param config - Request configuration including `baseUrl`/`url`, `type`, `id`,
 *                 and optional `language` / `namespace` filters.
 * @returns A promise that resolves to the {@link FlowMetadataResponse}.
 *
 * @throws {AsgardeoAPIError} When required parameters are missing or the server
 *         returns a non-OK response.
 *
 * @example
 * ```typescript
 * import getFlowMetaV2 from './api/v2/getFlowMetaV2';
 * import { FlowMetaType } from './models/v2/flow-meta-v2';
 *
 * const meta = await getFlowMetaV2({
 *   baseUrl: 'https://localhost:8090',
 *   type: FlowMetaType.App,
 *   id: '60a9b38b-6eba-9f9e-55f9-267067de4680',
 *   language: 'en',
 *   namespace: 'auth',
 * });
 *
 * console.log(meta.application?.name);
 * console.log(meta.i18n.translations);
 * ```
 *
 * @experimental This function targets the Asgardeo V2 platform API
 */
const getFlowMetaV2 = async ({
  url,
  baseUrl,
  type,
  id,
  language,
  namespace,
  ...requestConfig
}: GetFlowMetaRequestConfig): Promise<FlowMetadataResponse> => {
  if (!type) {
    throw new AsgardeoAPIError(
      'The "type" parameter is required',
      'getFlowMetaV2-ValidationError-001',
      'javascript',
      400,
      'The "type" query parameter must be either "APP" or "OU".',
    );
  }

  if (!id) {
    throw new AsgardeoAPIError(
      'The "id" parameter is required',
      'getFlowMetaV2-ValidationError-002',
      'javascript',
      400,
      'The "id" query parameter must be a valid UUID of the target application or organization unit.',
    );
  }

  const queryParams: URLSearchParams = new URLSearchParams({
    id,
    type,
    ...(language ? {language} : {}),
    ...(namespace ? {namespace} : {}),
  });

  const baseEndpoint: string = url ?? `${baseUrl}/flow/meta`;
  const endpoint: string = `${baseEndpoint}?${queryParams.toString()}`;

  const response: Response = await fetch(endpoint, {
    ...requestConfig,
    headers: {
      Accept: 'application/json',
      ...requestConfig.headers,
    },
    method: 'GET',
  });

  if (!response.ok) {
    const errorText: string = await response.text();

    throw new AsgardeoAPIError(
      `Flow metadata request failed: ${errorText}`,
      'getFlowMetaV2-ResponseError-001',
      'javascript',
      response.status,
      response.statusText,
    );
  }

  const flowMetadata: FlowMetadataResponse = await response.json();

  return flowMetadata;
};

export default getFlowMetaV2;
