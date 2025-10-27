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

import {describe, it, expect, vi} from 'vitest';
import getScim2Me from '../getScim2Me';
import AsgardeoAPIError from '../../errors/AsgardeoAPIError';

// Mock user data
const mockUser = {
  id: '123',
  username: 'testuser',
  email: 'test@example.com',
  givenName: 'Test',
  familyName: 'User',
};

describe('getScim2Me', () => {
  it('should fetch user profile successfully with default fetch', async () => {
    // Mock fetch
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockUser),
      text: () => Promise.resolve(JSON.stringify(mockUser)),
    });

    // Replace global fetch
    global.fetch = mockFetch;

    const result = await getScim2Me({
      url: 'https://api.asgardeo.io/t/test/scim2/Me',
    });

    expect(result).toEqual(mockUser);
    expect(mockFetch).toHaveBeenCalledWith('https://api.asgardeo.io/t/test/scim2/Me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/scim+json',
        Accept: 'application/json',
      },
    });
  });

  it('should use custom fetcher when provided', async () => {
    const customFetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockUser),
      text: () => Promise.resolve(JSON.stringify(mockUser)),
    });

    const result = await getScim2Me({
      url: 'https://api.asgardeo.io/t/test/scim2/Me',
      fetcher: customFetcher,
    });

    expect(result).toEqual(mockUser);
    expect(customFetcher).toHaveBeenCalledWith('https://api.asgardeo.io/t/test/scim2/Me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/scim+json',
        Accept: 'application/json',
      },
    });
  });

  it('should handle errors thrown directly by custom fetcher', async (): Promise<void> => {
    const customFetcher = vi.fn().mockImplementation(() => {
      throw new Error('Custom fetcher failure');
    });

    await expect(
      getScim2Me({
        url: 'https://api.asgardeo.io/t/test/scim2/Me',
        fetcher: customFetcher,
      }),
    ).rejects.toThrow(AsgardeoAPIError);
    await expect(
      getScim2Me({
        url: 'https://api.asgardeo.io/t/test/scim2/Me',
        fetcher: customFetcher,
      }),
    ).rejects.toThrow('Network or parsing error: Custom fetcher failure');
  });

  it('should throw AsgardeoAPIError for invalid URL', async () => {
    await expect(
      getScim2Me({
        url: 'invalid-url',
      }),
    ).rejects.toThrow(AsgardeoAPIError);

    await expect(
      getScim2Me({
        baseUrl: 'invalid-url',
      }),
    ).rejects.toThrow(AsgardeoAPIError);
  });

  it('should throw AsgardeoAPIError for undefined URL', async () => {
    await expect(getScim2Me({})).rejects.toThrow(AsgardeoAPIError);

    const error: AsgardeoAPIError = await getScim2Me({
      url: undefined,
      baseUrl: undefined,
    }).catch(e => e);

    expect(error.name).toBe('AsgardeoAPIError');
    expect(error.code).toBe('getScim2Me-ValidationError-001');
  });

  it('should throw AsgardeoAPIError for empty string URL', async () => {
    await expect(
      getScim2Me({
        url: '',
      }),
    ).rejects.toThrow(AsgardeoAPIError);

    const error: AsgardeoAPIError = await getScim2Me({
      url: '',
    }).catch(e => e);

    expect(error.name).toBe('AsgardeoAPIError');
    expect(error.code).toBe('getScim2Me-ValidationError-001');
  });

  it('should throw AsgardeoAPIError for failed response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: () => Promise.resolve('User not found'),
    });

    global.fetch = mockFetch;

    await expect(
      getScim2Me({
        url: 'https://api.asgardeo.io/t/test/scim2/Me',
      }),
    ).rejects.toThrow(AsgardeoAPIError);
  });

  it('should handle network errors', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

    global.fetch = mockFetch;

    await expect(
      getScim2Me({
        url: 'https://api.asgardeo.io/t/test/scim2/Me',
      }),
    ).rejects.toThrow(AsgardeoAPIError);
  });

  it('should handle non-Error rejections', async (): Promise<void> => {
    global.fetch = vi.fn().mockRejectedValue('unexpected failure');

    const baseUrl: string = 'https://api.asgardeo.io/t/dxlab';

    await expect(getScim2Me({baseUrl})).rejects.toThrow(AsgardeoAPIError);
    await expect(getScim2Me({baseUrl})).rejects.toThrow('Network or parsing error: Unknown error');
  });

  it('should pass through custom headers', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockUser),
      text: () => Promise.resolve(JSON.stringify(mockUser)),
    });

    global.fetch = mockFetch;
    const customHeaders = {
      Authorization: 'Bearer token',
      'X-Custom-Header': 'custom-value',
    };

    await getScim2Me({
      url: 'https://api.asgardeo.io/t/test/scim2/Me',
      headers: customHeaders,
    });

    expect(mockFetch).toHaveBeenCalledWith('https://api.asgardeo.io/t/test/scim2/Me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/scim+json',
        Accept: 'application/json',
        ...customHeaders,
      },
    });
  });

  it('should default to baseUrl if url is not provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockUser),
      text: () => Promise.resolve(JSON.stringify(mockUser)),
    });
    global.fetch = mockFetch;

    const baseUrl = 'https://api.asgardeo.io/t/test';
    await getScim2Me({
      baseUrl,
    });
    expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/scim2/Me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/scim+json',
        Accept: 'application/json',
      },
    });
  });
});
