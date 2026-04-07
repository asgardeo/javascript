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

export interface VidIconProps {
  /** Color of the icon stroke */
  color?: string;
  /** Icon size in pixels */
  size?: number;
}

/**
 * VidIcon — card with PIN-hole dots, used for VID login type.
 */
const VidIcon: FC<VidIconProps> = ({color = 'currentColor', size = 24}: VidIconProps) => (
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
    <rect width="20" height="12" x="2" y="6" rx="2" />
    <path d="M7 12h.01" />
    <path d="M9 12h.01" />
    <path d="M11 12h.01" />
    <path d="M13 12h.01" />
    <path d="M15 12h.01" />
    <path d="M17 12h.01" />
  </svg>
);

VidIcon.displayName = 'VidIcon';

export default VidIcon;
