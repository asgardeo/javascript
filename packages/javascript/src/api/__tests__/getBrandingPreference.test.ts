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
import getBrandingPreference from '../getBrandingPreference';
import {BrandingPreference} from '../../models/branding-preference';
import AsgardeoAPIError from '../../errors/AsgardeoAPIError';

describe('getBrandingPreference', (): void => {
  beforeEach((): void => {
    vi.resetAllMocks();
  });

  it('should fetch branding preference successfully', async (): Promise<void> => {
    const mockBrandingPreference: BrandingPreference = {
      type: 'ORG',
      name: 'dxlab',
      locale: 'en-US',
      preference: {
        configs: {
          isBrandingEnabled: true,
          removeDefaultBranding: false,
        },
        layout: {
          activeLayout: 'centered',
        },
        organizationDetails: {
          displayName: '',
          supportEmail: '',
        },
        theme: {
          activeTheme: 'DARK',
          LIGHT: {
            buttons: {
              primary: {
                base: {
                  border: {
                    borderRadius: '22px',
                  },
                  font: {
                    color: '#ffffffe6',
                  },
                },
              },
            },
            colors: {
              primary: {
                main: '#FF7300',
              },
              secondary: {
                main: '#E0E1E2',
              },
            },
          },
          DARK: {
            buttons: {
              primary: {
                base: {
                  border: {
                    borderRadius: '22px',
                  },
                  font: {
                    color: '#ffffff',
                  },
                },
              },
            },
            colors: {
              primary: {
                main: '#FF7300',
              },
              secondary: {
                main: '#E0E1E2',
              },
            },
          },
        },
        urls: {
          selfSignUpURL: 'https://localhost:5173/signup',
        },
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBrandingPreference),
    });

    const baseUrl: string = 'https://api.asgardeo.io/t/dxlab';
    const result: BrandingPreference = await getBrandingPreference({baseUrl});

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/api/server/v1/branding-preference/resolve`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    expect(result).toEqual(mockBrandingPreference);
  });

  it('should fetch branding preference with query parameters', async (): Promise<void> => {
    const mockBrandingPreference: BrandingPreference = {
      type: 'ORG',
      name: 'custom',
      locale: 'en-US',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBrandingPreference),
    });

    const baseUrl: string = 'https://api.asgardeo.io/t/dxlab';
    await getBrandingPreference({
      baseUrl,
      locale: 'en-US',
      name: 'custom',
      type: 'org',
    });

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/api/server/v1/branding-preference/resolve?locale=en-US&name=custom&type=org`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );
  });

  it('should handle custom fetcher', async (): Promise<void> => {
    const mockBrandingPreference: BrandingPreference = {
      type: 'ORG',
      name: 'default',
    };

    const customFetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBrandingPreference),
    });

    const baseUrl: string = 'https://api.asgardeo.io/t/dxlab';
    await getBrandingPreference({baseUrl, fetcher: customFetcher});

    expect(customFetcher).toHaveBeenCalledWith(`${baseUrl}/api/server/v1/branding-preference/resolve`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  });

  it('should handle errors thrown directly by custom fetcher', async (): Promise<void> => {
    const customFetcher = vi.fn().mockImplementation(() => {
      throw new Error('Custom fetcher failure');
    });

    const baseUrl: string = 'https://api.asgardeo.io/t/dxlab';

    await expect(getBrandingPreference({baseUrl, fetcher: customFetcher})).rejects.toThrow(AsgardeoAPIError);
    await expect(getBrandingPreference({baseUrl, fetcher: customFetcher})).rejects.toThrow(
      'Network or parsing error: Custom fetcher failure',
    );
  });

  it('should handle invalid base URL', async (): Promise<void> => {
    const invalidUrl: string = 'invalid-url';

    await expect(getBrandingPreference({baseUrl: invalidUrl})).rejects.toThrow(AsgardeoAPIError);
    await expect(getBrandingPreference({baseUrl: invalidUrl})).rejects.toThrow('Invalid base URL provided.');
  });

  it('should throw AsgardeoAPIError for undefined baseUrl', async (): Promise<void> => {
    await expect(getBrandingPreference({} as any)).rejects.toThrow(AsgardeoAPIError);
    await expect(getBrandingPreference({} as any)).rejects.toThrow('Invalid base URL provided.');
  });

  it('should throw AsgardeoAPIError for empty string baseUrl', async (): Promise<void> => {
    await expect(getBrandingPreference({baseUrl: ''})).rejects.toThrow(AsgardeoAPIError);
    await expect(getBrandingPreference({baseUrl: ''})).rejects.toThrow('Invalid base URL provided.');
  });

  it('should handle HTTP error responses', async (): Promise<void> => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: () => Promise.resolve('Branding preference not found'),
    });

    const baseUrl: string = 'https://api.asgardeo.io/t/dxlab';

    await expect(getBrandingPreference({baseUrl})).rejects.toThrow(AsgardeoAPIError);
    await expect(getBrandingPreference({baseUrl})).rejects.toThrow(
      'Failed to get branding preference: Branding preference not found',
    );
  });

  it('should handle network errors', async (): Promise<void> => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const baseUrl: string = 'https://api.asgardeo.io/t/dxlab';

    await expect(getBrandingPreference({baseUrl})).rejects.toThrow(AsgardeoAPIError);
    await expect(getBrandingPreference({baseUrl})).rejects.toThrow('Network or parsing error: Network error');
  });

  it('should handle non-Error rejections', async (): Promise<void> => {
    global.fetch = vi.fn().mockRejectedValue('unexpected failure');

    const baseUrl: string = 'https://api.asgardeo.io/t/dxlab';

    await expect(getBrandingPreference({baseUrl})).rejects.toThrow(AsgardeoAPIError);
    await expect(getBrandingPreference({baseUrl})).rejects.toThrow('Network or parsing error: Unknown error');
  });

  it('should pass through custom headers', async (): Promise<void> => {
    const mockBrandingPreference: BrandingPreference = {
      type: 'ORG',
      name: 'default',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBrandingPreference),
    });

    const baseUrl: string = 'https://api.asgardeo.io/t/dxlab';
    const customHeaders = {
      Authorization: 'Bearer token',
      'X-Custom-Header': 'custom-value',
    };

    await getBrandingPreference({
      baseUrl,
      headers: customHeaders,
    });

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/api/server/v1/branding-preference/resolve`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer token',
        'X-Custom-Header': 'custom-value',
      },
    });
  });
});
