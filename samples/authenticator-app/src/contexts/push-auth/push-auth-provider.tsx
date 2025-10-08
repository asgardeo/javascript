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

import TypeConvert from "../../utils/TyperConvert";
import { Router, useRouter } from "expo-router";
import { FunctionComponent, PropsWithChildren, ReactElement, useCallback, useEffect, useState } from "react";
import Alert, { AlertType } from "../../components/common/alert";
import StorageConstants from "../../constants/storage";
import {
  PushAuthenticationDataInterface,
  PushAuthJWTBodyInterface,
  PushAuthJWTHeaderInterface,
  PushAuthResponseStatus,
  PushNotificationQRDataInterface
} from "../../models/push-notification";
import { AccountInterface, PushAuthenticationDataStorageInterface, StorageDataInterface } from "../../models/storage";
import AsyncStorageService from "../../utils/AsyncStorageService";
import CryptoService from "../../utils/CryptoService";
import MessagingService from "../../utils/MessagingService";
import PushAuthContext from "./push-auth-context";
import resolveHostName from "../../utils/resolveHostName";
import { DeploymentConfig } from "../../models/core";
import useAsgardeo from "../asgardeo/use-asgardeo";
import AppPaths from "../../constants/paths";
import SecureStorageService from "../../utils/SecureStorageService";
import { deviceName, modelName } from 'expo-device';
import { Platform } from "react-native";
import useAccount from "../account/use-account";
import rawConfig from "../../../config/app.config.json";

const config: DeploymentConfig = rawConfig as DeploymentConfig;

/**
 * Push Authentication Provider component.
 *
 * @param children - Child components.
 * @returns Push authentication provider component.
 */
const PushAuthProvider: FunctionComponent<PropsWithChildren> = ({
  children
}: PropsWithChildren): ReactElement => {
  const router: Router = useRouter();
  const { isAppInitialized } = useAsgardeo();
  const [pushAuthMessageCache, setPushAuthMessageCache] = useState<Record<string, PushAuthenticationDataInterface>>({});
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>(AlertType.SUCCESS);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const { getAccountByItemKey, fetchAccounts } = useAccount();

  /**
   * Shows an alert message.
   *
   * @param type - The type of the alert.
   * @param title - The title of the alert.
   * @param message - The message of the alert.
   */
  const showAlert = useCallback((type: AlertType, title: string, message: string): void => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  }, []);

  /**
   * Adds a new push authentication message to the cache.
   *
   * @param id - The unique identifier for the push authentication message.
   * @param message - The push authentication message data.
   */
  const addPushAuthMessageToCache = useCallback((id: string, message: PushAuthenticationDataInterface): void => {
    setPushAuthMessageCache((prevCache) => ({
      ...prevCache,
      [id]: message
    }));
  }, [setPushAuthMessageCache]);

  /**
   * Handles push authentication notifications.
   *
   * @param data - The push authentication data received from the notification.
   */
  const handlePushAuthNotification = useCallback((data: PushAuthenticationDataInterface) => {
    addPushAuthMessageToCache(data.pushId, data);
    router.push({
      pathname: '/push-auth',
      params: { id: data.pushId }
    });
  }, [addPushAuthMessageToCache, router]);

  /**
   * Sets up a listener for when the app is in the foreground.
   */
  useEffect(() => {
    const unsubscribe: () => void = MessagingService.listenForInAppMessages(handlePushAuthNotification);

    return unsubscribe;
  }, [handlePushAuthNotification]);

  /**
   * Request permission to receive notifications on component mount.
   */
  useEffect(() => {
    MessagingService.requestUserPermission();
  }, []);

  /**
   * Sets up a listener for when the app is in the background.
   */
  useEffect(() => {
    const unsubscribe: () => void = MessagingService.listenForNotificationOpenWhenAppInBackground(
      handlePushAuthNotification
    );

    return unsubscribe;
  }, [handlePushAuthNotification]);

  /**
   * Sets up a listener for when the app is closed.
   */
  useEffect(() => {
    if (isAppInitialized) {
      MessagingService.listenForNotificationOpenWhenAppIsClosedExpo(handlePushAuthNotification);
      MessagingService.listenForNotificationWhenAppIsClosedFCM(handlePushAuthNotification);
    }
  }, [isAppInitialized, handlePushAuthNotification]);

  /**
   * Builds the push authentication URL based on the push ID.
   *
   * @param id - The push authentication ID.
   * @param accountDetails - The account details associated with the push authentication.
   * @returns The constructed push authentication URL.
   */
  const buildPushAuthUrl = useCallback((id: string, accountDetails: AccountInterface): string => {
    const { tenantDomain, organizationId } = pushAuthMessageCache[id];
    const hostName: string = resolveHostName(accountDetails.host!);

    if (organizationId) {
      return `${hostName}/o/${organizationId}/push-auth/authenticate`;
    } else if (tenantDomain) {
      return `${hostName}/t/${tenantDomain}/push-auth/authenticate`;
    } else {
      throw new Error('Neither organizationId nor tenantDomain found in QR data.');
    }
  }, [pushAuthMessageCache]);

  /**
   * Sends the push authentication response back to the server.
   *
   * @param id - The unique identifier for the push authentication message.
   * @param status - The status of the push authentication response.
   */
  const sentPushAuthResponse = useCallback(async (id: string, status: PushAuthResponseStatus): Promise<void> => {
    if (!pushAuthMessageCache[id]) {
      router.back();
      return;
    }

    showAlert(AlertType.LOADING, 'Sending Response', 'Please wait while we send your response...');

    const storageData: StorageDataInterface[] = await AsyncStorageService.getListItemByItemKey(
      StorageConstants.ACCOUNTS_DATA, "deviceId", pushAuthMessageCache[id].deviceId);

    if (storageData.length === 0) {
      return;
    }

    const accountDetails: AccountInterface = TypeConvert.toAccountInterface(storageData[0]);

    const header: PushAuthJWTHeaderInterface = {
      alg: 'RS256',
      typ: 'JWT',
      deviceId: pushAuthMessageCache[id].deviceId
    };

    let body: PushAuthJWTBodyInterface = {
      pushAuthId: id,
      challenge: pushAuthMessageCache[id].challenge,
      response: status,
      exp: Date.now() + 5 * 60 * 1000 // Token valid for 5 minutes.
    };

    if (pushAuthMessageCache[id].numberChallenge && status === PushAuthResponseStatus.APPROVED) {
      body = {
        ...body,
        numberChallenge: pushAuthMessageCache[id].numberChallenge.toString()
      };
    }

    let result: Response | null = null;

    try {
      const jwtResponse: string = CryptoService.generatePushResponseJWT(header, body);
      const pushAuthUrl: string = buildPushAuthUrl(id, accountDetails);

      result = await fetch(pushAuthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ authResponse: jwtResponse })
      });

      if (result.status === 200) {
        showAlert(AlertType.SUCCESS, 'Response Sent', 'Your response has been sent successfully.');
      } else {
        showAlert(AlertType.ERROR, 'Response Failed', 'Failed to send your response. Please try again.');
      }
    } catch {
      showAlert(AlertType.ERROR, 'Response Failed', 'Failed to send your response. Please try again.');
    }

    try {
      if (result?.status === 200) {
        const authStorageData: PushAuthenticationDataStorageInterface = {
          applicationName: pushAuthMessageCache[id].applicationName,
          ipAddress: pushAuthMessageCache[id].ipAddress,
          notificationScenario: pushAuthMessageCache[id].notificationScenario,
          deviceOS: pushAuthMessageCache[id].deviceOS,
          browser: pushAuthMessageCache[id].browser,
          status: status,
          respondedTime: Date.now()
        };

        AsyncStorageService.addItem(
          StorageConstants.replaceAccountId(
            StorageConstants.PUSH_AUTHENTICATION_DATA, accountDetails.id),
          authStorageData,
          config.feature.push.numberOfHistoryRecords
        );
      }
    } catch {
      // Ignore the error since the push authentication response has been sent successfully.
    }
  }, [pushAuthMessageCache, buildPushAuthUrl, showAlert, router]);

  /**
   * Retrieves a push authentication message from the cache by its ID.
   *
   * @param id - The unique identifier for the push authentication message.
   * @returns The push authentication message data or undefined if not found.
   */
  const getPushAuthMessageFromCache = useCallback((id: string): PushAuthenticationDataInterface | undefined => {
    return pushAuthMessageCache[id];
  }, [pushAuthMessageCache]);

  /**
   * Build registration endpoint URL based on tenant or organization.
   */
  const buildRegistrationUrl = (qrData: PushNotificationQRDataInterface): string => {
    const { host, tenantDomain, organizationId } = qrData;
    const hostName = resolveHostName(host);

    if (organizationId) {
      return hostName + AppPaths.ORGANIZATION_PATH + organizationId + AppPaths.PUSH_AUTH_REGISTRATION_SERVER;
    } else if (tenantDomain) {
      return hostName + AppPaths.TENANT_PATH + tenantDomain + AppPaths.PUSH_AUTH_REGISTRATION_SERVER;
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
  ): Promise<string> => {
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
        let accountId: string = "";

        let storageData: AccountInterface[] = getAccountByItemKey(
          'username',
          `^(.+\\/${qrData.username}|${qrData.username})$`,
          'tenantDomain',
          qrData.tenantDomain
        );

        if (storageData.length === 0) {
          storageData = getAccountByItemKey(
            'username',
            `^(.+\\/${qrData.username}|${qrData.username})$`,
            'organizationId',
            qrData.organizationId
          );
        }

        if (storageData.length === 0) {
          storageData = getAccountByItemKey(
            'username',
            `^(.+\\/${qrData.username}|${qrData.username})$`,
            'issuer',
            qrData.tenantDomain
          );
        }

        if (storageData.length === 0) {
          storageData = getAccountByItemKey(
            'username',
            `^(.+\\/${qrData.username}|${qrData.username})$`,
            'issuer',
            qrData.organizationId
          );
        }

        if (storageData.length > 1 || storageData.length === 0) {
          const id: string = CryptoService.generateRandomKey();

          const accountData: AccountInterface = {
            id,
            deviceId: qrData.deviceId,
            host: qrData.host,
            username: qrData.username,
            displayName: qrData.organizationName ?? qrData.tenantDomain,
            tenantDomain: qrData.tenantDomain,
            organizationId: qrData.organizationId
          };
          await AsyncStorageService.addItem(StorageConstants.ACCOUNTS_DATA,
            TypeConvert.toStorageDataInterface(accountData));

          accountId = id;
        } else {
          const accountDetail: AccountInterface = storageData[0];
          accountDetail.deviceId = qrData.deviceId;
          accountDetail.organizationId = qrData.organizationId;
          accountDetail.tenantDomain = qrData.tenantDomain;
          await AsyncStorageService.removeListItemByItemKey(
            StorageConstants.ACCOUNTS_DATA, 'id', accountDetail.id
          );
          await AsyncStorageService.addItem(StorageConstants.ACCOUNTS_DATA,
            TypeConvert.toStorageDataInterface(accountDetail));

          accountId = accountDetail.id;
        }

        fetchAccounts();

        return accountId;
      } else {
        throw new Error(`Registration failed with status ${response.status}`);
      }
    } catch {
      throw new Error('Push device registration failed.');
    }
  }, [getAccountByItemKey, fetchAccounts]);

  /**
   * Builds the push unregistration URL for the given account data.
   *
   * @param data Account data.
   * @returns The push unregistration URL.
   */
  const buildPushUnregistrationUrl = (data: AccountInterface): string => {
    const { host, tenantDomain, organizationId } = data;
    const hostName = resolveHostName(host!);

    if (organizationId) {
      return hostName + AppPaths.ORGANIZATION_PATH + organizationId +
        AppPaths.PUSH_AUTH_UNREGISTRATION_SERVER.replace('{{id}}', data.deviceId!);
    } else if (tenantDomain) {
      return hostName + AppPaths.TENANT_PATH + tenantDomain +
        AppPaths.PUSH_AUTH_UNREGISTRATION_SERVER.replace('{{id}}', data.deviceId!);
    } else {
      throw new Error('Neither organizationId nor tenantDomain found in QR data.');
    }
  };

  /**
   * Unregister push device and delete associated data.
   *
   * @param id - The account ID.
   */
  const unregisterPushDevice = useCallback(async (id: string) => {
    try {
      const storageData: AccountInterface[] = getAccountByItemKey('id', id);
      const accountData: AccountInterface = storageData[0];

      const isPushAuthConfigured: boolean = !!accountData.deviceId;

      const result: Response | undefined = !isPushAuthConfigured ? undefined : await fetch(
        buildPushUnregistrationUrl(accountData), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: CryptoService.generatePushUnregistrationJWT(accountData.deviceId!)
        })
      });

      if (!result || result.status === 204) {
        await AsyncStorageService.removeItem(StorageConstants.replaceAccountId(
          StorageConstants.PUSH_AUTHENTICATION_DATA, accountData.id));
        SecureStorageService.removeItem(accountData.deviceId!);
        await AsyncStorageService.removeListItemByItemKey(StorageConstants.ACCOUNTS_DATA, 'id', accountData.id);

        // Retain TOTP data if exists.
        if (accountData.issuer) {
          const totpAccountData: AccountInterface = {
            id: accountData.id,
            username: accountData.username,
            displayName: accountData.displayName,
            issuer: accountData.issuer,
            period: accountData.period,
            algorithm: accountData.algorithm,
            digits: accountData.digits
          }
          await AsyncStorageService.addItem(StorageConstants.ACCOUNTS_DATA,
            TypeConvert.toStorageDataInterface(totpAccountData));
        }

        fetchAccounts();
      } else {
        throw new Error('Push unregistration failed with status: ' + result.status);
      }
    } catch {
      throw new Error('Push device unregistration failed.');
    }
  }, [getAccountByItemKey, fetchAccounts]);

  return (
    <PushAuthContext.Provider
      value={{
        addPushAuthMessageToCache,
        getPushAuthMessageFromCache,
        sentPushAuthResponse,
        registerPushDevice,
        unregisterPushDevice
      }}
    >
      {children}
      <Alert
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        autoDismissTimeout={2000}
        onPrimaryPress={
          () => {
            router.back();
            setAlertVisible(false);
          }
        }
      />
    </PushAuthContext.Provider>
  )
}

export default PushAuthProvider;
