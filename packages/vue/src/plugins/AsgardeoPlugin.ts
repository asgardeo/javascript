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

import type {App, Plugin} from 'vue';
import AsgardeoProvider from '../providers/AsgardeoProvider';
import {injectStyles} from '../styles/injectStyles';

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
const AsgardeoPlugin: Plugin = {
  install(app: App): void {
    injectStyles();
    app.component('AsgardeoProvider', AsgardeoProvider);
  },
};

export default AsgardeoPlugin;
