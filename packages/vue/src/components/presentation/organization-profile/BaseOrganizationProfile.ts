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
import {type PropType, type VNode, defineComponent, h, ref} from 'vue';
import Button from '../../primitives/Button';
import Card from '../../primitives/Card';
import Divider from '../../primitives/Divider';
import TextField from '../../primitives/TextField';
import Typography from '../../primitives/Typography';
import {BuildingIcon} from '../../primitives/Icons';

/**
 * BaseOrganizationProfile — unstyled organization details view/edit component.
 */
const BaseOrganizationProfile = defineComponent({
  name: 'BaseOrganizationProfile',
  props: {
    className: {type: String, default: ''},
    organization: {type: Object as PropType<Organization | null>, default: null},
    editable: {type: Boolean, default: false},
    onUpdate: {
      type: Function as PropType<(payload: Record<string, unknown>) => Promise<void>>,
      default: undefined,
    },
  },
  setup(props, {slots}) {
    const isEditing = ref(false);
    const editedName = ref('');

    return () => {
      if (slots['default']) {
        return slots['default']({organization: props.organization, isEditing: isEditing.value});
      }

      if (!props.organization) {
        return slots['fallback']?.() ?? null;
      }

      const prefix = withVendorCSSClassPrefix;
      const orgName = (props.organization['name'] || props.organization['displayName'] || '') as string;
      const children: VNode[] = [];

      children.push(
        h('div', {class: prefix('organization-profile__header')}, [
          h(BuildingIcon, {size: 24}),
          isEditing.value
            ? h(TextField, {
                modelValue: editedName.value,
                'onUpdate:modelValue': (v: string) => (editedName.value = v),
                label: 'Organization Name',
              })
            : h(Typography, {variant: 'h5'}, () => orgName),
        ]),
      );

      children.push(h(Divider));

      // Display organization details
      const details = Object.entries(props.organization).filter(
        ([key]) => !['id', 'name', 'displayName'].includes(key),
      );

      details.forEach(([key, value]) => {
        children.push(
          h('div', {class: prefix('organization-profile__field'), key}, [
            h(Typography, {variant: 'subtitle2'}, () =>
              key
                .split(/(?=[A-Z])|_/)
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(' '),
            ),
            h(Typography, {variant: 'body1'}, () => (value != null ? String(value) : '—')),
          ]),
        );
      });

      if (props.editable) {
        children.push(
          h('div', {class: prefix('organization-profile__actions')}, [
            isEditing.value
              ? [
                  h(
                    Button,
                    {
                      variant: 'solid' as const,
                      size: 'small' as const,
                      onClick: async () => {
                        await props.onUpdate?.({name: editedName.value});
                        isEditing.value = false;
                      },
                    },
                    () => 'Save',
                  ),
                  h(
                    Button,
                    {
                      variant: 'text' as const,
                      size: 'small' as const,
                      onClick: () => (isEditing.value = false),
                    },
                    () => 'Cancel',
                  ),
                ]
              : h(
                  Button,
                  {
                    variant: 'outline' as const,
                    size: 'small' as const,
                    onClick: () => {
                      editedName.value = orgName;
                      isEditing.value = true;
                    },
                  },
                  () => 'Edit',
                ),
          ]),
        );
      }

      return h(
        Card,
        {class: [prefix('organization-profile'), props.className].filter(Boolean).join(' ')},
        () => children,
      );
    };
  },
});

export default BaseOrganizationProfile;
