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

import { AvatarColorPair } from "../models/ui";

/**
 * Class containing UI related constants.
 */
class UIConstants {
  /**
   * Predefined set of background and text colors for avatars.
   */
  static readonly AVATAR_COLORS: AvatarColorPair[] = [
    { bg: '#FFB3B3', text: '#B91C1C' },
    { bg: '#B3E5FC', text: '#0369A1' },
    { bg: '#B3D9FF', text: '#1E40AF' },
    { bg: '#C8E6C9', text: '#166534' },
    { bg: '#FFF3B3', text: '#CA8A04' },
    { bg: '#FFD1FF', text: '#A21CAF' },
    { bg: '#B3D4FF', text: '#3730A3' },
    { bg: '#D1C4E9', text: '#6B21A8' },
    { bg: '#B3F5F5', text: '#0F766E' },
    { bg: '#FFDB9B', text: '#EA580C' },
    { bg: '#C8F7C5', text: '#15803D' },
    { bg: '#FFCAB0', text: '#DC2626' },
    { bg: '#C1E4FF', text: '#1D4ED8' },
    { bg: '#D1C4E9', text: '#7C3AED' },
    { bg: '#E1DFFF', text: '#5B21B6' },
    { bg: '#FFE1F3', text: '#BE185D' },
    { bg: '#FFCAB0', text: '#F97316' },
    { bg: '#B3F2E6', text: '#047857' },
    { bg: '#B3F5F5', text: '#0891B2' },
    { bg: '#E1DFFF', text: '#6366F1' }
  ];
}

export default UIConstants;
