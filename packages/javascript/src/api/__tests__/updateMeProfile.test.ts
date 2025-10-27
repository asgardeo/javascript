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
import updateMeProfile from '../updateMeProfile';
import AsgardeoAPIError from '../../errors/AsgardeoAPIError';
import type {User} from '../../models/user';

describe('updateMeProfile', (): void => {
  beforeEach((): void => {
    vi.resetAllMocks();
  });

  it('should update profile successfully using default fetch', async (): Promise<void> => {
    const mockUser: User = {
      id: 'u1',
      name: 'Alice',
      email: 'alice@example.com',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    const url = 'https://api.asgardeo.io/t/demo/scim2/Me';
    const payload = {'urn:scim:wso2:schema': {mobileNumbers: ['0777933830']}};

    const result = await updateMeProfile({url, payload});

    expect(fetch).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = (fetch as any).mock.calls[0];

    expect(calledUrl).toBe(url);
    expect(init.method).toBe('PATCH');
    expect(init.headers['Content-Type']).toBe('application/scim+json');
    expect(init.headers['Accept']).toBe('application/json');

    const parsed = JSON.parse(init.body);
    expect(parsed.schemas).toEqual(['urn:ietf:params:scim:api:messages:2.0:PatchOp']);
    expect(parsed.Operations).toEqual([{op: 'replace', value: payload}]);

    expect(result).toEqual(mockUser);
  });

  it('should fall back to baseUrl when url is not provided', async (): Promise<void> => {
    const mockUser: User = {
      id: 'u2',
      name: 'Bob',
      email: 'bob@example.com',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    const payload = {profile: {givenName: 'Bob'}};

    const result = await updateMeProfile({baseUrl, payload});

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/scim2/Me`, expect.any(Object));
    expect(result).toEqual(mockUser);
  });

  it('should use custom fetcher when provided', async (): Promise<void> => {
    const mockUser: User = {id: 'u3', name: 'Carol', email: 'carol@example.com'};

    const customFetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    const payload = {profile: {familyName: 'Doe'}};

    const result = await updateMeProfile({baseUrl, payload, fetcher: customFetcher});

    expect(result).toEqual(mockUser);
    expect(customFetcher).toHaveBeenCalledWith(
      `${baseUrl}/scim2/Me`,
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          'Content-Type': 'application/scim+json',
          Accept: 'application/json',
        }),
      }),
    );
  });

  it('should prefer url over baseUrl when both are provided', async (): Promise<void> => {
    const mockUser: User = {id: 'u4', name: 'Dan', email: 'dan@example.com'};
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    const url = 'https://api.asgardeo.io/t/demo/scim2/Me';
    const baseUrl = 'https://api.asgardeo.io/t/ignored';
    await updateMeProfile({url, baseUrl, payload: {x: 1}});

    expect(fetch).toHaveBeenCalledWith(url, expect.any(Object));
  });

  it('should throw AsgardeoAPIError for invalid URL or baseUrl', async (): Promise<void> => {
    await expect(updateMeProfile({url: 'not-a-valid-url' as any, payload: {}})).rejects.toThrow(AsgardeoAPIError);

    await expect(updateMeProfile({url: 'not-a-valid-url' as any, payload: {}})).rejects.toThrow(
      'Invalid URL provided.',
    );
  });

  it('should throw AsgardeoAPIError when both url and baseUrl are missing', async (): Promise<void> => {
    await expect(updateMeProfile({url: undefined as any, baseUrl: undefined as any, payload: {}})).rejects.toThrow(
      AsgardeoAPIError,
    );
  });

  it('should throw AsgardeoAPIError when both url and baseUrl are empty strings', async (): Promise<void> => {
    await expect(updateMeProfile({url: '', baseUrl: '', payload: {}})).rejects.toThrow(AsgardeoAPIError);
  });

  it('should handle HTTP error responses', async (): Promise<void> => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: () => Promise.resolve('SCIM validation failed'),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    await expect(updateMeProfile({baseUrl, payload: {bad: 'data'}})).rejects.toThrow(AsgardeoAPIError);

    await expect(updateMeProfile({baseUrl, payload: {bad: 'data'}})).rejects.toThrow(
      'Failed to update user profile: SCIM validation failed',
    );
  });

  it('should handle network or unknown errors with the generic message', async (): Promise<void> => {
    // Rejection with Error
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    await expect(updateMeProfile({url: 'https://api.asgardeo.io/t/demo/scim2/Me', payload: {a: 1}})).rejects.toThrow(
      AsgardeoAPIError,
    );
    await expect(updateMeProfile({url: 'https://api.asgardeo.io/t/demo/scim2/Me', payload: {a: 1}})).rejects.toThrow(
      'An error occurred while updating the user profile. Please try again.',
    );

    // Rejection with non-Error
    global.fetch = vi.fn().mockRejectedValue('weird failure');
    await expect(updateMeProfile({url: 'https://api.asgardeo.io/t/demo/scim2/Me', payload: {a: 1}})).rejects.toThrow(
      'An error occurred while updating the user profile. Please try again.',
    );
  });

  it('should pass through custom headers (and enforces content-type & accept)', async (): Promise<void> => {
    const mockUser: User = {id: 'u5', name: 'Eve', email: 'eve@example.com'};

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    const customHeaders = {
      Authorization: 'Bearer token',
      'X-Custom-Header': 'custom-value',
      'Content-Type': 'text/plain',
      Accept: 'text/plain',
    };

    await updateMeProfile({baseUrl, payload: {y: 2}, headers: customHeaders});

    const [, init] = (fetch as any).mock.calls[0];
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer token',
      'X-Custom-Header': 'custom-value',
      'Content-Type': 'application/scim+json',
      Accept: 'application/json',
    });
  });

  it('should build the SCIM PatchOp body correctly', async (): Promise<void> => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({} as User),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    const payload = {'urn:scim:wso2:schema': {mobileNumbers: ['123']}};

    await updateMeProfile({baseUrl, payload});

    const [, init] = (fetch as any).mock.calls[0];
    const body = JSON.parse(init.body);

    expect(body.schemas).toEqual(['urn:ietf:params:scim:api:messages:2.0:PatchOp']);
    expect(body.Operations).toHaveLength(1);
    expect(body.Operations[0]).toEqual({op: 'replace', value: payload});
  });

  it('should allow method override when provided in requestConfig', async (): Promise<void> => {
    // Note: due to `{ method: 'PATCH', ...requestConfig }` order, requestConfig.method overrides PATCH
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({} as User),
    });

    const baseUrl = 'https://api.asgardeo.io/t/demo';
    await updateMeProfile({baseUrl, payload: {z: 9}, method: 'PUT' as any});

    const [, init] = (fetch as any).mock.calls[0];
    expect(init.method).toBe('PUT');
  });
});
