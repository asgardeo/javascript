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
 * Generates an unguessable session ID.
 *
 * Uses the Web Crypto API, which is available globally in Node.js 19+ and in edge runtimes, so the same helper works in
 * Next.js middleware and in server code.
 *
 * @returns A random UUID (v4).
 */
const generateSessionId = (): string => {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    const bytes: Uint8Array = globalThis.crypto.getRandomValues(new Uint8Array(16));

    return Array.from(bytes, (byte: number) => byte.toString(16).padStart(2, '0')).join('');
  }

  throw new Error('A secure random number generator is not available to generate the session ID.');
};

export default generateSessionId;
