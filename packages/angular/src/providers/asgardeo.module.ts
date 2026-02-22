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

import {NgModule, ModuleWithProviders, APP_INITIALIZER} from '@angular/core';
import {ASGARDEO_CONFIG} from './asgardeo-config.token';
import {AsgardeoCallbackComponent} from '../components/callback/callback.component';
import {AsgardeoCreateOrganizationComponent} from '../components/create-organization/create-organization.component';
import {AsgardeoOrganizationListComponent} from '../components/organization-list/organization-list.component';
import {AsgardeoOrganizationProfileComponent} from '../components/organization-profile/organization-profile.component';
import {AsgardeoOrganizationSwitcherComponent} from '../components/organization-switcher/organization-switcher.component';
import {AsgardeoUserProfileComponent} from '../components/user-profile/user-profile.component';
import {AsgardeoLoadingDirective} from '../directives/loading.directive';
import {AsgardeoSignedInDirective} from '../directives/signed-in.directive';
import {AsgardeoSignedOutDirective} from '../directives/signed-out.directive';
import {AsgardeoAngularConfig} from '../models/config';
import {AsgardeoAuthService} from '../services/asgardeo-auth.service';
import {AsgardeoOrganizationService} from '../services/asgardeo-organization.service';
import {AsgardeoUserService} from '../services/asgardeo-user.service';

/**
 * NgModule for Asgardeo authentication in module-based Angular applications.
 * Use `AsgardeoModule.forRoot(config)` in your root module.
 *
 * For standalone Angular 17+ apps, prefer `provideAsgardeo()` instead.
 *
 * @example
 * ```typescript
 * @NgModule({
 *   imports: [
 *     AsgardeoModule.forRoot({
 *       baseUrl: 'https://api.asgardeo.io/t/myorg',
 *       clientId: 'my-client-id',
 *       afterSignInUrl: window.location.origin,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@NgModule({
  exports: [
    AsgardeoSignedInDirective,
    AsgardeoSignedOutDirective,
    AsgardeoLoadingDirective,
    AsgardeoCallbackComponent,
    AsgardeoUserProfileComponent,
    AsgardeoOrganizationListComponent,
    AsgardeoCreateOrganizationComponent,
    AsgardeoOrganizationProfileComponent,
    AsgardeoOrganizationSwitcherComponent,
  ],
  imports: [
    AsgardeoSignedInDirective,
    AsgardeoSignedOutDirective,
    AsgardeoLoadingDirective,
    AsgardeoCallbackComponent,
    AsgardeoUserProfileComponent,
    AsgardeoOrganizationListComponent,
    AsgardeoCreateOrganizationComponent,
    AsgardeoOrganizationProfileComponent,
    AsgardeoOrganizationSwitcherComponent,
  ],
})
export class AsgardeoModule {
  static forRoot(config: AsgardeoAngularConfig): ModuleWithProviders<AsgardeoModule> {
    return {
      ngModule: AsgardeoModule,
      providers: [
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
      ],
    };
  }
}
