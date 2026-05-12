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

interface LoggerConfig {
  bgGreen: string;
  bgRed: string;
  bgWhite: string;
  bgYellow: string;
  fgBlack: string;
  fgGreen: string;
  fgRed: string;
  fgWhite: string;
  fgYellow: string;
  reset: string;
}

export const LOGGER_CONFIG: LoggerConfig = {
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgWhite: '\x1b[47m',
  bgYellow: '\x1b[43m',
  fgBlack: '\x1b[30m',
  fgGreen: '\x1b[32m',
  fgRed: '\x1b[31m',
  fgWhite: '\x1b[37m',
  fgYellow: '\x1b[33m',
  reset: '\x1b[0m',
};
