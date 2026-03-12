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

import {type User as IUser} from '@asgardeo/browser';
import {type PropType, type VNode, defineComponent, h} from 'vue';

/**
 * BaseUser — unstyled user component using render-prop (scoped slot) pattern.
 *
 * Renders default slot with user data, or fallback slot if no user is provided.
 */
const BaseUser = defineComponent({
  name: 'BaseUser',
  props: {
    user: {type: Object as PropType<IUser | null>, default: null},
  },
  setup(props, {slots}) {
    return (): VNode[] | null => {
      if (!props.user) {
        return slots['fallback']?.() ?? null;
      }

      return slots['default']?.({user: props.user}) ?? null;
    };
  },
});

export default BaseUser;
