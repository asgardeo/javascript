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

import { PushNotificationQRDataInterface } from "./push-notification";
import { TOTPQRDataInterface } from "./totp";
import { UIConfig } from "./ui";

/**
 * Interface representing the response after validating QR code data.
 */
export interface QRDataValidationResponseInterface {
  isValid: boolean;
  type: QRDataType;
  pushNotificationData?: PushNotificationQRDataInterface;
  totpData?: TOTPQRDataInterface;
}

/**
 * Enum representing the types of QR data.
 */
export enum QRDataType {
  TOTP = "TOTP",
  PUSH_NOTIFICATION = "PUSH_NOTIFICATION",
  UNKNOWN = "UNKNOWN"
}

/**
 * Interface representing the deployment configuration.
 */
export interface DeploymentConfig {
  /**
   * Security configuration.
   */
  security: SecurityConfig;
  /**
   * Feature configuration.
   */
  feature: FeatureConfig;
  /**
   * Dev mode configuration.
   */
  devMode: DevModeConfig;
  /**
   * UI configuration.
   */
  ui: UIConfig;
}

/**
 * Feature configuration.
 */
export interface FeatureConfig {
  /**
   * Push notification related configurations.
   */
  push: {
    /**
     * Number of push authentication history records to retain.
     */
    numberOfHistoryRecords: number;
  }
}

/**
 * Security configuration.
 */
export interface SecurityConfig {
  /**
   * Enable or disable app screen locks.
   */
  enableAppScreenLocks: boolean;
  /**
   * Enable or disable settings screen lock.
   */
  enableSettingsScreenLock: boolean;
}

/**
 * Dev mode configuration.
 */
export interface DevModeConfig {
  /**
   * Enable or disable dev mode.
   */
  enabled: boolean;
  /**
   * The host URL to be used in dev mode.
   */
  host: string;
}
