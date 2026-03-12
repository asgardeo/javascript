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

// ── Plugin ──
export {default as AsgardeoPlugin} from './plugins/AsgardeoPlugin';

// ── Components ──
export {default as AsgardeoProvider} from './components/AsgardeoProvider';

// ── Composables ──
export {default as useAsgardeo} from './composables/useAsgardeo';

// ── Client ──
export {default as AsgardeoVueClient} from './AsgardeoVueClient';

// ── Keys ──
export {ASGARDEO_KEY} from './keys';

// ── Models / Types ──
export type {AsgardeoVueConfig} from './models/config';
export type {AsgardeoContext} from './models/contexts';

// ── Re-exports from @asgardeo/browser ──
export {
  type AllOrganizationsApiResponse,
  type Config,
  type EmbeddedFlowExecuteRequestConfig,
  type EmbeddedFlowExecuteRequestPayload,
  type EmbeddedFlowExecuteResponse,
  type EmbeddedSignInFlowHandleRequestPayload,
  type HttpRequestConfig,
  type HttpResponse,
  type IdToken,
  type Organization,
  type SignInOptions,
  type SignOutOptions,
  type SignUpOptions,
  type TokenExchangeRequestConfig,
  type TokenResponse,
  type User,
  type UserProfile,
} from '@asgardeo/browser';
