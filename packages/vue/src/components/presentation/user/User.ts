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

import {type VNode, defineComponent, h} from 'vue';
import useAsgardeo from '../../../composables/useAsgardeo';
import BaseUser from './BaseUser';

/**
 * User — styled user component.
 *
 * Retrieves user from Asgardeo context and delegates to BaseUser.
 */
const User = defineComponent({
  name: 'User',
  setup(_props, {slots}) {
    const {user} = useAsgardeo();

    return (): VNode => h(BaseUser, {user: user.value}, slots);
  },
});

export default User;
