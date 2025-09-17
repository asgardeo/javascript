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

import messaging, { getToken, requestPermission } from '@react-native-firebase/messaging';

/**
 * Class containing messaging service utility methods.
 */
class MessagingService {
  /**
   * Requests user permissions to display offline notifications.
   */
  static async requestUserPermission(): Promise<void> {
    await requestPermission(messaging());
  }

  /**
   * Generates a new FCM token for the device.
   *
   * @returns The FCM token for the device.
   */
  static async generateFCMToken(): Promise<string> {
    return getToken(messaging());
  }
}

export default MessagingService;
