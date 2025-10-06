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

import { authenticateAsync, LocalAuthenticationResult } from "expo-local-authentication";
import StorageConstants from "../constants/storage"
import { UserPreferenceInterface } from "../models/storage";
import AsyncStorageService from "./async-storage-service"
import { getSecurityConfig } from "./core";
import TypeConvert from "./typer-convert";

/**
 * Verify local authentication.
 *
 * @param settings - Flag indicating if the verification is for the settings page.
 * @returns A promise that resolves to true if local authentication is successful or not required, false otherwise.
 */
const verifyLocalAuthentication = async (settings: boolean = false): Promise<boolean> => {
  try {
    // Check if the requested page is settings page.
    if (settings) {
      if (!getSecurityConfig().enableSettingsScreenLock) {
        return true;
      }
    } else {
      const userPreferences: UserPreferenceInterface = TypeConvert.toUserPreferenceInterface(
        await AsyncStorageService.getItem(StorageConstants.USER_PREFERENCE) ?? {});
      const appScreenLocksEnabledInAppConfig: boolean = getSecurityConfig().enableAppScreenLocks;

      if (userPreferences?.enableAppScreenLocks === false || !appScreenLocksEnabledInAppConfig) {
        return true;
      }
    }

    const status: LocalAuthenticationResult = await authenticateAsync();

    if (!status.success) {
      return false;
    }
  } catch (error) {
    console.error("Local authentication error:", error);
    return false;
  }

  return true;
}

export default verifyLocalAuthentication;
