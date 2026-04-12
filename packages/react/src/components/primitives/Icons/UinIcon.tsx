/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
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

import {FC} from 'react';

export interface UinIconProps {
  /** Color of the icon stroke */
  color?: string;
  /** Icon size in pixels */
  size?: number;
}

/**
 * UinIcon — ID card with photo and text lines, used for UIN login type.
 */
const UinIcon: FC<UinIconProps> = ({color = 'currentColor', size = 24}: UinIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <circle cx="8" cy="12" r="2" />
    <path d="M13 12h3" />
    <path d="M13 16h3" />
    <path d="M8 16h.01" />
  </svg>
);

UinIcon.displayName = 'UinIcon';

export default UinIcon;
