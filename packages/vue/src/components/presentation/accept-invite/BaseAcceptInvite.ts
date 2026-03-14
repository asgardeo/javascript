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
import {defineComponent, h} from 'vue';

export interface BaseAcceptInviteProps {
  className?: string;
}

/**
 * BaseAcceptInvite — unstyled invitation acceptance UI.
 *
 * This component requires the app-native authentication flow which is not yet
 * supported in the Vue SDK. It will be implemented in a future release.
 */
const BaseAcceptInvite = defineComponent({
  name: 'BaseAcceptInvite',
  props: {
    className: {type: String, default: ''},
  },
  setup(props, {slots}) {
    return () => {
      if (slots['default']) {
        return slots['default']();
      }

      return h(
        'div',
        {
          class: [withVendorCSSClassPrefix('accept-invite--coming-soon'), props.className].filter(Boolean).join(' '),
          style: 'padding: 24px; border: 1px dashed #ccc; border-radius: 8px; text-align: center;',
        },
        [
          h('h3', {style: 'margin: 0 0 8px 0;'}, 'Accept Invite'),
          h('p', {style: 'color: #666; margin: 0; font-size: 14px;'}, 'Coming Soon — This embedded invitation acceptance component will be available when app-native authentication flow is implemented.'),
        ],
      );
    };
  },
});

export default BaseAcceptInvite;
