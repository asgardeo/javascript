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

import type {H3Event} from 'h3';
import type {AsgardeoSessionPayload, AsgardeoSSRData} from '../../types';

/**
 * The typed shape of `event.context.asgardeo` set by the Asgardeo Nitro plugin
 * on every SSR request.
 */
export interface AsgardeoEventContext {
  /** The decoded session payload, or null when the user is not signed in. */
  session: AsgardeoSessionPayload | null;
  /** Convenience boolean derived from the session presence. */
  isSignedIn: boolean;
  /** SSR-prefetched data (user profile, orgs, branding). Present only after the SSR plugin runs. */
  ssr?: AsgardeoSSRData;
}

/**
 * Typed accessor for `event.context.asgardeo`.
 *
 * Returns null when called before the Asgardeo SSR plugin has populated
 * the context (e.g. in non-Nuxt Nitro routes that run before the plugin).
 *
 * @example
 * ```ts
 * import { getAsgardeoContext } from '@asgardeo/nuxt/server';
 *
 * export default defineEventHandler((event) => {
 *   const ctx = getAsgardeoContext(event);
 *   if (!ctx?.isSignedIn) throw createError({ statusCode: 401 });
 *   return { userId: ctx.session!.sub };
 * });
 * ```
 */
export function getAsgardeoContext(event: H3Event): AsgardeoEventContext | null {
  return (event.context.asgardeo as AsgardeoEventContext | undefined) ?? null;
}
