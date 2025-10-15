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

import {describe, it, expect, vi, beforeEach, Mock} from 'vitest';
import initializeEmbeddedSignInFlow from '../initializeEmbeddedSignInFlow';
import AsgardeoAPIError from '../../errors/AsgardeoAPIError';
import type {EmbeddedSignInFlowInitiateResponse} from '../../models/embedded-signin-flow';

describe('initializeEmbeddedSignInFlow', (): void => {
  beforeEach((): void => {
    vi.resetAllMocks();
  });

  it('should execute successfully with explicit url (default fetch)', async (): Promise<void> => {
    const mockResp: EmbeddedSignInFlowInitiateResponse = {
      flowId: 'fid-123',
      flowStatus: 'PENDING',
    } as any;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResp),
    });

    const url = 'https://api.asgardeo.io/t/demo/oauth2/authorize';
    const payload = {
      response_type: 'code',
      client_id: 'cid',
      redirect_uri: 'https://app/cb',
      scope: 'openid profile',
      state: 'xyz',
      code_challenge: 'abc',
      code_challenge_method: 'S256',
    };

    const result = await initializeEmbeddedSignInFlow({url, payload});

    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams(payload as Record<string, string>).toString(),
    });
    expect(result).toEqual(mockResp);
  });

  it('should fall back to baseUrl when url is not provided', async (): Promise<void> => {
    const mockResp: EmbeddedSignInFlowInitiateResponse = {
      flowId: 'fid-456',
      flowStatus: 'PENDING',
    } as any;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResp),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    const payload = {response_type: 'code', client_id: 'cid'};

    const result = await initializeEmbeddedSignInFlow({baseUrl, payload});

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/oauth2/authorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams(payload as Record<string, string>).toString(),
    });
    expect(result).toEqual(mockResp);
  });

  it('should use custom method from requestConfig when provided', async (): Promise<void> => {
    const mockResp: EmbeddedSignInFlowInitiateResponse = {
      flowId: 'fid-789',
      flowStatus: 'PENDING',
    } as any;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResp),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    const payload = {response_type: 'code', client_id: 'cid'};

    await initializeEmbeddedSignInFlow({baseUrl, payload, method: 'PUT' as any});

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/oauth2/authorize`, expect.objectContaining({method: 'PUT'}));
  });

  it('should prefer url over baseUrl when both are provided', async (): Promise<void> => {
    const mockResp: EmbeddedSignInFlowInitiateResponse = {
      flowId: 'fid-000',
      flowStatus: 'PENDING',
    } as any;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResp),
    });

    const url = 'https://api.asgardeo.io/t/demo/oauth2/authorize';
    const baseUrl = 'https://api.asgardeo.io/t/ignored';
    await initializeEmbeddedSignInFlow({url, baseUrl, payload: {response_type: 'code'}});

    expect(fetch).toHaveBeenCalledWith(url, expect.any(Object));
  });

  it('should throw AsgardeoAPIError for invalid URL/baseUrl', async (): Promise<void> => {
    await expect(initializeEmbeddedSignInFlow({url: 'invalid-url' as any, payload: {a: 1} as any})).rejects.toThrow(
      AsgardeoAPIError,
    );
    await expect(initializeEmbeddedSignInFlow({url: 'invalid-url' as any, payload: {a: 1} as any})).rejects.toThrow(
      'Invalid URL provided.',
    );
  });

  it('should throw AsgardeoAPIError when payload is missing', async (): Promise<void> => {
    const baseUrl = 'https://api.asgardeo.io/t/demo';
    await expect(initializeEmbeddedSignInFlow({baseUrl} as any)).rejects.toThrow(AsgardeoAPIError);
    await expect(initializeEmbeddedSignInFlow({baseUrl} as any)).rejects.toThrow('Authorization payload is required');
  });

  it('should handle HTTP error responses', async (): Promise<void> => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: () => Promise.resolve('invalid request'),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    const payload = {response_type: 'code', client_id: 'cid'};

    await expect(initializeEmbeddedSignInFlow({baseUrl, payload})).rejects.toThrow(AsgardeoAPIError);
    await expect(initializeEmbeddedSignInFlow({baseUrl, payload})).rejects.toThrow(
      'Authorization request failed: invalid request',
    );
  });

  it('should handle network or parsing errors', async (): Promise<void> => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network down'));

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    const payload = {response_type: 'code', client_id: 'cid'};

    await expect(initializeEmbeddedSignInFlow({baseUrl, payload})).rejects.toThrow(AsgardeoAPIError);
    await expect(initializeEmbeddedSignInFlow({baseUrl, payload})).rejects.toThrow(
      'Network or parsing error: Network down',
    );
  });

  it('should handle non-Error rejections', async (): Promise<void> => {
    global.fetch = vi.fn().mockRejectedValue('weird failure');

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    const payload = {response_type: 'code', client_id: 'cid'};

    await expect(initializeEmbeddedSignInFlow({baseUrl, payload})).rejects.toThrow(
      'Network or parsing error: Unknown error',
    );
  });

  it('should pass through custom headers (and enforces content-type & accept)', async (): Promise<void> => {
    const mockResp: EmbeddedSignInFlowInitiateResponse = {
      flowId: 'fid-headers',
      flowStatus: 'PENDING',
    } as any;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResp),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    const payload = {response_type: 'code', client_id: 'cid'};
    const customHeaders = {
      Authorization: 'Bearer token',
      'X-Custom-Header': 'custom-value',
      'Content-Type': 'text/plain',
      Accept: 'text/plain',
    };

    await initializeEmbeddedSignInFlow({
      baseUrl,
      payload,
      headers: customHeaders,
    });

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/oauth2/authorize`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer token',
        'X-Custom-Header': 'custom-value',
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams(payload as Record<string, string>).toString(),
    });
  });

  it('should encode payload as application/x-www-form-urlencoded', async (): Promise<void> => {
    const mockResp: EmbeddedSignInFlowInitiateResponse = {
      flowId: 'fid-enc',
      flowStatus: 'PENDING',
    } as any;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResp),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    const payload = {
      response_type: 'code',
      client_id: 'cid',
      scope: 'openid profile email',
      redirect_uri: 'https://app.example.com/cb?x=1&y=2',
      state: 'chars !@#$&=+,:;/?',
    };

    await initializeEmbeddedSignInFlow({baseUrl, payload});

    const [, init] = (fetch as unknown as Mock).mock.calls[0];
    expect(init.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    // ensure characters are url-encoded in body
    expect((init as any).body).toContain('scope=openid+profile+email');
    expect((init as any).body).toContain('redirect_uri=https%3A%2F%2Fapp.example.com%2Fcb%3Fx%3D1%26y%3D2');
    expect((init as any).body).toContain('state=chars+%21%40%23%24%26%3D%2B%2C%3A%3B%2F%3F');
  });
});
