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

import {cookies} from 'next/headers';
import {beforeEach, describe, expect, it, vi, Mock} from 'vitest';
import AsgardeoNextClient from '../../../AsgardeoNextClient';
import SessionManager from '../../../utils/SessionManager';
import signInAction from '../signInAction';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('../../../AsgardeoNextClient', () => ({
  default: {
    getInstance: vi.fn(),
  },
}));

vi.mock('../../../utils/SessionManager', () => ({
  default: {
    createTempSession: vi.fn(),
    getSessionCookieName: vi.fn(() => 'session'),
    getTempSessionCookieName: vi.fn(() => 'temp-session'),
    getTempSessionCookieOptions: vi.fn(() => ({httpOnly: true})),
    verifySessionToken: vi.fn(),
    verifyTempSession: vi.fn(),
  },
}));

vi.mock('../../../utils/logger', () => ({
  default: {debug: vi.fn(), error: vi.fn(), warn: vi.fn()},
}));

describe('signInAction', () => {
  type ActionResult = Awaited<ReturnType<typeof signInAction>>;

  const client: {getAuthorizeRequestUrl: Mock; getConfiguration: Mock; signIn: Mock} = {
    getAuthorizeRequestUrl: vi.fn(),
    getConfiguration: vi.fn(),
    signIn: vi.fn(),
  };
  const cookieStore: {delete: Mock; get: Mock; set: Mock} = {delete: vi.fn(), get: vi.fn(), set: vi.fn()};
  const authorizeUrl: string = 'https://api.asgardeo.io/t/acme/oauth2/authorize?client_id=client-id';

  beforeEach(() => {
    vi.clearAllMocks();

    (AsgardeoNextClient.getInstance as unknown as Mock).mockReturnValue(client);
    (cookies as unknown as Mock).mockResolvedValue(cookieStore);
    (SessionManager.verifyTempSession as unknown as Mock).mockResolvedValue({sessionId: 'session-1'});
    (SessionManager.createTempSession as unknown as Mock).mockResolvedValue('temp.jwt');

    // No session cookies: a temporary session is created for the sign-in.
    cookieStore.get.mockReturnValue(undefined);

    client.getConfiguration.mockResolvedValue({signInOptions: {fidp: 'OrganizationSSO'}});
    client.getAuthorizeRequestUrl.mockResolvedValue(authorizeUrl);
  });

  it('resolves the redirect-based sign-in URL with the configured signInOptions when called without a payload', async () => {
    const result: ActionResult = await signInAction();

    expect(client.getAuthorizeRequestUrl).toHaveBeenCalledWith({fidp: 'OrganizationSSO'}, expect.any(String));
    expect(client.signIn).not.toHaveBeenCalled();
    expect(result).toEqual({data: {signInUrl: authorizeUrl}, success: true});
    expect(cookieStore.set).toHaveBeenCalledWith('temp-session', 'temp.jwt', {httpOnly: true});
  });

  it('treats an empty payload like no payload', async () => {
    await signInAction({});

    expect(client.getAuthorizeRequestUrl).toHaveBeenCalledWith({fidp: 'OrganizationSSO'}, expect.any(String));
    expect(client.signIn).not.toHaveBeenCalled();
  });

  it("appends the caller's sign-in options to the authorize request on top of the configured ones", async () => {
    const result: ActionResult = await signInAction({fidp: 'GoogleIdP', prompt: 'login'});

    expect(client.getAuthorizeRequestUrl).toHaveBeenCalledWith(
      {fidp: 'GoogleIdP', prompt: 'login'},
      expect.any(String),
    );
    expect(client.signIn).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('works without configured signInOptions', async () => {
    client.getConfiguration.mockResolvedValue({});

    await signInAction({prompt: 'login'});

    expect(client.getAuthorizeRequestUrl).toHaveBeenCalledWith({prompt: 'login'}, expect.any(String));
  });

  it('drives the embedded flow when the payload is an embedded-flow step', async () => {
    const payload: {flowId: string; selectedAuthenticator: {authenticatorId: string; params: Record<string, string>}} =
      {
        flowId: 'flow-1',
        selectedAuthenticator: {authenticatorId: 'BasicAuthenticator', params: {password: 'secret', username: 'jane'}},
      };
    const request: {method: string; url: string} = {method: 'POST', url: 'https://api.asgardeo.io/t/acme/oauth2/authn'};
    const nextStep: Record<string, unknown> = {flowId: 'flow-1', flowStatus: 'INCOMPLETE', nextStep: {}};

    client.signIn.mockResolvedValue(nextStep);

    const result: ActionResult = await signInAction(payload, request);

    expect(client.signIn).toHaveBeenCalledWith(payload, request, expect.any(String));
    expect(client.getAuthorizeRequestUrl).not.toHaveBeenCalled();
    expect(result).toEqual({data: nextStep, success: true});
  });

  it('reuses the session ID of an existing temporary session', async () => {
    cookieStore.get.mockImplementation((name: string) => (name === 'temp-session' ? {value: 'temp.jwt'} : undefined));

    await signInAction();

    expect(client.getAuthorizeRequestUrl).toHaveBeenCalledWith({fidp: 'OrganizationSSO'}, 'session-1');
    expect(SessionManager.createTempSession).not.toHaveBeenCalled();
  });
});
