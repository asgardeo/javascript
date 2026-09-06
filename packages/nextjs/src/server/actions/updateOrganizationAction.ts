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

import {OrganizationDetails, UpdateOrganizationConfig} from '@asgardeo/node';
import AsgardeoNextClient from '../../AsgardeoNextClient';

/**
 * Server action to update an organization with a set of patch operations.
 *
 * The access token stays on the server: it is read from the session cookie and attached to the request,
 * which is why the browser cannot call the Organizations API directly.
 *
 * @param organizationId - The ID of the organization to update.
 * @param operations - The patch operations to apply (see `createPatchOperations`).
 * @param sessionId - Optional session ID; resolved from the session cookie when omitted.
 */
const updateOrganizationAction = async (
  organizationId: string,
  operations: UpdateOrganizationConfig['operations'],
  sessionId?: string,
): Promise<{
  data: {organization?: OrganizationDetails};
  error: string | null;
  success: boolean;
}> => {
  try {
    const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();
    const organization: OrganizationDetails = await client.updateOrganization(organizationId, operations, sessionId);

    return {data: {organization}, error: null, success: true};
  } catch (error) {
    return {
      data: {},
      error: error instanceof Error ? error.message : String(error),
      success: false,
    };
  }
};

export default updateOrganizationAction;
