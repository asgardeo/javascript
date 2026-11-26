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

import {describe, it, expect, vi, beforeEach} from 'vitest';

import signoutHandler from '../../src/runtime/server/routes/auth/session/signout.post';

const mockClientInstance = vi.hoisted(() => ({
  getSignOutUrlFor: vi.fn<(sessionId: string, afterSignOutUrl: string) => Promise<string>>(),
}));

const mockSession = vi.hoisted(() => ({value: {sessionId: 'sess-1'} as {sessionId: string} | null}));

vi.mock('h3', () => ({
  defineEventHandler: (fn: Function) => fn,
  deleteCookie: vi.fn(),
  getRequestURL: (event: {origin: string}) => new URL(event.origin),
}));

vi.mock('#imports', () => ({
  useRuntimeConfig: vi.fn(() => ({
    asgardeo: {sessionSecret: 'test-secret'},
    public: {asgardeo: {afterSignOutUrl: '/'}},
  })),
}));

vi.mock('../../src/runtime/server/AsgardeoNuxtClient', () => ({
  default: {getInstance: () => mockClientInstance},
}));

vi.mock('../../src/runtime/server/utils/serverSession', () => ({
  verifyAndRehydrateSession: vi.fn(async () => mockSession.value),
}));

describe('POST /api/auth/signout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.value = {sessionId: 'sess-1'};
    mockClientInstance.getSignOutUrlFor.mockImplementation(
      async (_sessionId: string, afterSignOutUrl: string) =>
        `https://idp.example.com/oidc/logout?post_logout_redirect_uri=${encodeURIComponent(afterSignOutUrl)}`,
    );
  });

  it('resolves the post-logout destination against each request origin', async () => {
    await (signoutHandler as any)({origin: 'https://one.example.com/api/auth/signout'});
    await (signoutHandler as any)({origin: 'https://two.example.com/api/auth/signout'});

    expect(mockClientInstance.getSignOutUrlFor).toHaveBeenNthCalledWith(1, 'sess-1', 'https://one.example.com/');
    expect(mockClientInstance.getSignOutUrlFor).toHaveBeenNthCalledWith(2, 'sess-1', 'https://two.example.com/');
  });

  it('redirects to the resolved destination when there is no session', async () => {
    mockSession.value = null;

    const result: {redirectUrl: string} = await (signoutHandler as any)({
      origin: 'https://one.example.com/api/auth/signout',
    });

    expect(result).toEqual({redirectUrl: 'https://one.example.com/'});
    expect(mockClientInstance.getSignOutUrlFor).not.toHaveBeenCalled();
  });
});
