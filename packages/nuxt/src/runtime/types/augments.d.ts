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

import type {AsgardeoSessionPayload, AsgardeoSSRData} from './types';

/**
 * Nuxt schema augmentation — adds `asgardeo` to NuxtConfig / NuxtOptions
 * and ensures the runtime config shapes are fully typed.
 */
declare module '@nuxt/schema' {
  interface NuxtConfig {
    asgardeo?: import('./types').AsgardeoNuxtConfig;
  }
  interface NuxtOptions {
    asgardeo?: import('./types').AsgardeoNuxtConfig;
  }
}

/**
 * H3 event context augmentation — provides a typed `event.context.asgardeo`
 * property so server plugins and API routes no longer need `as any` casts.
 *
 * Set by the Nitro `asgardeo-ssr` plugin on every page request.
 */
declare module 'h3' {
  interface H3EventContext {
    /**
     * Resolved auth state for the current request.
     * Populated by the Nitro `asgardeo-ssr` plugin during SSR page requests.
     * `null` when the request is an API route or when the session is absent/invalid.
     */
    asgardeo?: {
      isSignedIn: boolean;
      session: AsgardeoSessionPayload | null;
      /**
       * Rich SSR payload populated by the Nitro `asgardeo-ssr` plugin.
       * Contains the user, userProfile, organisations, and branding data
       * resolved on the server and seeded into `useState` keys for
       * zero-cost client hydration.
       */
      ssr?: AsgardeoSSRData;
    };
  }
}

export {};
