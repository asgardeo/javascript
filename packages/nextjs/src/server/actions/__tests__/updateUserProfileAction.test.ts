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
import updateUserProfileAction from '../updateUserProfileAction';

vi.mock('../../../AsgardeoNextClient', () => ({
  default: {
    getInstance: vi.fn(),
  },
}));

describe('updateUserProfileAction', () => {
  type ActionResult = Awaited<ReturnType<typeof updateUserProfileAction>>;

  const client: {updateUserProfile: Mock} = {updateUserProfile: vi.fn()};
  const payload: {operations: Array<{op: string; path: string; value: string}>} = {
    operations: [{op: 'replace', path: 'name.givenName', value: 'Jane'}],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (AsgardeoNextClient.getInstance as unknown as Mock).mockReturnValue(client);
  });

  it('returns the updated user when the update succeeds', async () => {
    const user: Record<string, unknown> = {id: 'user-1', name: {givenName: 'Jane'}};

    client.updateUserProfile.mockResolvedValue(user);

    const result: ActionResult = await updateUserProfileAction(payload as any, 'session-1');

    expect(client.updateUserProfile).toHaveBeenCalledWith(payload, 'session-1');
    expect(result).toEqual({data: {user}, error: '', success: true});
  });

  it('reports the failure reason instead of throwing when the update fails', async () => {
    client.updateUserProfile.mockRejectedValue(new Error('Failed to update user profile: attribute is read-only'));

    const result: ActionResult = await updateUserProfileAction(payload as any, 'session-1');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to update user profile: attribute is read-only');
    expect(result.data.user).toEqual({});
  });
});
