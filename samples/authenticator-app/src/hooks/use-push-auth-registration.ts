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
import { PushNotificationQRDataInterface } from '../models/push-notification';
import { CryptographyUtils } from '../utils/cryptography';
import { DeviceUtils } from '../utils/device-utils';
import { FirebaseMessagingUtils } from '../utils/firebase-messaging';
import { RegistrationDataStorage } from '../utils/registration-storage';
import { SecureStorage } from '../utils/secure-storage';

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
 * 2. Generate Firebase Cloud Messaging device token
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
   * Generate Firebase Cloud Messaging device token
   */
  const generateDeviceToken = useCallback(async (): Promise<string> => {
    try {
      // Initialize Firebase messaging if needed
      await FirebaseMessagingUtils.initialize();

      // Get the FCM token
      const token = await FirebaseMessagingUtils.getDeviceToken();
      return token;
    } catch (error) {
      console.error('Failed to generate FCM device token:', error);
      throw new Error(`FCM token generation failed: ${error}`);
    }
  }, []);

  /**
   * Generate RSA key pair and format public key for WSO2 IS
   */
  const generateKeyPair = useCallback(async (deviceId: string) => {
    try {
      // Generate proper RSA 2048-bit key pair
      const rsaKeyPair = await CryptographyUtils.generateRSAKeyPair();

      // Store the key pair securely using existing secure storage
      await SecureStorage.storeGeneratedKeyPair(deviceId, {
        certificate: '', // Not needed for push registration
        privateKey: rsaKeyPair.privateKey,
        publicKey: rsaKeyPair.publicKey,
        fingerprint: CryptographyUtils.generateHash(rsaKeyPair.publicKey).substring(0, 32),
      }, {
        keySize: 2048,
        algorithm: 'RSA',
        validityDays: 365,
      });

      return {
        publicKey: rsaKeyPair.publicKeyFormatted, // Pre-formatted for WSO2 IS
        privateKey: rsaKeyPair.privateKey,
      };
    } catch (error) {
      throw new Error(`Key pair generation failed: ${error}`);
    }
  }, []);

  /**
   * Generate signature for registration verification
   * Signs challenge.deviceToken with private key using RSA-SHA256
   */
  const generateSignature = useCallback(async (
    challenge: string,
    deviceToken: string,
    privateKey: string
  ): Promise<string> => {
    try {
      // Use proper RSA-SHA256 signature generation as required by WSO2 IS
      const signature = await CryptographyUtils.generateSignature(
        challenge,
        deviceToken,
        privateKey
      );

      return signature;
    } catch (error) {
      throw new Error(`Signature generation failed: ${error}`);
    }
  }, []);

  /**
   * Build registration endpoint URL based on tenant or organization
   */
  const buildRegistrationUrl = useCallback((qrData: PushNotificationQRDataInterface): string => {
    const { tenantDomain, organizationId } = qrData;
    const host = "http://192.168.1.128:8082"; // Replace with actual host or extract from QR data if available

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
   * Store registration data securely for future use
   */
  const storeRegistrationData = useCallback(async (
    deviceId: string,
    qrData: PushNotificationQRDataInterface,
    deviceToken: string
  ) => {
    try {
      // Store user and server information for authentication flows
      await RegistrationDataStorage.storeRegistrationData(deviceId, qrData, deviceToken);
      console.log('Registration data stored successfully');
    } catch (error) {
      throw new Error(`Failed to store registration data: ${error}`);
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
      const deviceToken = await generateDeviceToken();

      // Step 3: Generate RSA key pair
      const { publicKey, privateKey } = await generateKeyPair(qrData.deviceId);

      // Step 4: Generate signature for verification
      const signature = await generateSignature(qrData.challenge, deviceToken, privateKey);

      // Step 5: Prepare registration payload
      const payload: DeviceRegistrationPayload = {
        deviceId: qrData.deviceId,
        name: deviceInfo.name,
        model: deviceInfo.model,
        deviceToken,
        publicKey,
        signature,
      };

      // Step 6: Build registration URL
      const registrationUrl = buildRegistrationUrl(qrData);
      console.log('Registration URL:', registrationUrl);

      // Step 7: Send registration request
      const result = await sendRegistrationRequest(registrationUrl, payload);

      if (result.success) {
        // Step 8: Store registration data on successful registration
        await storeRegistrationData(qrData.deviceId, qrData, deviceToken);
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
    generateDeviceToken,
    generateKeyPair,
    generateSignature,
    buildRegistrationUrl,
    sendRegistrationRequest,
    storeRegistrationData,
  ]);

  return {
    registerPushDevice,
    isRegistering,
    registrationError,
    clearError: () => setRegistrationError(null),
  };
};
