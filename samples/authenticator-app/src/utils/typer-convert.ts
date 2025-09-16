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

import { StorageDataInterface } from "../models/storage";

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
}

export default TypeConvert;
