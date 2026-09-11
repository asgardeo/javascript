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

import {SignJWT} from 'jose';
import {afterAll, afterEach, beforeAll, describe, expect, it, vi, Mock} from 'vitest';
import handleRefreshToken, {HandleRefreshTokenResult} from '../handleRefreshToken';
import SessionManager, {SessionTokenPayload} from '../SessionManager';

describe('handleRefreshToken', () => {
  const originalSecret: string | undefined = process.env['ASGARDEO_SECRET'];
  const config: {baseUrl: string; clientId: string; clientSecret: string} = {
    baseUrl: 'https://api.asgardeo.io/t/acme',
    clientId: 'client-id',
    clientSecret: 'client-secret',
  };
  const storedClaims: Record<string, unknown> = {org_id: 'org-1', org_name: 'Acme', sub: 'user-1'};

  const makeSession = (): SessionTokenPayload =>
    ({
      accessToken: 'old-access-token',
      exp: 0,
      iat: 0,
      idTokenClaims: storedClaims,
      organizationId: 'org-1',
      refreshToken: 'refresh-1',
      scopes: ['openid'],
      sessionId: 'session-1',
      sub: 'user-1',
      type: 'session',
    } as SessionTokenPayload);

  const mockTokenEndpoint = (tokenData: Record<string, unknown>): Mock => {
    const fetchMock: Mock = vi.fn().mockResolvedValue({
      json: async (): Promise<Record<string, unknown>> => tokenData,
      ok: true,
      status: 200,
    });

    vi.stubGlobal('fetch', fetchMock);

    return fetchMock;
  };

  beforeAll(() => {
    process.env['ASGARDEO_SECRET'] = 'unit-test-secret';
  });

  afterAll(() => {
    if (originalSecret === undefined) {
      delete process.env['ASGARDEO_SECRET'];
    } else {
      process.env['ASGARDEO_SECRET'] = originalSecret;
    }
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends the refresh_token grant to the token endpoint of the base URL', async () => {
    const fetchMock: Mock = mockTokenEndpoint({access_token: 'new-access-token', expires_in: 3600});

    await handleRefreshToken(makeSession(), config);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init]: [string, RequestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body: URLSearchParams = new URLSearchParams(init.body as string);

    expect(url).toBe('https://api.asgardeo.io/t/acme/oauth2/token');
    expect(body.get('grant_type')).toBe('refresh_token');
    expect(body.get('refresh_token')).toBe('refresh-1');
    expect(body.get('client_id')).toBe('client-id');
    expect(body.get('client_secret')).toBe('client-secret');
  });

  it('stores the claims of the refreshed ID token in the new session', async () => {
    const idToken: string = await new SignJWT({
      at_hash: 'hash',
      org_handle: 'beta',
      org_id: 'org-2',
      org_name: 'Beta',
      sub: 'user-1',
    })
      .setProtectedHeader({alg: 'HS256'})
      .sign(new TextEncoder().encode('identity-server-secret'));

    mockTokenEndpoint({
      access_token: 'new-access-token',
      expires_in: 3600,
      id_token: idToken,
      refresh_token: 'refresh-2',
      scope: 'openid profile',
      token_type: 'Bearer',
    });

    const result: HandleRefreshTokenResult = await handleRefreshToken(makeSession(), config);
    const payload: SessionTokenPayload = await SessionManager.verifySessionToken(result.newSessionToken);

    expect(result.tokenResponse.idToken).toBe(idToken);
    expect(payload.refreshToken).toBe('refresh-2');
    expect(payload.idTokenClaims).toEqual({org_handle: 'beta', org_id: 'org-2', org_name: 'Beta', sub: 'user-1'});
  });

  it('keeps the existing claims when the refresh response has no ID token', async () => {
    mockTokenEndpoint({access_token: 'new-access-token', expires_in: 3600});

    const result: HandleRefreshTokenResult = await handleRefreshToken(makeSession(), config);
    const payload: SessionTokenPayload = await SessionManager.verifySessionToken(result.newSessionToken);

    expect(payload.idTokenClaims).toEqual(storedClaims);
    expect(payload.refreshToken).toBe('refresh-1');
  });

  it('keeps the existing claims when the refreshed ID token cannot be decoded', async () => {
    mockTokenEndpoint({access_token: 'new-access-token', expires_in: 3600, id_token: 'not-a-jwt'});

    const result: HandleRefreshTokenResult = await handleRefreshToken(makeSession(), config);
    const payload: SessionTokenPayload = await SessionManager.verifySessionToken(result.newSessionToken);

    expect(payload.idTokenClaims).toEqual(storedClaims);
  });
});
