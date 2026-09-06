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
import AsgardeoNextClient from '../AsgardeoNextClient';
import getClientOrigin from '../server/actions/getClientOrigin';

const {legacyClient} = vi.hoisted(() => {
  const hoistedLegacyClient: {getConfigData: Mock; getSignInUrl: Mock; initialize: Mock} = {
    getConfigData: vi.fn(),
    getSignInUrl: vi.fn(),
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

vi.mock('../server/actions/getClientOrigin', () => ({default: vi.fn()}));
vi.mock('../server/actions/getSessionId', () => ({default: vi.fn(async () => 'session-1')}));

interface Deferred<T> {
  promise: Promise<T>;
  reject: (reason: unknown) => void;
  resolve: (value: T) => void;
}

const defer = <T>(): Deferred<T> => {
  let resolve: (value: T) => void = () => {};
  let reject: (reason: unknown) => void = () => {};
  const promise: Promise<T> = new Promise<T>((res: (value: T) => void, rej: (reason: unknown) => void) => {
    resolve = res;
    reject = rej;
  });

  return {promise, reject, resolve};
};

describe('AsgardeoNextClient.initialize', () => {
  const config: Record<string, unknown> = {
    baseUrl: 'https://api.asgardeo.io/t/acme',
    clientId: 'client-id',
    clientSecret: 'client-secret',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Every test starts from a fresh singleton.
    (AsgardeoNextClient as unknown as {instance: unknown}).instance = undefined;

    legacyClient.initialize.mockResolvedValue(true);
    legacyClient.getConfigData.mockResolvedValue(config);
    legacyClient.getSignInUrl.mockResolvedValue('https://api.asgardeo.io/t/acme/oauth2/authorize?client_id=client-id');
  });

  it('shares one initialization between concurrent callers', async () => {
    const origin: Deferred<string> = defer<string>();

    (getClientOrigin as unknown as Mock).mockReturnValue(origin.promise);

    const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();
    const first: Promise<boolean> = client.initialize(config as any);
    const second: Promise<boolean> = client.initialize(config as any);

    expect(client.isInitialized).toBe(false);
    expect(legacyClient.initialize).not.toHaveBeenCalled();

    origin.resolve('http://localhost:3000');

    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
    expect(legacyClient.initialize).toHaveBeenCalledTimes(1);
    expect(client.isInitialized).toBe(true);
  });

  it('lets callers that need an initialized client wait for the initialization in progress', async () => {
    const origin: Deferred<string> = defer<string>();

    (getClientOrigin as unknown as Mock).mockReturnValue(origin.promise);

    const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();
    const initialization: Promise<boolean> = client.initialize(config as any);
    const authorizeUrl: Promise<string> = client.getAuthorizeRequestUrl({});

    expect(legacyClient.getSignInUrl).not.toHaveBeenCalled();

    origin.resolve('http://localhost:3000');

    await initialization;
    await expect(authorizeUrl).resolves.toContain('/oauth2/authorize');
  });

  it('does not mark the client as initialized when the initialization fails and retries on the next call', async () => {
    (getClientOrigin as unknown as Mock).mockRejectedValueOnce(
      new Error('headers() was called outside a request scope'),
    );

    const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();

    await expect(client.initialize(config as any)).rejects.toThrow('outside a request scope');
    expect(client.isInitialized).toBe(false);
    expect(legacyClient.initialize).not.toHaveBeenCalled();
    await expect(client.getAuthorizeRequestUrl({})).rejects.toThrow(/not initialized/);

    (getClientOrigin as unknown as Mock).mockResolvedValue('http://localhost:3000');

    await expect(client.initialize(config as any)).resolves.toBe(true);
    expect(client.isInitialized).toBe(true);
    expect(legacyClient.initialize).toHaveBeenCalledTimes(1);
  });

  it('initializes only once across sequential calls', async () => {
    (getClientOrigin as unknown as Mock).mockResolvedValue('http://localhost:3000');

    const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();

    await client.initialize(config as any);
    await expect(client.initialize(config as any)).resolves.toBe(true);

    expect(getClientOrigin).toHaveBeenCalledTimes(1);
    expect(legacyClient.initialize).toHaveBeenCalledTimes(1);
  });
});
