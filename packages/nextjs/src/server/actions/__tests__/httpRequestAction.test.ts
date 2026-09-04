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

import {afterEach, beforeEach, describe, expect, it, vi, Mock} from 'vitest';
import getAccessToken from '../getAccessToken';
import httpRequestAction, {HttpRequestActionResult} from '../httpRequestAction';

vi.mock('../getAccessToken', () => ({default: vi.fn()}));
vi.mock('../getClientOrigin', () => ({default: vi.fn().mockResolvedValue('http://localhost:3000')}));
vi.mock('../../../AsgardeoNextClient', () => ({
  default: {
    getInstance: (): {getConfiguration: Mock} => ({
      getConfiguration: vi.fn().mockResolvedValue({baseUrl: 'https://api.asgardeo.io/t/acme'}),
    }),
  },
}));

const jsonResponse = (body: unknown, status: number = 200): Response =>
  new Response(JSON.stringify(body), {headers: {'content-type': 'application/json'}, status});

describe('httpRequestAction', () => {
  beforeEach(() => {
    (getAccessToken as Mock).mockResolvedValue('token-123');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({userName: 'jane'})));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('attaches the session access token and returns the parsed response', async () => {
    const result: HttpRequestActionResult = await httpRequestAction({url: 'https://api.asgardeo.io/t/acme/scim2/Me'});

    expect(result.success).toBe(true);
    expect(result.data?.status).toBe(200);
    expect(result.data?.data).toEqual({userName: 'jane'});

    const [, init] = (fetch as Mock).mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer token-123');
  });

  it('allows the app origin and appends query params', async () => {
    await httpRequestAction({params: {page: 2}, url: 'http://localhost:3000/api/items'});

    expect((fetch as Mock).mock.calls[0][0]).toBe('http://localhost:3000/api/items?page=2');
  });

  it('refuses origins other than the identity server and the app', async () => {
    const result: HttpRequestActionResult = await httpRequestAction({url: 'http://169.254.169.254/latest/meta-data/'});

    expect(result.success).toBe(false);
    expect(result.error).toContain('not allowed');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('fails loudly without a session', async () => {
    (getAccessToken as Mock).mockResolvedValue(undefined);

    const result: HttpRequestActionResult = await httpRequestAction({url: 'https://api.asgardeo.io/t/acme/scim2/Me'});

    expect(result.success).toBe(false);
    expect(result.error).toContain('No active session');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('reports non-2xx responses as failures but keeps the body', async () => {
    (fetch as Mock).mockResolvedValue(jsonResponse({detail: 'nope'}, 403));

    const result: HttpRequestActionResult = await httpRequestAction({url: 'https://api.asgardeo.io/t/acme/scim2/Me'});

    expect(result.success).toBe(false);
    expect(result.data?.status).toBe(403);
    expect(result.data?.data).toEqual({detail: 'nope'});
  });
});
