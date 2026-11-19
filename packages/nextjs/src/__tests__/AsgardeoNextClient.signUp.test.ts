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

import {beforeAll, beforeEach, describe, expect, it, vi, Mock} from 'vitest';
import AsgardeoNextClient from '../AsgardeoNextClient';

const {legacyClient} = vi.hoisted(() => {
  const hoistedLegacyClient: {getConfigData: Mock; initialize: Mock} = {
    getConfigData: vi.fn(),
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
}));

vi.mock('../server/actions/getClientOrigin', () => ({default: vi.fn(async () => 'http://localhost:3000')}));
vi.mock('../server/actions/getSessionId', () => ({default: vi.fn(async () => 'session-1')}));

describe('AsgardeoNextClient.getSignUpUrl', () => {
  const config: Record<string, unknown> = {
    applicationId: 'app-id',
    baseUrl: 'https://api.asgardeo.io/t/acme',
    clientId: 'client-id',
    clientSecret: 'client-secret',
  };

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
  });

  it('derives the hosted self-registration page from the Asgardeo base URL', async () => {
    const signUpUrl: URL = new URL(await client.getSignUpUrl());

    expect(signUpUrl.origin).toBe('https://accounts.asgardeo.io');
    expect(signUpUrl.pathname).toBe('/t/acme/accountrecoveryendpoint/register.do');
    expect(signUpUrl.searchParams.get('client_id')).toBe('client-id');
    expect(signUpUrl.searchParams.get('spId')).toBe('app-id');
  });

  it('prefers the configured signUpUrl', async () => {
    legacyClient.getConfigData.mockResolvedValue({...config, signUpUrl: '/signup'});

    await expect(client.getSignUpUrl()).resolves.toBe('/signup');
  });

  it('returns an empty string when the base URL is not a recognised identity server pattern', async () => {
    legacyClient.getConfigData.mockResolvedValue({...config, baseUrl: 'https://login.example.com'});

    await expect(client.getSignUpUrl()).resolves.toBe('');
  });

  it('still rejects a programmatic signUp(options) call, pointing at getSignUpUrl', async () => {
    await expect(client.signUp({})).rejects.toThrow(/getSignUpUrl/);
  });
});
