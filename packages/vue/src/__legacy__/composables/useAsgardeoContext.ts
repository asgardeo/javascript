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

import {inject} from 'vue';
import {ASGARDEO_INJECTION_KEY} from '../plugins/AsgardeoPlugin';
import {AuthContextInterface} from '../types';

/**
 * Retrieves the Asgardeo authentication context from Vue's dependency injection system.
 *
 * @throws {Error} Throws an error if the Vue plugin is not installed.
 * @returns {AuthContextInterface} The authentication context containing authentication methods and state.
 */
export function useAsgardeoContext(): AuthContextInterface {
  const ctx: AuthContextInterface = inject(ASGARDEO_INJECTION_KEY);

  if (!ctx) {
    throw new Error('This can be only used when vue plugin is installed');
  }

  return ctx;
}
