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

import type { App, Plugin } from 'vue';
import AsgardeoProvider from '../providers/AsgardeoProvider';
import { injectStyles } from '../styles/injectStyles';

/**
 * Options accepted by {@link AsgardeoPlugin}.
 *
 * @example Browser SPA (default behaviour — no options needed)
 * ```ts
 * app.use(AsgardeoPlugin);
 * ```
 *
 * @example Delegated mode (e.g. @asgardeo/nuxt)
 * ```ts
 * // The host framework is responsible for providing all injection context
 * // via app.provide().  The plugin skips browser-only initialisation so it
 * // can run safely in SSR environments.
 * app.use(AsgardeoPlugin, { mode: 'delegated' });
 * ```
 */
export interface AsgardeoPluginOptions {
  /**
   * `'browser'` (default) — full browser PKCE flow, registers `<AsgardeoProvider>`.
   * `'delegated'` — the host framework (e.g. `@asgardeo/nuxt`) provides all
   * injection context via `app.provide()`.  The plugin skips browser-only
   * initialisation so it is safe to call during SSR.
   */
  mode?: 'browser' | 'delegated';
}

/**
 * Vue plugin for Asgardeo authentication.
 *
 * Registers the `<AsgardeoProvider>` component globally so it can be used
 * anywhere in the application without explicit imports.
 *
 * @example
 * ```ts
 * import { createApp } from 'vue';
 * import { AsgardeoPlugin } from '@asgardeo/vue';
 * import App from './App.vue';
 *
 * const app = createApp(App);
 * app.use(AsgardeoPlugin);
 * app.mount('#app');
 * ```
 *
 * Then in your root component:
 * ```vue
 * <template>
 *   <AsgardeoProvider :base-url="baseUrl" :client-id="clientId">
 *     <router-view />
 *   </AsgardeoProvider>
 * </template>
 * ```
 */
const AsgardeoPlugin: Plugin<[AsgardeoPluginOptions?]> = {
  install(app: App, options?: AsgardeoPluginOptions): void {
    injectStyles();

    if (options?.mode === 'delegated') {
      // In delegated mode the host framework is responsible for providing all
      // injection context (ASGARDEO_KEY, USER_KEY, …) via app.provide() and
      // for registering its own root component.
      return;
    }
    app.component('AsgardeoProvider', AsgardeoProvider);
  },
};

export default AsgardeoPlugin;
