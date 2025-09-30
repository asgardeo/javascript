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

import { useCallback, useState } from 'react';
import StorageConstants from '../constants/storage';
import { AccountInterface, StorageDataInterface } from '../models/storage';
import { TOTPQRDataInterface } from '../models/totp';
import AsyncStorageService from '../utils/async-storage-service';
import CryptoService from '../utils/crypto-service';
import SecureStorageService from '../utils/secure-storage-service';
import TypeConvert from '../utils/typer-convert';

/**
 * Interface for the return type of the `useTOTPRegistration` hook.
 */
export interface UseTOTPRegistrationPropsInterface {
  registerTOTP: (qrData: TOTPQRDataInterface) => Promise<void>;
  isRegistering: boolean;
}

/**
 * Hook to handle TOTP authentication registration.
 *
 * @returns Hook for TOTP authentication registration.
 */
export const useTOTPRegistration = (): UseTOTPRegistrationPropsInterface => {
  const [isRegistering, setIsRegistering] = useState(false);

  /**
   * Register TOTP using the provided QR data.
   *
   * @param qrData - The TOTP QR data.
   * @returns A promise that resolves when the registration is complete.
   * @throws Will throw an error if registration fails.
   */
  const registerTOTP = useCallback(async (qrData: TOTPQRDataInterface): Promise<void> => {
    setIsRegistering(true);

    try {
      let accountDetails: StorageDataInterface[] = await AsyncStorageService.getListItemByItemKey(
        StorageConstants.ACCOUNTS_DATA, 'username', `^(.+\\/${qrData.username}|${qrData.username})$`, 'tenantDomain', qrData.issuer
      );

      if (accountDetails.length === 0) {
        accountDetails = await AsyncStorageService.getListItemByItemKey(
          StorageConstants.ACCOUNTS_DATA, 'username', `^(.+\\/${qrData.username}|${qrData.username})$`, 'organizationId', qrData.issuer
        );
      }

      if (accountDetails.length === 0) {
        accountDetails = await AsyncStorageService.getListItemByItemKey(
          StorageConstants.ACCOUNTS_DATA, 'username', `^(.+\\/${qrData.username}|${qrData.username})$`, 'issuer', qrData.issuer
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
      } else {
        // Update existing account.
        const accountDetail: AccountInterface = TypeConvert.toAccountInterface(accountDetails[0]);
        SecureStorageService.setItem(accountDetail.id, qrData.secret);
        accountDetail.issuer = qrData.issuer;
        accountDetail.period = qrData.period || 30;
        await AsyncStorageService.removeListItemByItemKey(
          StorageConstants.ACCOUNTS_DATA, 'id', accountDetail.id
        );
        await AsyncStorageService.addItem(StorageConstants.ACCOUNTS_DATA,
          TypeConvert.toStorageDataInterface(accountDetail));
      }
    } catch {
      throw new Error('Failed to register TOTP account.');
    } finally {
      setIsRegistering(false);
    }
  }, []);

  return {
    registerTOTP,
    isRegistering
  };
};

