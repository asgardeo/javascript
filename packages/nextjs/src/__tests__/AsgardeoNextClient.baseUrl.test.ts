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

import {createOrganization, getOrganization, getSchemas, getScim2Me, updateMeProfile} from '@asgardeo/node';
import {beforeAll, beforeEach, describe, expect, it, vi, Mock} from 'vitest';
import AsgardeoNextClient from '../AsgardeoNextClient';
import getAccessToken from '../server/actions/getAccessToken';
import getSessionPayload from '../server/actions/getSessionPayload';

const {legacyClient} = vi.hoisted(() => {
  const hoistedLegacyClient: {getConfigData: Mock; getDecodedIdToken: Mock; initialize: Mock} = {
    getConfigData: vi.fn(),
    getDecodedIdToken: vi.fn(),
    initialize: vi.fn(),
  };

  return {legacyClient: hoistedLegacyClient};
});

vi.mock('@asgardeo/node', async (importOriginal: () => Promise<Record<string, unknown>>) => ({
  ...(await importOriginal()),
  // The SDK instantiates the legacy client with `new`, which an arrow function cannot serve.
  // eslint-disable-next-line prefer-arrow-callback
  LegacyAsgardeoNodeClient: vi.fn(function LegacyAsgardeoNodeClientMock(): unknown {
    return legacyClient;
  }),
  createOrganization: vi.fn(),
  getOrganization: vi.fn(),
  getSchemas: vi.fn(),
  getScim2Me: vi.fn(),
  updateMeProfile: vi.fn(),
}));

vi.mock('../server/actions/getClientOrigin', () => ({default: vi.fn(async () => 'http://localhost:3000')}));
vi.mock('../server/actions/getSessionId', () => ({default: vi.fn(async () => 'session-1')}));
vi.mock('../server/actions/getSessionPayload', () => ({default: vi.fn()}));
vi.mock('../server/actions/getAccessToken', () => ({default: vi.fn(async () => 'access-token')}));

describe('AsgardeoNextClient base URL resolution', () => {
  const rootBaseUrl: string = 'https://api.asgardeo.io/t/acme';
  const config: Record<string, unknown> = {baseUrl: rootBaseUrl, clientId: 'client-id', clientSecret: 'client-secret'};

  const rootSession: Record<string, unknown> = {sessionId: 'session-1', sub: 'user-1', type: 'session'};
  const organizationSession: Record<string, unknown> = {...rootSession, organizationId: 'org-1'};

  const baseUrlPassedTo = (apiMock: unknown): string =>
    ((apiMock as Mock).mock.calls[0]?.[0] as {baseUrl: string} | undefined)?.baseUrl ?? '';

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
    (getAccessToken as unknown as Mock).mockResolvedValue('access-token');
    (getScim2Me as unknown as Mock).mockResolvedValue({userName: 'jane'});
    (getSchemas as unknown as Mock).mockResolvedValue([]);
    (updateMeProfile as unknown as Mock).mockResolvedValue({userName: 'jane'});
    (createOrganization as unknown as Mock).mockResolvedValue({id: 'org-2', name: 'Beta'});
    (getOrganization as unknown as Mock).mockResolvedValue({id: 'org-1', name: 'Acme'});
  });

  describe('for a root organization session', () => {
    beforeEach(() => {
      (getSessionPayload as unknown as Mock).mockResolvedValue(rootSession);
    });

    it('calls the SCIM2 APIs on the configured base URL', async () => {
      await client.getUserProfile('session-1');

      expect(baseUrlPassedTo(getScim2Me)).toBe(rootBaseUrl);
      expect(baseUrlPassedTo(getSchemas)).toBe(rootBaseUrl);
    });

    it('calls the organization APIs on the configured base URL', async () => {
      await client.getOrganization('org-1', 'session-1');
      await client.createOrganization({name: 'Beta'} as any, 'session-1');

      expect(baseUrlPassedTo(getOrganization)).toBe(rootBaseUrl);
      expect(baseUrlPassedTo(createOrganization)).toBe(rootBaseUrl);
    });
  });

  describe('for an organization session', () => {
    beforeEach(() => {
      (getSessionPayload as unknown as Mock).mockResolvedValue(organizationSession);
    });

    it('reads and updates the user profile through the /o SCIM2 APIs', async () => {
      await client.getUser('session-1');
      await client.updateUserProfile({operations: []}, 'session-1');

      expect(baseUrlPassedTo(getScim2Me)).toBe(`${rootBaseUrl}/o`);
      expect(baseUrlPassedTo(getSchemas)).toBe(`${rootBaseUrl}/o`);
      expect(baseUrlPassedTo(updateMeProfile)).toBe(`${rootBaseUrl}/o`);
    });

    it('reads and creates organizations through the /o organization APIs', async () => {
      await client.getOrganization('org-1', 'session-1');
      await client.createOrganization({name: 'Beta'} as any, 'session-1');

      expect(baseUrlPassedTo(getOrganization)).toBe(`${rootBaseUrl}/o`);
      expect(baseUrlPassedTo(createOrganization)).toBe(`${rootBaseUrl}/o`);
    });

    it('does not append /o twice when the configured base URL already targets an organization', async () => {
      legacyClient.getConfigData.mockResolvedValue({...config, baseUrl: `${rootBaseUrl}/o`});

      await client.getUserProfile('session-1');

      expect(baseUrlPassedTo(getScim2Me)).toBe(`${rootBaseUrl}/o`);
    });
  });

  it('keeps using the configured base URL when there is no session cookie', async () => {
    (getSessionPayload as unknown as Mock).mockResolvedValue(undefined);

    await client.getUserProfile('session-1');

    expect(baseUrlPassedTo(getScim2Me)).toBe(rootBaseUrl);
  });
});
