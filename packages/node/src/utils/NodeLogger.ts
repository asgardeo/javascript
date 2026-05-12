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

/* eslint-disable no-console */

import {LOGGER_CONFIG} from '../constants';

enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  OFF,
}

export class Logger {
  static LOG_LEVEL: string = process.env['LOG_LEVEL'] ?? LogLevel[LogLevel.OFF];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static debug(message: string): void {
    if (LogLevel[this.LOG_LEVEL] <= LogLevel.DEBUG)
      console.log(
        LOGGER_CONFIG.bgGreen,
        LOGGER_CONFIG.fgBlack,
        'DEBUG',
        LOGGER_CONFIG.reset,
        LOGGER_CONFIG.fgGreen,
        message,
        LOGGER_CONFIG.reset,
      );
  }

  public static info(message: string): void {
    if (LogLevel[this.LOG_LEVEL] <= LogLevel.INFO)
      console.log(
        LOGGER_CONFIG.bgWhite,
        LOGGER_CONFIG.fgBlack,
        'INFO',
        LOGGER_CONFIG.reset,
        LOGGER_CONFIG.fgWhite,
        message,
        LOGGER_CONFIG.reset,
      );
  }

  public static warn(message: string): void {
    if (LogLevel[this.LOG_LEVEL] <= LogLevel.WARN)
      console.log(
        LOGGER_CONFIG.bgYellow,
        LOGGER_CONFIG.fgBlack,
        'WARNING',
        LOGGER_CONFIG.reset,
        LOGGER_CONFIG.fgYellow,
        message,
        LOGGER_CONFIG.reset,
      );
  }

  public static error(message: string): void {
    if (LogLevel[this.LOG_LEVEL] <= LogLevel.ERROR)
      console.log(
        LOGGER_CONFIG.bgRed,
        LOGGER_CONFIG.fgBlack,
        'ERROR',
        LOGGER_CONFIG.reset,
        LOGGER_CONFIG.fgRed,
        message,
        LOGGER_CONFIG.reset,
      );
  }
}
