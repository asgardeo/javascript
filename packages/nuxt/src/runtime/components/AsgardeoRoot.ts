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

import {
  BrandingProvider,
  FlowProvider,
  I18nProvider,
  OrganizationProvider,
  ThemeProvider,
  UserProvider,
} from '@asgardeo/vue';
import {
  defineComponent,
  h,
  type Component,
  type SetupContext,
  type VNode,
} from 'vue';

/**
 * Nuxt root wrapper that mounts the full Asgardeo Vue provider tree.
 *
 * Mirrors `AsgardeoClientProvider` in the Next.js SDK — the primary
 * {@link I18nProvider}, {@link BrandingProvider}, {@link ThemeProvider},
 * {@link FlowProvider}, {@link UserProvider}, and {@link OrganizationProvider}
 * from `@asgardeo/vue` are composed in the same order so downstream composables
 * (`useUser`, `useOrganization`, `useFlow`, `useTheme`, `useBranding`,
 * `useAsgardeoI18n`) receive real context values rather than no-op placeholders.
 *
 * The `ASGARDEO_KEY` itself (config + auth state + actions) is still provided
 * at the app level by the Nuxt plugin, so this wrapper only has to supply the
 * auxiliary contexts.
 *
 * @example
 * ```vue
 * <!-- app.vue -->
 * <template>
 *   <AsgardeoRoot>
 *     <NuxtPage />
 *   </AsgardeoRoot>
 * </template>
 * ```
 */
const AsgardeoRoot: Component = defineComponent({
  name: 'AsgardeoRoot',
  setup(_props, {slots}: SetupContext): () => VNode {
    return (): VNode =>
      h(I18nProvider, null, {
        default: (): VNode =>
          h(BrandingProvider, null, {
            default: (): VNode =>
              h(ThemeProvider, {inheritFromBranding: true}, {
                default: (): VNode =>
                  h(FlowProvider, null, {
                    default: (): VNode =>
                      h(UserProvider, null, {
                        default: (): VNode =>
                          h(OrganizationProvider, null, {
                            default: (): VNode | VNode[] | undefined => slots['default']?.(),
                          }),
                      }),
                  }),
              }),
          }),
      });
  },
});

export default AsgardeoRoot;
