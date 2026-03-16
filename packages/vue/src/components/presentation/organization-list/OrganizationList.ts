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

import {type Organization as IOrganization, withVendorCSSClassPrefix} from '@asgardeo/browser';
import {defineComponent, h} from 'vue';
import BaseOrganizationList from './BaseOrganizationList';
import useOrganization from '../../../composables/useOrganization';

/**
 * OrganizationList — styled organization list component.
 *
 * Retrieves organization list from context and delegates to BaseOrganizationList.
 */
const OrganizationList = defineComponent({
  name: 'OrganizationList',
  props: {
    className: {type: String, default: ''},
  },
  emits: ['select'],
  setup(props, {slots, emit}) {
    const {myOrganizations, isLoading, switchOrganization} = useOrganization();

    const handleSelect = async (org: IOrganization) => {
      emit('select', org);
      await switchOrganization(org);
    };

    return () =>
      h(
        BaseOrganizationList,
        {
          class: withVendorCSSClassPrefix('organization-list--styled'),
          className: props.className,
          organizations: myOrganizations.value,
          isLoading: isLoading.value,
          onSelect: handleSelect,
        },
        slots,
      );
  },
});

export default OrganizationList;
