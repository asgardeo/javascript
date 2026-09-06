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

import {AsgardeoRuntimeError, IdToken, Organization, TokenResponse} from '@asgardeo/node';
import {afterEach, beforeAll, beforeEach, describe, expect, it, vi, Mock} from 'vitest';
import AsgardeoNextClient from '../AsgardeoNextClient';
import getAccessToken from '../server/actions/getAccessToken';
import getSessionPayload from '../server/actions/getSessionPayload';
import {SessionTokenPayload} from '../utils/SessionManager';

const {legacyClient, storageManager} = vi.hoisted(() => {
  const hoistedStorageManager: {setSessionData: Mock} = {setSessionData: vi.fn()};
  const hoistedLegacyClient: {
    decodeJwtToken: Mock;
    getConfigData: Mock;
    getDecodedIdToken: Mock;
    getStorageManager: Mock;
    initialize: Mock;
  } = {
    decodeJwtToken: vi.fn(),
    getConfigData: vi.fn(),
    getDecodedIdToken: vi.fn(),
    getStorageManager: vi.fn(),
    initialize: vi.fn(),
  };

  return {legacyClient: hoistedLegacyClient, storageManager: hoistedStorageManager};
});

vi.mock('@asgardeo/node', async (importOriginal: () => Promise<Record<string, unknown>>) => ({
  ...(await importOriginal()),
  // The SDK instantiates the legacy client with `new`, which an arrow function cannot serve.
  // eslint-disable-next-line prefer-arrow-callback
  LegacyAsgardeoNodeClient: vi.fn(function LegacyAsgardeoNodeClientMock(): unknown {
    return legacyClient;
  }),
}));

vi.mock('../server/actions/getClientOrigin', () => ({default: vi.fn(async () => 'http://localhost:3000')}));
vi.mock('../server/actions/getSessionId', () => ({default: vi.fn(async () => 'session-1')}));
vi.mock('../server/actions/getSessionPayload', () => ({default: vi.fn()}));
vi.mock('../server/actions/getAccessToken', () => ({default: vi.fn()}));

describe('AsgardeoNextClient', () => {
  const config: Record<string, unknown> = {
    baseUrl: 'https://api.asgardeo.io/t/acme',
    clientId: 'client-id',
    clientSecret: 'client-secret',
    scopes: 'openid profile',
  };
  const cookieSession: SessionTokenPayload = {
    accessToken: 'cookie-access-token',
    exp: 0,
    iat: 0,
    idTokenClaims: {email: 'jane@example.com', org_handle: 'acme', org_id: 'org-1', org_name: 'Acme'},
    organizationId: 'org-1',
    refreshToken: 'refresh-1',
    scopes: ['openid'],
    sessionId: 'session-1',
    sub: 'user-1',
    type: 'session',
  } as SessionTokenPayload;

  let client: AsgardeoNextClient;

  beforeAll(async () => {
    legacyClient.getConfigData.mockResolvedValue(config);
    legacyClient.initialize.mockResolvedValue(true);

    client = AsgardeoNextClient.getInstance();
    await client.initialize(config as any);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    legacyClient.getConfigData.mockResolvedValue(config);
    legacyClient.getStorageManager.mockResolvedValue(storageManager);
    (getSessionPayload as unknown as Mock).mockResolvedValue(cookieSession);
    (getAccessToken as unknown as Mock).mockResolvedValue('cookie-access-token');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getDecodedIdToken', () => {
    it('decodes the given ID token instead of consulting any session', async () => {
      const decoded: IdToken = {aud: 'client-id', iss: 'issuer', sub: 'user-1'};

      legacyClient.decodeJwtToken.mockResolvedValue(decoded);

      await expect(client.getDecodedIdToken('session-1', 'raw.id.token')).resolves.toEqual(decoded);

      expect(legacyClient.decodeJwtToken).toHaveBeenCalledWith('raw.id.token');
      expect(getSessionPayload).not.toHaveBeenCalled();
      expect(legacyClient.getDecodedIdToken).not.toHaveBeenCalled();
    });

    it('returns the claims stored in the session cookie without the in-memory session', async () => {
      await expect(client.getDecodedIdToken('session-1')).resolves.toEqual({
        email: 'jane@example.com',
        org_handle: 'acme',
        org_id: 'org-1',
        org_name: 'Acme',
        sub: 'user-1',
      });

      expect(legacyClient.getDecodedIdToken).not.toHaveBeenCalled();
    });

    it('falls back to the in-memory session for cookies that carry no claims', async () => {
      const decoded: IdToken = {aud: 'client-id', iss: 'issuer', sub: 'user-1'};

      (getSessionPayload as unknown as Mock).mockResolvedValue({...cookieSession, idTokenClaims: undefined});
      legacyClient.getDecodedIdToken.mockResolvedValue(decoded);

      await expect(client.getDecodedIdToken('session-1')).resolves.toEqual(decoded);

      expect(legacyClient.getDecodedIdToken).toHaveBeenCalledWith('session-1');
    });
  });

  describe('getCurrentOrganization', () => {
    it('reads the organization from the claims in the session cookie', async () => {
      await expect(client.getCurrentOrganization('session-1')).resolves.toEqual({
        id: 'org-1',
        name: 'Acme',
        orgHandle: 'acme',
      });

      expect(legacyClient.getDecodedIdToken).not.toHaveBeenCalled();
    });
  });

  describe('switchOrganization', () => {
    const organization: Organization = {id: 'org-2', name: 'Beta', orgHandle: 'beta'};
    const tokenData: Record<string, unknown> = {
      access_token: 'switched-access-token',
      expires_in: 3600,
      id_token: 'switched.id.token',
      refresh_token: 'refresh-2',
      scope: 'openid profile',
      token_type: 'Bearer',
    };

    const mockTokenEndpoint = (response: Partial<Response> & {json?: () => Promise<unknown>}): Mock => {
      const fetchMock: Mock = vi.fn().mockResolvedValue({
        json: async (): Promise<unknown> => tokenData,
        ok: true,
        status: 200,
        text: async (): Promise<string> => '',
        ...response,
      });

      vi.stubGlobal('fetch', fetchMock);

      return fetchMock;
    };

    it('exchanges the access token from the session cookie with the organization_switch grant', async () => {
      const fetchMock: Mock = mockTokenEndpoint({});

      const result: TokenResponse | Response = await client.switchOrganization(organization, 'session-1');

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const [url, init]: [string, RequestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
      const body: URLSearchParams = new URLSearchParams(init.body as string);

      expect(url).toBe('https://api.asgardeo.io/t/acme/oauth2/token');
      expect(init.method).toBe('POST');
      expect(body.get('grant_type')).toBe('organization_switch');
      expect(body.get('switching_organization')).toBe('org-2');
      expect(body.get('token')).toBe('cookie-access-token');
      expect(body.get('client_id')).toBe('client-id');
      expect(body.get('client_secret')).toBe('client-secret');
      expect(body.get('scope')).toBe('openid profile');

      expect(result).toMatchObject({
        accessToken: 'switched-access-token',
        expiresIn: '3600',
        idToken: 'switched.id.token',
        refreshToken: 'refresh-2',
        scope: 'openid profile',
        tokenType: 'Bearer',
      });
    });

    it('keeps the in-memory session in sync with the switched tokens', async () => {
      mockTokenEndpoint({});

      await client.switchOrganization(organization, 'session-1');

      expect(storageManager.setSessionData).toHaveBeenCalledWith(
        expect.objectContaining({
          access_token: 'switched-access-token',
          expires_in: '3600',
          id_token: 'switched.id.token',
          refresh_token: 'refresh-2',
        }),
        'session-1',
      );
    });

    it('uses HTTP basic authentication when the token request is configured for it', async () => {
      legacyClient.getConfigData.mockResolvedValue({...config, tokenRequest: {authMethod: 'client_secret_basic'}});

      const fetchMock: Mock = mockTokenEndpoint({});

      await client.switchOrganization(organization, 'session-1');

      const [, init]: [string, RequestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
      const body: URLSearchParams = new URLSearchParams(init.body as string);

      expect((init.headers as Record<string, string>)['Authorization']).toBe(
        `Basic ${btoa('client-id:client-secret')}`,
      );
      expect(body.has('client_secret')).toBe(false);
    });

    it('rejects when the token endpoint refuses the switch', async () => {
      mockTokenEndpoint({ok: false, status: 400, text: async (): Promise<string> => '{"error":"invalid_grant"}'});

      await expect(client.switchOrganization(organization, 'session-1')).rejects.toBeInstanceOf(AsgardeoRuntimeError);
      await expect(client.switchOrganization(organization, 'session-1')).rejects.toThrow(/HTTP 400/);
    });

    it('rejects when the organization has no ID', async () => {
      const fetchMock: Mock = mockTokenEndpoint({});

      await expect(client.switchOrganization({name: 'Nameless'} as Organization)).rejects.toThrow(
        /Organization ID is required/,
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
