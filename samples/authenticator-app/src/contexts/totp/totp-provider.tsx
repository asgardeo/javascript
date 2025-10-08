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

import { FunctionComponent, PropsWithChildren, ReactElement, useCallback } from "react";
import TOTPContext from "./totp-context";
import { TOTPQRDataInterface } from "../../models/totp";
import { AccountInterface } from "../../models/storage";
import AsyncStorageService from "../../utils/AsyncStorageService";
import StorageConstants from "../../constants/storage";
import CryptoService from "../../utils/CryptoService";
import TypeConvert from "../../utils/TyperConvert";
import SecureStorageService from "../../utils/SecureStorageService";
import useAccount from "../account/use-account";

/**
 * TOTP Provider component to provide TOTP context to its children.
 *
 * @param props - Props for the TOTPProvider component.
 * @returns TOTP Provider component.
 */
const TOTPProvider: FunctionComponent<PropsWithChildren> = ({
  children
}: PropsWithChildren): ReactElement => {
  const { getAccountByItemKey, fetchAccounts } = useAccount();

  /**
   * Register TOTP using the provided QR data.
   *
   * @param qrData - The TOTP QR data.
   * @returns A promise that resolves to the registered account ID.
   * @throws Will throw an error if registration fails.
   */
  const registerTOTP = useCallback(async (qrData: TOTPQRDataInterface): Promise<string> => {
    let accountId: string = "";

    try {
      let accountDetails: AccountInterface[] = getAccountByItemKey(
        'username',
        `^(.+\\/${qrData.username}|${qrData.username})$`,
        'tenantDomain',
        qrData.issuer
      );

      if (accountDetails.length === 0) {
        accountDetails = getAccountByItemKey(
          'username',
          `^(.+\\/${qrData.username}|${qrData.username})$`,
          'organizationId',
          qrData.issuer
        );
      }

      if (accountDetails.length === 0) {
        accountDetails = getAccountByItemKey(
          'username',
          `^(.+\\/${qrData.username}|${qrData.username})$`,
          'issuer',
          qrData.issuer
        );
      }

      if (accountDetails.length > 1 || accountDetails.length === 0) {
        // Create a new account if multiple or no accounts are found.
        const id: string = CryptoService.generateRandomKey();
        const accountData: AccountInterface = {
          id,
          username: qrData.username,
          displayName: qrData.issuer,
          issuer: qrData.issuer,
          period: qrData.period || 30,
          algorithm: qrData.algorithm || 'SHA1',
          digits: qrData.digits || 6,
        };
        await AsyncStorageService.addItem(StorageConstants.ACCOUNTS_DATA,
          TypeConvert.toStorageDataInterface(accountData));
        SecureStorageService.setItem(id, qrData.secret);

        accountId = id;
      } else {
        // Update existing account.
        const accountDetail: AccountInterface = accountDetails[0];
        SecureStorageService.setItem(accountDetail.id, qrData.secret);
        accountDetail.issuer = qrData.issuer;
        accountDetail.period = qrData.period || 30;
        await AsyncStorageService.removeListItemByItemKey(
          StorageConstants.ACCOUNTS_DATA, 'id', accountDetail.id
        );
        await AsyncStorageService.addItem(StorageConstants.ACCOUNTS_DATA,
          TypeConvert.toStorageDataInterface(accountDetail));

        accountId = accountDetail.id;
      }

      fetchAccounts();

      return accountId;
    } catch {
      throw new Error('Failed to register TOTP account.');
    }
  }, [getAccountByItemKey, fetchAccounts]);

  /**
   * Unregister TOTP for the given account ID.
   *
   * @param id - The account ID.
   * @returns A promise that resolves when the unregistration is complete.
   * @throws Will throw an error if unregistration fails.
   */
  const unregisterTOTP = useCallback(async (id: string): Promise<void> => {
    try {
      const storageData: AccountInterface[] = getAccountByItemKey('id', id);
      const accountData: AccountInterface = storageData[0];
      await AsyncStorageService.removeListItemByItemKey(StorageConstants.ACCOUNTS_DATA, 'id', accountData.id);
      await SecureStorageService.removeItem(accountData.id);

      // If the account is associated with a deviceId, retain the account data for push auth.
      if (accountData.deviceId) {
        const newAccountData: AccountInterface = {
          id: accountData.id,
          deviceId: accountData.deviceId,
          host: accountData.host,
          username: accountData.username,
          displayName: accountData.displayName,
          tenantDomain: accountData.tenantDomain,
          organizationId: accountData.organizationId
        }
        await AsyncStorageService.addItem(StorageConstants.ACCOUNTS_DATA,
          TypeConvert.toStorageDataInterface(newAccountData));
      }

      fetchAccounts();
    } catch {
      throw new Error('Failed to unregister TOTP account.');
    }
  }, [getAccountByItemKey, fetchAccounts]);

  return (
    <TOTPContext.Provider value={{
      registerTOTP,
      unregisterTOTP
    }}>
      {children}
    </TOTPContext.Provider>
  )
}

export default TOTPProvider;
