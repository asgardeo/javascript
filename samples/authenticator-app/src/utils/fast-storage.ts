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

import { MMKV } from "react-native-mmkv";

const storage: MMKV = new MMKV();

/**
 * Fast storage utility class.
 * This uses mmkv storage for faster read/write operations.
 * This is better for frequently accessed data like theme and locale.
 */
class FastStorage {
  /**
   * Get an item from storage.
   *
   * @param key The key of the item to retrieve.
   * @returns The value of the item or null if not found.
   */
  static getItem(key: string): string | null {
    return storage.getString(key) ?? null;
  }

  /**
   * Set an item in storage.
   *
   * @param key The key of the item to set.
   * @param value The value of the item to set.
   */
  static setItem(key: string, value: string): void {
    storage.set(key, value);
  }

  /**
   * Remove an item from storage.
   *
   * @param key The key of the item to remove.
   */
  static removeItem(key: string): void {
    storage.delete(key);
  }
}

export default FastStorage;
