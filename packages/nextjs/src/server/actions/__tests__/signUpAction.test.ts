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
import autoSignInAfterSignUp from '../../../utils/autoSignInAfterSignUp';
import signUpAction from '../signUpAction';

vi.mock('../../../AsgardeoNextClient', () => ({
  default: {
    getInstance: vi.fn(),
  },
}));

vi.mock('../../../utils/autoSignInAfterSignUp', () => ({
  default: vi.fn(),
  extractSignUpCredentials: vi.fn((inputs?: Record<string, unknown>) =>
    inputs?.['username'] && inputs?.['password']
      ? {password: inputs['password'] as string, username: inputs['username'] as string}
      : undefined,
  ),
}));

describe('signUpAction', () => {
  type ActionResult = Awaited<ReturnType<typeof signUpAction>>;

  const storageManager: {getConfigDataParameter: Mock} = {getConfigDataParameter: vi.fn()};
  const client: {getSignUpUrl: Mock; getStorageManager: Mock; signUp: Mock} = {
    getSignUpUrl: vi.fn(),
    getStorageManager: vi.fn(async () => storageManager),
    signUp: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (AsgardeoNextClient.getInstance as unknown as Mock).mockReturnValue(client);
    client.getStorageManager.mockResolvedValue(storageManager);
  });

  it('resolves the redirect-based sign-up URL when called without a payload', async () => {
    const signUpUrl: string =
      'https://accounts.asgardeo.io/t/acme/accountrecoveryendpoint/register.do?client_id=client-id';

    client.getSignUpUrl.mockResolvedValue(signUpUrl);

    const result: ActionResult = await signUpAction();

    expect(result).toEqual({data: {signUpUrl}, success: true});
    expect(client.signUp).not.toHaveBeenCalled();
  });

  it('reports an error when no sign-up URL can be resolved', async () => {
    client.getSignUpUrl.mockResolvedValue('');

    const result: ActionResult = await signUpAction();

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/signUpUrl/);
    expect(result.data).toBeUndefined();
  });

  it('returns the next step of an incomplete embedded flow', async () => {
    const nextStep: Record<string, unknown> = {flowId: 'flow-1', flowStatus: 'INCOMPLETE', type: 'VIEW'};

    client.signUp.mockResolvedValue(nextStep);

    const payload: {flowType: string} = {flowType: 'REGISTRATION'};
    const result: ActionResult = await signUpAction(payload as any);

    expect(client.signUp).toHaveBeenCalledWith(payload);
    expect(client.getSignUpUrl).not.toHaveBeenCalled();
    expect(result).toEqual({data: nextStep, success: true});
  });

  it('signs the user in and returns the after-sign-up URL when the embedded flow completes', async () => {
    client.signUp.mockResolvedValue({flowId: 'flow-1', flowStatus: 'COMPLETE'});
    storageManager.getConfigDataParameter.mockImplementation(async (name: string) =>
      name === 'afterSignUpUrl' ? 'http://localhost:3000/welcome' : undefined,
    );
    (autoSignInAfterSignUp as unknown as Mock).mockResolvedValue({signedIn: true});

    const result: ActionResult = await signUpAction({
      flowId: 'flow-1',
      inputs: {password: 'secret', username: 'jane'},
    } as any);

    expect(autoSignInAfterSignUp).toHaveBeenCalledWith({password: 'secret', username: 'jane'});
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      afterSignUpUrl: 'http://localhost:3000/welcome',
      flowStatus: 'COMPLETE',
      signedIn: true,
    });
  });
});
