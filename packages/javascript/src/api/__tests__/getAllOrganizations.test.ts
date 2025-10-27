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
import getAllOrganizations from '../getAllOrganizations';
import AsgardeoAPIError from '../../errors/AsgardeoAPIError';
import {AllOrganizationsApiResponse} from '../../models/organization';

describe('getAllOrganizations', (): void => {
  beforeEach((): void => {
    vi.resetAllMocks();
  });

  it('should fetch all organizations successfully with default fetch', async (): Promise<void> => {
    const mockResponse: AllOrganizationsApiResponse = {
      hasMore: false,
      nextCursor: null,
      totalCount: 2,
      organizations: [
        {id: 'org1', name: 'Org One', orgHandle: 'org-one'},
        {id: 'org2', name: 'Org Two', orgHandle: 'org-two'},
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    const result = await getAllOrganizations({baseUrl});

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/api/server/v1/organizations?limit=10&recursive=false`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    expect(result).toEqual(mockResponse);
  });

  it('should append query parameters when provided', async (): Promise<void> => {
    const mockResponse: AllOrganizationsApiResponse = {
      hasMore: true,
      nextCursor: 'abc123',
      totalCount: 5,
      organizations: [],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    await getAllOrganizations({
      baseUrl,
      filter: 'type eq TENANT',
      limit: 20,
      recursive: true,
    });

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/api/server/v1/organizations?filter=type+eq+TENANT&limit=20&recursive=true`,
      expect.any(Object),
    );
  });

  it('should use custom fetcher when provided', async (): Promise<void> => {
    const mockResponse: AllOrganizationsApiResponse = {
      hasMore: false,
      nextCursor: null,
      totalCount: 1,
      organizations: [{id: 'org1', name: 'Custom Org', orgHandle: 'custom-org'}],
    };

    const customFetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    const result = await getAllOrganizations({baseUrl, fetcher: customFetcher});

    expect(result).toEqual(mockResponse);
    expect(customFetcher).toHaveBeenCalledWith(
      `${baseUrl}/api/server/v1/organizations?limit=10&recursive=false`,
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });

  it('should handle errors thrown directly by custom fetcher', async (): Promise<void> => {
    const customFetcher = vi.fn().mockImplementation(() => {
      throw new Error('Custom fetcher failure');
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';

    await expect(getAllOrganizations({baseUrl, fetcher: customFetcher})).rejects.toThrow(
      'Network or parsing error: Custom fetcher failure',
    );
  });

  it('should throw AsgardeoAPIError for invalid base URL', async (): Promise<void> => {
    await expect(getAllOrganizations({baseUrl: 'invalid-url'})).rejects.toThrow(AsgardeoAPIError);
    await expect(getAllOrganizations({baseUrl: 'invalid-url'})).rejects.toThrow('Invalid base URL provided.');
  });

  it('should throw AsgardeoAPIError for undefined baseUrl', async (): Promise<void> => {
    await expect(getAllOrganizations({baseUrl: undefined} as any)).rejects.toThrow(AsgardeoAPIError);
    await expect(getAllOrganizations({baseUrl: undefined} as any)).rejects.toThrow('Invalid base URL provided.');
  });

  it('should throw AsgardeoAPIError for empty string baseUrl', async (): Promise<void> => {
    await expect(getAllOrganizations({baseUrl: ''})).rejects.toThrow(AsgardeoAPIError);
    await expect(getAllOrganizations({baseUrl: ''})).rejects.toThrow('Invalid base URL provided.');
  });

  it('should handle HTTP error responses', async (): Promise<void> => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: () => Promise.resolve('Invalid query'),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';

    await expect(getAllOrganizations({baseUrl})).rejects.toThrow(AsgardeoAPIError);
    await expect(getAllOrganizations({baseUrl})).rejects.toThrow('Failed to get organizations: Invalid query');
  });

  it('should handle network or parsing errors', async (): Promise<void> => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const baseUrl = 'https://api.asgardeo.io/t/demo';

    await expect(getAllOrganizations({baseUrl})).rejects.toThrow(AsgardeoAPIError);
    await expect(getAllOrganizations({baseUrl})).rejects.toThrow('Network or parsing error: Network error');
  });

  it('should handle non-Error rejections', async (): Promise<void> => {
    global.fetch = vi.fn().mockRejectedValue('unexpected failure');

    const baseUrl = 'https://api.asgardeo.io/t/demo';

    await expect(getAllOrganizations({baseUrl})).rejects.toThrow('Network or parsing error: Unknown error');
  });

  it('should pass through custom headers (and enforces content-type & accept)', async (): Promise<void> => {
    const mockResponse: AllOrganizationsApiResponse = {
      hasMore: false,
      nextCursor: null,
      totalCount: 1,
      organizations: [],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    const customHeaders = {
      Authorization: 'Bearer token',
      'X-Custom-Header': 'custom-value',
      'Content-Type': 'text/plain',
      Accept: 'text/plain',
    };

    await getAllOrganizations({
      baseUrl,
      headers: customHeaders,
    });

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/api/server/v1/organizations?limit=10&recursive=false`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer token',
        'X-Custom-Header': 'custom-value',
      },
    });
  });

  it('should return an empty organization list if none exist', async (): Promise<void> => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          hasMore: false,
          nextCursor: null,
          totalCount: 0, // missing organizations
        }),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    const result = await getAllOrganizations({baseUrl});

    expect(result.organizations).toEqual([]);
    expect(result.totalCount).toBe(0);
  });
});
