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

import {useEffect, useState} from 'react';

/**
 * Direction type for document layout.
 */
export type Direction = 'ltr' | 'rtl';

/**
 * Return type for useRTL hook.
 */
export interface UseRTLReturn {
  /**
   * Whether the current direction is RTL.
   */
  isRTL: boolean;
  /**
   * The current direction.
   */
  direction: Direction;
}

/**
 * Custom hook for RTL (Right-to-Left) language detection.
 * 
 * @returns An object containing RTL state and direction.
 * 
 * @example
 * ```tsx
 * const {isRTL, direction} = useRTL();
 * 
 * return (
 *   <div style={{textAlign: isRTL ? 'right' : 'left'}}>
 *     Current direction: {direction}
 *   </div>
 * );
 * ```
 */
export const useRTL = (): UseRTLReturn => {
  const [isRTL, setIsRTL] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>('ltr');

  useEffect(() => {
    const checkRTL = (): void => {
      const htmlDir = document.documentElement.dir;
      const bodyDir = document.body.dir;
      const computedDir = window.getComputedStyle(document.documentElement).direction;
      
      const isRightToLeft = 
        htmlDir === 'rtl' || 
        bodyDir === 'rtl' || 
        computedDir === 'rtl';
      
      setIsRTL(isRightToLeft);
      setDirection(isRightToLeft ? 'rtl' : 'ltr');
    };

    // Initial check
    checkRTL();

    // Observe changes to dir attribute
    const observer = new MutationObserver(checkRTL);
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir']
    });
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['dir']
    });

    return () => observer.disconnect();
  }, []);

  return {isRTL, direction};
};

/**
 * Utility function to get logical CSS property based on direction.
 * 
 * @param ltrProp - The LTR property name.
 * @param rtlProp - The RTL property name.
 * @param isRTL - Whether RTL is enabled.
 * @returns The appropriate property name.
 * 
 * @example
 * ```tsx
 * const property = getLogicalProperty('margin-left', 'margin-right', isRTL);
 * ```
 */
export const getLogicalProperty = (
  ltrProp: string,
  rtlProp: string,
  isRTL: boolean
): string => {
  return isRTL ? rtlProp : ltrProp;
};

/**
 * Utility function to flip horizontal values for RTL.
 * 
 * @param value - The value to potentially flip ('left' | 'right').
 * @param isRTL - Whether RTL is enabled.
 * @returns The appropriate value.
 * 
 * @example
 * ```tsx
 * const alignment = flipHorizontal('left', isRTL);
 * ```
 */
export const flipHorizontal = (
  value: 'left' | 'right',
  isRTL: boolean
): 'left' | 'right' => {
  if (!isRTL) return value;
  return value === 'left' ? 'right' : 'left';
};