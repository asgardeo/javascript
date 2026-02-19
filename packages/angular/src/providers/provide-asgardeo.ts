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

import {EnvironmentProviders, makeEnvironmentProviders, APP_INITIALIZER} from '@angular/core';
import {ASGARDEO_CONFIG} from './asgardeo-config.token';
import {AsgardeoAngularConfig} from '../models/config';
import {AsgardeoAuthService} from '../services/asgardeo-auth.service';
import {AsgardeoOrganizationService} from '../services/asgardeo-organization.service';
import {AsgardeoUserService} from '../services/asgardeo-user.service';

/**
 * Provides Asgardeo authentication services for standalone Angular applications (Angular 17+).
 *
 * @param config - The Asgardeo configuration object.
 * @returns EnvironmentProviders to be used in the app's providers array.
 *
 * @example
 * ```typescript
 * // app.config.ts
 * import { provideAsgardeo } from '@asgardeo/angular';
 *
 * export const appConfig = {
 *   providers: [
 *     provideAsgardeo({
 *       baseUrl: 'https://api.asgardeo.io/t/myorg',
 *       clientId: 'my-client-id',
 *       afterSignInUrl: window.location.origin,
 *       afterSignOutUrl: window.location.origin,
 *       scopes: ['openid', 'profile', 'email'],
 *     }),
 *   ],
 * };
 * ```
 */
export function provideAsgardeo(config: AsgardeoAngularConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: ASGARDEO_CONFIG, useValue: config},
    AsgardeoAuthService,
    AsgardeoUserService,
    AsgardeoOrganizationService,
    {
      deps: [AsgardeoAuthService],
      multi: true,
      provide: APP_INITIALIZER,
      useFactory: (authService: AsgardeoAuthService) => () => authService.initialize(),
    },
  ]);
}
