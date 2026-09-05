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

import {createLogger, LogLevel} from '@asgardeo/node';

const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];

/**
 * Resolves the server-side log level from `ASGARDEO_LOG_LEVEL`. Defaults to `error`, so that
 * degraded-but-working situations the SDK reports at `warn` (for example falling back to the ID token
 * when the SCIM2 profile cannot be loaded) can be surfaced by setting `ASGARDEO_LOG_LEVEL=warn`.
 */
const resolveLogLevel = (): LogLevel => {
  const configured: string | undefined = process.env['ASGARDEO_LOG_LEVEL']?.toLowerCase();

  return LOG_LEVELS.includes(configured as LogLevel) ? (configured as LogLevel) : 'error';
};

const logger: any = createLogger({
  level: resolveLogLevel(),
});

export default logger;
