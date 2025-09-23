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

import {CSSProperties, FC, ReactElement} from 'react';
import {useRTL} from '../../../hooks/useRTL';

/**
 * Props interface for the DirectionalIcon component.
 */
export interface DirectionalIconProps {
  /**
   * The icon component to wrap.
   */
  children: ReactElement;
  /**
   * Whether to flip the icon horizontally in RTL mode.
   * @default false
   */
  flipInRTL?: boolean;
  /**
   * Whether to rotate the icon 180 degrees in RTL mode.
   * @default false
   */
  rotateInRTL?: boolean;
  /**
   * Additional style to apply to the wrapper.
   */
  style?: CSSProperties;
}

/**
 * Wrapper component for icons that need directional awareness in RTL layouts.
 * 
 * This component automatically flips or rotates icons based on the document's
 * direction (LTR or RTL), ensuring proper visual representation for users
 * of right-to-left languages.
 * 
 * @param props - Props for the DirectionalIcon component.
 * @returns The wrapped icon component with RTL support.
 * 
 * @example
 * ```tsx
 * // Flip a chevron icon in RTL mode
 * <DirectionalIcon flipInRTL>
 *   <ChevronRight />
 * </DirectionalIcon>
 * 
 * // Rotate an arrow icon in RTL mode
 * <DirectionalIcon rotateInRTL>
 *   <ArrowForward />
 * </DirectionalIcon>
 * ```
 */
const DirectionalIcon: FC<DirectionalIconProps> = ({
  children,
  flipInRTL = false,
  rotateInRTL = false,
  style = {}
}: DirectionalIconProps) => {
  const {isRTL} = useRTL();

  /**
   * Determine the appropriate transform based on RTL mode and props.
   * @returns The CSS transform string or empty string.
   */
  const getTransform = (): string => {
    if (!isRTL) return '';
    if (flipInRTL) return 'scaleX(-1)';
    if (rotateInRTL) return 'rotate(180deg)';
    return '';
  };

  const transform = getTransform();

  const iconStyle: CSSProperties = {
    ...style,
    ...(transform && {
      transform,
      display: 'inline-block'
    }),
    transition: 'transform 0.2s ease-in-out'
  };

  return (
    <span style={iconStyle}>
      {children}
    </span>
  );
};

DirectionalIcon.displayName = 'DirectionalIcon';

export default DirectionalIcon;