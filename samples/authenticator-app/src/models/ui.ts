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

/**
 * Class containing avatar related constants.
 */
export interface AvatarColorPair {
  /**
   * Background color of the avatar.
   */
  bg: string;
  /**
   * Text color of the avatar.
   */
  text: string;
}

/**
 * Interface representing the UI configuration.
 */
export interface UIConfig {
  theme: Theme;
}

/**
 * Interface representing the theme structure.
 */
export interface Theme {
  activeTheme: ThemeMode;
  light: ThemeConfigs;
  dark: ThemeConfigs;
}

/**
 * Interface representing theme configurations.
 */
export interface ThemeConfigs {
  colors: {
    screen: {
      background: string;
    },
    overlay: {
      background: string;
      text: string;
    },
    header: {
      background: string;
      text: string;
      icon: string;
    },
    button: {
      primary: {
        background: string;
        text: string;
      },
      secondary: {
        background: string;
        text: string;
      }
    },
    typography: {
      primary: string;
      secondary: string;
    },
    card: {
      background: string;
      border: string;
    },
    alert: {
      success: {
        background: string,
        text: string
      },
      error: {
        background: string,
        text: string
      },
      info: {
        background: string,
        text: string
      },
      warning: {
        background: string,
        text: string
      },
      loading: {
        background: string,
        text: string
      }
    },
    avatar: AvatarColorPair[]
  }
}

/**
 * Enum for theme modes.
 */
export enum ThemeMode {
  LIGHT = "light",
  DARK = "dark"
}
