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
import {PencilIcon} from '../../primitives/Icons';
import TextField from '../../primitives/TextField';
import Typography from '../../primitives/Typography';

const ORG_AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #22d3ee 0%, #2dd4bf 100%)',
  'linear-gradient(135deg, #34d399 0%, #059669 100%)',
  'linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)',
  'linear-gradient(135deg, #f472b6 0%, #c084fc 100%)',
  'linear-gradient(135deg, #fb923c 0%, #fbbf24 100%)',
  'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)',
  'linear-gradient(135deg, #f87171 0%, #fb923c 100%)',
];

const getOrgAvatarGradient = (seed: string): string => {
  if (!seed) return ORG_AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return ORG_AVATAR_GRADIENTS[Math.abs(hash) % ORG_AVATAR_GRADIENTS.length];
};

const getOrgInitials = (name: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  return name.charAt(0).toUpperCase();
};

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});
  } catch {
    return dateStr;
  }
};

/**
 * BaseOrganizationProfile — unstyled organization details view/edit component.
 *
 * Renders a profile card with avatar, org name, handle, and two-column field rows
 * for Organization ID, Name, Description, Created Date, and Last Modified Date.
 */
const BaseOrganizationProfile = defineComponent({
  name: 'BaseOrganizationProfile',
  props: {
    className: {type: String, default: ''},
    organization: {type: Object as PropType<Organization | null>, default: null},
    editable: {type: Boolean, default: false},
    title: {type: String, default: 'Organization Profile'},
    onUpdate: {
      type: Function as PropType<(payload: Record<string, unknown>) => Promise<void>>,
      default: undefined,
    },
  },
  setup(props, {slots}) {
    const editingName = ref(false);
    const editingDescription = ref(false);
    const editedName = ref('');
    const editedDescription = ref('');

    return () => {
      if (slots['default']) {
        return slots['default']({organization: props.organization});
      }

      if (!props.organization) {
        return slots['fallback']?.() ?? null;
      }

      const prefix = withVendorCSSClassPrefix;
      const org = props.organization as unknown as Record<string, unknown>;
      const orgName = String(org['name'] || org['displayName'] || '');
      const orgHandle = String(org['orgHandle'] || '');
      const orgId = String(org['id'] || '');
      const orgDescription = org['description'] != null ? String(org['description']) : null;
      const createdDate = org['created'] ? formatDate(String(org['created'])) : null;
      const lastModifiedDate = org['lastModified'] ? formatDate(String(org['lastModified'])) : null;
      const initials = getOrgInitials(orgName);
      const avatarGradient = getOrgAvatarGradient(orgId || orgName);

      const children: VNode[] = [];

      // Header: title
      children.push(
        h('div', {class: prefix('organization-profile__header')}, [
          h(Typography, {variant: 'h5', class: prefix('organization-profile__title')}, () => props.title),
        ]),
      );

      children.push(h(Divider, {class: prefix('organization-profile__header-divider')}));

      // Avatar + org name + handle
      children.push(
        h('div', {class: prefix('organization-profile__identity')}, [
          h(
            'div',
            {
              class: prefix('organization-profile__avatar'),
              style: {background: avatarGradient},
            },
            [h('span', {class: prefix('organization-profile__avatar-initials')}, initials)],
          ),
          h(Typography, {variant: 'h5', class: prefix('organization-profile__org-name')}, () => orgName),
          orgHandle
            ? h(
                Typography,
                {variant: 'body2', class: prefix('organization-profile__org-handle')},
                () => `@${orgHandle}`,
              )
            : null,
        ]),
      );

      children.push(h(Divider, {class: prefix('organization-profile__identity-divider')}));

      // Field rows
      const fieldRows: VNode[] = [];

      // Organization ID (readonly)
      fieldRows.push(
        h('div', {class: prefix('organization-profile__field'), key: 'id'}, [
          h('div', {class: prefix('organization-profile__field-label-col')}, [
            h(
              Typography,
              {variant: 'body2', class: prefix('organization-profile__field-label')},
              () => 'Organization ID',
            ),
          ]),
          h('div', {class: prefix('organization-profile__field-value-col')}, [
            h('div', {class: prefix('organization-profile__field-display')}, [
              orgId
                ? h(
                    Typography,
                    {
                      variant: 'body1',
                      class: [
                        prefix('organization-profile__field-value'),
                        prefix('organization-profile__field-value--id'),
                      ].join(' '),
                    },
                    () => orgId,
                  )
                : h('span', {class: prefix('organization-profile__field-placeholder')}, 'Not available'),
            ]),
          ]),
        ]),
      );

      // Organization Name (editable)
      fieldRows.push(
        h('div', {class: prefix('organization-profile__field'), key: 'name'}, [
          h('div', {class: prefix('organization-profile__field-label-col')}, [
            h(
              Typography,
              {variant: 'body2', class: prefix('organization-profile__field-label')},
              () => 'Organization Name',
            ),
          ]),
          h('div', {class: prefix('organization-profile__field-value-col')}, [
            editingName.value
              ? h('div', {class: prefix('organization-profile__field-edit')}, [
                  h(TextField, {
                    modelValue: editedName.value,
                    'onUpdate:modelValue': (v: string) => (editedName.value = v),
                  }),
                  h('div', {class: prefix('organization-profile__field-edit-actions')}, [
                    h(
                      Button,
                      {
                        variant: 'solid' as const,
                        size: 'small' as const,
                        onClick: async () => {
                          await props.onUpdate?.({name: editedName.value});
                          editingName.value = false;
                        },
                      },
                      () => 'Save',
                    ),
                    h(
                      Button,
                      {
                        variant: 'text' as const,
                        size: 'small' as const,
                        onClick: () => (editingName.value = false),
                      },
                      () => 'Cancel',
                    ),
                  ]),
                ])
              : h('div', {class: prefix('organization-profile__field-display')}, [
                  h(Typography, {variant: 'body1', class: prefix('organization-profile__field-value')}, () => orgName),
                  props.editable
                    ? h(
                        'button',
                        {
                          type: 'button',
                          class: prefix('organization-profile__field-edit-btn'),
                          'aria-label': 'Edit Organization Name',
                          onClick: () => {
                            editedName.value = orgName;
                            editingName.value = true;
                          },
                        },
                        [h(PencilIcon)],
                      )
                    : null,
                ]),
          ]),
        ]),
      );

      // Organization Description (editable)
      fieldRows.push(
        h('div', {class: prefix('organization-profile__field'), key: 'description'}, [
          h('div', {class: prefix('organization-profile__field-label-col')}, [
            h(
              Typography,
              {variant: 'body2', class: prefix('organization-profile__field-label')},
              () => 'Organization Description',
            ),
          ]),
          h('div', {class: prefix('organization-profile__field-value-col')}, [
            editingDescription.value
              ? h('div', {class: prefix('organization-profile__field-edit')}, [
                  h(TextField, {
                    modelValue: editedDescription.value,
                    'onUpdate:modelValue': (v: string) => (editedDescription.value = v),
                  }),
                  h('div', {class: prefix('organization-profile__field-edit-actions')}, [
                    h(
                      Button,
                      {
                        variant: 'solid' as const,
                        size: 'small' as const,
                        onClick: async () => {
                          await props.onUpdate?.({description: editedDescription.value});
                          editingDescription.value = false;
                        },
                      },
                      () => 'Save',
                    ),
                    h(
                      Button,
                      {
                        variant: 'text' as const,
                        size: 'small' as const,
                        onClick: () => (editingDescription.value = false),
                      },
                      () => 'Cancel',
                    ),
                  ]),
                ])
              : h('div', {class: prefix('organization-profile__field-display')}, [
                  orgDescription != null
                    ? h(
                        Typography,
                        {variant: 'body1', class: prefix('organization-profile__field-value')},
                        () => orgDescription,
                      )
                    : h(
                        'span',
                        {
                          class: prefix('organization-profile__field-placeholder'),
                          onClick: props.editable
                            ? () => {
                                editedDescription.value = '';
                                editingDescription.value = true;
                              }
                            : undefined,
                        },
                        'Enter organization description',
                      ),
                  props.editable
                    ? h(
                        'button',
                        {
                          type: 'button',
                          class: prefix('organization-profile__field-edit-btn'),
                          'aria-label': 'Edit Organization Description',
                          onClick: () => {
                            editedDescription.value = orgDescription ?? '';
                            editingDescription.value = true;
                          },
                        },
                        [h(PencilIcon)],
                      )
                    : null,
                ]),
          ]),
        ]),
      );

      // Created Date (readonly)
      fieldRows.push(
        h('div', {class: prefix('organization-profile__field'), key: 'created'}, [
          h('div', {class: prefix('organization-profile__field-label-col')}, [
            h(Typography, {variant: 'body2', class: prefix('organization-profile__field-label')}, () => 'Created Date'),
          ]),
          h('div', {class: prefix('organization-profile__field-value-col')}, [
            h('div', {class: prefix('organization-profile__field-display')}, [
              createdDate
                ? h(
                    Typography,
                    {variant: 'body1', class: prefix('organization-profile__field-value')},
                    () => createdDate,
                  )
                : h('span', {class: prefix('organization-profile__field-placeholder')}, 'Not available'),
            ]),
          ]),
        ]),
      );

      // Last Modified Date (readonly)
      fieldRows.push(
        h('div', {class: prefix('organization-profile__field'), key: 'lastModified'}, [
          h('div', {class: prefix('organization-profile__field-label-col')}, [
            h(
              Typography,
              {variant: 'body2', class: prefix('organization-profile__field-label')},
              () => 'Last Modified Date',
            ),
          ]),
          h('div', {class: prefix('organization-profile__field-value-col')}, [
            h('div', {class: prefix('organization-profile__field-display')}, [
              lastModifiedDate
                ? h(
                    Typography,
                    {variant: 'body1', class: prefix('organization-profile__field-value')},
                    () => lastModifiedDate,
                  )
                : h('span', {class: prefix('organization-profile__field-placeholder')}, 'Not available'),
            ]),
          ]),
        ]),
      );

      // Organization Handle (readonly)
      fieldRows.push(
        h('div', {class: prefix('organization-profile__field'), key: 'orgHandle'}, [
          h('div', {class: prefix('organization-profile__field-label-col')}, [
            h(
              Typography,
              {variant: 'body2', class: prefix('organization-profile__field-label')},
              () => 'Organization Handle',
            ),
          ]),
          h('div', {class: prefix('organization-profile__field-value-col')}, [
            h('div', {class: prefix('organization-profile__field-display')}, [
              orgHandle
                ? h(Typography, {variant: 'body1', class: prefix('organization-profile__field-value')}, () => orgHandle)
                : h('span', {class: prefix('organization-profile__field-placeholder')}, 'Not available'),
            ]),
          ]),
        ]),
      );

      children.push(h('div', {class: prefix('organization-profile__fields')}, fieldRows));

      return h(
        Card,
        {class: [prefix('organization-profile'), props.className].filter(Boolean).join(' ')},
        () => children,
      );
    };
  },
});

export default BaseOrganizationProfile;
