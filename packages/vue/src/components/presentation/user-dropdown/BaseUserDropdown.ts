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

import {type User, withVendorCSSClassPrefix} from '@asgardeo/browser';
import {type PropType, type VNode, defineComponent, h, ref} from 'vue';
import Button from '../../primitives/Button';
import Typography from '../../primitives/Typography';
import {ChevronDownIcon, LogOutIcon, UserIcon} from '../../primitives/Icons';

export interface BaseUserDropdownProps {
  className?: string;
  onProfileClick?: () => void;
  onSignOut?: () => void;
  user?: User | null;
}

/**
 * BaseUserDropdown — unstyled user dropdown with avatar, profile link, sign-out.
 */
const BaseUserDropdown = defineComponent({
  name: 'BaseUserDropdown',
  props: {
    className: {type: String, default: ''},
    user: {type: Object as PropType<User | null>, default: null},
    onSignOut: {type: Function as PropType<() => void>, default: undefined},
    onProfileClick: {type: Function as PropType<() => void>, default: undefined},
  },
  setup(props, {slots}) {
    const isOpen = ref(false);
    const prefix = withVendorCSSClassPrefix;

    return () => {
      if (slots['default']) {
        return slots['default']({user: props.user, isOpen: isOpen.value, toggle: () => (isOpen.value = !isOpen.value)});
      }

      const resolveDisplayName = (): string | undefined => {
        if (!props.user) return undefined;
        const record = props.user as Record<string, unknown>;
        if (typeof record['displayName'] === 'string') return record['displayName'];
        const name = record['name'];
        if (typeof name === 'string') return name;
        if (typeof name === 'object' && name) {
          const parts = [(name as any).givenName, (name as any).familyName].filter(Boolean);
          if (parts.length > 0) return parts.join(' ');
        }
        if (typeof record['email'] === 'string') return record['email'];
        if (typeof record['username'] === 'string') return record['username'];
        if (typeof record['sub'] === 'string') return record['sub'];
        return undefined;
      };
      const displayName = resolveDisplayName();

      const children: VNode[] = [];

      // Trigger button
      children.push(
        h(
          'button',
          {
            type: 'button',
            class: prefix('user-dropdown__trigger'),
            onClick: () => (isOpen.value = !isOpen.value),
          },
          [
            h('span', {class: prefix('user-dropdown__avatar')}, [
              h(UserIcon, {size: 20}),
            ]),
            displayName
              ? h(Typography, {variant: 'body2', class: prefix('user-dropdown__name')}, () => displayName)
              : null,
            h(ChevronDownIcon, {size: 16}),
          ],
        ),
      );

      // Dropdown menu
      if (isOpen.value) {
        const menuItems: VNode[] = [];

        if (props.onProfileClick) {
          menuItems.push(
            h(
              'button',
              {type: 'button', class: prefix('user-dropdown__item'), onClick: props.onProfileClick},
              [h(UserIcon, {size: 16}), h('span', null, 'Profile')],
            ),
          );
        }

        if (slots['items']) {
          menuItems.push(...(slots['items']() ?? []));
        }

        if (props.onSignOut) {
          menuItems.push(
            h(
              'button',
              {type: 'button', class: prefix('user-dropdown__item'), onClick: props.onSignOut},
              [h(LogOutIcon, {size: 16}), h('span', null, 'Sign Out')],
            ),
          );
        }

        children.push(h('div', {class: prefix('user-dropdown__menu')}, menuItems));
      }

      return h(
        'div',
        {class: [prefix('user-dropdown'), props.className].filter(Boolean).join(' ')},
        children,
      );
    };
  },
});

export default BaseUserDropdown;
