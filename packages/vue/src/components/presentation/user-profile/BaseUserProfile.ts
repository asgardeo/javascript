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
  type SchemaAttribute,
  type UpdateMeProfileConfig,
  WellKnownSchemaIds,
  withVendorCSSClassPrefix,
} from '@asgardeo/browser';

/**
 * Runtime shape produced by `flattenUserSchema` — a `SchemaAttribute` with the
 * owning schema's URN attached. Modelled locally because the published
 * `FlattenedSchema` type incorrectly extends `Schema` instead of
 * `SchemaAttribute` and is therefore missing fields like `multiValued`.
 */
type FlatSchemaEntry = SchemaAttribute & {schemaId: string};
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

/**
 * Each entry's `keys` lists candidate flattened paths produced by
 * `generateFlattenedUserProfile`. The first key that exists in the profile
 * data is used both for display lookup and as the SCIM2 attribute path
 * `buildScimPatchValue` translates back into a proper PATCH payload.
 */
const PROFILE_FIELD_DESCRIPTORS: ProfileFieldDescriptor[] = [
  {keys: ['userName', 'username'], label: 'Username', readonly: true},
  {keys: ['name.givenName', 'firstName', 'givenName'], label: 'First Name', readonly: false},
  {keys: ['name.familyName', 'lastName', 'familyName'], label: 'Last Name', readonly: false},
  {keys: ['emails', 'email'], label: 'Email', readonly: true},
  {keys: ['country'], label: 'Country', readonly: false},
  {keys: ['dateOfBirth', 'birthdate', 'birthDate'], label: 'Birth Date', readonly: false},
  {keys: ['phoneNumbers.mobile', 'mobile', 'mobileNumbers'], label: 'Mobile', readonly: false},
];

const CORE_USER_SCHEMA_ID: string = WellKnownSchemaIds.User;

const setNestedPath = (target: Record<string, unknown>, segments: string[], value: unknown): void => {
  let cursor: Record<string, unknown> = target;
  for (let i: number = 0; i < segments.length - 1; i += 1) {
    const segment: string = segments[i];
    if (typeof cursor[segment] !== 'object' || cursor[segment] === null) {
      cursor[segment] = {};
    }
    cursor = cursor[segment] as Record<string, unknown>;
  }
  cursor[segments[segments.length - 1]] = value;
};

/**
 * Build a SCIM2 PATCH `value` object for a flattened profile field update.
 *
 * Translates a flat key (e.g. `name.givenName`, `phoneNumbers.mobile`,
 * `country`) plus a string value into the canonical SCIM2 structure expected
 * by the `/scim2/Me` PATCH endpoint:
 *
 *  - `name.givenName`         → `{name: {givenName: value}}`
 *  - `phoneNumbers.mobile`    → `{phoneNumbers: [{type: 'mobile', value}]}`
 *  - `emails.work`            → `{emails: [{type: 'work', value}]}`
 *  - `country` (WSO2 ext)     → `{"urn:scim:wso2:schema": {country: value}}`
 *  - `mobileNumbers` (multiV) → `{"urn:scim:wso2:schema": {mobileNumbers: [value]}}`
 *
 * Falls back to a plain `{[flatKey]: value}` when the schema is unknown so
 * unrecognised fields still produce a syntactically valid (if possibly
 * ineffective) PATCH instead of throwing.
 */
const buildScimPatchValue = (
  flatKey: string,
  rawValue: string,
  schemas: Schema[] | null | undefined,
): Record<string, unknown> => {
  const list: FlatSchemaEntry[] = (schemas ?? []) as unknown as FlatSchemaEntry[];
  const entry: FlatSchemaEntry | undefined = list.find((s: FlatSchemaEntry) => s.name === flatKey);

  // Special case: in Asgardeo / WSO2 IS the user's mobile is stored across two
  // independent SCIM2 attributes that map to two distinct userstore columns:
  //   - phoneNumbers[type=mobile].value      → claim http://wso2.org/claims/mobile
  //   - urn:scim:wso2:schema.mobileNumbers   → claim http://wso2.org/claims/mobileNumbers
  // ID-token claims and the SCIM `phoneNumbers` array read from the first;
  // the Asgardeo Console's User Details page and consumers that read the
  // multi-valued aggregate read from the second. Update both in the same
  // PATCH so the value is consistent everywhere.
  if (flatKey === 'phoneNumbers.mobile') {
    return {
      phoneNumbers: [{type: 'mobile', value: rawValue}],
      [WellKnownSchemaIds.SystemUser]: {mobileNumbers: [rawValue]},
    };
  }

  // SCIM multi-valued complex attributes (phoneNumbers, emails, ims, photos, ...)
  // surface in flattenedProfile as `<attr>.<type>` (e.g. phoneNumbers.mobile).
  // The PATCH shape is an array of typed objects, NOT a nested object —
  // sending `{phoneNumbers: {mobile: "..."}}` is invalid and silently dropped.
  const complexMultiValued: Set<string> = new Set([
    'phoneNumbers',
    'emails',
    'ims',
    'photos',
    'addresses',
    'entitlements',
    'roles',
    'x509Certificates',
  ]);
  const dotIndex: number = flatKey.indexOf('.');
  if (dotIndex > 0) {
    const head: string = flatKey.slice(0, dotIndex);
    const tail: string = flatKey.slice(dotIndex + 1);
    if (complexMultiValued.has(head)) {
      return {[head]: [{type: tail, value: rawValue}]};
    }
  }

  // Multi-valued simple attributes (e.g. mobileNumbers under WSO2 schema):
  // wrap the value in an array.
  const value: unknown = entry?.multiValued ? [rawValue] : rawValue;

  // Build the nested object for dotted attribute paths within the same
  // schema (e.g. name.givenName → {name: {givenName: value}}).
  const segments: string[] = flatKey.split('.');
  const nested: Record<string, unknown> = {};
  setNestedPath(nested, segments, value);

  // If the attribute belongs to an extension schema, wrap under its URN.
  // Core attributes (urn:...:core:2.0:User) sit at the root.
  const schemaId: string | undefined = entry?.schemaId;
  if (schemaId && schemaId !== CORE_USER_SCHEMA_ID) {
    return {[schemaId]: nested};
  }

  return nested;
};

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
                                  payload: buildScimPatchValue(
                                    key,
                                    editedValues.value[key] ?? '',
                                    props.schemas,
                                  ),
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
