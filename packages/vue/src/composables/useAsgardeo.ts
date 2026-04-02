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

import {resolveFlowTemplateLiterals, type FlowMetadataResponse} from '@asgardeo/browser';
import {inject, ref, type Ref} from 'vue';
import {ASGARDEO_KEY, FLOW_META_KEY, I18N_KEY} from '../keys';
import type {AsgardeoContext, FlowMetaContextValue, I18nContextValue} from '../models/contexts';

/**
 * Primary composable for Asgardeo authentication.
 *
 * Must be called inside a component that is a descendant of `<AsgardeoProvider>`.
 * Returns all auth-related reactive state and action methods.
 *
 * @throws Error if called outside of `<AsgardeoProvider>`.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useAsgardeo } from '@asgardeo/vue';
 *
 * const { isSignedIn, isLoading, user, signIn, signOut } = useAsgardeo();
 * </script>
 *
 * <template>
 *   <div v-if="isLoading">Loading...</div>
 *   <div v-else-if="isSignedIn">
 *     <p>Welcome, {{ user?.name }}</p>
 *     <button @click="signOut()">Sign Out</button>
 *   </div>
 *   <div v-else>
 *     <button @click="signIn()">Sign In</button>
 *   </div>
 * </template>
 * ```
 */
const useAsgardeo = (): AsgardeoContext => {
  const context: unknown = inject(ASGARDEO_KEY);

  if (!context) {
    throw new Error(
      '[Asgardeo] useAsgardeo() was called outside of <AsgardeoProvider>. ' +
        'Make sure to install the AsgardeoPlugin or wrap your app with <AsgardeoProvider>.',
    );
  }

  // FlowMetaContext lives inside AsgardeoProvider, so it is always present in
  // normal usage. Optional chaining keeps the composable safe in unit tests that
  // don't render FlowMetaProvider.
  const flowMetaContext: FlowMetaContextValue | null = inject(FLOW_META_KEY, null) as FlowMetaContextValue | null;

  // I18nContext provides the translation function.
  const i18nContext: I18nContextValue | null = inject(I18N_KEY, null) as I18nContextValue | null;

  const meta: Ref<FlowMetadataResponse | null> = flowMetaContext?.meta ?? ref(null);

  return {
    ...(context as AsgardeoContext),
    meta: meta as Readonly<Ref<FlowMetadataResponse | null>>,
    resolveFlowTemplateLiterals: (text: string | undefined): string =>
      resolveFlowTemplateLiterals(text, {
        meta: meta.value,
        t: i18nContext?.t ?? ((key: string): string => key),
      }),
  };
};

export default useAsgardeo;
