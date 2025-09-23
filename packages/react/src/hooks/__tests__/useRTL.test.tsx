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

import {act, renderHook} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {flipHorizontal, getLogicalProperty, useRTL} from '../useRTL';

describe('useRTL', () => {
  let originalDir: string;

  beforeEach(() => {
    originalDir = document.documentElement.dir;
  });

  afterEach(() => {
    document.documentElement.dir = originalDir;
    document.body.dir = '';
  });

  it('should detect LTR direction by default', () => {
    const {result} = renderHook(() => useRTL());
    
    expect(result.current.isRTL).toBe(false);
    expect(result.current.direction).toBe('ltr');
  });

  it('should detect RTL direction when set on documentElement', () => {
    document.documentElement.dir = 'rtl';
    const {result} = renderHook(() => useRTL());
    
    expect(result.current.isRTL).toBe(true);
    expect(result.current.direction).toBe('rtl');
  });

  it('should detect RTL direction when set on body', () => {
    document.body.dir = 'rtl';
    const {result} = renderHook(() => useRTL());
    
    expect(result.current.isRTL).toBe(true);
    expect(result.current.direction).toBe('rtl');
  });

  it('should update when direction changes', async () => {
    const {rerender, result} = renderHook(() => useRTL());
    
    expect(result.current.isRTL).toBe(false);
    
    await act(async () => {
      document.documentElement.dir = 'rtl';
      // Trigger mutation observer
      const event = new MutationEvent('DOMAttrModified', {
        bubbles: true,
        cancelable: false,
      });
      document.documentElement.dispatchEvent(event);
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    rerender();
    expect(result.current.isRTL).toBe(true);
    expect(result.current.direction).toBe('rtl');
  });
});

describe('getLogicalProperty', () => {
  it('should return LTR property when isRTL is false', () => {
    expect(getLogicalProperty('left', 'right', false)).toBe('left');
    expect(getLogicalProperty('margin-left', 'margin-right', false)).toBe('margin-left');
  });

  it('should return RTL property when isRTL is true', () => {
    expect(getLogicalProperty('left', 'right', true)).toBe('right');
    expect(getLogicalProperty('margin-left', 'margin-right', true)).toBe('margin-right');
  });
});

describe('flipHorizontal', () => {
  it('should not flip values when isRTL is false', () => {
    expect(flipHorizontal('left', false)).toBe('left');
    expect(flipHorizontal('right', false)).toBe('right');
  });

  it('should flip values when isRTL is true', () => {
    expect(flipHorizontal('left', true)).toBe('right');
    expect(flipHorizontal('right', true)).toBe('left');
  });
});