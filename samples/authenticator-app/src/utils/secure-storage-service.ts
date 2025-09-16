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

import { getItem, setItem } from 'expo-secure-store';

/**
 * Secure Storage service for handling secure storage operations.
 */
class SecureStorageService {
  /**
   * Sets a value in secure storage.
   *
   * @param key The key to associate with the value.
   * @param value The value to store (This should be a single string).
   */
  static setItem(key: string, value: string): void {
    setItem(key, value);
  }

  /**
   * Retrieves a value from secure storage.
   *
   * @param key The key to retrieve the value.
   * @returns The stored value or null if not found.
   */
  static getItem(key: string): string | null {
    return getItem(key);
  }
}

export default SecureStorageService;
