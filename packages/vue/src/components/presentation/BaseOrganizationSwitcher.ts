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
import type {Organization} from '@asgardeo/browser';
import type {PropType, VNode} from 'vue';
import {defineComponent, h, ref} from 'vue';
import Button from '../primitives/Button';
import Card from '../primitives/Card';
import Divider from '../primitives/Divider';
import {BuildingIcon, ChevronDownIcon} from '../primitives/Icons';
import Spinner from '../primitives/Spinner';
import Typography from '../primitives/Typography';

const cls = (name: string): string => withVendorCSSClassPrefix(`organization-switcher${name}`);

/**
 * BaseOrganizationSwitcher — unstyled organisation dropdown switcher.
 *
 * Shows the current organization name and a dropdown list to switch.
 */
const BaseOrganizationSwitcher = defineComponent({
  name: 'BaseOrganizationSwitcher',
  props: {
    className: {type: String, default: ''},
    currentOrganization: {type: Object as PropType<Organization | null>, default: null},
    organizations: {type: Array as PropType<Organization[]>, default: () => []},
    isLoading: {type: Boolean, default: false},
    onSwitch: {type: Function as PropType<(org: Organization) => void>, default: undefined},
  },
  setup(props, {slots}) {
    const isOpen = ref(false);

    const toggle = (): void => {
      isOpen.value = !isOpen.value;
    };

    const handleSelect = (org: Organization): void => {
      isOpen.value = false;
      props.onSwitch?.(org);
    };

    return () => {
      if (slots['default']) {
        return slots['default']({
          currentOrganization: props.currentOrganization,
          organizations: props.organizations,
          isLoading: props.isLoading,
          isOpen: isOpen.value,
          toggle,
          handleSelect,
        });
      }

      const currentName = props.currentOrganization?.name ?? 'No Organization';

      const triggerButton = h(
        'button',
        {
          type: 'button',
          class: cls('__trigger'),
          onClick: toggle,
          'aria-haspopup': 'listbox',
          'aria-expanded': isOpen.value,
        },
        [
          h(BuildingIcon, {size: 16}),
          h(Typography, {variant: 'body2', class: cls('__trigger-label')}, () => currentName),
          h(ChevronDownIcon, {size: 12}),
        ],
      );

      const dropdownChildren: VNode[] = [];

      if (props.isLoading) {
        dropdownChildren.push(
          h('div', {class: cls('__loading')}, [h(Spinner, {size: 'small'})]),
        );
      } else if (props.organizations.length === 0) {
        dropdownChildren.push(
          h(Typography, {variant: 'body2', class: cls('__empty')}, () => 'No organizations available'),
        );
      } else {
        for (const org of props.organizations) {
          const isActive = org['id'] === props.currentOrganization?.id;
          dropdownChildren.push(
            h(
              'button',
              {
                type: 'button',
                class: [cls('__item'), isActive ? cls('__item--active') : ''],
                onClick: () => handleSelect(org),
                role: 'option',
                'aria-selected': isActive,
              },
              [
                h(BuildingIcon, {size: 14}),
                h(Typography, {variant: 'body2'}, () => org['name']),
              ],
            ),
          );
        }
      }

      const dropdown = isOpen.value
        ? h('div', {class: cls('__dropdown'), role: 'listbox'}, dropdownChildren)
        : null;

      return h(
        Card,
        {class: [cls(''), props.className].filter(Boolean).join(' ')},
        () => [triggerButton, dropdown],
      );
    };
  },
});

export default BaseOrganizationSwitcher;
