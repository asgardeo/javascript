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

import {beforeEach, describe, expect, it, vi, Mock} from 'vitest';
import AsgardeoNextClient from '../../../AsgardeoNextClient';
import updateOrganizationAction from '../updateOrganizationAction';

vi.mock('../../../AsgardeoNextClient', () => ({
  default: {
    getInstance: vi.fn(),
  },
}));

describe('updateOrganizationAction', () => {
  type ActionResult = Awaited<ReturnType<typeof updateOrganizationAction>>;

  const client: {updateOrganization: Mock} = {updateOrganization: vi.fn()};
  const operations: Array<{operation: 'REPLACE'; path: string; value: string}> = [
    {operation: 'REPLACE', path: '/name', value: 'Acme Inc.'},
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (AsgardeoNextClient.getInstance as unknown as Mock).mockReturnValue(client);
  });

  it('returns the updated organization when the update succeeds', async () => {
    const organization: Record<string, unknown> = {id: 'org-1', name: 'Acme Inc.'};

    client.updateOrganization.mockResolvedValue(organization);

    const result: ActionResult = await updateOrganizationAction('org-1', operations, 'session-1');

    expect(client.updateOrganization).toHaveBeenCalledWith('org-1', operations, 'session-1');
    expect(result).toEqual({data: {organization}, error: null, success: true});
  });

  it('reports the failure reason instead of throwing when the update fails', async () => {
    client.updateOrganization.mockRejectedValue(new Error('Failed to update the organization org-1: forbidden'));

    const result: ActionResult = await updateOrganizationAction('org-1', operations);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to update the organization org-1: forbidden');
    expect(result.data.organization).toBeUndefined();
  });
});
