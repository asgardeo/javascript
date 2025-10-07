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

import rawConfig from "../../config/app.config.json";
import { DeploymentConfig, DevModeConfig, FeatureConfig, SecurityConfig } from "../models/core";

const config: DeploymentConfig = rawConfig as DeploymentConfig;

/**
 * Get Feature configuration.
 *
 * @returns Feature configuration.
 */
export const getFeatureConfig = (): FeatureConfig => {
  return config.feature;
};

/**
 * Get Security configuration.
 *
 * @returns Security configuration.
 */
export const getSecurityConfig = (): SecurityConfig => {
  return config.security;
};

/**
 * Get Dev mode configuration.
 *
 * @returns Dev mode configuration.
 */
export const getDevModeConfig = (): DevModeConfig => {
  return config.devMode;
};

/**
 * Resolve host name based on dev mode configuration.
 *
 * @param host - Original host name.
 * @returns Resolved host name based on dev mode configuration.
 */
export const resolveHostName = (host: string): string => {
  if (getDevModeConfig().enabled) {
    return getDevModeConfig().host;
  }

  return host;
}
