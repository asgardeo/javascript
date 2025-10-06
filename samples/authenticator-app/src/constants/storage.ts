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
 * Class containing storage related constants.
 */
class StorageConstants {
  /**
   * Placeholder for account ID in storage keys.
   */
  private static readonly ACCOUNT_ID_PLACEHOLDER = '{{account_id}}';

  /**
   * Key for storing push authentication data.
   */
  static readonly PUSH_AUTHENTICATION_DATA = 'push_authentication_data_{{account_id}}';

  /**
   * Key for storing accounts data.
   */
  static readonly ACCOUNTS_DATA = 'accounts_data';

  /**
   * Key for storing user preferences.
   */
  static readonly USER_PREFERENCE = 'user_preference';

  /**
   * Replaces the account ID placeholder in a storage key.
   *
   * @param key The storage key with the account ID placeholder.
   * @param accountId The actual account ID to replace the placeholder.
   * @returns The storage key with the account ID replaced.
   */
  static replaceAccountId(key: string, accountId: string): string {
    return key.replace(this.ACCOUNT_ID_PLACEHOLDER, accountId);
  }
}

export default StorageConstants;
