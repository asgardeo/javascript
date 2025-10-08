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

import { ThemeConfigs, ThemeMode } from "../models/ui";
import rawConfig from "../../config/app.config.json";
import { DeploymentConfig } from "../models/core";
import StorageConstants from "../constants/StorageConstants";
import FastStorage from "./FastStorage";
import { Appearance } from "react-native";

const config: DeploymentConfig = rawConfig as DeploymentConfig;

/**
 * Theme class to manage theme configurations.
 */
class Theme {
  private static instance: Theme;
  private configs: ThemeConfigs;

  /**
   * Initializes the Theme class by determining the active theme based on user preference or system settings.
   */
  private constructor() {
    const activeTheme: ThemeMode = config.ui.theme.activeTheme;
    let userPreference: ThemeMode | 'system';

    try {
      userPreference = FastStorage.getItem(StorageConstants.THEME_MODE) as ThemeMode ?? 'system';
    } catch {
      userPreference = 'system';
    }

    if (userPreference === 'system' && Appearance.getColorScheme()) {
      userPreference = Appearance.getColorScheme() === 'dark' ? ThemeMode.DARK : ThemeMode.LIGHT;
    }

    if (userPreference === 'system') {
      userPreference = activeTheme;
    }

    this.configs = config.ui.theme[userPreference];
  }

  /**
   * Get the singleton instance of the Theme class.
   *
   * @returns Initialized theme configurations.
   */
  public static getInstance(): Theme {
    if (!Theme.instance) {
      Theme.instance = new Theme();
    }
    return Theme.instance;
  }

  /**
   * Get the theme configurations.
   *
   * @returns The theme configurations.
   */
  public getConfigs(): ThemeConfigs {
    return this.configs;
  }
}

export default Theme;
