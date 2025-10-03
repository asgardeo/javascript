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

import UIConstants from "../constants/ui";
import { AvatarColorPair, DeploymentConfig, ThemeConfigs, ThemeMode } from "../models/ui";
import rawConfig from "../../config/deployment.config.json";

const config: DeploymentConfig = rawConfig as DeploymentConfig;

/**
 * Get avatar colors based on the provided name.
 *
 * @param name Name for which to get avatar colors.
 * @returns AvatarColorPair containing background and text colors.
 */
export const getAvatarColors = (name: string): AvatarColorPair => {
  let hash: number = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index: number = Math.abs(hash) % UIConstants.AVATAR_COLORS.length;

  return UIConstants.AVATAR_COLORS[index];
};

/**
 * Generate initials from a given name.
 *
 * @param name Name to generate initials from.
 * @returns Initials generated from the name.
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Convert a timestamp to a human-readable "time ago" format.
 *
 * @param timestamp - The timestamp to convert.
 * @returns A human-readable string representing the time elapsed since the timestamp.
 */
export const getTimeFromNow = (timestamp: number): string => {
  const now: number = Date.now();
  const diffInSeconds: number = Math.floor((now - timestamp) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes: number = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours: number = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days: number = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  return new Date(timestamp).toLocaleDateString();
};

/**
 * Get the theme configurations based on the active theme.
 *
 * @returns The theme configurations based on the active theme.
 */
export const getThemeConfigs = (): ThemeConfigs => {
  const activeTheme: ThemeMode = config.ui.theme.activeTheme;

  return config.ui.theme[activeTheme];
};
