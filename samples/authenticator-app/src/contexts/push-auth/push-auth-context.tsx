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

import { Context, createContext } from "react";
import { PushAuthenticationDataInterface, PushAuthResponseStatus, PushNotificationQRDataInterface } from "../../models/push-notification";

export interface PushAuthContextInterface {
  /**
   * Adds a new push authentication message to the cache.
   *
   * @param id - The unique identifier for the push authentication message.
   * @param message - The push authentication message data.
   */
  addPushAuthMessageToCache: (id: string, message: PushAuthenticationDataInterface) => void;
  /**
   * Retrieves a push authentication message from the cache by its ID.
   *
   * @param id - The unique identifier for the push authentication message.
   * @returns The push authentication message data or undefined if not found.
   */
  getPushAuthMessageFromCache: (id: string) => PushAuthenticationDataInterface | undefined;
  /**
   * Sends the push authentication response back to the server.
   *
   * @param id - The unique identifier for the push authentication message.
   * @param status - The status of the push authentication response.
   * @returns A promise that resolves when the response has been sent.
   */
  sentPushAuthResponse: (id: string, status: PushAuthResponseStatus) => Promise<void>;
  /**
   * Register push device using the provided QR data.
   *
   * @param qrData - The push notification QR data.
   * @returns A promise that resolves when the registration is complete.
   * @throws Will throw an error if registration fails.
   */
  registerPushDevice: (qrData: PushNotificationQRDataInterface) => Promise<string>;
}

/**
 * Context to manage push authentication state and messages.
 */
const PushAuthContext: Context<PushAuthContextInterface> = createContext<PushAuthContextInterface>({
  addPushAuthMessageToCache: () => { },
  getPushAuthMessageFromCache: () => undefined,
  sentPushAuthResponse: async () => { },
  registerPushDevice: async () => ""
});

export default PushAuthContext;
