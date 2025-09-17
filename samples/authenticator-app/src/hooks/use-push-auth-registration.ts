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
import { PushNotificationQRDataInterface } from '../models/push-notification';
import { AccountInterface, PushRegistrationDataStorageInterface } from '../models/storage';
import AsyncStorageService from '../utils/async-storage-service';
import CryptoService from '../utils/crypto-service';
import { DeviceUtils } from '../utils/device-utils';
import MessagingService from '../utils/messagging-service';
import SecureStorageService from '../utils/secure-storage-service';
import TypeConvert from '../utils/typer-convert';

/**
 * Interface for device registration payload sent to WSO2 Identity Server
 */
export interface DeviceRegistrationPayload {
  deviceId: string;
  name: string;
  model: string;
  deviceToken: string;
  publicKey: string;
  signature: string;
}

/**
 * Interface for device registration response
 */
export interface DeviceRegistrationResponse {
  success: boolean;
  message?: string;
}

/**
 * Interface for push device registration errors
 */
export interface PushRegistrationError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Hook for managing push notification device registration with WSO2 Identity Server
 *
 * This hook implements the complete push device registration flow as per WSO2 IS documentation:
 * 1. Extract QR code data containing deviceId, challenge, and server information
 * 2. Generate  Cloud Messaging device token
 * 3. Generate RSA 2048-bit key pair for cryptographic operations
 * 4. Sign challenge.deviceToken with private key for verification
 * 5. Send registration request to appropriate WSO2 IS endpoint (tenant or organization)
 * 6. Store registration data securely for future authentication flows
 */
export const usePushAuthRegistration = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<PushRegistrationError | null>(null);

  /**
   * Get device information for registration
   */
  const getDeviceInfo = useCallback(async () => {
    return await DeviceUtils.getDeviceInfo();
  }, []);

  /**
   * Build registration endpoint URL based on tenant or organization
   */
  const buildRegistrationUrl = useCallback((qrData: PushNotificationQRDataInterface): string => {
    const { tenantDomain, organizationId } = qrData;
    const host = "http://192.168.208.18:8082"; // Replace with actual host or extract from QR data if available

    if (organizationId) {
      // Organization user - use organization path
      return `${host}/o/${organizationId}/api/users/v1/me/push/devices/`;
    } else if (tenantDomain) {
      // Tenant user - use tenanted path
      return `${host}/t/${tenantDomain}/api/users/v1/me/push/devices/`;
    } else {
      throw new Error('Neither organizationId nor tenantDomain found in QR data');
    }
  }, []);

  /**
   * Send registration request to WSO2 Identity Server
   */
  const sendRegistrationRequest = useCallback(async (
    url: string,
    payload: DeviceRegistrationPayload
  ): Promise<DeviceRegistrationResponse> => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:admin'),
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 201) {
        return { success: true };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          message: `Registration failed with status ${response.status}: ${errorText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Network error during registration: ${error}`,
      };
    }
  }, []);

  /**
   * Main registration function that orchestrates the entire push device registration flow
   *
   * @param qrData - The data extracted from the QR code containing device and server information
   * @returns Promise<DeviceRegistrationResponse> - Result of the registration process
   */
  const registerPushDevice = useCallback(async (
    qrData: PushNotificationQRDataInterface
  ): Promise<DeviceRegistrationResponse> => {
    setIsRegistering(true);
    setRegistrationError(null);

    try {
      // Step 1: Get device information
      const deviceInfo = await getDeviceInfo();

      // Step 2: Generate FCM device token
      const deviceToken = await MessagingService.generateFCMToken();

      // Step 3: Generate RSA key pair
      const rsaKeyPair = CryptoService.generateKeyPair();

      // Store the key pair securely with converted certificate
      SecureStorageService.setItem(qrData.deviceId, rsaKeyPair.privateKey);

      // Step 4: Generate signature for verification
      const signature = CryptoService.generateChallengeSignature(qrData.challenge, deviceToken, rsaKeyPair.privateKey);

      // Step 5: Prepare registration payload
      const payload: DeviceRegistrationPayload = {
        deviceId: qrData.deviceId,
        name: deviceInfo.name,
        model: deviceInfo.model,
        deviceToken,
        publicKey: CryptoService.getBase64Text(rsaKeyPair.publicKey),
        signature: signature,
      };

      // Step 6: Build registration URL
      const registrationUrl = buildRegistrationUrl(qrData);

      console.log('Registration Payload:', payload);

      // Step 7: Send registration request
      const result = await sendRegistrationRequest(registrationUrl, payload);

      if (result.success) {
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
        setRegistrationError({
          code: 'REGISTRATION_FAILED',
          message: result.message || 'Registration failed',
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown registration error';
      setRegistrationError({
        code: 'REGISTRATION_ERROR',
        message: errorMessage,
        details: error,
      });

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsRegistering(false);
    }
  }, [
    getDeviceInfo,
    buildRegistrationUrl,
    sendRegistrationRequest
  ]);

  return {
    registerPushDevice,
    isRegistering,
    registrationError,
    clearError: () => setRegistrationError(null),
  };
};
