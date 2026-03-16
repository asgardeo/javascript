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
import {type PropType, type VNode, defineComponent, h} from 'vue';
import Spinner from '../../primitives/Spinner';
import Typography from '../../primitives/Typography';
import {BuildingIcon} from '../../primitives/Icons';

/**
 * BaseOrganizationList — unstyled list of organizations.
 */
const BaseOrganizationList = defineComponent({
  name: 'BaseOrganizationList',
  props: {
    className: {type: String, default: ''},
    organizations: {type: Array as PropType<IOrganization[]>, default: () => []},
    isLoading: {type: Boolean, default: false},
    onSelect: {type: Function as PropType<(org: IOrganization) => void>, default: undefined},
  },
  setup(props, {slots}) {
    return () => {
      if (slots['default']) {
        return slots['default']({organizations: props.organizations, isLoading: props.isLoading});
      }

      const prefix = withVendorCSSClassPrefix;
      const children: VNode[] = [];

      if (props.isLoading) {
        children.push(h('div', {class: prefix('organization-list__loading')}, [h(Spinner)]));
      } else if (props.organizations.length === 0) {
        children.push(
          h(Typography, {variant: 'body2', class: prefix('organization-list__empty')}, () => 'No organizations found'),
        );
      } else {
        props.organizations.forEach((org) => {
          children.push(
            h(
              'button',
              {
                type: 'button',
                key: org['id'],
                class: prefix('organization-list__item'),
                onClick: () => props.onSelect?.(org),
              },
              [
                h(BuildingIcon, {size: 16}),
                h(Typography, {variant: 'body1'}, () => org['name'] || org['id']),
              ],
            ),
          );
        });
      }

      return h(
        'div',
        {class: [prefix('organization-list'), props.className].filter(Boolean).join(' ')},
        children,
      );
    };
  },
});

export default BaseOrganizationList;
