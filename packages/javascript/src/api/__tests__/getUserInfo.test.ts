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
import getUserInfo from '../getUserInfo';
import {User} from '../../models/user';
import AsgardeoAPIError from '../../errors/AsgardeoAPIError';

describe('getUserInfo', (): void => {
  beforeEach((): void => {
    vi.resetAllMocks();
  });

  it('should fetch user info successfully', async (): Promise<void> => {
    const mockUserInfo: User = {
      id: 'test-id',
      name: 'Test User',
      email: 'test@example.com',
      roles: ['user'],
      groups: ['group1'],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUserInfo),
    });

    const url: string = 'https://api.asgardeo.io/t/<ORGANIZATION>/oauth2/userinfo';
    const result: User = await getUserInfo({url});

    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    expect(result).toEqual({
      id: 'test-id',
      name: 'Test User',
      email: 'test@example.com',
      roles: ['user'],
      groups: ['group1'],
    });
  });

  it('should handle missing optional fields', async (): Promise<void> => {
    const mockUserInfo: User = {
      id: 'test-id',
      name: 'Test User',
      email: 'test@example.com',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUserInfo),
    });

    const url: string = 'https://api.asgardeo.io/t/<ORGANIZATION>/oauth2/userinfo';
    const result: User = await getUserInfo({url});

    expect(result).toEqual({
      id: 'test-id',
      name: 'Test User',
      email: 'test@example.com',
    });
  });

  it('should throw AsgardeoAPIError on fetch failure', async (): Promise<void> => {
    const errorText: string = 'Failed to fetch';

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve(errorText),
      status: 400,
      statusText: 'Bad Request',
    });

    const url: string = 'https://api.asgardeo.io/t/<ORGANIZATION>/oauth2/userinfo';

    await expect(getUserInfo({url})).rejects.toThrow(AsgardeoAPIError);
    await expect(getUserInfo({url})).rejects.toThrow(`Failed to fetch user info: ${errorText}`);

    const error: AsgardeoAPIError = await getUserInfo({url}).catch(e => e);

    expect(error.code).toBe('getUserInfo-ResponseError-001');
    expect(error.name).toBe('AsgardeoAPIError');
  });

  it('should throw AsgardeoAPIError for invalid URL', async (): Promise<void> => {
    const invalidUrl: string = 'not-a-valid-url';

    await expect(getUserInfo({url: invalidUrl})).rejects.toThrow(AsgardeoAPIError);

    const error: AsgardeoAPIError = await getUserInfo({url: invalidUrl}).catch(e => e);

    expect(error.message).toBe('Invalid endpoint URL provided');
    expect(error.code).toBe('getUserInfo-ValidationError-001');
    expect(error.name).toBe('AsgardeoAPIError');
  });

  it('should throw AsgardeoAPIError for undefined URL', async (): Promise<void> => {
    await expect(getUserInfo({})).rejects.toThrow(AsgardeoAPIError);

    const error: AsgardeoAPIError = await getUserInfo({}).catch(e => e);

    expect(error.message).toBe('Invalid endpoint URL provided');
    expect(error.code).toBe('getUserInfo-ValidationError-001');
    expect(error.name).toBe('AsgardeoAPIError');
  });

  it('should throw AsgardeoAPIError for empty string URL', async (): Promise<void> => {
    await expect(getUserInfo({url: ''})).rejects.toThrow(AsgardeoAPIError);

    const error: AsgardeoAPIError = await getUserInfo({url: ''}).catch(e => e);

    expect(error.message).toBe('Invalid endpoint URL provided');
    expect(error.code).toBe('getUserInfo-ValidationError-001');
    expect(error.name).toBe('AsgardeoAPIError');
  });

  it('should handle network errors', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

    global.fetch = mockFetch;

    await expect(
      getUserInfo({
        url: 'https://api.asgardeo.io/t/test/oauth2/userinfo',
      }),
    ).rejects.toThrow(AsgardeoAPIError);
    await expect(
      getUserInfo({
        url: 'https://api.asgardeo.io/t/test/oauth2/userinfo',
      }),
    ).rejects.toThrow('Network or parsing error: Network error');
  });

  it('should handle non-Error rejections', async (): Promise<void> => {
    global.fetch = vi.fn().mockRejectedValue('unexpected failure');

    const url: string = 'https://api.asgardeo.io/t/dxlab';

    await expect(getUserInfo({url})).rejects.toThrow(AsgardeoAPIError);
    await expect(getUserInfo({url})).rejects.toThrow('Network or parsing error: Unknown error');
  });

  it('should pass through custom headers', async () => {
    const mockUserInfo: User = {
      id: 'test-id',
      name: 'Test User',
      email: 'test@example.com',
      roles: ['user'],
      groups: ['group1'],
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUserInfo),
    });
    global.fetch = mockFetch;
    const customHeaders = {
      Authorization: 'Bearer token',
      'X-Custom-Header': 'custom-value',
    };
    const url: string = 'https://api.asgardeo.io/t/<ORGANIZATION>/oauth2/userinfo';
    const result: User = await getUserInfo({url, headers: customHeaders});

    expect(result).toEqual(mockUserInfo);
    expect(mockFetch).toHaveBeenCalledWith(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...customHeaders,
      },
    });
  });
});
