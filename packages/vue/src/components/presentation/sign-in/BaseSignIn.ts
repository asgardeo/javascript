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

import {Platform} from '@asgardeo/browser';
import {type Component, type SetupContext, type VNode, defineComponent, h} from 'vue';
import useAsgardeo from '../../../composables/useAsgardeo';
import BaseSignInV1 from './v1/BaseSignIn';
import BaseSignInV2 from './v2/BaseSignIn';

export type {BaseSignInRenderProps, BaseSignInProps} from './v2/BaseSignIn';

/**
 * BaseSignIn — platform-aware base sign-in component.
 *
 * Routes to the V1 (authenticator-based) or V2 (component-driven) BaseSignIn
 * based on the configured `platform`.
 */
const BaseSignIn: Component = defineComponent({
  name: 'BaseSignIn',
  inheritAttrs: false,
  setup(_props: Record<string, unknown>, {attrs, slots}: SetupContext): () => VNode {
    const {platform} = useAsgardeo();

    return (): VNode => {
      if (platform === Platform.AsgardeoV2) {
        return h(BaseSignInV2, {...attrs}, slots);
      }

      return h(BaseSignInV1, {...attrs}, slots);
    };
  },
});

export default BaseSignIn;