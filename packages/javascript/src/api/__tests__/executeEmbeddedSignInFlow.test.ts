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

import {describe, it, expect, vi, beforeEach} from 'vitest';
import executeEmbeddedSignInFlow from '../executeEmbeddedSignInFlow';
import AsgardeoAPIError from '../../errors/AsgardeoAPIError';
import {EmbeddedSignInFlowHandleResponse} from '../../models/embedded-signin-flow';

describe('executeEmbeddedSignInFlow', (): void => {
  beforeEach((): void => {
    vi.resetAllMocks();
  });

  it('should execute successfully with default fetch', async (): Promise<void> => {
    const mockResponse: EmbeddedSignInFlowHandleResponse = {
      authData: {token: 'abc123'},
      flowStatus: 'COMPLETED',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const url = 'https://api.asgardeo.io/t/demo/oauth2/authn';
    const payload = {client_id: 'abc123', username: 'test', password: 'pass'};

    const result = await executeEmbeddedSignInFlow({url, payload});

    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual(mockResponse);
  });

  it('should fall back to baseUrl if url is not provided', async (): Promise<void> => {
    const mockResponse: EmbeddedSignInFlowHandleResponse = {
      authData: {token: 'abc123'},
      flowStatus: 'COMPLETED',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    const payload = {grant_type: 'password'};

    const result = await executeEmbeddedSignInFlow({baseUrl, payload});

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/oauth2/authn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual(mockResponse);
  });

  it('should throw AsgardeoAPIError for invalid URL', async (): Promise<void> => {
    const payload = {username: 'user', password: '123'};

    await expect(executeEmbeddedSignInFlow({url: 'invalid-url', payload})).rejects.toThrow(AsgardeoAPIError);

    await expect(executeEmbeddedSignInFlow({url: 'invalid-url', payload})).rejects.toThrow('Invalid URL provided.');
  });

  it('should throw AsgardeoAPIError for undefined URL and baseUrl', async (): Promise<void> => {
    const payload = {username: 'user', password: '123'};

    await expect(executeEmbeddedSignInFlow({url: undefined, baseUrl: undefined, payload} as any)).rejects.toThrow(
      AsgardeoAPIError,
    );
    await expect(executeEmbeddedSignInFlow({url: undefined, baseUrl: undefined, payload} as any)).rejects.toThrow(
      'Invalid URL provided.',
    );
  });

  it('should throw AsgardeoAPIError for empty string URL and baseUrl', async (): Promise<void> => {
    const payload = {username: 'user', password: '123'};
    await expect(executeEmbeddedSignInFlow({url: '', baseUrl: '', payload})).rejects.toThrow(AsgardeoAPIError);
  });

  it('should throw AsgardeoAPIError when payload is missing', async (): Promise<void> => {
    const baseUrl = 'https://api.asgardeo.io/t/demo';

    await expect(executeEmbeddedSignInFlow({baseUrl} as any)).rejects.toThrow(AsgardeoAPIError);
    await expect(executeEmbeddedSignInFlow({baseUrl} as any)).rejects.toThrow('Authorization payload is required');
  });

  it('should prefer url over baseUrl when both are provided', async (): Promise<void> => {
    const mock = {
      authData: {token: 'abc123'},
      flowStatus: 'COMPLETED' as const,
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mock),
    });

    const url = 'https://api.asgardeo.io/t/demo/oauth2/authn';
    const baseUrl = 'https://api.asgardeo.io/t/ignored';
    await executeEmbeddedSignInFlow({url, baseUrl, payload: {a: 1}});

    expect(fetch).toHaveBeenCalledWith(url, expect.any(Object));
  });

  it('should respect method override from requestConfig', async (): Promise<void> => {
    const mock = {
      authData: {token: 'abc123'},
      flowStatus: 'COMPLETED' as const,
    };
    global.fetch = vi.fn().mockResolvedValue({ok: true, json: () => Promise.resolve(mock)});

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    await executeEmbeddedSignInFlow({baseUrl, payload: {a: 1}, method: 'PUT' as any});

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/oauth2/authn`, expect.objectContaining({method: 'PUT'}));
  });

  it('should handle HTTP error responses', async (): Promise<void> => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: () => Promise.resolve('Invalid credentials'),
    });

    const payload = {username: 'wrong', password: 'invalid'};
    const baseUrl = 'https://api.asgardeo.io/t/demo';

    await expect(executeEmbeddedSignInFlow({baseUrl, payload})).rejects.toThrow(AsgardeoAPIError);
    await expect(executeEmbeddedSignInFlow({baseUrl, payload})).rejects.toThrow(
      'Authorization request failed: Invalid credentials',
    );
  });

  it('should handle network or parsing errors', async (): Promise<void> => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const payload = {username: 'user', password: 'pass'};
    const baseUrl = 'https://api.asgardeo.io/t/demo';

    await expect(executeEmbeddedSignInFlow({baseUrl, payload})).rejects.toThrow(AsgardeoAPIError);
    await expect(executeEmbeddedSignInFlow({baseUrl, payload})).rejects.toThrow(
      'Network or parsing error: Network error',
    );
  });

  it('should handle non-Error rejections', async (): Promise<void> => {
    global.fetch = vi.fn().mockRejectedValue('Unexpected failure');

    const payload = {username: 'user', password: 'pass'};
    const baseUrl = 'https://api.asgardeo.io/t/demo';

    await expect(executeEmbeddedSignInFlow({baseUrl, payload})).rejects.toThrow(
      'Network or parsing error: Unknown error',
    );
  });

  it('should include custom headers when provided', async (): Promise<void> => {
    const mockResponse: EmbeddedSignInFlowHandleResponse = {
      authData: {token: 'abc123'},
      flowStatus: 'COMPLETED',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const payload = {username: 'user', password: 'pass'};
    const baseUrl = 'https://api.asgardeo.io/t/demo';
    const customHeaders = {
      Authorization: 'Bearer token',
      'X-Custom-Header': 'custom-value',
    };

    await executeEmbeddedSignInFlow({
      baseUrl,
      payload,
      headers: customHeaders,
    });

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/oauth2/authn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer token',
        'X-Custom-Header': 'custom-value',
      },
      body: JSON.stringify(payload),
    });
  });
});
