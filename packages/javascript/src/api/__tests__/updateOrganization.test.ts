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
import updateOrganization, {createPatchOperations} from '../updateOrganization';
import AsgardeoAPIError from '../../errors/AsgardeoAPIError';
import type {OrganizationDetails} from '../getOrganization';

describe('updateOrganization', (): void => {
  const baseUrl = 'https://api.asgardeo.io/t/demo';
  const organizationId = '0d5e071b-d3d3-475d-b3c6-1a20ee2fa9b1';

  beforeEach((): void => {
    vi.resetAllMocks();
  });

  it('should update organization successfully with default fetch', async (): Promise<void> => {
    const mockOrg: OrganizationDetails = {
      id: organizationId,
      name: 'Updated Name',
      orgHandle: 'demo',
      description: 'Updated',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOrg),
    });

    const operations = [
      {operation: 'REPLACE' as const, path: '/name', value: 'Updated Name'},
      {operation: 'REPLACE' as const, path: '/description', value: 'Updated'},
    ];

    const result = await updateOrganization({baseUrl, organizationId, operations});

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/api/server/v1/organizations/${organizationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(operations),
    });
    expect(result).toEqual(mockOrg);
  });

  it('should use custom fetcher when provided', async (): Promise<void> => {
    const mockOrg: OrganizationDetails = {
      id: organizationId,
      name: 'Custom',
      orgHandle: 'custom',
    };

    const customFetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOrg),
    });

    const operations = [{operation: 'REPLACE' as const, path: '/name', value: 'Custom'}];

    const result = await updateOrganization({
      baseUrl,
      organizationId,
      operations,
      fetcher: customFetcher,
    });

    expect(result).toEqual(mockOrg);
    expect(customFetcher).toHaveBeenCalledWith(
      `${baseUrl}/api/server/v1/organizations/${organizationId}`,
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify(operations),
      }),
    );
  });

  it('should handle errors thrown directly by custom fetcher', async (): Promise<void> => {
    const customFetcher = vi.fn().mockImplementation(() => {
      throw new Error('Custom fetcher failure');
    });

    const operations = [{operation: 'REPLACE' as const, path: '/name', value: 'X'}];

    await expect(updateOrganization({baseUrl, organizationId, operations, fetcher: customFetcher})).rejects.toThrow(
      'Network or parsing error: Custom fetcher failure',
    );
  });

  it('should throw AsgardeoAPIError for invalid base URL', async (): Promise<void> => {
    const operations = [{operation: 'REPLACE' as const, path: '/name', value: 'X'}];

    await expect(updateOrganization({baseUrl: 'invalid-url' as any, organizationId, operations})).rejects.toThrow(
      AsgardeoAPIError,
    );

    await expect(updateOrganization({baseUrl: 'invalid-url' as any, organizationId, operations})).rejects.toThrow(
      'Invalid base URL provided.',
    );
  });

  it('should throw AsgardeoAPIError for undefined baseUrl', async (): Promise<void> => {
    const operations = [{operation: 'REPLACE' as const, path: '/name', value: 'X'}];

    await expect(updateOrganization({baseUrl: undefined as any, organizationId, operations})).rejects.toThrow(
      AsgardeoAPIError,
    );
    await expect(updateOrganization({baseUrl: undefined as any, organizationId, operations})).rejects.toThrow(
      'Invalid base URL provided.',
    );
  });

  it('should throw AsgardeoAPIError for empty string baseUrl', async (): Promise<void> => {
    const operations = [{operation: 'REPLACE' as const, path: '/name', value: 'X'}];

    await expect(updateOrganization({baseUrl: '', organizationId, operations})).rejects.toThrow(AsgardeoAPIError);
    await expect(updateOrganization({baseUrl: '', organizationId, operations})).rejects.toThrow(
      'Invalid base URL provided.',
    );
  });

  it('should throw AsgardeoAPIError when organizationId is missing', async (): Promise<void> => {
    const operations = [{operation: 'REPLACE' as const, path: '/name', value: 'X'}];

    await expect(updateOrganization({baseUrl, organizationId: '' as any, operations})).rejects.toThrow(
      AsgardeoAPIError,
    );
    await expect(updateOrganization({baseUrl, organizationId: '' as any, operations})).rejects.toThrow(
      'Organization ID is required',
    );
  });

  it('should throw AsgardeoAPIError when operations is missing/empty', async (): Promise<void> => {
    await expect(updateOrganization({baseUrl, organizationId, operations: undefined as any})).rejects.toThrow(
      'Operations array is required and cannot be empty',
    );

    await expect(updateOrganization({baseUrl, organizationId, operations: []})).rejects.toThrow(
      'Operations array is required and cannot be empty',
    );

    await expect(updateOrganization({baseUrl, organizationId, operations: 'not-array' as any})).rejects.toThrow(
      'Operations array is required and cannot be empty',
    );
  });

  it('should handle HTTP error responses', async (): Promise<void> => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: () => Promise.resolve('Invalid operations'),
    });

    const operations = [{operation: 'REPLACE' as const, path: '/name', value: 'X'}];

    await expect(updateOrganization({baseUrl, organizationId, operations})).rejects.toThrow(AsgardeoAPIError);
    await expect(updateOrganization({baseUrl, organizationId, operations})).rejects.toThrow(
      'Failed to update organization: Invalid operations',
    );
  });

  it('should handle network or parsing errors', async (): Promise<void> => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const operations = [{operation: 'REPLACE' as const, path: '/name', value: 'X'}];

    await expect(updateOrganization({baseUrl, organizationId, operations})).rejects.toThrow(AsgardeoAPIError);
    await expect(updateOrganization({baseUrl, organizationId, operations})).rejects.toThrow(
      'Network or parsing error: Network error',
    );
  });

  it('should handle non-Error rejections', async (): Promise<void> => {
    global.fetch = vi.fn().mockRejectedValue('unexpected failure');

    const operations = [{operation: 'REPLACE' as const, path: '/name', value: 'X'}];

    await expect(updateOrganization({baseUrl, organizationId, operations})).rejects.toThrow(
      'Network or parsing error: Unknown error',
    );
  });

  it('should include custom headers when provided', async (): Promise<void> => {
    const mockOrg: OrganizationDetails = {
      id: organizationId,
      name: 'Header Org',
      orgHandle: 'header-org',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOrg),
    });

    const operations = [{operation: 'REPLACE' as const, path: '/name', value: 'Header Org'}];

    const customHeaders = {
      Authorization: 'Bearer token',
      'X-Custom-Header': 'custom-value',
    };

    await updateOrganization({
      baseUrl,
      organizationId,
      operations,
      headers: customHeaders,
    });

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/api/server/v1/organizations/${organizationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer token',
        'X-Custom-Header': 'custom-value',
      },
      body: JSON.stringify(operations),
    });
  });

  it('should always use HTTP PATCH even if a different method is passed in requestConfig', async (): Promise<void> => {
    const mockOrg: OrganizationDetails = {id: organizationId, name: 'A', orgHandle: 'a'};

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOrg),
    });

    const operations = [{operation: 'REPLACE' as const, path: '/name', value: 'A'}];

    await updateOrganization({
      baseUrl,
      organizationId,
      operations,
      method: 'PUT',
    });

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/api/server/v1/organizations/${organizationId}`,
      expect.objectContaining({method: 'PATCH'}),
    );
  });

  it('should send the exact operations array as body (no mutation)', async (): Promise<void> => {
    const mockOrg: OrganizationDetails = {id: organizationId, name: 'B', orgHandle: 'b'};

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOrg),
    });

    const operations = [
      {operation: 'REPLACE' as const, path: 'name', value: 'B'},
      {operation: 'REMOVE' as const, path: 'description'},
    ];

    await updateOrganization({baseUrl, organizationId, operations});

    const [, init] = (fetch as any).mock.calls[0];
    expect(JSON.parse(init.body)).toEqual(operations);
  });
});

describe('createPatchOperations', (): void => {
  it('should generate REPLACE for non-empty values and REMOVE for empty', (): void => {
    const payload = {
      name: 'Updated Organization',
      description: '',
      note: null,
      extra: 'value',
    };

    const ops = createPatchOperations(payload);

    expect(ops).toEqual(
      expect.arrayContaining([
        {operation: 'REPLACE', path: '/name', value: 'Updated Organization'},
        {operation: 'REPLACE', path: '/extra', value: 'value'},
        {operation: 'REMOVE', path: '/description'},
        {operation: 'REMOVE', path: '/note'},
      ]),
    );
  });

  it('should prefix all paths with a slash', (): void => {
    const ops = createPatchOperations({title: 'A', summary: ''});

    expect(ops.find(o => o.path === '/title')).toBeDefined();
    expect(ops.find(o => o.path === '/summary')).toBeDefined();
  });

  it('should handle undefined payload values as REMOVE', (): void => {
    const ops = createPatchOperations({something: undefined});

    expect(ops).toEqual([{operation: 'REMOVE', path: '/something'}]);
  });
});
