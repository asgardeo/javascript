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

import { FunctionComponent, PropsWithChildren, ReactElement, RefObject, useCallback, useRef, useState } from "react";
import AccountContext from "./account-context";
import { AccountInterface } from "../../models/storage";
import AsyncStorageService from "../../utils/async-storage-service";
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

  return (
    <AccountContext.Provider value={{
      accounts,
      fetchAccounts,
      loading,
      isAccountFetched: isAccountFetched.current
    }}>
      {children}
    </AccountContext.Provider>
  )
}

export default AccountProvider;
