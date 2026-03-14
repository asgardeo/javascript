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

const fieldsToSkip = [
  'roles.default',
  'active',
  'groups',
  'accountLocked',
  'accountDisabled',
  'oneTimePassword',
  'userSourceId',
  'idpType',
  'localCredentialExists',
  'ResourceType',
  'ExternalID',
  'MetaData',
  'verifiedMobileNumbers',
  'verifiedEmailAddresses',
  'phoneNumbers.mobile',
  'emailAddresses',
  'preferredMFAOption',
];

const readonlyFields = ['username', 'userName', 'user_name'];

/**
 * BaseUserProfile — unstyled user profile component.
 *
 * Renders user profile fields with inline editing support.
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
    title: {type: String, default: 'My Profile'},
    onUpdate: {type: Function as PropType<(requestConfig: UpdateMeProfileConfig, sessionId?: string) => Promise<{data: {user: User}; error: string; success: boolean}>>, default: undefined},
    showFields: {type: Array as PropType<string[]>, default: () => []},
    hideFields: {type: Array as PropType<string[]>, default: () => []},
  },
  setup(props, {slots}) {
    const editingFields = ref<Record<string, boolean>>({});
    const editedValues = ref<Record<string, string>>({});

    const shouldShowField = (fieldName: string): boolean => {
      if (fieldsToSkip.includes(fieldName)) return false;
      if (props.hideFields.length > 0 && props.hideFields.includes(fieldName)) return false;
      if (props.showFields.length > 0) return props.showFields.includes(fieldName);

      return true;
    };

    const formatLabel = (key: string): string =>
      key
        .split(/(?=[A-Z])|_/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    return () => {
      if (slots['default']) {
        return slots['default']({
          profile: props.flattenedProfile || props.profile,
          isLoading: props.isLoading,
          error: props.error,
        });
      }

      const prefix = withVendorCSSClassPrefix;
      const children: VNode[] = [];

      children.push(h(Typography, {variant: 'h5', class: prefix('user-profile__title')}, () => props.title));
      children.push(h(Divider, {class: prefix('user-profile__divider')}));

      if (props.error) {
        children.push(h(Alert, {severity: 'error' as const, class: prefix('user-profile__error')}, () => props.error));
      }

      if (props.isLoading) {
        children.push(h('div', {class: prefix('user-profile__loading')}, [h(Spinner)]));
      } else {
        const data = props.flattenedProfile || props.profile;
        if (data) {
          const entries = Object.entries(data).filter(([key]) => shouldShowField(key));
          entries.forEach(([key, value]) => {
            const isReadonly = readonlyFields.includes(key);
            const isEditing = editingFields.value[key];

            children.push(
              h('div', {class: prefix('user-profile__field'), key}, [
                h('div', {class: prefix('user-profile__field-header')}, [
                  h(Typography, {variant: 'subtitle2', class: prefix('user-profile__field-label')}, () =>
                    formatLabel(key),
                  ),
                  props.editable && !isReadonly
                    ? h(
                        Button,
                        {
                          variant: 'text' as const,
                          size: 'small' as const,
                          onClick: () => {
                            editingFields.value = {...editingFields.value, [key]: !isEditing};
                            if (!isEditing) {
                              editedValues.value = {...editedValues.value, [key]: String(value ?? '')};
                            }
                          },
                        },
                        () => (isEditing ? 'Cancel' : 'Edit'),
                      )
                    : null,
                ]),
                isEditing
                  ? h('div', {class: prefix('user-profile__field-edit')}, [
                      h(TextField, {
                        modelValue: editedValues.value[key] ?? String(value ?? ''),
                        'onUpdate:modelValue': (v: string) => {
                          editedValues.value = {...editedValues.value, [key]: v};
                        },
                      }),
                      h(
                        Button,
                        {
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
                    ])
                  : h(Typography, {variant: 'body1', class: prefix('user-profile__field-value')}, () =>
                      value != null ? String(value) : '—',
                    ),
              ]),
            );
          });
        }
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
