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
import {FederatedAssociation} from '../models/federated-association';

/**
 * Configuration for the `getMeFederatedAssociations` request.
 */
export interface GetMeFederatedAssociationsConfig extends Omit<RequestInit, 'method'> {
  /**
   * The base path of the API endpoint.
   */
  baseUrl?: string;
  /**
   * Optional custom fetcher function. If not provided, native fetch will be used.
   */
  fetcher?: (url: string, config: RequestInit) => Promise<Response>;
  /**
   * The absolute API endpoint.
   */
  url?: string;
}

/**
 * Retrieves the identity provider accounts linked to the signed-in user.
 *
 * An account provisioned just-in-time from a social or enterprise connection has at least one
 * association; a user who registered locally has none.
 *
 * @param config - Request configuration.
 * @returns The list of associations, empty when the account is purely local.
 * @example
 * ```ts
 * const associations = await getMeFederatedAssociations({baseUrl: 'https://api.asgardeo.io/t/<org>'});
 * const isFederated = associations.length > 0;
 * ```
 */
const getMeFederatedAssociations = async ({
  url,
  baseUrl,
  fetcher,
  ...requestConfig
}: GetMeFederatedAssociationsConfig): Promise<FederatedAssociation[]> => {
  try {
    // eslint-disable-next-line no-new
    new URL(url ?? baseUrl);
  } catch (error) {
    throw new AsgardeoAPIError(
      `Invalid URL provided. ${error?.toString()}`,
      'getMeFederatedAssociations-ValidationError-001',
      'javascript',
      400,
      'The provided `url` or `baseUrl` path does not adhere to the URL schema.',
    );
  }

  const fetchFn: typeof fetch = fetcher || fetch;
  const resolvedUrl: string = url ?? `${baseUrl}/api/users/v1/me/federated-associations`;

  const response: Response = await fetchFn(resolvedUrl, {
    ...requestConfig,
    headers: {
      Accept: 'application/json',
      ...requestConfig.headers,
    },
    method: 'GET',
  });

  if (!response?.ok) {
    const errorText: string = await response.text();

    throw new AsgardeoAPIError(
      errorText,
      'getMeFederatedAssociations-ResponseError-001',
      'javascript',
      response.status,
      response.statusText,
    );
  }

  const associations: unknown = await response.json();

  return Array.isArray(associations) ? (associations as FederatedAssociation[]) : [];
};

export default getMeFederatedAssociations;
