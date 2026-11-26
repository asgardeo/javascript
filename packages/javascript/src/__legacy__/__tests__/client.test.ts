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

import {afterEach, describe, expect, it, vi} from 'vitest';
import {DefaultCacheStore} from '../../DefaultCacheStore';
import {DefaultCrypto} from '../../DefaultCrypto';
import {AsgardeoAuthClient} from '../client';
import {AuthClientConfig} from '../models';

const baseConfig: AuthClientConfig = {
  afterSignInUrl: 'http://localhost:3000',
  baseUrl: 'https://api.asgardeo.io/t/example',
  clientId: 'client-id',
};

const createClient = async (config: Partial<AuthClientConfig> = {}): Promise<AsgardeoAuthClient<unknown>> => {
  const client: AsgardeoAuthClient<unknown> = new AsgardeoAuthClient<unknown>();
  await client.initialize({...baseConfig, ...config} as AuthClientConfig, new DefaultCacheStore(), new DefaultCrypto());

  return client;
};

const toJwt = (payload: Record<string, unknown>): string =>
  `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;

describe('AsgardeoAuthClient', () => {
  describe('initialize', () => {
    it('keeps the other token validation defaults when only one option is set', async () => {
      const client: AsgardeoAuthClient<unknown> = await createClient({
        tokenValidation: {idToken: {clockTolerance: 60}},
      });

      expect((await client.getStorageManager().getConfigData()).tokenValidation).toEqual({
        idToken: {clockTolerance: 60, validate: true, validateIssuer: true},
      });
    });

    it('applies the short endpoint names from the endpoints config', async () => {
      const client: AsgardeoAuthClient<unknown> = await createClient({
        endpoints: {
          authorization: 'https://idp.example.com/authorize',
          token: 'https://idp.example.com/token',
        } as AuthClientConfig['endpoints'],
      });

      await client.loadOpenIDProviderConfiguration(true);

      const endpoints: Record<string, unknown> = (await client.getOpenIDProviderEndpoints()) as Record<string, unknown>;

      expect(endpoints['authorizationEndpoint']).toBe('https://idp.example.com/authorize');
      expect(endpoints['tokenEndpoint']).toBe('https://idp.example.com/token');
      expect(endpoints['jwksUri']).toBe('https://api.asgardeo.io/t/example/oauth2/jwks');
    });
  });

  describe('reInitialize', () => {
    it('merges the new config into the stored one', async () => {
      const client: AsgardeoAuthClient<unknown> = await createClient();

      await client.reInitialize({afterSignOutUrl: 'http://localhost:3000/signed-out'});

      const config: AuthClientConfig = await client.getStorageManager().getConfigData();

      expect(config.clientId).toBe('client-id');
      expect(config.afterSignOutUrl).toBe('http://localhost:3000/signed-out');
    });
  });

  describe('getDecodedIdToken', () => {
    it('prefers a token passed in over the stored one', async () => {
      const client: AsgardeoAuthClient<unknown> = await createClient();
      await client.getStorageManager().setSessionData({id_token: toJwt({sub: 'stored'})});

      expect((await client.getDecodedIdToken(undefined, toJwt({sub: 'passed'}))).sub).toBe('passed');
      expect((await client.getDecodedIdToken()).sub).toBe('stored');
    });
  });

  describe('redirect_uri for a sign-in request', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    const createClientWithEndpoints = async (): Promise<AsgardeoAuthClient<unknown>> => {
      const client: AsgardeoAuthClient<unknown> = await createClient({
        endpoints: {
          authorization: 'https://idp.example.com/authorize',
          token: 'https://idp.example.com/token',
        } as AuthClientConfig['endpoints'],
      });

      await client.loadOpenIDProviderConfiguration(true);

      return client;
    };

    const captureTokenRequestBody = async (
      client: AsgardeoAuthClient<unknown>,
      state: string,
    ): Promise<URLSearchParams> => {
      let body: URLSearchParams | undefined;

      vi.stubGlobal(
        'fetch',
        vi.fn((_url: string, init: RequestInit) => {
          body = new URLSearchParams(init.body as string);

          return Promise.reject(new Error('stop after capturing the token request'));
        }),
      );

      await expect(client.requestAccessToken('code', '', state)).rejects.toBeDefined();

      return body;
    };

    it('sends the redirect_uri passed for the sign-in request in the token request', async () => {
      const client: AsgardeoAuthClient<unknown> = await createClientWithEndpoints();
      const signInUrl: URL = new URL(await client.getSignInUrl({redirect_uri: 'https://app.example.com/callback'}));

      expect(signInUrl.searchParams.get('redirect_uri')).toBe('https://app.example.com/callback');

      const body: URLSearchParams = await captureTokenRequestBody(client, signInUrl.searchParams.get('state'));

      expect(body.get('redirect_uri')).toBe('https://app.example.com/callback');
    });

    it('uses the configured redirect_uri when the sign-in request does not set one', async () => {
      const client: AsgardeoAuthClient<unknown> = await createClientWithEndpoints();
      const signInUrl: URL = new URL(await client.getSignInUrl());

      expect(signInUrl.searchParams.get('redirect_uri')).toBe('http://localhost:3000');

      const body: URLSearchParams = await captureTokenRequestBody(client, signInUrl.searchParams.get('state'));

      expect(body.get('redirect_uri')).toBe('http://localhost:3000');
    });
  });
});
