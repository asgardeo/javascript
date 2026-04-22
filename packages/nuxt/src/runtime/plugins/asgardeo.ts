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

import {defineNuxtPlugin, useState, useRequestEvent} from '#app';
import type {AsgardeoAuthState} from '../types';

/**
 * Client plugin that initializes the auth state from SSR hydration.
 *
 * On the server side, the Nitro plugin (auth-state.ts) resolves auth state
 * and stores it in event.context.__asgardeoAuth.
 *
 * This plugin reads it and initializes useState('asgardeo:auth') so that
 * the useAsgardeo() composable can use it on both server and client.
 */
export default defineNuxtPlugin(() => {
  const authState = useState<AsgardeoAuthState>('asgardeo:auth', () => ({
    isSignedIn: false,
    user: null,
    isLoading: true,
  }));

  // On server: read from event context (set by Nitro plugin)
  if (import.meta.server) {
    const event = useRequestEvent();
    const ssrAuth = event?.context?.['__asgardeoAuth'] as AsgardeoAuthState | undefined;
    if (ssrAuth) {
      authState.value = ssrAuth;
    } else {
      authState.value = {isSignedIn: false, user: null, isLoading: false};
    }
  }

  // On client: the state is already hydrated from SSR via useState
  // Just ensure isLoading is false after hydration
  if (import.meta.client) {
    authState.value = {...authState.value, isLoading: false};
  }
});
