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

import messaging, {
  FirebaseMessagingTypes,
  getToken,
  onMessage,
  requestPermission,
  onNotificationOpenedApp
} from '@react-native-firebase/messaging';
import { PushAuthenticationDataInterface } from '../models/push-notification';
import { PermissionsAndroid, Platform } from 'react-native';
import { getLastNotificationResponse, NotificationResponse, clearLastNotificationResponse } from "expo-notifications";

const messagingInstance: FirebaseMessagingTypes.Module = messaging();

/**
 * Class containing messaging service utility methods.
 */
class MessagingService {
  /**
   * Requests user permissions to display offline notifications.
   */
  static async requestUserPermission(): Promise<void> {
    if (Platform.OS === 'ios') {
      await requestPermission(messagingInstance);
    } else if (Platform.OS === 'android') {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }
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
   * Creates a push authentication data payload from the received message.
   *
   * @param message - The received remote message.
   * @returns The push authentication data payload or null if the message is invalid.
   */
  private static createPushDataPayload(
    message: FirebaseMessagingTypes.RemoteMessage
  ): PushAuthenticationDataInterface | null {
    if (!message.data?.pushId) {
      return null;
    }

    return {
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
    };
  }

  /**
   * Creates a push authentication data payload from the notification response.
   *
   * @param response - The notification response from Expo.
   * @returns The push authentication data payload or null if the response is invalid.
   */
  static createPushDataPayloadFromExpo(
    response: NotificationResponse
  ): PushAuthenticationDataInterface | null {
    if (!response?.notification?.request?.content?.data?.pushId) {
      return null;
    }

    return {
      username: response.notification.request.content.data.username as string,
      tenantDomain: response.notification.request.content.data.tenantDomain as string,
      organizationId: response.notification.request.content.data.organizationId as string,
      organizationName: response.notification.request.content.data.organizationName as string,
      userStoreDomain: response.notification.request.content.data.userStoreDomain as string,
      deviceId: response.notification.request.content.data.deviceId as string,
      applicationName: response.notification.request.content.data.applicationName as string,
      notificationScenario: response.notification.request.content.data.notificationScenario as string,
      pushId: response.notification.request.content.data.pushId as string,
      challenge: response.notification.request.content.data.challenge as string,
      numberChallenge: response.notification.request.content.data.numberChallenge as string,
      ipAddress: response.notification.request.content.data.ipAddress as string,
      deviceOS: response.notification.request.content.data.deviceOS as string,
      browser: response.notification.request.content.data.browser as string,
      sentTime: response.notification.date as number
    };
  }

  /**
   * Listens for incoming in-app messages when the app is in the foreground.
   *
   * @param router - The router instance to navigate on message receipt.
   * @returns A function to unsubscribe from in-app message listener.
   */
  static listenForInAppMessages(callback: (data: PushAuthenticationDataInterface) => void): () => void {
    return onMessage(messagingInstance, (message: FirebaseMessagingTypes.RemoteMessage) => {
      const pushData: PushAuthenticationDataInterface | null = this.createPushDataPayload(message);
      if (pushData) {
        callback(pushData);
      }
    });
  }

  /**
   * Listens for notification opens when the app is in the background.
   *
   * @param callback - The callback to execute on notification open.
   * @returns A function to unsubscribe from notification open listener.
   */
  static listenForNotificationOpenWhenAppInBackground(
    callback: (data: PushAuthenticationDataInterface) => void
  ): () => void {
    return onNotificationOpenedApp(messagingInstance, (message: FirebaseMessagingTypes.RemoteMessage) => {
      const pushData: PushAuthenticationDataInterface | null = this.createPushDataPayload(message);
      if (pushData) {
        callback(pushData);
      }
    });
  }

  /**
   * Sets up a listener for when the app is closed.
   *
   * @param callback - The callback to execute on notification open.
   */
  static listenForNotificationOpenWhenAppIsClosed(callback: (data: PushAuthenticationDataInterface) => void): void {
    const response: NotificationResponse | null = getLastNotificationResponse();
    if (response) {
      const pushData: PushAuthenticationDataInterface | null = this.createPushDataPayloadFromExpo(response);
      if (pushData) {
        clearLastNotificationResponse();
        callback(pushData);
      }
    }
  }
}

export default MessagingService;
