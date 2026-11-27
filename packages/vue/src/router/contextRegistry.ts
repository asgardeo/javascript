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

import type {AsgardeoContext} from '../models/contexts';

/**
 * The Asgardeo context of the mounted `<AsgardeoProvider>`.
 *
 * The provider supplies its context with component-level `provide()`, which router navigation guards can't
 * `inject()`: guards only see values provided on the app. The provider registers its context here as well, so that
 * `createAsgardeoGuard()` can read it.
 */
let registeredContext: AsgardeoContext | null = null;

/**
 * Registers the context of a mounted `<AsgardeoProvider>`.
 *
 * @param context - The provider's context.
 * @returns A function that unregisters the context, for when the provider unmounts.
 */
export const registerAsgardeoContext = (context: AsgardeoContext): (() => void) => {
  registeredContext = context;

  return (): void => {
    if (registeredContext === context) {
      registeredContext = null;
    }
  };
};

/**
 * Returns the context of the mounted `<AsgardeoProvider>`, or `null` when none is mounted.
 */
export const getRegisteredAsgardeoContext = (): AsgardeoContext | null => registeredContext;
