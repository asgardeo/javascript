/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

import {LegacyAsgardeoNodeClient, TokenResponse} from '@asgardeo/node';
import type express from 'express';
import {describe, expect, it, vi} from 'vitest';
import {AsgardeoExpressClient} from '../client';

describe('AsgardeoExpressClient.signIn', () => {
  it('sets the session cookie and redirects without calling next()', async () => {
    vi.spyOn(LegacyAsgardeoNodeClient.prototype, 'initialize').mockResolvedValue(true);
    vi.spyOn(LegacyAsgardeoNodeClient.prototype, 'signIn').mockImplementation(
      async (authURLCallback: (url: string) => void): Promise<TokenResponse> => {
        authURLCallback('https://api.asgardeo.io/t/example/oauth2/authorize');

        return {accessToken: '', idToken: ''} as TokenResponse;
      },
    );

    const client: AsgardeoExpressClient = AsgardeoExpressClient.getInstance({
      appURL: 'http://localhost:3000',
      baseUrl: 'https://api.asgardeo.io/t/example',
      clientId: 'client-id',
      cookieConfig: {maxAge: 0},
    });
    const res: {cookie: ReturnType<typeof vi.fn>; redirect: ReturnType<typeof vi.fn>} = {
      cookie: vi.fn(),
      redirect: vi.fn(),
    };
    const next: ReturnType<typeof vi.fn> = vi.fn();
    const req: express.Request = {cookies: {}, originalUrl: '/login', query: {}} as unknown as express.Request;

    await client.signIn(req, res as unknown as express.Response, next);

    expect(res.redirect).toHaveBeenCalledWith('https://api.asgardeo.io/t/example/oauth2/authorize');
    // An explicit maxAge of 0 is kept instead of falling back to the default.
    expect(res.cookie).toHaveBeenCalledWith(
      'ASGARDEO_SESSION_ID',
      expect.any(String),
      expect.objectContaining({maxAge: 0}),
    );
    expect(next).not.toHaveBeenCalled();
  });
});
