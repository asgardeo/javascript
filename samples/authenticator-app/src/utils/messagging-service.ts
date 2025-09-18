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

import messaging, { FirebaseMessagingTypes, getToken, onMessage, requestPermission } from '@react-native-firebase/messaging';
import { PushAuthenticationDataInterface } from '../models/push-notification';

const messagingInstance: FirebaseMessagingTypes.Module = messaging();

/**
 * Class containing messaging service utility methods.
 */
class MessagingService {
  /**
   * Requests user permissions to display offline notifications.
   */
  static async requestUserPermission(): Promise<void> {
    await requestPermission(messagingInstance);
  }

  /**
   * Generates a new FCM token for the device.
   *
   * @returns The FCM token for the device.
   */
  static async generateFCMToken(): Promise<string> {
    return getToken(messagingInstance);
  }

  /**
   * Listens for incoming in-app messages when the app is in the foreground.
   *
   * @param router - The router instance to navigate on message receipt.
   * @returns A function to unsubscribe from in-app message listener.
   */
  static listenForInAppMessages(callback: (data: PushAuthenticationDataInterface) => void): () => void {
    return onMessage(messagingInstance, (message: FirebaseMessagingTypes.RemoteMessage) => {
      if (message.data?.pushId) {
        const pushData: PushAuthenticationDataInterface = {
          username: message.data.username as string,
          tenantDomain: message.data.tenantDomain as string,
          organizationId: message.data.organizationId as string,
          organizationName: message.data.organizationName as string,
          userStoreDomain: message.data.userStoreDomain as string,
          deviceId: message.data.deviceId as string,
          applicationName: message.data.applicationName as string,
          notificationScenario: message.data.notificationScenario as string,
          pushId: message.data.pushId as string,
          challenge: message.data.challenge as string,
          numberChallenge: message.data.numberChallenge as string,
          ipAddress: message.data.ipAddress as string,
          deviceOS: message.data.deviceOS as string,
          browser: message.data.browser as string,
          sentTime: message.sentTime as number
        }

        callback(pushData);
      }
    });
  }
}

export default MessagingService;
