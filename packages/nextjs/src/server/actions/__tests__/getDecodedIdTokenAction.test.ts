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
import getDecodedIdTokenAction from '../getDecodedIdTokenAction';
import getSessionId from '../getSessionId';

vi.mock('../../../AsgardeoNextClient', () => ({
  default: {
    getInstance: vi.fn(),
  },
}));

vi.mock('../getSessionId', () => ({
  default: vi.fn(async () => 'session-from-cookie'),
}));

describe('getDecodedIdTokenAction', () => {
  type ActionResult = Awaited<ReturnType<typeof getDecodedIdTokenAction>>;

  const client: {getDecodedIdToken: Mock} = {getDecodedIdToken: vi.fn()};
  const idToken: Record<string, unknown> = {aud: 'client-id', email: 'jane@example.com', iss: 'issuer', sub: 'user-1'};

  beforeEach(() => {
    vi.clearAllMocks();
    (AsgardeoNextClient.getInstance as unknown as Mock).mockReturnValue(client);
    (getSessionId as unknown as Mock).mockResolvedValue('session-from-cookie');
  });

  it('returns the decoded ID token for the given session', async () => {
    client.getDecodedIdToken.mockResolvedValue(idToken);

    const result: ActionResult = await getDecodedIdTokenAction('session-1');

    expect(client.getDecodedIdToken).toHaveBeenCalledWith('session-1');
    expect(result).toEqual({data: {idToken}, error: null, success: true});
  });

  it('resolves the session from the cookie when no session ID is given', async () => {
    client.getDecodedIdToken.mockResolvedValue(idToken);

    await getDecodedIdTokenAction();

    expect(client.getDecodedIdToken).toHaveBeenCalledWith('session-from-cookie');
  });

  it('reports the failure reason instead of throwing', async () => {
    client.getDecodedIdToken.mockRejectedValue(new Error('No session'));

    const result: ActionResult = await getDecodedIdTokenAction();

    expect(result).toEqual({data: {}, error: 'No session', success: false});
  });
});
