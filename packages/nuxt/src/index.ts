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
// Only AsgardeoContext is exposed — it is the return type of useAsgardeo()
// and users may need it to type custom wrappers. The individual *ContextValue
// types are internal implementation details; use ReturnType<typeof useXxx> instead.
export type {AsgardeoContext} from '@asgardeo/vue';

// ── Errors ─────────────────────────────────────────────────────────────────
export {AsgardeoError, ErrorCode} from './runtime/errors';
