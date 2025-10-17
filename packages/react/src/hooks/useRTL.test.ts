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

import {renderHook, waitFor} from '@testing-library/react';
import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import useRTL from './useRTL';

describe('useRTL', () => {
  beforeEach(() => {
    // Reset the dir attribute before each test
    document.documentElement.removeAttribute('dir');
  });

  afterEach(() => {
    // Clean up after each test
    document.documentElement.removeAttribute('dir');
  });

  it('should return LTR direction by default', () => {
    const {result} = renderHook(() => useRTL());

    expect(result.current.isRTL).toBe(false);
    expect(result.current.direction).toBe('ltr');
  });

  it('should detect RTL when dir attribute is set to rtl', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const {result} = renderHook(() => useRTL());

    expect(result.current.isRTL).toBe(true);
    expect(result.current.direction).toBe('rtl');
  });

  it('should detect LTR when dir attribute is explicitly set to ltr', () => {
    document.documentElement.setAttribute('dir', 'ltr');
    const {result} = renderHook(() => useRTL());

    expect(result.current.isRTL).toBe(false);
    expect(result.current.direction).toBe('ltr');
  });

  it('should update direction when dir attribute changes from LTR to RTL', async () => {
    document.documentElement.setAttribute('dir', 'ltr');
    const {result} = renderHook(() => useRTL());

    expect(result.current.direction).toBe('ltr');

    // Change to RTL
    document.documentElement.setAttribute('dir', 'rtl');

    await waitFor(() => {
      expect(result.current.isRTL).toBe(true);
      expect(result.current.direction).toBe('rtl');
    });
  });

  it('should update direction when dir attribute changes from RTL to LTR', async () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const {result} = renderHook(() => useRTL());

    expect(result.current.direction).toBe('rtl');

    // Change to LTR
    document.documentElement.setAttribute('dir', 'ltr');

    await waitFor(() => {
      expect(result.current.isRTL).toBe(false);
      expect(result.current.direction).toBe('ltr');
    });
  });

  it('should handle document.dir property', () => {
    document.dir = 'rtl';
    const {result} = renderHook(() => useRTL());

    expect(result.current.isRTL).toBe(true);
    expect(result.current.direction).toBe('rtl');

    // Clean up
    document.dir = '';
  });
});
