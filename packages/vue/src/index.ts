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

// ── Providers ──
export {default as BrandingProvider} from './providers/BrandingProvider';
export {default as FlowMetaProvider} from './providers/FlowMetaProvider';
export {default as FlowProvider} from './providers/FlowProvider';
export {default as I18nProvider} from './providers/I18nProvider';
export {default as OrganizationProvider} from './providers/OrganizationProvider';
export {default as ThemeProvider} from './providers/ThemeProvider';
export {default as UserProvider} from './providers/UserProvider';

// ── Composables ──
export {default as useAsgardeo} from './composables/useAsgardeo';
export {default as useBranding} from './composables/useBranding';
export {default as useFlow} from './composables/useFlow';
export {default as useFlowMeta} from './composables/useFlowMeta';
export {default as useI18n} from './composables/useI18n';
export {default as useOrganization} from './composables/useOrganization';
export {default as useTheme} from './composables/useTheme';
export {default as useUser} from './composables/useUser';

// ── Client ──
export {default as AsgardeoVueClient} from './AsgardeoVueClient';

// ── Keys ──
export {
  ASGARDEO_KEY,
  BRANDING_KEY,
  FLOW_KEY,
  FLOW_META_KEY,
  I18N_KEY,
  ORGANIZATION_KEY,
  THEME_KEY,
  USER_KEY,
} from './keys';

// ── Models / Types ──
export type {AsgardeoVueConfig} from './models/config';
export type {
  AsgardeoContext,
  BrandingContextValue,
  FlowContextValue,
  FlowMessage,
  FlowMetaContextValue,
  FlowStep,
  I18nContextValue,
  OrganizationContextValue,
  ThemeContextValue,
  UserContextValue,
} from './models/contexts';

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
