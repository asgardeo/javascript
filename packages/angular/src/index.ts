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

// --- Client ---
export {default as AsgardeoAngularClient} from './AsgardeoAngularClient';

// --- Config ---
export type {AsgardeoAngularConfig} from './models/config';

// --- Providers ---
export {provideAsgardeo} from './providers/provide-asgardeo';
export {AsgardeoModule} from './providers/asgardeo.module';
export {ASGARDEO_CONFIG} from './providers/asgardeo-config.token';

// --- Services ---
export {AsgardeoAuthService} from './services/asgardeo-auth.service';
export {AsgardeoUserService} from './services/asgardeo-user.service';
export {AsgardeoOrganizationService} from './services/asgardeo-organization.service';

// --- Guard ---
export {asgardeoGuard} from './guards/asgardeo.guard';

// --- Interceptor ---
export {asgardeoInterceptor} from './interceptors/asgardeo.interceptor';

// --- Directives ---
export {AsgardeoSignedInDirective} from './directives/signed-in.directive';
export {AsgardeoSignedOutDirective} from './directives/signed-out.directive';
export {AsgardeoLoadingDirective} from './directives/loading.directive';

// --- Components ---
export {AsgardeoCallbackComponent} from './components/callback/callback.component';
export {AsgardeoUserProfileComponent} from './components/user-profile/user-profile.component';

// --- API ---
export {default as getAllOrganizations, GetAllOrganizationsConfig} from './api/getAllOrganizations';
export {default as createOrganization, CreateOrganizationConfig} from './api/createOrganization';
export {default as getMeOrganizations, GetMeOrganizationsConfig} from './api/getMeOrganizations';
export {default as getOrganization, GetOrganizationConfig} from './api/getOrganization';
export {default as updateOrganization, createPatchOperations, UpdateOrganizationConfig} from './api/updateOrganization';
export {default as getSchemas, GetSchemasConfig} from './api/getSchemas';
export {default as updateMeProfile, UpdateMeProfileConfig} from './api/updateMeProfile';
export {default as getMeProfile} from './api/getScim2Me';
export * from './api/getScim2Me';

// --- Re-exports from @asgardeo/browser ---
export {
  AsgardeoRuntimeError,
  http,
  navigate,
  type User,
  type UserProfile,
  type Organization,
  type IdToken,
  type TokenResponse,
  type HttpRequestConfig,
  type HttpResponse,
  type AllOrganizationsApiResponse,
  type TokenExchangeRequestConfig,
  type SignInOptions,
  type SignOutOptions,
  type SignUpOptions,
  type Config,
  Platform,
} from '@asgardeo/browser';
