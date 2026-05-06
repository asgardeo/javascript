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

import {
  type User,
  type Schema,
  WellKnownSchemaIds,
  withVendorCSSClassPrefix,
} from '@asgardeo/browser';
import {type Component, type PropType, type Ref, type SetupContext, type VNode, defineComponent, h, ref} from 'vue';
import Alert from '../../primitives/Alert';
import Button from '../../primitives/Button';
import Card from '../../primitives/Card';
import Checkbox from '../../primitives/Checkbox';
import DatePicker from '../../primitives/DatePicker';
import Divider from '../../primitives/Divider';
import {PencilIcon} from '../../primitives/Icons';
import Spinner from '../../primitives/Spinner';
import TextField from '../../primitives/TextField';
import Typography from '../../primitives/Typography';
import getDisplayName from '../../../utils/getDisplayName';
import getMappedUserProfileValue from '../../../utils/getMappedUserProfileValue';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExtendedSchema {
  description?: string;
  displayName?: string;
  displayOrder?: string;
  multiValued?: boolean;
  mutability?: string;
  name?: string;
  required?: boolean;
  schemaId?: string;
  subAttributes?: ExtendedSchema[];
  type?: string;
  value?: any;
}

export interface BaseUserProfileProps {
  avatarSize?: 'sm' | 'md' | 'lg';
  cardLayout?: boolean;
  cardVariant?: 'elevated' | 'outlined' | 'flat';
  className?: string;
  compact?: boolean;
  editable?: boolean;
  error?: string | null;
  flattenedProfile?: User | null;
  hideFields?: string[];
  isLoading?: boolean;
  onUpdate?: (payload: any) => Promise<void>;
  profile?: User | null;
  schemas?: Schema[] | null;
  showAvatar?: boolean;
  showFields?: string[];
  title?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FIELDS_TO_SKIP: string[] = [
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

const READONLY_FIELDS: string[] = ['username', 'userName', 'user_name'];

const DEFAULT_ATTRIBUTE_MAPPINGS: Record<string, string | string[]> = {
  email: ['emails', 'email'],
  firstName: ['name.givenName', 'given_name'],
  lastName: ['name.familyName', 'family_name'],
  picture: ['profile', 'profileUrl', 'picture', 'URL'],
  username: ['userName', 'username', 'user_name'],
};

const AVATAR_GRADIENTS: string[] = [
  'linear-gradient(135deg, #4b6ef5 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #4b6ef5 100%)',
  'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #ec4899 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #4b6ef5 100%)',
  'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)',
  'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAvatarGradient(seed: string): string {
  if (!seed) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function formatLabel(key: string): string {
  return key
    .split(/(?=[A-Z])|[_.]/)
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function buildScimPatchValue(
  flatKey: string,
  rawValue: any,
  schemaId: string | undefined,
  multiValued: boolean | undefined,
): Record<string, unknown> {
  if (flatKey === 'phoneNumbers.mobile') {
    return {
      phoneNumbers: [{type: 'mobile', value: rawValue}],
      [WellKnownSchemaIds.SystemUser]: {mobileNumbers: [rawValue]},
    };
  }

  const complexMultiValued = new Set([
    'phoneNumbers', 'emails', 'ims', 'photos', 'addresses',
    'entitlements', 'roles', 'x509Certificates',
  ]);

  const dotIndex = flatKey.indexOf('.');
  if (dotIndex > 0) {
    const head = flatKey.slice(0, dotIndex);
    const tail = flatKey.slice(dotIndex + 1);
    if (complexMultiValued.has(head)) {
      return {[head]: [{type: tail, value: rawValue}]};
    }
  }

  const value: unknown = multiValued ? [rawValue] : rawValue;

  if (schemaId && schemaId !== WellKnownSchemaIds.User) {
    return {[schemaId]: {[flatKey]: value}};
  }

  const segments = flatKey.split('.');
  const nested: Record<string, unknown> = {};
  let cursor: Record<string, unknown> = nested;
  for (let i = 0; i < segments.length - 1; i += 1) {
    cursor[segments[i]] = {};
    cursor = cursor[segments[i]] as Record<string, unknown>;
  }
  cursor[segments[segments.length - 1]] = value;
  return nested;
}

// ─── Component ───────────────────────────────────────────────────────────────

const BaseUserProfile: Component = defineComponent({
  inheritAttrs: false,
  name: 'BaseUserProfile',
  props: {
    /** Avatar circle size. */
    avatarSize: {
      default: 'lg',
      type: String as PropType<'sm' | 'md' | 'lg'>,
    },
    cardLayout: {default: true, type: Boolean},
    /** Shadow / border style of the Card wrapper. */
    cardVariant: {
      default: 'elevated',
      type: String as PropType<'elevated' | 'outlined' | 'flat'>,
    },
    className: {default: '', type: String},
    /** Tighter field spacing for modal / dropdown contexts. */
    compact: {default: false, type: Boolean},
    editable: {default: true, type: Boolean},
    error: {default: null, type: String as PropType<string | null>},
    flattenedProfile: {default: null, type: Object as PropType<User | null>},
    hideFields: {default: () => [], type: Array as PropType<string[]>},
    isLoading: {default: false, type: Boolean},
    onUpdate: {default: undefined, type: Function as PropType<(payload: any) => Promise<void>>},
    profile: {default: null, type: Object as PropType<User | null>},
    schemas: {default: () => [], type: Array as PropType<Schema[] | null>},
    /** Whether to render the avatar hero banner. */
    showAvatar: {default: true, type: Boolean},
    showFields: {default: () => [], type: Array as PropType<string[]>},
    title: {default: 'Profile', type: String},
  },
  setup(props: BaseUserProfileProps, {slots}: SetupContext): () => VNode | VNode[] | null {
    const editingFields: Ref<Record<string, boolean>> = ref({});
    const editedValues: Ref<Record<string, any>> = ref({});

    const px = withVendorCSSClassPrefix;

    // ── Visibility ────────────────────────────────────────────────────────────

    function shouldShowField(fieldName: string): boolean {
      if (FIELDS_TO_SKIP.includes(fieldName)) return false;
      if (props.hideFields && props.hideFields.length > 0 && props.hideFields.includes(fieldName)) return false;
      if (props.showFields && props.showFields.length > 0) return props.showFields.includes(fieldName);
      return true;
    }

    // ── Edit state ────────────────────────────────────────────────────────────

    function startEditing(fieldName: string, currentValue: any): void {
      editedValues.value = {...editedValues.value, [fieldName]: currentValue ?? ''};
      editingFields.value = {...editingFields.value, [fieldName]: true};
    }

    function cancelEditing(fieldName: string): void {
      const data = props.flattenedProfile || props.profile;
      const originalValue = (data as Record<string, any>)?.[fieldName] ?? '';
      editedValues.value = {...editedValues.value, [fieldName]: originalValue};
      editingFields.value = {...editingFields.value, [fieldName]: false};
    }

    function saveField(schema: ExtendedSchema): void {
      if (!props.onUpdate || !schema.name) return;
      const value = editedValues.value[schema.name] ?? '';
      const payload = buildScimPatchValue(schema.name, value, schema.schemaId, schema.multiValued);
      props.onUpdate(payload);
      editingFields.value = {...editingFields.value, [schema.name]: false};
    }

    // ── Input rendering per schema type ───────────────────────────────────────

    function renderInput(schema: ExtendedSchema): VNode {
      const fieldName = schema.name!;
      const currentValue = editedValues.value[fieldName];

      switch (schema.type) {
        case 'DATE_TIME':
          return h(DatePicker, {
            modelValue: String(currentValue ?? ''),
            'onUpdate:modelValue': (v: string) => {
              editedValues.value = {...editedValues.value, [fieldName]: v};
            },
            placeholder: `Enter your ${(schema.displayName || fieldName).toLowerCase()}`,
            required: schema.required,
          });

        case 'BOOLEAN':
          return h(Checkbox, {
            label: schema.displayName || fieldName,
            modelValue: Boolean(currentValue),
            'onUpdate:modelValue': (v: boolean) => {
              editedValues.value = {...editedValues.value, [fieldName]: v};
            },
          });

        default:
          return h(TextField, {
            modelValue: String(currentValue ?? ''),
            'onUpdate:modelValue': (v: string) => {
              editedValues.value = {...editedValues.value, [fieldName]: v};
            },
            placeholder: `Enter your ${(schema.displayName || fieldName).toLowerCase()}`,
            required: schema.required,
          });
      }
    }

    // ── Schema-driven field row ───────────────────────────────────────────────

    function renderSchemaFieldRow(schema: ExtendedSchema): VNode | null {
      const {name, displayName, description, mutability, value} = schema;
      if (!name || !shouldShowField(name)) return null;

      const label = displayName || description || formatLabel(name);
      const isReadonly = mutability === 'READ_ONLY' || READONLY_FIELDS.includes(name);
      const isEditable = props.editable && !isReadonly;
      const isEditing = editingFields.value[name];
      const hasValue = value !== undefined && value !== null && value !== '';

      if (!hasValue && !isEditing && !(isEditable && mutability === 'READ_WRITE')) return null;

      return h('div', {class: px('user-profile__field'), key: name}, [
        h('div', {class: px('user-profile__field-label-col')}, [
          h(Typography, {class: px('user-profile__field-label'), variant: 'body2'}, () => label),
        ]),
        h('div', {class: px('user-profile__field-value-col')}, [
          isEditing
            ? h('div', {class: px('user-profile__field-edit')}, [
                renderInput(schema),
                h('div', {class: px('user-profile__field-edit-actions')}, [
                  h(
                    Button,
                    {onClick: () => saveField(schema), size: 'small' as const, variant: 'solid' as const},
                    () => 'Save',
                  ),
                  h(
                    Button,
                    {onClick: () => cancelEditing(name), size: 'small' as const, variant: 'text' as const},
                    () => 'Cancel',
                  ),
                ]),
              ])
            : h('div', {class: px('user-profile__field-display')}, [
                hasValue
                  ? h(Typography, {class: px('user-profile__field-value'), variant: 'body1'}, () => String(value))
                  : isEditable
                    ? h(
                        'span',
                        {class: px('user-profile__field-placeholder'), onClick: () => startEditing(name, value)},
                        `Enter your ${label.toLowerCase()}`,
                      )
                    : null,
                isEditable
                  ? h(
                      'button',
                      {
                        'aria-label': `Edit ${label}`,
                        class: px('user-profile__field-edit-btn'),
                        onClick: () => startEditing(name, value),
                        type: 'button',
                      },
                      [h(PencilIcon)],
                    )
                  : null,
              ]),
        ]),
      ]);
    }

    // ── Fallback: no schemas ──────────────────────────────────────────────────

    function renderProfileWithoutSchemas(): VNode[] {
      const data = (props.flattenedProfile || props.profile) as Record<string, any> | null;
      if (!data) return [];

      return Object.entries(data)
        .filter(([key, value]: [string, any]) => {
          if (!shouldShowField(key)) return false;
          return value !== undefined && value !== null && value !== '';
        })
        .sort(([a]: [string, any], [b]: [string, any]) => a.localeCompare(b))
        .map(([key, value]: [string, any]) =>
          h('div', {class: px('user-profile__field'), key}, [
            h('div', {class: px('user-profile__field-label-col')}, [
              h(Typography, {class: px('user-profile__field-label'), variant: 'body2'}, () => formatLabel(key)),
            ]),
            h('div', {class: px('user-profile__field-value-col')}, [
              h(Typography, {class: px('user-profile__field-value'), variant: 'body1'}, () =>
                typeof value === 'object' ? JSON.stringify(value) : String(value),
              ),
            ]),
          ]),
        );
    }

    // ── Hero section ──────────────────────────────────────────────────────────

    function renderHero(currentUser: Record<string, any>): VNode {
      const displayName = getDisplayName(DEFAULT_ATTRIBUTE_MAPPINGS, currentUser as User);
      const email =
        getMappedUserProfileValue('email', DEFAULT_ATTRIBUTE_MAPPINGS, currentUser as User) ||
        getMappedUserProfileValue('username', DEFAULT_ATTRIBUTE_MAPPINGS, currentUser as User);

      const avatarSeed = String(
        currentUser['username'] || currentUser['userName'] || currentUser['email'] || currentUser['sub'] || displayName,
      );
      const avatarGradient = getAvatarGradient(avatarSeed);
      const initials = displayName
        .split(' ')
        .map((w: string) => w.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase() || '?';

      const avatarSizeClass = px(`user-profile__avatar--${props.avatarSize ?? 'lg'}`);

      return h('div', {class: px('user-profile__hero')}, [
        h('div', {class: px('user-profile__avatar-wrapper')}, [
          h(
            'div',
            {class: [px('user-profile__avatar'), avatarSizeClass].join(' '), style: {background: avatarGradient}},
            [h('span', {class: px('user-profile__avatar-initials')}, initials)],
          ),
        ]),
        h('div', {class: px('user-profile__hero-info')}, [
          h('span', {class: px('user-profile__hero-name')}, displayName),
          email ? h('span', {class: px('user-profile__hero-subtitle')}, String(email)) : null,
        ]),
      ]);
    }

    // ── Main render ───────────────────────────────────────────────────────────

    return (): VNode | VNode[] | null => {
      const data = props.flattenedProfile || props.profile;

      if (!data && !props.isLoading) {
        return slots['default']
          ? slots['default']({error: props.error, isLoading: props.isLoading, profile: null})
          : null;
      }

      if (slots['default']) {
        return slots['default']({error: props.error, isLoading: props.isLoading, profile: data});
      }

      const currentUser = data as Record<string, any>;
      const schemas = (props.schemas ?? []) as ExtendedSchema[];
      const hasSchemas = schemas.length > 0;

      const rootClasses = [
        px('user-profile'),
        props.compact ? px('user-profile--compact') : '',
        props.className ?? '',
      ]
        .filter(Boolean)
        .join(' ');

      const children: VNode[] = [];

      // Title header
      children.push(
        h('div', {class: px('user-profile__header')}, [
          h('span', {class: px('user-profile__title')}, props.title ?? 'Profile'),
        ]),
      );
      children.push(h(Divider, {class: px('user-profile__header-divider')}));

      // Hero
      if (props.showAvatar !== false && currentUser) {
        children.push(renderHero(currentUser));
      }

      // Error alert
      if (props.error) {
        children.push(
          h(Alert, {class: px('user-profile__error'), severity: 'error' as const}, () => props.error),
        );
      }

      // Fields
      if (props.isLoading) {
        children.push(h('div', {class: px('user-profile__loading')}, [h(Spinner)]));
      } else if (hasSchemas) {
        const fieldRows: VNode[] = schemas
          .filter((s: ExtendedSchema) => s.name && shouldShowField(s.name))
          .sort((a: ExtendedSchema, b: ExtendedSchema) => {
            const orderA = a.displayOrder ? parseInt(a.displayOrder, 10) : 999;
            const orderB = b.displayOrder ? parseInt(b.displayOrder, 10) : 999;
            return orderA - orderB;
          })
          .map((schema: ExtendedSchema) => {
            const value = currentUser && schema.name ? currentUser[schema.name] : undefined;
            return renderSchemaFieldRow({...schema, value});
          })
          .filter((node): node is VNode => node !== null);

        children.push(h('div', {class: px('user-profile__fields')}, fieldRows));
      } else {
        children.push(h('div', {class: px('user-profile__fields')}, renderProfileWithoutSchemas()));
      }

      if (slots['footer']) {
        children.push(h('div', {class: px('user-profile__footer')}, slots['footer']()));
      }

      if (props.cardLayout) {
        return h(
          Card,
          {class: rootClasses, variant: props.cardVariant ?? 'elevated'},
          () => children,
        );
      }

      return h('div', {class: rootClasses}, children);
    };
  },
});

export default BaseUserProfile;
