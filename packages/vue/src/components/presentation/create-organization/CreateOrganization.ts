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
import useOrganization from '../../../composables/useOrganization';
import BaseCreateOrganization from './BaseCreateOrganization';

/**
 * CreateOrganization — styled sub-organisation creation component.
 *
 * Retrieves createOrganization from context and delegates to BaseCreateOrganization.
 */
const CreateOrganization = defineComponent({
  name: 'CreateOrganization',
  props: {
    className: {type: String, default: ''},
    title: {type: String, default: 'Create Organization'},
    description: {type: String, default: 'Create a new sub-organization.'},
  },
  setup(props, {slots}) {
    const {createOrganization} = useOrganization();

    return () =>
      h(
        BaseCreateOrganization,
        {
          class: withVendorCSSClassPrefix('create-organization--styled'),
          className: props.className,
          title: props.title,
          description: props.description,
          onCreate: createOrganization
            ? async (name: string) => {
                await createOrganization({name, description: '', parentId: '', type: 'TENANT'}, '');
              }
            : undefined,
        },
        slots,
      );
  },
});

export default CreateOrganization;
