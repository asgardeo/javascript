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

import { Context, createContext } from "react";
import { AccountInterface } from "../../models/storage";

/**
 * Account context interface.
 */
export interface AccountContextInterface {
  /**
   * List of registered accounts.
   */
  accounts: AccountInterface[];
  /**
   * Function to fetch accounts from storage.
   *
   * @returns A promise that resolves when accounts are fetched from storage.
   */
  fetchAccounts: () => Promise<void>;
  /**
   * Loading state.
   */
  loading: boolean;
  /**
   * Flag to indicate if accounts have been fetched at least once.
   */
  isAccountFetched: boolean;
  /**
   * Get account by item key and value.
   *
   * @param itemKey - The key to search by.
   * @param itemValue - The value to search for.
   * @param fallbackItemKey - The fallback key to search by.
   * @param fallbackItemValue - The fallback value to search for.
   * @returns The account(s) matching the criteria.
   */
  getAccountByItemKey: (
    itemKey: keyof AccountInterface,
    itemValue: string,
    fallbackItemKey?: keyof AccountInterface,
    fallbackItemValue?: string
  ) => AccountInterface[]
}

/**
 * Account context.
 */
const AccountContext: Context<AccountContextInterface> = createContext<AccountContextInterface>({
  accounts: [],
  fetchAccounts: async () => { },
  loading: false,
  isAccountFetched: false,
  getAccountByItemKey: () => []
})

export default AccountContext;
