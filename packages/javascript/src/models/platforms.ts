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

/**
 * Enumeration of supported identity platforms.
 *
 * - `Asgardeo`: Represents the Asgardeo cloud identity platform (asgardeo.io domains).
 * - `IdentityServer`: Represents WSO2 Identity Server (on-prem or custom domains).
 * - `Unknown`: Used when the platform cannot be determined from the configuration.
 *
 * This enum is used to distinguish between different identity providers and to
 * enable platform-specific logic throughout the SDK.
 */
export enum Platform {
  /** Asgardeo cloud identity platform (asgardeo.io domains) */
  Asgardeo = 'ASGARDEO',
  /** @experimental WSO2 Asgardeo V2 */
  AsgardeoV2 = 'AsgardeoV2',
  /** WSO2 Identity Server (on-prem or custom domains) */
  IdentityServer = 'IDENTITY_SERVER',
  /** Unknown or unsupported platform */
  Unknown = 'UNKNOWN',
}
