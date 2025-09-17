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

import { deviceName, modelName } from 'expo-device';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import StorageConstants from '../constants/storage';
import { PushNotificationQRDataInterface } from '../models/push-notification';
import { AccountInterface, PushRegistrationDataStorageInterface } from '../models/storage';
import AsyncStorageService from '../utils/async-storage-service';
import CryptoService from '../utils/crypto-service';
import MessagingService from '../utils/messagging-service';
import SecureStorageService from '../utils/secure-storage-service';
import TypeConvert from '../utils/typer-convert';

/**
 * Interface for the return type of the `usePushAuthRegistration` hook.
 */
export interface UsePushAuthRegistrationPropsInterface {
  registerPushDevice: (qrData: PushNotificationQRDataInterface) => Promise<void>;
  isRegistering: boolean;
}

/**
 * Hook to handle push authentication registration.
 *
 * @returns Hook for push authentication registration.
 */
export const usePushAuthRegistration = (): UsePushAuthRegistrationPropsInterface => {
  const [isRegistering, setIsRegistering] = useState(false);

  /**
   * Build registration endpoint URL based on tenant or organization.
   */
  const buildRegistrationUrl = (qrData: PushNotificationQRDataInterface): string => {
    const { tenantDomain, organizationId } = qrData;
    // TODO: Use the host from the QR data.
    const host = "http://192.168.208.18:8082";

    if (organizationId) {
      return `${host}/o/${organizationId}/api/users/v1/me/push/devices`;
    } else if (tenantDomain) {
      return `${host}/t/${tenantDomain}/api/users/v1/me/push/devices`;
    } else {
      throw new Error('Neither organizationId nor tenantDomain found in QR data.');
    }
  };

  /**
   * Register push device using the provided QR data.
   *
   * @param qrData - The push notification QR data.
   * @returns A promise that resolves when the registration is complete.
   * @throws Will throw an error if registration fails.
   */
  const registerPushDevice = useCallback(async (
    qrData: PushNotificationQRDataInterface
  ): Promise<void> => {
    setIsRegistering(true);

    try {
      // Generate fcm device token.
      const deviceToken = await MessagingService.generateFCMToken();

      // Generate RSA 2048-bit key pair.
      const rsaKeyPair = CryptoService.generateKeyPair();

      // Store private key securely.
      SecureStorageService.setItem(qrData.deviceId, rsaKeyPair.privateKey);

      // Generate challenge signature.
      const signature = CryptoService.generateChallengeSignature(qrData.challenge, deviceToken, rsaKeyPair.privateKey);

      const registrationUrl = buildRegistrationUrl(qrData);

      const body: string = JSON.stringify({
        deviceId: qrData.deviceId,
        name: deviceName || (Platform.OS === 'ios' ? 'iOS Device' : 'Android Device'),
        model: modelName || (Platform.OS === 'ios' ? 'iOS Device' : 'Android Device'),
        deviceToken,
        publicKey: CryptoService.getBase64Text(rsaKeyPair.publicKey),
        signature: signature,
      });

      const response = await fetch(registrationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body,
      });

      if (response.status === 201) {
        const accountId: string = CryptoService.generateRandomKey();

        const accountData: AccountInterface = {
          id: accountId,
          username: qrData.username,
          organization: qrData.organizationName ?? qrData.tenantDomain
        };
        await AsyncStorageService.addItem(StorageConstants.ACCOUNTS_DATA,
          TypeConvert.toStorageDataInterface(accountData));

        const storingData: PushRegistrationDataStorageInterface = {
          tenantDomain: qrData.tenantDomain,
          organizationId: qrData.organizationId,
          organizationName: qrData.organizationName,
          deviceId: qrData.deviceId
        };
        await AsyncStorageService.setItem(
          StorageConstants.replaceAccountId(StorageConstants.PUSH_REGISTRATION_DATA, accountId),
          JSON.stringify(storingData)
        );
      } else {
        throw new Error(`Registration failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error during push device registration:', error);
    } finally {
      setIsRegistering(false);
    }
  }, []);

  return {
    registerPushDevice,
    isRegistering
  };
};
