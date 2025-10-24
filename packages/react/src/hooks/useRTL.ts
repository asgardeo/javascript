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

import {useState, useEffect} from 'react';

export interface UseRTL {
  /**
   * Whether the current direction is Right-to-Left
   */
  isRTL: boolean;

  /**
   * The current text direction ('ltr' or 'rtl')
   */
  direction: 'ltr' | 'rtl';
}

/**
 * Hook for detecting Right-to-Left (RTL) text direction.
 * Checks the document's dir attribute and updates on changes.
 *
 * @returns An object containing RTL state and direction
 *
 * @example
 * ```tsx
 * const { isRTL, direction } = useRTL();
 *
 * return (
 *   <div style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}>
 *     {children}
 *   </div>
 * );
 * ```
 */
const useRTL = (): UseRTL => {
  const getDirection = (): 'ltr' | 'rtl' => {
    if (typeof document === 'undefined') {
      return 'ltr';
    }

    const dir = document.dir || document.documentElement.dir;
    return dir === 'rtl' ? 'rtl' : 'ltr';
  };

  const [direction, setDirection] = useState<'ltr' | 'rtl'>(getDirection);

  useEffect(() => {
    // Update direction if it changes
    const updateDirection = () => {
      setDirection(getDirection());
    };

    // Create a MutationObserver to watch for dir attribute changes
    const observer = new MutationObserver(updateDirection);

    // Observe the document element and html element for dir attribute changes
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['dir'],
      });
    }

    // Initial check
    updateDirection();

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    isRTL: direction === 'rtl',
    direction,
  };
};

export default useRTL;
