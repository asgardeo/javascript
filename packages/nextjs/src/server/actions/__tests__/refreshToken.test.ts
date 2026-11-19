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
import {afterEach, beforeEach, describe, expect, it, vi, Mock} from 'vitest';
import AsgardeoNextClient from '../../../AsgardeoNextClient';
import handleRefreshToken from '../../../utils/handleRefreshToken';
import SessionManager from '../../../utils/SessionManager';
import refreshToken, {RefreshResult} from '../refreshToken';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('../../../AsgardeoNextClient', () => ({
  default: {
    getInstance: vi.fn(),
  },
}));

vi.mock('../../../utils/handleRefreshToken', () => ({
  default: vi.fn(),
}));

vi.mock('../../../utils/SessionManager', () => ({
  default: {
    getSessionCookieName: vi.fn(() => 'session'),
    getSessionCookieOptions: vi.fn((maxAge: number) => ({httpOnly: true, maxAge})),
    verifySessionTokenForRefresh: vi.fn(),
  },
}));

describe('refreshToken', () => {
  const NOW: number = 1_800_000_000_000;
  const nowSeconds: number = NOW / 1000;
  const cookieStore: {delete: Mock; get: Mock; set: Mock} = {delete: vi.fn(), get: vi.fn(), set: vi.fn()};
  const client: {getConfiguration: Mock} = {getConfiguration: vi.fn()};

  const sessionExpiringIn = (seconds: number): Record<string, unknown> => ({
    exp: nowSeconds + seconds,
    refreshToken: 'refresh-1',
    sessionId: 'session-1',
    sub: 'user-1',
    type: 'session',
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    (cookies as unknown as Mock).mockResolvedValue(cookieStore);
    cookieStore.get.mockReturnValue({value: 'session.jwt'});
    (AsgardeoNextClient.getInstance as unknown as Mock).mockReturnValue(client);
    client.getConfiguration.mockResolvedValue({
      baseUrl: 'https://api.asgardeo.io/t/acme',
      clientId: 'client-id',
      clientSecret: 'client-secret',
    });
    (handleRefreshToken as unknown as Mock).mockResolvedValue({
      newSessionToken: 'new.session.jwt',
      sessionCookieExpiryTime: 86400,
      tokenResponse: {expiresIn: '3600'},
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exchanges the refresh token, stores the new session cookie and returns the new expiry', async () => {
    (SessionManager.verifySessionTokenForRefresh as unknown as Mock).mockResolvedValue(sessionExpiringIn(10));

    const result: RefreshResult = await refreshToken();

    expect(handleRefreshToken).toHaveBeenCalledTimes(1);
    expect(cookieStore.set).toHaveBeenCalledWith('session', 'new.session.jwt', {httpOnly: true, maxAge: 86400});
    expect(result).toEqual({expiresAt: nowSeconds + 3600});
  });

  it('skips the exchange when only an expiring session should be refreshed and the token is still fresh', async () => {
    (SessionManager.verifySessionTokenForRefresh as unknown as Mock).mockResolvedValue(sessionExpiringIn(1800));

    const result: RefreshResult = await refreshToken({onlyIfExpiring: true});

    expect(handleRefreshToken).not.toHaveBeenCalled();
    expect(cookieStore.set).not.toHaveBeenCalled();
    expect(result).toEqual({expiresAt: nowSeconds + 1800});
  });

  it('refreshes an expiring session when only an expiring session should be refreshed', async () => {
    (SessionManager.verifySessionTokenForRefresh as unknown as Mock).mockResolvedValue(sessionExpiringIn(10));

    const result: RefreshResult = await refreshToken({onlyIfExpiring: true});

    expect(handleRefreshToken).toHaveBeenCalledTimes(1);
    expect(result).toEqual({expiresAt: nowSeconds + 3600});
  });

  it('clears the session cookie and rejects when the refresh fails', async () => {
    (SessionManager.verifySessionTokenForRefresh as unknown as Mock).mockResolvedValue(sessionExpiringIn(10));
    (handleRefreshToken as unknown as Mock).mockRejectedValue(new Error('Token endpoint rejected refresh (HTTP 400).'));

    await expect(refreshToken()).rejects.toThrow(/HTTP 400/);
    expect(cookieStore.delete).toHaveBeenCalledWith('session');
  });

  it('rejects when there is no session cookie', async () => {
    cookieStore.get.mockReturnValue(undefined);

    await expect(refreshToken()).rejects.toThrow(/No active session/);
    expect(handleRefreshToken).not.toHaveBeenCalled();
  });
});
