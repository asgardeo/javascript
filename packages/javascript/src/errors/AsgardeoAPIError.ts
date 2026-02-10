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

import AsgardeoError from './AsgardeoError';

/**
 * Base class for all API-related errors in Asgardeo. This class extends AsgardeoError
 * and adds support for HTTP status codes and status text.
 *
 * @example
 * ```typescript
 * throw new AsgardeoAPIError(
 *   "Failed to fetch user data",
 *   "API_FETCH_ERROR",
 *   404,
 *   "Not Found"
 * );
 * ```
 */
export default class AsgardeoAPIError extends AsgardeoError {
  /**
   * Creates an instance of AsgardeoAPIError.
   *
   * @param message - Human-readable description of the error
   * @param code - A unique error code that identifies the error type
   * @param statusCode - HTTP status code of the failed request
   * @param statusText - HTTP status text of the failed request
   * @param origin - Optional. The SDK origin (e.g. 'react', 'vue'). Defaults to generic 'Asgardeo'
   * @constructor
   */
  constructor(
    message: string,
    code: string,
    origin: string,
    public readonly statusCode?: number,
    public readonly statusText?: string,
  ) {
    super(message, code, origin);

    Object.defineProperty(this, 'name', {
      configurable: true,
      value: 'AsgardeoAPIError',
      writable: true,
    });
  }

  /**
   * Returns a string representation of the API error
   * @returns Formatted error string with name, code, status, and message
   */
  public override toString(): string {
    const status: string = this.statusCode ? ` (HTTP ${this.statusCode} - ${this.statusText})` : '';
    return `[${this.name}] (code="${this.code}")${status}\nMessage: ${this.message}`;
  }
}
