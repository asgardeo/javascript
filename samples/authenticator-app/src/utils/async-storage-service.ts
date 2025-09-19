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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageDataInterface } from '../models/storage';

/**
 * Async Storage service for handling plain text storage operations.
 */
class AsyncStorageService {
  /**
   * Sets a value in async storage.
   *
   * @param key The key to associate with the value.
   * @param value The value to store (This should be a single string).
   * @returns A promise that resolves when the item is set.
   */
  static async setItem(key: string, value: string): Promise<void> {
    return AsyncStorage.setItem(key, value);
  }

  /**
   * Retrieves a value from async storage.
   *
   * @param key The key to retrieve the value.
   * @returns A promise that resolves with the stored value or null if not found.
   */
  static async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  /**
   * Removes a value from async storage.
   *
   * @param key The key to remove the value.
   * @returns A promise that resolves when the item is removed.
   */
  static async removeItem(key: string): Promise<void> {
    return AsyncStorage.removeItem(key);
  }

  /**
   * Adds a value to async storage.
   *
   * @param key The key to associate with the value.
   * @param value The value to store (This should be a JSON object).
   * @returns A promise that resolves when the item is added.
   */
  static async addItem(key: string, value: StorageDataInterface, maxItems?: number): Promise<void> {
    const existingValue = await AsyncStorage.getItem(key);
    let newValue: StorageDataInterface[] = [];

    if (existingValue) {
      newValue = JSON.parse(existingValue);
    }

    if (maxItems && newValue.length === maxItems) {
      newValue = [value, ...newValue.slice(0, maxItems)];
    } else {
      newValue = [value, ...newValue];
    }

    return AsyncStorage.setItem(key, JSON.stringify(newValue));
  }

  /**
   * Lists all items in async storage.
   *
   * @param key The key to retrieve the values.
   * @returns A promise that resolves with an array of stored JSON objects.
   */
  static async listItems(key: string): Promise<StorageDataInterface[]> {
    const existingValue = await AsyncStorage.getItem(key);
    let items: StorageDataInterface[] = [];

    if (existingValue) {
      items = JSON.parse(existingValue);
    }

    return items;
  }

  /**
   * Retrieves a specific item from a list in async storage.
   * All matching items will be returned.
   *
   * @param key The key to retrieve the list.
   * @param itemKey The key of the item for searching.
   * @param itemValue The value of the item key for searching.
   * @param fallbackItemKey (Optional) If provided, both primary and fallback keys will be searched.
   * @param fallbackItemValue (Optional) If provided, both primary and fallback values will be searched.
   * @returns A promise that resolves with the found items or an empty array.
   */
  static async getListItemByItemKey(
    key: string, itemKey: string, itemValue: string, fallbackItemKey?: string, fallbackItemValue?: string
  ): Promise<StorageDataInterface[]> {
    return this.listItems(key).then((items: StorageDataInterface[]) => {
      return items.filter((item: StorageDataInterface) => new RegExp(itemValue).test(item[itemKey] as string)
        && (!fallbackItemKey || !fallbackItemValue || new RegExp(fallbackItemValue).test(item[fallbackItemKey] as string)));
    });
  }

  /**
   * Removes an item from a list in async storage.
   * Only the first matching item is removed.
   *
   * @param key The key to retrieve the list.
   * @param itemKey The key of the item for searching.
   * @param itemValue The value of the item key for searching.
   * @returns A promise that resolves when the item is removed.
   */
  static async removeListItemByItemKey(key: string, itemKey: string, itemValue: string): Promise<void> {
    const existingValue = await AsyncStorage.getItem(key);
    let items: StorageDataInterface[] = [];

    if (existingValue) {
      items = JSON.parse(existingValue);
    }

    const filteredItems = items.filter((item: StorageDataInterface) => item[itemKey] !== itemValue);

    return AsyncStorage.setItem(key, JSON.stringify(filteredItems));
  }
}

export default AsyncStorageService;
