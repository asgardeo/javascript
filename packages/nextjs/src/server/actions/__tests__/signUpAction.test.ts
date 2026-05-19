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

import {EmbeddedFlowExecuteRequestPayload} from '@asgardeo/node';
import {describe, it, expect, vi, beforeEach, afterEach, type Mock} from 'vitest';
import AsgardeoNextClient from '../../../AsgardeoNextClient';
import signUpAction from '../signUpAction';

vi.mock('../../../AsgardeoNextClient', () => ({
  default: {
    getInstance: vi.fn(),
  },
}));

describe('signUpAction', () => {
  const mockStorageManager: {getConfigData: ReturnType<typeof vi.fn>} = {
    getConfigData: vi.fn(),
  };

  const mockClient: {getStorageManager: ReturnType<typeof vi.fn>; signUp: ReturnType<typeof vi.fn>} = {
    getStorageManager: vi.fn(),
    signUp: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();

    mockClient.getStorageManager.mockResolvedValue(mockStorageManager);
    mockStorageManager.getConfigData.mockResolvedValue({
      applicationId: 'app-123',
      baseUrl: 'https://api.asgardeo.io/t/test-org',
      clientId: 'client-123',
    });
    (AsgardeoNextClient.getInstance as unknown as Mock).mockReturnValue(mockClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return the configured sign-up URL for redirect-based sign-up', async () => {
    mockStorageManager.getConfigData.mockResolvedValueOnce({
      baseUrl: 'https://api.asgardeo.io/t/test-org',
      signUpUrl: 'https://accounts.example.com/register',
    });

    const result: Awaited<ReturnType<typeof signUpAction>> = await signUpAction();

    expect(mockClient.getStorageManager).toHaveBeenCalledTimes(1);
    expect(mockStorageManager.getConfigData).toHaveBeenCalledTimes(1);
    expect(mockClient.signUp).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: {signUpUrl: 'https://accounts.example.com/register'},
      success: true,
    });
  });

  it('should generate the Asgardeo sign-up URL for redirect-based sign-up', async () => {
    const result: Awaited<ReturnType<typeof signUpAction>> = await signUpAction({});

    expect(result).toEqual({
      data: {
        signUpUrl:
          'https://accounts.asgardeo.io/t/test-org/accountrecoveryendpoint/register.do?client_id=client-123&spId=app-123',
      },
      success: true,
    });
  });

  it('should execute embedded sign-up when a payload is provided', async () => {
    const payload: EmbeddedFlowExecuteRequestPayload = {flowType: 'REGISTRATION'} as EmbeddedFlowExecuteRequestPayload;
    const response: Record<string, string> = {flowStatus: 'INCOMPLETE', flowId: 'flow-123'};

    mockClient.signUp.mockResolvedValueOnce(response);

    const result: Awaited<ReturnType<typeof signUpAction>> = await signUpAction(payload);

    expect(mockClient.signUp).toHaveBeenCalledWith(payload);
    expect(result).toEqual({data: response, success: true});
  });
});
