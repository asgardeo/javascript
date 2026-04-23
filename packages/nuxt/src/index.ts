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

export {default} from './module';

// ── Types ──────────────────────────────────────────────────────────────────
export type {
  AsgardeoNuxtConfig,
  AsgardeoSessionPayload,
  AsgardeoTempSessionPayload,
  AsgardeoAuthState,
} from './runtime/types';

// ── Composables ────────────────────────────────────────────────────────────
// The Nuxt-specific `useAsgardeo` layers navigation overrides over Vue's
// `useAsgardeo`. The rest are re-exports of `@asgardeo/vue` composables —
// their contexts are mounted by `<AsgardeoRoot>` (see runtime/components).
export {useAsgardeo} from './runtime/composables/useAsgardeo';
export {useUser, useOrganization, useFlow, useTheme, useBranding} from '@asgardeo/vue';
export {useI18n as useAsgardeoI18n} from '@asgardeo/vue';

// ── Components ─────────────────────────────────────────────────────────────
export {default as AsgardeoRoot} from './runtime/components/AsgardeoRoot';

// ── Middleware ─────────────────────────────────────────────────────────────
export {defineAsgardeoMiddleware} from './runtime/middleware/defineAsgardeoMiddleware';
export type {AsgardeoMiddlewareOptions} from './runtime/middleware/defineAsgardeoMiddleware';

// ── Composable types (re-exported from @asgardeo/vue) ─────────────────────
export type {
  AsgardeoContext,
  UserContextValue,
  OrganizationContextValue,
  FlowContextValue,
  ThemeContextValue,
  BrandingContextValue,
  I18nContextValue,
} from '@asgardeo/vue';

// ── Utilities ──────────────────────────────────────────────────────────────
export {createRouteMatcher} from './runtime/utils/createRouteMatcher';

// ── Errors ─────────────────────────────────────────────────────────────────
export {AsgardeoError, ErrorCode} from './runtime/errors';

// ── Logging ────────────────────────────────────────────────────────────────
export {maskToken, createLogger} from './runtime/utils/log';
