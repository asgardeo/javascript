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

import {HttpInterceptorFn, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {from, switchMap} from 'rxjs';
import {AsgardeoAuthService} from '../services/asgardeo-auth.service';

/**
 * Functional HTTP interceptor that automatically attaches the access token
 * to outgoing HTTP requests as a Bearer token in the Authorization header.
 *
 * Skips token attachment if:
 * - The request already has an Authorization header
 * - The user is not signed in
 *
 * @example
 * ```typescript
 * // app.config.ts
 * import { provideHttpClient, withInterceptors } from '@angular/common/http';
 * import { asgardeoInterceptor } from '@asgardeo/angular';
 *
 * export const appConfig = {
 *   providers: [
 *     provideHttpClient(withInterceptors([asgardeoInterceptor])),
 *     provideAsgardeo({ ... }),
 *   ],
 * };
 * ```
 */
export const asgardeoInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService: AsgardeoAuthService = inject(AsgardeoAuthService);

  // Skip if the request already has an Authorization header
  if (req.headers.has('Authorization')) {
    return next(req);
  }

  // Skip token attachment if the user is not signed in
  if (!authService.isSignedIn()) {
    return next(req);
  }

  return from(authService.getAccessToken()).pipe(
    switchMap((token: string) => {
      if (token) {
        const authReq: HttpRequest<unknown> = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next(authReq);
      }
      return next(req);
    }),
  );
};
