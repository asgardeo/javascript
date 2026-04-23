/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.  You may obtain a copy of the
 * License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied.  See the License for the specific
 * language governing permissions and limitations under the
 * License.
 */

import {defineNuxtRouteMiddleware, navigateTo, useState} from '#app';
import type {AsgardeoAuthState} from '../types';

export interface AsgardeoMiddlewareOptions {
  /**
   * If `true`, the middleware will also require that the user has an
   * `organizationId` in their session.  Redirects to `redirectTo` if not.
   */
  requireOrganization?: boolean;
  /**
   * Required OAuth scopes.  The middleware checks that every listed scope
   * is present in the session before allowing access.
   */
  requireScopes?: string[];
  /**
   * The path to redirect unauthenticated (or unauthorised) requests to.
   * Defaults to `'/api/auth/signin'`.
   */
  redirectTo?: string;
}

const DEFAULT_REDIRECT_TO = '/api/auth/signin';

/**
 * Typed factory for Asgardeo route middleware.
 *
 * Usage in a page component:
 * ```vue
 * <script setup>
 * definePageMeta({
 *   middleware: [defineAsgardeoMiddleware({ requireOrganization: true })]
 * });
 * </script>
 * ```
 *
 * Or add it as a named middleware in `middleware/` and reference by name.
 *
 * The built-in `'auth'` middleware registered by this module is equivalent
 * to calling `defineAsgardeoMiddleware()` with no options.
 */
export function defineAsgardeoMiddleware(options: AsgardeoMiddlewareOptions = {}) {
  const {redirectTo = DEFAULT_REDIRECT_TO, requireOrganization = false, requireScopes = []} = options;

  return defineNuxtRouteMiddleware((to) => {
    const authState = useState<AsgardeoAuthState>('asgardeo:auth');

    if (!authState.value?.isSignedIn) {
      const returnTo = encodeURIComponent(to.fullPath);
      return navigateTo(`${redirectTo}?returnTo=${returnTo}`, {external: true});
    }

    const user = authState.value.user as Record<string, unknown> | null;

    if (requireOrganization && !user?.['organizationId']) {
      return navigateTo(redirectTo, {external: true});
    }

    if (requireScopes.length > 0) {
      const sessionScopes = String(user?.['scopes'] ?? '').split(' ');
      const hasAllScopes = requireScopes.every((s) => sessionScopes.includes(s));
      if (!hasAllScopes) {
        return navigateTo(redirectTo, {external: true});
      }
    }
  });
}
