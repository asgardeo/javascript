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

import {defineNuxtRouteMiddleware, navigateTo, useState} from '#app';
import type {AsgardeoAuthState} from '../types';

/**
 * Named route middleware for protecting pages.
 *
 * Usage in a page:
 * ```vue
 * <script setup>
 * definePageMeta({ middleware: ['auth'] });
 * </script>
 * ```
 *
 * When a user is not authenticated, they are redirected to the
 * sign-in endpoint with a `returnTo` parameter pointing to the
 * page they tried to access.
 */
export default defineNuxtRouteMiddleware((to) => {
  const authState = useState<AsgardeoAuthState>('asgardeo:auth');

  if (!authState.value?.isSignedIn) {
    const returnTo = to.fullPath;
    return navigateTo(`/api/auth/signin?returnTo=${encodeURIComponent(returnTo)}`, {
      external: true,
    });
  }
});
