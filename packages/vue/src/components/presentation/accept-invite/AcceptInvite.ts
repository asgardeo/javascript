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

import {withVendorCSSClassPrefix} from '@asgardeo/browser';
import {type VNode, defineComponent, h} from 'vue';
import Card from '../../primitives/Card';
import Typography from '../../primitives/Typography';

/**
 * AcceptInvite — embedded invitation acceptance component.
 *
 * This component requires the app-native authentication flow which is not yet
 * supported in the Vue SDK. It will be implemented in a future release.
 */
const AcceptInvite: ReturnType<typeof defineComponent> = defineComponent({
  name: 'AcceptInvite',
  setup(_props: Record<string, unknown>, {slots}) {
    return (): VNode | VNode[] => {
      if (slots['default']) {
        return slots['default']();
      }

      return h(Card, {class: withVendorCSSClassPrefix('accept-invite--coming-soon')}, () => [
        h(Typography, {variant: 'h5'}, () => 'Accept Invite'),
        h(
          'p',
          {style: 'color: #666; margin-top: 8px; font-size: 14px;'},
          'Coming Soon — This embedded invitation acceptance component will be available when app-native authentication flow is implemented in the Vue SDK.',
        ),
      ]);
    };
  },
});

export default AcceptInvite;
