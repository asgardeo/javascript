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

import TypeConvert from "@/src/utils/typer-convert";
import { Router, useRouter } from "expo-router";
import { FunctionComponent, PropsWithChildren, ReactElement, useCallback, useEffect, useState } from "react";
import Alert, { AlertType } from "../../components/Alert";
import StorageConstants from "../../constants/storage";
import { PushAuthenticationDataInterface, PushAuthJWTBodyInterface, PushAuthJWTHeaderInterface, PushAuthResponseStatus } from "../../models/push-notification";
import { AccountInterface, PushAuthenticationDataStorageInterface, StorageDataInterface } from "../../models/storage";
import AsyncStorageService from "../../utils/async-storage-service";
import CryptoService from "../../utils/crypto-service";
import MessagingService from "../../utils/messagging-service";
import PushAuthContext from "./push-auth-context";

/**
 * Push Authentication Provider component.
 *
 * @param children - Child components.
 * @returns Push authentication provider component.
 */
const PushAuthProvider: FunctionComponent<PropsWithChildren> = ({ children }: PropsWithChildren): ReactElement => {
  const router: Router = useRouter();
  const [pushAuthMessageCache, setPushAuthMessageCache] = useState<Record<string, PushAuthenticationDataInterface>>({});
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>(AlertType.SUCCESS);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

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
   * Sets up a listener for when the app is in the foreground.
   * When a message is received, it is added to the cache.
   */
  useEffect(() => {
    const unsubscribe: () => void = MessagingService.listenForInAppMessages((data: PushAuthenticationDataInterface) => {
      addPushAuthMessageToCache(data.pushId, data);
      router.push({
        pathname: '/push-auth',
        params: { id: data.pushId }
      });
    });

    return unsubscribe;
  }, [addPushAuthMessageToCache, router]);

  /**
   * Build push authentication endpoint URL based on push ID.
   *
   * @param id - The push authentication ID.
   * @returns The constructed push authentication URL.
   */
  const buildPushAuthUrl = useCallback((id: string): string => {
    const { tenantDomain, organizationId } = pushAuthMessageCache[id];
    // TODO: Use the host from the QR data.
    const host = "http://192.168.208.18:8082";

    if (organizationId) {
      return `${host}/o/${organizationId}/push-auth/authenticate`;
    } else if (tenantDomain) {
      return `${host}/t/${tenantDomain}/push-auth/authenticate`;
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
      const pushAuthUrl: string = buildPushAuthUrl(id);

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
        const storageData: StorageDataInterface[] = await AsyncStorageService.getListItemByItemKey(
          StorageConstants.ACCOUNTS_DATA, "deviceId", pushAuthMessageCache[id].deviceId);

        if (storageData.length === 0) {
          return;
        }

        const accountDetails: AccountInterface = TypeConvert.toAccountInterface(storageData);

        const authStorageData: PushAuthenticationDataStorageInterface = {
          applicationName: pushAuthMessageCache[id].applicationName,
          ipAddress: pushAuthMessageCache[id].ipAddress,
          notificationScenario: pushAuthMessageCache[id].notificationScenario,
          deviceOS: pushAuthMessageCache[id].deviceOS,
          browser: pushAuthMessageCache[id].browser,
          sentTime: pushAuthMessageCache[id].sentTime,
          status: status,
          respondedTime: Date.now()
        };

        AsyncStorageService.addItem(
          StorageConstants.replaceAccountId(
            StorageConstants.PUSH_AUTHENTICATION_DATA, accountDetails.id),
          authStorageData,
          3 // Keep a maximum of 3 records per device ID.
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
  }, [ pushAuthMessageCache ]);

  return (
    <PushAuthContext.Provider
      value={{ addPushAuthMessageToCache, getPushAuthMessageFromCache, sentPushAuthResponse }}
    >
      { children }
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
