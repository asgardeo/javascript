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

import { AccountInterface, PushAuthenticationDataStorageInterface, StorageDataInterface, UserPreferenceInterface } from "../models/storage";

/**
 * Class containing type conversion utility methods.
 */
class TypeConvert {
  private static isStorageDataType(data: unknown): data is StorageDataInterface {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return false;
    }

    return true;
  }

  /**
   * Converts the given data to a StorageDataInterface.
   *
   * @param data - Data to be converted to StorageDataInterface.
   * @returns The converted StorageDataInterface.
   * @throws Error if the data is not a valid StorageDataInterface.
   */
  static toStorageDataInterface(data: unknown): StorageDataInterface {
    if (!this.isStorageDataType(data)) {
      throw new Error("Invalid storage data");
    }

    return data;
  }

  /**
   * Checks if the given data is of type AccountInterface.
   *
   * @param data - Data to be checked.
   * @returns True if the data is of type AccountInterface, false otherwise.
   */
  private static isAccountInterfaceType(data: unknown): data is AccountInterface {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return false;
    }

    if (!('id' in data) || !('displayName' in data) || !('username' in data)) {
      return false;
    }

    return true;
  }

  /**
   * Converts the given data to an AccountInterface.
   *
   * @param data - Data to be converted to AccountInterface.
   * @returns The converted AccountInterface.
   * @throws Error if the data is not a valid AccountInterface.
   */
  static toAccountInterface(data: unknown): AccountInterface {
    if (!this.isAccountInterfaceType(data)) {
      throw new Error("Invalid account data");
    }

    return data;
  }

  /**
   * Checks if the given data is of type PushAuthenticationDataStorageInterface.
   *
   * @param data - Data to be checked.
   * @returns True if the data is of type PushAuthenticationDataStorageInterface, false otherwise.
   */
  static isPushAuthenticationDataStorageInterfaceType(data: unknown): data is PushAuthenticationDataStorageInterface {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return false;
    }

    if (!('applicationName' in data) || !('status' in data) || !('respondedTime' in data)) {
      return false;
    }

    return true;
  }

  /**
   * Converts the given data to a PushAuthenticationDataStorageInterface.
   *
   * @param data - Data to be converted to PushAuthenticationDataStorageInterface.
   * @returns The converted PushAuthenticationDataStorageInterface.
   */
  static toPushAuthenticationDataStorageInterface(data: unknown): PushAuthenticationDataStorageInterface {
    if (!this.isPushAuthenticationDataStorageInterfaceType(data)) {
      throw new Error("Invalid push authentication data");
    }

    return data;
  }

  /**
   * Checks if the given data is of type UserPreferenceInterface.
   *
   * @param data - Data to be checked.
   * @returns True if the data is of type UserPreferenceInterface, false otherwise.
   */
  static isUserPreferenceInterfaceType(data: unknown): data is UserPreferenceInterface {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return false;
    }

    return true;
  }

  /**
   * Converts the given data to a UserPreferenceInterface.
   *
   * @param data - Data to be converted to UserPreferenceInterface.
   * @returns The converted UserPreferenceInterface.
   * @throws Error if the data is not a valid UserPreferenceInterface.
   */
  static toUserPreferenceInterface(data: unknown): UserPreferenceInterface {
    if (!this.isUserPreferenceInterfaceType(data)) {
      throw new Error("Invalid user preference data");
    }

    return data;
  }
}

export default TypeConvert;
