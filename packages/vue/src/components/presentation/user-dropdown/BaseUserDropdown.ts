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
import {type PropType, type Ref, type VNode, defineComponent, h, ref} from 'vue';
import {ChevronDownIcon, LogOutIcon, UserIcon, XIcon} from '../../primitives/Icons';
import Typography from '../../primitives/Typography';

export interface BaseUserDropdownProps {
  className?: string;
  isProfileModalOpen?: boolean;
  onProfileClick?: () => void;
  onProfileModalClose?: () => void;
  onSignOut?: () => void;
  profileContent?: VNode | null;
  user?: User | null;
}

/**
 * BaseUserDropdown — unstyled user dropdown with avatar, profile link, sign-out.
 */
const BaseUserDropdown = defineComponent({
  inheritAttrs: false,
  name: 'BaseUserDropdown',
  props: {
    className: {default: '', type: String},
    isProfileModalOpen: {default: false, type: Boolean},
    onProfileClick: {default: undefined, type: Function as PropType<() => void>},
    onProfileModalClose: {default: undefined, type: Function as PropType<() => void>},
    onSignOut: {default: undefined, type: Function as PropType<() => void>},
    profileContent: {default: null, type: Object as PropType<VNode | null>},
    user: {default: null, type: Object as PropType<User | null>},
  },
  setup(
    props: {
      className: string;
      isProfileModalOpen: boolean;
      onProfileClick?: () => void;
      onProfileModalClose?: () => void;
      onSignOut?: () => void;
      profileContent: VNode | null;
      user: User | null;
    },
    {slots}: {slots: any},
  ): () => VNode | VNode[] | null {
    const isOpen: Ref<boolean> = ref(false);
    const prefix: typeof withVendorCSSClassPrefix = withVendorCSSClassPrefix;

    return (): VNode | VNode[] | null => {
      if (slots['default']) {
        return slots['default']({
          isOpen: isOpen.value,
          toggle: () => {
            isOpen.value = !isOpen.value;
          },
          user: props.user,
        });
      }

      const resolveDisplayName = (): string | undefined => {
        if (!props.user) return undefined;
        const {displayName, name, email, username, sub} = props.user as Record<string, unknown>;
        if (typeof displayName === 'string') return displayName;
        if (typeof name === 'string') return name;
        if (typeof name === 'object' && name) {
          const parts: string[] = [(name as any).givenName, (name as any).familyName].filter(Boolean);
          if (parts.length > 0) return parts.join(' ');
        }
        if (typeof email === 'string') return email;
        if (typeof username === 'string') return username;
        if (typeof sub === 'string') return sub;
        return undefined;
      };
      const displayName: string | undefined = resolveDisplayName();

      const children: VNode[] = [];

      // Trigger button
      children.push(
        h(
          'button',
          {
            class: prefix('user-dropdown__trigger'),
            onClick: () => {
              isOpen.value = !isOpen.value;
            },
            type: 'button',
          },
          [
            h('span', {class: prefix('user-dropdown__avatar')}, [h(UserIcon, {size: 20})]),
            displayName
              ? h(Typography, {class: prefix('user-dropdown__name'), variant: 'body2'}, () => displayName)
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
            h('button', {class: prefix('user-dropdown__item'), onClick: props.onProfileClick, type: 'button'}, [
              h(UserIcon, {size: 16}),
              h('span', null, 'Profile'),
            ]),
          );
        }

        if (slots['items']) {
          menuItems.push(...(slots['items']() ?? []));
        }

        if (props.onSignOut) {
          menuItems.push(
            h('button', {class: prefix('user-dropdown__item'), onClick: props.onSignOut, type: 'button'}, [
              h(LogOutIcon, {size: 16}),
              h('span', null, 'Sign Out'),
            ]),
          );
        }

        children.push(h('div', {class: prefix('user-dropdown__menu')}, menuItems));
      }

      const container: VNode = h(
        'div',
        {class: [prefix('user-dropdown'), props.className].filter(Boolean).join(' ')},
        children,
      );

      // If profile modal is open, render modal overlay
      if (props.isProfileModalOpen) {
        return h('div', [
          container,
          h('div', {class: prefix('user-dropdown__modal-overlay')}, [
            h('div', {class: prefix('user-dropdown__modal-content')}, [
              h(
                'button',
                {
                  'aria-label': 'Close profile modal',
                  class: prefix('user-dropdown__modal-close'),
                  onClick: props.onProfileModalClose,
                  type: 'button',
                },
                [h(XIcon, {size: 24})],
              ),
              props.profileContent,
            ]),
          ]),
        ]);
      }

      return container;
    };
  },
});

export default BaseUserDropdown;
