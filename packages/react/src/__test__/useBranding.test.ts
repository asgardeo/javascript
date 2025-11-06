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

import {renderHook} from '@testing-library/react';
import useBranding from '../hooks/useBranding';
import {vi, describe, it, expect, afterEach} from 'vitest';

// Mock the context and make default export a vi.fn()
vi.mock('../contexts/Branding/useBrandingContext', () => {
  return {default: vi.fn()};
});

// Import the mocked function
import useBrandingContext from '../contexts/Branding/useBrandingContext';

describe('useBranding hook', () => {
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns values from context when available', () => {
    const mockReturn = {
      brandingPreference: {name: 'TestBrand'},
      theme: {colors: {primary: {main: '#000'}}},
      activeTheme: 'light',
      isLoading: false,
      error: null,
      fetchBranding: vi.fn(),
      refetch: vi.fn(),
    };

    (useBrandingContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockReturn);

    const {result} = renderHook(() => useBranding());

    expect(result.current.brandingPreference).toEqual(mockReturn.brandingPreference);
    expect(result.current.theme).toEqual(mockReturn.theme);
    expect(result.current.activeTheme).toBe('light');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.fetchBranding).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });

  it('returns default values when context is missing', async () => {
    (useBrandingContext as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Provider missing');
    });

    const {result} = renderHook(() => useBranding());

    expect(result.current.brandingPreference).toBeNull();
    expect(result.current.theme).toBeNull();
    expect(result.current.activeTheme).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);

    await expect(result.current.fetchBranding()).resolves.toBeUndefined();
    await expect(result.current.refetch()).resolves.toBeUndefined();

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('useBranding: BrandingProvider not available'));
  });

  it('accepts a config object without breaking', () => {
    (useBrandingContext as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Provider missing');
    });

    const {result} = renderHook(() => useBranding({locale: 'en', autoFetch: true}));

    expect(result.current.brandingPreference).toBeNull();
    expect(result.current.theme).toBeNull();
    expect(result.current.activeTheme).toBeNull();
  });
});
