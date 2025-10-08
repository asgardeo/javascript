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

import { FunctionComponent, PropsWithChildren, ReactElement, RefObject, useCallback, useEffect, useRef, useState } from "react";
import AccountContext from "./account-context";
import { AccountInterface } from "../../models/storage";
import AsyncStorageService from "../../utils/AsyncStorageService";
import StorageConstants from "../../constants/storage";
import useAsgardeo from "../asgardeo/use-asgardeo";
import { AlertType } from "../../components/common/alert";

/**
 * Account provider component.
 *
 * @param props - Props for the component.
 * @returns Account provider component.
 */
const AccountProvider: FunctionComponent<PropsWithChildren> = ({
  children
}: PropsWithChildren): ReactElement => {
  const [accounts, setAccounts] = useState<AccountInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const isAccountFetched: RefObject<boolean> = useRef(false);
  const { showAlert, hideAlert } = useAsgardeo();

  /**
   * Fetch accounts from storage.
   */
  const fetchAccounts = useCallback(async (): Promise<void> => {
    setLoading(true);
    if (!isAccountFetched.current) {
      isAccountFetched.current = true;
    }
    AsyncStorageService.getItem(StorageConstants.ACCOUNTS_DATA)
      .then((accounts: string | null) => {
        if (accounts) {
          const parsedAccounts: AccountInterface[] = JSON.parse(accounts);
          setAccounts(parsedAccounts);
        } else {
          setAccounts([]);
        }
      })
      .catch(() => {
        setAccounts([]);
        showAlert({
          type: AlertType.ERROR,
          title: "Error Fetching Accounts",
          message: "Failed to fetch accounts from storage. Try again by restarting the app.",
          primaryButtonText: "OK",
          onPrimaryPress: () => { hideAlert(); }
        })
      })
      .finally(() => {
        setLoading(false);
      });
  }, [showAlert, hideAlert]);

  /**
   * Fetch accounts on component mount.
   */
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  /**
   * Get account by item key and value.
   *
   * @param itemKey - The key to search by.
   * @param itemValue - The value to search for.
   * @param fallbackItemKey - The fallback key to search by.
   * @param fallbackItemValue - The fallback value to search for.
   * @returns The account(s) matching the criteria.
   */
  const getAccountByItemKey = useCallback((
    itemKey: keyof AccountInterface,
    itemValue: string,
    fallbackItemKey?: keyof AccountInterface,
    fallbackItemValue?: string
  ): AccountInterface[] => {
    return accounts.filter((item: AccountInterface) => new RegExp(itemValue).test(item[itemKey] as string)
      && (!fallbackItemKey || !fallbackItemValue ||
        new RegExp(fallbackItemValue).test(item[fallbackItemKey] as string)));
  }, [accounts]);

  return (
    <AccountContext.Provider value={{
      accounts,
      fetchAccounts,
      loading,
      isAccountFetched: isAccountFetched.current,
      getAccountByItemKey
    }}>
      {children}
    </AccountContext.Provider>
  )
}

export default AccountProvider;
