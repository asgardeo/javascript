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
import {type Component, type PropType, type Ref, type SetupContext, type VNode, defineComponent, h, ref} from 'vue';
import Alert from '../../primitives/Alert';
import Button from '../../primitives/Button';
import Card from '../../primitives/Card';
import Divider from '../../primitives/Divider';
import {PencilIcon} from '../../primitives/Icons';
import Spinner from '../../primitives/Spinner';
import TextField from '../../primitives/TextField';
import Typography from '../../primitives/Typography';

export interface BaseUserProfileProps {
  cardLayout?: boolean;
  className?: string;
  editable?: boolean;
  error?: string | null;
  flattenedProfile?: User;
  hideFields?: string[];
  isLoading?: boolean;
  onUpdate?: (
    requestConfig: UpdateMeProfileConfig,
    sessionId?: string,
  ) => Promise<{data: {user: User}; error: string; success: boolean}>;
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
type ProfileFieldDescriptor = {keys: string[]; label: string; readonly: boolean};

const PROFILE_FIELD_DESCRIPTORS: ProfileFieldDescriptor[] = [
  {keys: ['username', 'userName', 'user_name'], label: 'Username', readonly: true},
  {keys: ['firstName', 'givenName'], label: 'First Name', readonly: false},
  {keys: ['lastName', 'familyName'], label: 'Last Name', readonly: false},
  {keys: ['email', 'emails'], label: 'Email', readonly: false},
  {keys: ['country'], label: 'Country', readonly: false},
  {keys: ['birthdate', 'birthDate', 'dateOfBirth'], label: 'Birth Date', readonly: false},
  {keys: ['mobile', 'mobileNumber', 'phoneNumbers'], label: 'Mobile Numbers', readonly: false},
];

const AVATAR_GRADIENTS: string[] = [
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
  let hash: number = 0;
  for (let i: number = 0; i < seed.length; i += 1) {
    const char: number = seed.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = (hash * 31 + char) >>> 0;
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

const getUserInitials = (user: Record<string, unknown> | null): string => {
  if (!user) return '?';
  const given: string = String(user['givenName'] || user['firstName'] || '');
  const family: string = String(user['familyName'] || user['lastName'] || '');
  if (given || family) return `${given.charAt(0)}${family.charAt(0)}`.toUpperCase();
  const fallback: string = String(user['username'] || user['userName'] || user['email'] || user['sub'] || '');
  return fallback.charAt(0).toUpperCase() || '?';
};

/**
 * BaseUserProfile — unstyled user profile component.
 *
 * Renders a profile card with avatar, title, and two-column field rows
 * that support inline editing via a pencil-icon button.
 */
const BaseUserProfile: Component = defineComponent({
  inheritAttrs: false,
  name: 'BaseUserProfile',
  props: {
    cardLayout: {default: true, type: Boolean},
    className: {default: '', type: String},
    editable: {default: true, type: Boolean},
    error: {default: null, type: String as PropType<string | null>},
    flattenedProfile: {default: null, type: Object as PropType<User | null>},
    hideFields: {default: () => [], type: Array as PropType<string[]>},
    isLoading: {default: false, type: Boolean},
    onUpdate: {
      default: undefined,
      type: Function as PropType<
        (
          requestConfig: UpdateMeProfileConfig,
          sessionId?: string,
        ) => Promise<{data: {user: User}; error: string; success: boolean}>
      >,
    },
    profile: {default: null, type: Object as PropType<User | null>},
    schemas: {default: () => [], type: Array as PropType<Schema[]>},
    showFields: {default: () => [], type: Array as PropType<string[]>},
    title: {default: 'Profile', type: String},
  },
  setup(props: BaseUserProfileProps, {slots}: SetupContext): () => VNode | VNode[] {
    const editingFields: Ref<Record<string, boolean>> = ref<Record<string, boolean>>({});
    const editedValues: Ref<Record<string, string>> = ref<Record<string, string>>({});

    return (): VNode | VNode[] => {
      if (slots['default']) {
        return slots['default']({
          error: props.error,
          isLoading: props.isLoading,
          profile: props.flattenedProfile || props.profile,
        });
      }

      const prefix: (className: string) => string = withVendorCSSClassPrefix;
      const data: User | null | undefined = props.flattenedProfile || props.profile;
      const dataRecord: Record<string, unknown> | null = data as Record<string, unknown> | null;
      const initials: string = getUserInitials(dataRecord);
      const avatarSeed: string = String(
        (dataRecord &&
          (dataRecord['username'] || dataRecord['userName'] || dataRecord['email'] || dataRecord['sub'])) ??
          initials,
      );
      const avatarGradient: string = getAvatarGradient(avatarSeed);

      const children: VNode[] = [];

      // Header: title
      children.push(
        h('div', {class: prefix('user-profile__header')}, [
          h(Typography, {class: prefix('user-profile__title'), variant: 'h5'}, () => props.title),
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
        children.push(h(Alert, {class: prefix('user-profile__error'), severity: 'error' as const}, () => props.error));
      }

      if (props.isLoading) {
        children.push(h('div', {class: prefix('user-profile__loading')}, [h(Spinner)]));
      } else if (data) {
        const fieldDataRecord: Record<string, unknown> = data as Record<string, unknown>;

        // Always show all defined profile fields; honour hideFields/showFields overrides
        const descriptors: ProfileFieldDescriptor[] = PROFILE_FIELD_DESCRIPTORS.filter((d: ProfileFieldDescriptor) => {
          const activeKey: string | undefined = d.keys.find((k: string) => k in fieldDataRecord);
          const matchKey: string = activeKey ?? d.keys[0];
          if (props.hideFields && props.hideFields.length > 0 && props.hideFields.includes(matchKey)) return false;
          if (
            props.showFields &&
            props.showFields.length > 0 &&
            !props.showFields.some((f: string) => d.keys.includes(f))
          )
            return false;
          return true;
        });

        const fieldRows: VNode[] = [];

        descriptors.forEach((descriptor: ProfileFieldDescriptor) => {
          const key: string = descriptor.keys.find((k: string) => k in fieldDataRecord) ?? descriptor.keys[0];
          const value: unknown = fieldDataRecord[key];
          const isReadonly: boolean = descriptor.readonly;
          const isEditing: boolean = editingFields.value[key];
          const isEmpty: boolean = value == null || value === '';
          const {label} = descriptor;

          fieldRows.push(
            h('div', {class: prefix('user-profile__field'), key}, [
              // Label column
              h('div', {class: prefix('user-profile__field-label-col')}, [
                h(Typography, {class: prefix('user-profile__field-label'), variant: 'body2'}, () => label),
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
                            onClick: async (): Promise<void> => {
                              if (props.onUpdate) {
                                await props.onUpdate({
                                  payload: {[key]: editedValues.value[key]},
                                } as UpdateMeProfileConfig);
                              }
                              editingFields.value = {...editingFields.value, [key]: false};
                            },
                            size: 'small' as const,
                            variant: 'solid' as const,
                          },
                          () => 'Save',
                        ),
                        h(
                          Button,
                          {
                            onClick: (): void => {
                              editingFields.value = {...editingFields.value, [key]: false};
                            },
                            size: 'small' as const,
                            variant: 'text' as const,
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
                              onClick:
                                props.editable && !isReadonly
                                  ? (): void => {
                                      editingFields.value = {...editingFields.value, [key]: true};
                                      editedValues.value = {...editedValues.value, [key]: ''};
                                    }
                                  : undefined,
                            },
                            `Enter your ${label.toLowerCase()}`,
                          )
                        : h(Typography, {class: prefix('user-profile__field-value'), variant: 'body1'}, () =>
                            String(value),
                          ),
                      props.editable && !isReadonly
                        ? h(
                            'button',
                            {
                              'aria-label': `Edit ${label}`,
                              class: prefix('user-profile__field-edit-btn'),
                              onClick: (): void => {
                                editingFields.value = {...editingFields.value, [key]: true};
                                editedValues.value = {...editedValues.value, [key]: String(value ?? '')};
                              },
                              type: 'button',
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
        return h(Card, {class: [prefix('user-profile'), props.className].filter(Boolean).join(' ')}, () => children);
      }

      return h('div', {class: [prefix('user-profile'), props.className].filter(Boolean).join(' ')}, children);
    };
  },
});

export default BaseUserProfile;
