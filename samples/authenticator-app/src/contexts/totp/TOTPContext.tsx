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
import { TOTPQRDataInterface } from "../../models/totp";

/**
 * Interface for the TOTP context.
 */
export interface TOTPContextInterface {
  /**
   * Register TOTP using the provided QR data.
   *
   * @param qrData - QR data to register TOTP.
   * @returns Promise that resolves to the account ID.
   */
  registerTOTP: (qrData: TOTPQRDataInterface) => Promise<string>;
  /**
   * Unregister TOTP for the given account ID.
   *
   * @param id - The account ID.
   * @returns A promise that resolves when the unregistration is complete.
   * @throws Will throw an error if unregistration fails.
   */
  unregisterTOTP: (id: string) => Promise<void>;
  /**
   * Indicates if a TOTP code generation is in progress.
   */
  isGenerating?: boolean;
  /**
   * Current generated TOTP code.
   */
  code?: string;
  /**
   * Remaining time in seconds for the current TOTP code to expire.
   */
  remainingTime?: number;
  /**
   * Next TOTP code.
   */
  nextCode?: string;
}

/**
 * TOTP Context to be used by the TOTP provider and consumers.
 */
const TOTPContext: Context<TOTPContextInterface> = createContext<TOTPContextInterface>({
  registerTOTP: async () => "",
  unregisterTOTP: async () => { },
  isGenerating: false,
  code: "",
  remainingTime: 0,
  nextCode: ""
});

export default TOTPContext;
