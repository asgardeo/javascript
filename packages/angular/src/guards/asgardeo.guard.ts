/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
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

import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {AsgardeoAuthService} from '../services/asgardeo-auth.service';

/**
 * Functional route guard that protects routes requiring authentication.
 *
 * If the user is signed in, the route is activated. If not, the guard either:
 * - Triggers the signIn() flow (redirect to Asgardeo), or
 * - Redirects to a configured `signInUrl` from route data.
 *
 * @example
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'dashboard',
 *     component: DashboardComponent,
 *     canActivate: [asgardeoGuard],
 *   },
 *   {
 *     path: 'admin',
 *     component: AdminComponent,
 *     canActivate: [asgardeoGuard],
 *     data: { signInUrl: '/login' },
 *   },
 * ];
 * ```
 */
export const asgardeoGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _state: RouterStateSnapshot,
): Promise<boolean | UrlTree> => {
  const authService: AsgardeoAuthService = inject(AsgardeoAuthService);
  const router: Router = inject(Router);

  // Wait for initialization to complete if still loading
  if (authService.isLoading()) {
    await new Promise<void>((resolve: () => void) => {
      const check: ReturnType<typeof setInterval> = setInterval(() => {
        if (!authService.isLoading()) {
          clearInterval(check);
          resolve();
        }
      }, 50);
    });
  }

  if (authService.isSignedIn()) {
    return true;
  }

  // Check if a custom sign-in URL is provided via route data
  const signInUrl: string | undefined = route.data?.['signInUrl'] as string | undefined;

  if (signInUrl) {
    return router.createUrlTree([signInUrl]);
  }

  // Trigger the redirect-based sign-in flow
  await authService.signIn();
  return false;
};
