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
import AsgardeoAPIError from '../../errors/AsgardeoAPIError';
import {EmbeddedSignInFlowHandleResponse} from '../../models/embedded-signin-flow';
import executeEmbeddedSignInFlow from '../executeEmbeddedSignInFlow';

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
      json: () => Promise.resolve(mockResponse),
      ok: true,
    });

    const url: string = 'https://api.asgardeo.io/t/demo/oauth2/authn';
    const payload: Record<string, string> = {client_id: 'abc123', password: 'pass', username: 'test'};

    const result: EmbeddedSignInFlowHandleResponse = await executeEmbeddedSignInFlow({payload, url});

    expect(fetch).toHaveBeenCalledWith(url, {
      body: JSON.stringify(payload),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should fall back to baseUrl if url is not provided', async (): Promise<void> => {
    const mockResponse: EmbeddedSignInFlowHandleResponse = {
      authData: {token: 'abc123'},
      flowStatus: 'COMPLETED',
    };

    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
      ok: true,
    });

    const baseUrl: string = 'https://api.asgardeo.io/t/demo';
    const payload: Record<string, string> = {grant_type: 'password'};

    const result: EmbeddedSignInFlowHandleResponse = await executeEmbeddedSignInFlow({baseUrl, payload});

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/oauth2/authn`, {
      body: JSON.stringify(payload),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should throw AsgardeoAPIError for invalid URL', async (): Promise<void> => {
    const payload: Record<string, string> = {password: '123', username: 'user'};

    await expect(executeEmbeddedSignInFlow({payload, url: 'invalid-url'})).rejects.toThrow(AsgardeoAPIError);

    await expect(executeEmbeddedSignInFlow({payload, url: 'invalid-url'})).rejects.toThrow('Invalid URL provided.');
  });

  it('should throw AsgardeoAPIError for undefined URL and baseUrl', async (): Promise<void> => {
    const payload: Record<string, string> = {password: '123', username: 'user'};

    await expect(executeEmbeddedSignInFlow({baseUrl: undefined, payload, url: undefined} as any)).rejects.toThrow(
      AsgardeoAPIError,
    );
    await expect(executeEmbeddedSignInFlow({baseUrl: undefined, payload, url: undefined} as any)).rejects.toThrow(
      'Invalid URL provided.',
    );
  });

  it('should throw AsgardeoAPIError for empty string URL and baseUrl', async (): Promise<void> => {
    const payload: Record<string, string> = {password: '123', username: 'user'};
    await expect(executeEmbeddedSignInFlow({baseUrl: '', payload, url: ''})).rejects.toThrow(AsgardeoAPIError);
  });

  it('should throw AsgardeoAPIError when payload is missing', async (): Promise<void> => {
    const baseUrl: string = 'https://api.asgardeo.io/t/demo';

    await expect(executeEmbeddedSignInFlow({baseUrl} as any)).rejects.toThrow(AsgardeoAPIError);
    await expect(executeEmbeddedSignInFlow({baseUrl} as any)).rejects.toThrow('Authorization payload is required');
  });

  it('should prefer url over baseUrl when both are provided', async (): Promise<void> => {
    const mockData: EmbeddedSignInFlowHandleResponse = {
      authData: {token: 'abc123'},
      flowStatus: 'COMPLETED' as const,
    };
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockData),
      ok: true,
    });

    const url: string = 'https://api.asgardeo.io/t/demo/oauth2/authn';
    const baseUrl: string = 'https://api.asgardeo.io/t/ignored';
    await executeEmbeddedSignInFlow({baseUrl, payload: {a: 1}, url});

    expect(fetch).toHaveBeenCalledWith(url, expect.any(Object));
  });

  it('should respect method override from requestConfig', async (): Promise<void> => {
    const mockData: EmbeddedSignInFlowHandleResponse = {
      authData: {token: 'abc123'},
      flowStatus: 'COMPLETED' as const,
    };
    global.fetch = vi.fn().mockResolvedValue({json: () => Promise.resolve(mockData), ok: true});

    const baseUrl: string = 'https://api.asgardeo.io/t/demo';
    await executeEmbeddedSignInFlow({baseUrl, method: 'PUT' as any, payload: {a: 1}});

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/oauth2/authn`, expect.objectContaining({method: 'PUT'}));
  });

  it('should handle HTTP error responses', async (): Promise<void> => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: () => Promise.resolve('Invalid credentials'),
    });

    const payload: Record<string, string> = {password: 'invalid', username: 'wrong'};
    const baseUrl: string = 'https://api.asgardeo.io/t/demo';

    await expect(executeEmbeddedSignInFlow({baseUrl, payload})).rejects.toThrow(AsgardeoAPIError);
    await expect(executeEmbeddedSignInFlow({baseUrl, payload})).rejects.toThrow(
      'Authorization request failed: Invalid credentials',
    );
  });

  it('should handle network or parsing errors', async (): Promise<void> => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const payload: Record<string, string> = {password: 'pass', username: 'user'};
    const baseUrl: string = 'https://api.asgardeo.io/t/demo';

    await expect(executeEmbeddedSignInFlow({baseUrl, payload})).rejects.toThrow(AsgardeoAPIError);
    await expect(executeEmbeddedSignInFlow({baseUrl, payload})).rejects.toThrow(
      'Network or parsing error: Network error',
    );
  });

  it('should handle non-Error rejections', async (): Promise<void> => {
    global.fetch = vi.fn().mockRejectedValue('Unexpected failure');

    const payload: Record<string, string> = {password: 'pass', username: 'user'};
    const baseUrl: string = 'https://api.asgardeo.io/t/demo';

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
      json: () => Promise.resolve(mockResponse),
      ok: true,
    });

    const payload: Record<string, string> = {password: 'pass', username: 'user'};
    const baseUrl: string = 'https://api.asgardeo.io/t/demo';
    const customHeaders: Record<string, string> = {
      Authorization: 'Bearer token',
      'X-Custom-Header': 'custom-value',
    };

    await executeEmbeddedSignInFlow({
      baseUrl,
      headers: customHeaders,
      payload,
    });

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/oauth2/authn`, {
      body: JSON.stringify(payload),
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer token',
        'Content-Type': 'application/json',
        'X-Custom-Header': 'custom-value',
      },
      method: 'POST',
    });
  });
});
