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

import {type User, type Schema, type UpdateMeProfileConfig, withVendorCSSClassPrefix} from '@asgardeo/browser';
import {type PropType, type VNode, defineComponent, h, ref} from 'vue';
import Alert from '../../primitives/Alert';
import Button from '../../primitives/Button';
import Card from '../../primitives/Card';
import Divider from '../../primitives/Divider';
import Spinner from '../../primitives/Spinner';
import TextField from '../../primitives/TextField';
import Typography from '../../primitives/Typography';
import {PencilIcon} from '../../primitives/Icons';

export interface BaseUserProfileProps {
  cardLayout?: boolean;
  className?: string;
  editable?: boolean;
  error?: string | null;
  flattenedProfile?: User;
  hideFields?: string[];
  isLoading?: boolean;
  onUpdate?: (requestConfig: UpdateMeProfileConfig, sessionId?: string) => Promise<{data: {user: User}; error: string; success: boolean}>;
  profile?: User;
  schemas?: Schema[];
  showFields?: string[];
  title?: string;
}

/**
 * Ordered list of fields to display. Each entry specifies candidate key names
 * (first match in the profile data wins), a human-readable label, and whether
 * the field is read-only.
 */
const PROFILE_FIELD_DESCRIPTORS: {keys: string[]; label: string; readonly: boolean}[] = [
  {keys: ['username', 'userName', 'user_name'], label: 'Username', readonly: true},
  {keys: ['firstName', 'givenName'], label: 'First Name', readonly: false},
  {keys: ['lastName', 'familyName'], label: 'Last Name', readonly: false},
  {keys: ['email', 'emails'], label: 'Email', readonly: false},
  {keys: ['country'], label: 'Country', readonly: false},
  {keys: ['birthdate', 'birthDate', 'dateOfBirth'], label: 'Birth Date', readonly: false},
  {keys: ['mobile', 'mobileNumber', 'phoneNumbers'], label: 'Mobile Numbers', readonly: false},
];

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
  'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)',
  'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
];

const getAvatarGradient = (seed: string): string => {
  if (!seed) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

const getUserInitials = (user: Record<string, unknown> | null): string => {
  if (!user) return '?';
  const given = String(user['givenName'] || user['firstName'] || '');
  const family = String(user['familyName'] || user['lastName'] || '');
  if (given || family) return `${given.charAt(0)}${family.charAt(0)}`.toUpperCase();
  const fallback = String(user['username'] || user['userName'] || user['email'] || user['sub'] || '');
  return fallback.charAt(0).toUpperCase() || '?';
};

/**
 * BaseUserProfile — unstyled user profile component.
 *
 * Renders a profile card with avatar, title, and two-column field rows
 * that support inline editing via a pencil-icon button.
 */
const BaseUserProfile = defineComponent({
  name: 'BaseUserProfile',
  props: {
    className: {type: String, default: ''},
    cardLayout: {type: Boolean, default: true},
    profile: {type: Object as PropType<User | null>, default: null},
    flattenedProfile: {type: Object as PropType<User | null>, default: null},
    schemas: {type: Array as PropType<Schema[]>, default: () => []},
    editable: {type: Boolean, default: true},
    isLoading: {type: Boolean, default: false},
    error: {type: String as PropType<string | null>, default: null},
    title: {type: String, default: 'Profile'},
    onUpdate: {type: Function as PropType<(requestConfig: UpdateMeProfileConfig, sessionId?: string) => Promise<{data: {user: User}; error: string; success: boolean}>>, default: undefined},
    showFields: {type: Array as PropType<string[]>, default: () => []},
    hideFields: {type: Array as PropType<string[]>, default: () => []},
  },
  setup(props, {slots}) {
    const editingFields = ref<Record<string, boolean>>({});
    const editedValues = ref<Record<string, string>>({});

    return () => {
      if (slots['default']) {
        return slots['default']({
          profile: props.flattenedProfile || props.profile,
          isLoading: props.isLoading,
          error: props.error,
        });
      }

      const prefix = withVendorCSSClassPrefix;
      const data = props.flattenedProfile || props.profile;
      const dataRecord = data as Record<string, unknown> | null;
      const initials = getUserInitials(dataRecord);
      const avatarSeed = String(
        (dataRecord && (dataRecord['username'] || dataRecord['userName'] || dataRecord['email'] || dataRecord['sub'])) ?? initials,
      );
      const avatarGradient = getAvatarGradient(avatarSeed);

      const children: VNode[] = [];

      // Header: title
      children.push(
        h('div', {class: prefix('user-profile__header')}, [
          h(Typography, {variant: 'h5', class: prefix('user-profile__title')}, () => props.title),
        ]),
      );

      children.push(h(Divider, {class: prefix('user-profile__header-divider')}));

      // Avatar section
      children.push(
        h('div', {class: prefix('user-profile__avatar-section')}, [
          h(
            'div',
            {
              class: prefix('user-profile__avatar'),
              style: {background: avatarGradient},
            },
            [h('span', {class: prefix('user-profile__avatar-initials')}, initials)],
          ),
        ]),
      );

      if (props.error) {
        children.push(h(Alert, {severity: 'error' as const, class: prefix('user-profile__error')}, () => props.error));
      }

      if (props.isLoading) {
        children.push(h('div', {class: prefix('user-profile__loading')}, [h(Spinner)]));
      } else if (data) {
        const dataRecord = data as Record<string, unknown>;

        // Always show all defined profile fields; honour hideFields/showFields overrides
        const descriptors = PROFILE_FIELD_DESCRIPTORS.filter((d) => {
          const activeKey = d.keys.find((k) => k in dataRecord);
          const matchKey = activeKey ?? d.keys[0];
          if (props.hideFields.length > 0 && props.hideFields.includes(matchKey)) return false;
          if (props.showFields.length > 0 && !props.showFields.some((f) => d.keys.includes(f))) return false;
          return true;
        });

        const fieldRows: VNode[] = [];

        descriptors.forEach((descriptor) => {
          const key = descriptor.keys.find((k) => k in dataRecord) ?? descriptor.keys[0];
          const value = dataRecord[key];
          const isReadonly = descriptor.readonly;
          const isEditing = editingFields.value[key];
          const isEmpty = value == null || value === '';
          const label = descriptor.label;

          fieldRows.push(
            h('div', {class: prefix('user-profile__field'), key}, [
              // Label column
              h('div', {class: prefix('user-profile__field-label-col')}, [
                h(Typography, {variant: 'body2', class: prefix('user-profile__field-label')}, () => label),
              ]),
              // Value column
              h('div', {class: prefix('user-profile__field-value-col')}, [
                isEditing
                  ? h('div', {class: prefix('user-profile__field-edit')}, [
                      h(TextField, {
                        modelValue: editedValues.value[key] ?? String(value ?? ''),
                        'onUpdate:modelValue': (v: string) => {
                          editedValues.value = {...editedValues.value, [key]: v};
                        },
                      }),
                      h('div', {class: prefix('user-profile__field-edit-actions')}, [
                        h(
                          Button,
                          {
                            variant: 'solid' as const,
                            size: 'small' as const,
                            onClick: async () => {
                              if (props.onUpdate) {
                                await props.onUpdate({payload: {[key]: editedValues.value[key]}} as UpdateMeProfileConfig);
                              }
                              editingFields.value = {...editingFields.value, [key]: false};
                            },
                          },
                          () => 'Save',
                        ),
                        h(
                          Button,
                          {
                            variant: 'text' as const,
                            size: 'small' as const,
                            onClick: () => {
                              editingFields.value = {...editingFields.value, [key]: false};
                            },
                          },
                          () => 'Cancel',
                        ),
                      ]),
                    ])
                  : h('div', {class: prefix('user-profile__field-display')}, [
                      isEmpty
                        ? h(
                            'span',
                            {
                              class: prefix('user-profile__field-placeholder'),
                              onClick: props.editable && !isReadonly
                                ? () => {
                                    editingFields.value = {...editingFields.value, [key]: true};
                                    editedValues.value = {...editedValues.value, [key]: ''};
                                  }
                                : undefined,
                            },
                            `Enter your ${label.toLowerCase()}`,
                          )
                        : h(
                            Typography,
                            {variant: 'body1', class: prefix('user-profile__field-value')},
                            () => String(value),
                          ),
                      props.editable && !isReadonly
                        ? h(
                            'button',
                            {
                              type: 'button',
                              class: prefix('user-profile__field-edit-btn'),
                              'aria-label': `Edit ${label}`,
                              onClick: () => {
                                editingFields.value = {...editingFields.value, [key]: true};
                                editedValues.value = {...editedValues.value, [key]: String(value ?? '')};
                              },
                            },
                            [h(PencilIcon)],
                          )
                        : null,
                    ]),
              ]),
            ]),
          );
        });

        children.push(h('div', {class: prefix('user-profile__fields')}, fieldRows));
      }

      if (slots['footer']) {
        children.push(h('div', {class: prefix('user-profile__footer')}, slots['footer']()));
      }

      if (props.cardLayout) {
        return h(
          Card,
          {class: [prefix('user-profile'), props.className].filter(Boolean).join(' ')},
          () => children,
        );
      }

      return h('div', {class: [prefix('user-profile'), props.className].filter(Boolean).join(' ')}, children);
    };
  },
});

export default BaseUserProfile;
