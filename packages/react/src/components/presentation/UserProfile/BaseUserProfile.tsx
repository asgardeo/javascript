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

import {User, withVendorCSSClassPrefix, WellKnownSchemaIds, bem} from '@asgardeo/browser';
import {cx} from '@emotion/css';
import {FC, ReactElement, useState, useCallback, useRef} from 'react';
import useTheme from '../../../contexts/Theme/useTheme';
import getMappedUserProfileValue from '../../../utils/getMappedUserProfileValue';
import {Avatar} from '../../primitives/Avatar/Avatar';
import Button from '../../primitives/Button/Button';
import Checkbox from '../../primitives/Checkbox/Checkbox';
import DatePicker from '../../primitives/DatePicker/DatePicker';
import Dialog from '../../primitives/Dialog/Dialog';
import TextField from '../../primitives/TextField/TextField';
import MultiInput from '../../primitives/MultiInput/MultiInput';
import Card from '../../primitives/Card/Card';
import useStyles from './BaseUserProfile.styles';
import useTranslation from '../../../hooks/useTranslation';
import Alert from '../../primitives/Alert/Alert';
import getDisplayName from '../../../utils/getDisplayName';

interface ExtendedFlatSchema {
  path?: string;
  schemaId?: string;
}

interface Schema extends ExtendedFlatSchema {
  caseExact?: boolean;
  description?: string;
  displayName?: string;
  displayOrder?: string;
  multiValued?: boolean;
  mutability?: string;
  name?: string;
  required?: boolean;
  returned?: string;
  subAttributes?: Schema[];
  type?: string;
  uniqueness?: string;
  value?: any;
}

export interface BaseUserProfileProps {
  attributeMapping?: {
    [key: string]: string | string[] | undefined;
    firstName?: string | string[];
    lastName?: string | string[];
    picture?: string | string[];
    username?: string | string[];
  };
  cardLayout?: boolean;
  className?: string;
  editable?: boolean;
  fallback?: ReactElement;
  flattenedProfile?: User;
  hideFields?: string[];
  mode?: 'inline' | 'popup';
  onOpenChange?: (open: boolean) => void;
  onUpdate?: (payload: any) => Promise<void>;
  open?: boolean;
  profile?: User;
  schemas?: Schema[];
  showFields?: string[];
  title?: string;
  error?: string | null;
  isLoading?: boolean;
}

// Fields to skip based on schema.name
const fieldsToSkip: string[] = [
  'roles.default',
  'active',
  'groups',
  'accountLocked',
  'accountDisabled',
  'oneTimePassword',
  'userSourceId',
  'idpType',
  'localCredentialExists',
  'active',
  'ResourceType',
  'ExternalID',
  'MetaData',
  'verifiedMobileNumbers',
  'verifiedEmailAddresses',
  'phoneNumbers.mobile',
  'emailAddresses',
  'preferredMFAOption',
];

// Fields that should be readonly
const readonlyFields: string[] = ['username', 'userName', 'user_name'];

const BaseUserProfile: FC<BaseUserProfileProps> = ({
  fallback = null,
  className = '',
  cardLayout = true,
  profile,
  schemas = [],
  flattenedProfile,
  mode = 'inline',
  title,
  attributeMapping = {},
  editable = true,
  onOpenChange,
  onUpdate,
  open = false,
  error = null,
  isLoading = false,
  showFields = [],
  hideFields = [],
}): ReactElement => {
  const {theme, colorScheme} = useTheme();
  const [editedUser, setEditedUser] = useState(flattenedProfile || profile);
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  const {t} = useTranslation();

  /**
   * Determines if a field should be visible based on showFields, hideFields, and fieldsToSkip arrays.
   * Priority order:
   * 1. fieldsToSkip (always hidden) - highest priority
   * 2. hideFields (explicitly hidden)
   * 3. showFields (explicitly shown, if array is not empty)
   * 4. Default behavior (show all fields not in fieldsToSkip)
   */
  const shouldShowField = useCallback(
    (fieldName: string): boolean => {
      // Always skip fields in the hardcoded fieldsToSkip array
      if (fieldsToSkip.includes(fieldName)) {
        return false;
      }

      // If hideFields is provided and contains this field, hide it
      if (hideFields.length > 0 && hideFields.includes(fieldName)) {
        return false;
      }

      // If showFields is provided and not empty, only show fields in that array
      if (showFields.length > 0) {
        return showFields.includes(fieldName);
      }

      return true;
    },
    [showFields, hideFields],
  );

  const PencilIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );

  const toggleFieldEdit = useCallback((fieldName: string) => {
    setEditingFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  }, []);

  const getFieldPlaceholder = useCallback((schema: Schema): string => {
    const {type, displayName, description, name} = schema;

    const fieldLabel = displayName || description || name || 'value';

    switch (type) {
      case 'DATE_TIME':
        return `Enter your ${fieldLabel.toLowerCase()}`;
      case 'BOOLEAN':
        return `Select ${fieldLabel.toLowerCase()}`;
      case 'COMPLEX':
        return `Enter ${fieldLabel.toLowerCase()} details`;
      default:
        return `Enter your ${fieldLabel.toLowerCase()}`;
    }
  }, []);

  const ObjectDisplay: FC<{data: unknown}> = ({data}) => {
    if (!data || typeof data !== 'object') return null;

    return (
      <table className={styles.value}>
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key}>
              <td className={styles.objectKey}>
                <strong>{formatLabel(key)}:</strong>
              </td>
              <td className={styles.objectValue}>
                {typeof value === 'object' ? <ObjectDisplay data={value} /> : String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  function set(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (i === keys.length - 1) {
        current[key] = value;
      } else {
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {};
        }
        current = current[key];
      }
    }
  }

  const handleFieldSave = useCallback(
    (schema: Schema): void => {
      if (!onUpdate || !schema.name) return;

      const fieldName: string = schema.name;
      let fieldValue: any =
        editedUser && fieldName && editedUser[fieldName] !== undefined
          ? editedUser[fieldName]
          : flattenedProfile && flattenedProfile[fieldName] !== undefined
          ? flattenedProfile[fieldName]
          : '';

      if (Array.isArray(fieldValue)) {
        fieldValue = fieldValue.filter(v => v !== undefined && v !== null && v !== '');
      }

      let payload: Record<string, any> = {};

      // SCIM Patch Operation Logic:
      // - Fields from core schema (urn:ietf:params:scim:schemas:core:2.0:User)
      //   should be sent directly: {"name":{"givenName":"John"}}
      // - Fields from extension schemas (like urn:scim:wso2:schema)
      //   should be nested under the schema namespace: {"urn:scim:wso2:schema":{"country":"Sri Lanka"}}
      if (schema.schemaId && schema.schemaId !== WellKnownSchemaIds.User) {
        // For non-core schemas, nest the field under the schema namespace
        payload = {
          [schema.schemaId]: {
            [fieldName]: fieldValue,
          },
        };
      } else {
        // For core schema or fields without schemaId, use the field path directly
        // This handles complex paths like "name.givenName" correctly
        set(payload, fieldName, fieldValue);
      }

      onUpdate(payload);

      toggleFieldEdit(fieldName);
    },
    [editedUser, flattenedProfile, onUpdate, toggleFieldEdit],
  );

  const handleFieldCancel = useCallback(
    (fieldName: string) => {
      const currentUser = flattenedProfile || profile;
      setEditedUser(prev => ({
        ...prev,
        [fieldName]: currentUser[fieldName],
      }));
      toggleFieldEdit(fieldName);
    },
    [flattenedProfile, profile, toggleFieldEdit],
  );

  const formatLabel = useCallback(
    (key: string): string =>
      key
        .split(/(?=[A-Z])|_/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' '),
    [],
  );

  const styles = useStyles(theme, colorScheme);

  const defaultAttributeMappings: {[key: string]: string | string[] | undefined} = {
    picture: ['profile', 'profileUrl', 'picture', 'URL'],
    firstName: ['name.givenName', 'given_name'],
    lastName: ['name.familyName', 'family_name'],
    email: ['emails'],
    username: ['userName', 'username', 'user_name'],
  };

  const mergedMappings: {[key: string]: string | string[] | undefined} = {
    ...defaultAttributeMappings,
    ...attributeMapping,
  };

  const renderSchemaField = (
    schema: Schema,
    isEditing: boolean,
    onEditValue?: (value: any) => void,
    onStartEdit?: () => void,
  ): ReactElement | null => {
    if (!schema) return null;
    const {value, displayName, description, name, type, required, mutability, subAttributes, multiValued} = schema;
    const label = displayName || description || name || '';

    if (subAttributes && Array.isArray(subAttributes)) {
      return (
        <>
          {subAttributes.map((subAttr, index) => (
            <div key={index} className={styles.field}>
              <span className={styles.label}>{subAttr.displayName || subAttr.description || ''}</span>
              <div className={styles.value}>
                {Array.isArray(subAttr.value)
                  ? subAttr.value
                      .map(item => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
                      .join(', ')
                  : typeof subAttr.value === 'object'
                  ? JSON.stringify(subAttr.value)
                  : String(subAttr.value)}
              </div>
            </div>
          ))}
        </>
      );
    }

    if (Array.isArray(value) || multiValued) {
      const hasValues = Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== '';
      const isEditable = editable && mutability !== 'READ_ONLY' && !readonlyFields.includes(name || '');

      if (isEditing && onEditValue && isEditable) {
        const currentValue =
          editedUser && name && editedUser[name] !== undefined
            ? editedUser[name]
            : flattenedProfile && name && flattenedProfile[name] !== undefined
            ? flattenedProfile[name]
            : value;

        let fieldValues: string[];
        if (Array.isArray(currentValue)) {
          fieldValues = currentValue.map(String);
        } else if (currentValue !== undefined && currentValue !== null && currentValue !== '') {
          fieldValues = [String(currentValue)];
        } else {
          fieldValues = [];
        }

        return (
          <>
            <span className={styles.label}>{label}</span>
            <div className={styles.value}>
              <MultiInput
                values={fieldValues}
                onChange={newValues => {
                  if (multiValued || Array.isArray(currentValue)) {
                    onEditValue(newValues);
                  } else {
                    onEditValue(newValues[0] || '');
                  }
                }}
                placeholder={getFieldPlaceholder(schema)}
                fieldType={type as 'STRING' | 'DATE_TIME' | 'BOOLEAN'}
                type={type === 'DATE_TIME' ? 'date' : type === 'STRING' ? 'text' : 'text'}
                required={required}
              />
            </div>
          </>
        );
      }

      let displayValue: string;
      if (hasValues) {
        if (Array.isArray(value)) {
          displayValue = value.map(item => (typeof item === 'object' ? JSON.stringify(item) : String(item))).join(', ');
        } else {
          displayValue = String(value);
        }
      } else if (isEditable) {
        displayValue = getFieldPlaceholder(schema);
      } else {
        displayValue = '-';
      }

      return (
        <>
          <span className={styles.label}>{label}</span>
          <div className={cx(styles.value, !hasValues ? styles.valuePlaceholder : '')}>
            {!hasValues && isEditable && onStartEdit ? (
              <Button
                onClick={onStartEdit}
                variant="text"
                color="secondary"
                size="small"
                title="Click to edit"
                className={styles.editButton}
              >
                {displayValue}
              </Button>
            ) : (
              displayValue
            )}
          </div>
        </>
      );
    }
    if (type === 'COMPLEX' && typeof value === 'object') {
      return <ObjectDisplay data={value} />;
    }

    if (isEditing && onEditValue && mutability !== 'READ_ONLY' && !readonlyFields.includes(name || '')) {
      const fieldValue =
        editedUser && name && editedUser[name] !== undefined
          ? editedUser[name]
          : flattenedProfile && name && flattenedProfile[name] !== undefined
          ? flattenedProfile[name]
          : value || '';

      const commonProps = {
        label: undefined,
        required,
        value: fieldValue,
        onChange: (e: any) => onEditValue(e.target ? e.target.value : e),
        placeholder: getFieldPlaceholder(schema),
        // Removed inline style, use .styles.ts for marginBottom if needed
      };
      let field: ReactElement;
      switch (type) {
        case 'STRING':
          field = <TextField {...commonProps} />;
          break;
        case 'DATE_TIME':
          field = <DatePicker {...commonProps} />;
          break;
        case 'BOOLEAN':
          field = <Checkbox {...commonProps} checked={!!fieldValue} onChange={e => onEditValue(e.target.checked)} />;
          break;
        case 'COMPLEX':
          field = (
            <textarea
              value={fieldValue}
              onChange={e => onEditValue(e.target.value)}
              placeholder={getFieldPlaceholder(schema)}
              required={required}
              className={styles.complexTextarea}
            />
          );
          break;
        default:
          field = <TextField {...commonProps} />;
      }
      return (
        <>
          <span className={styles.label}>{label}</span>
          <div className={styles.value}>{field}</div>
        </>
      );
    }

    const hasValue = value !== undefined && value !== null && value !== '';
    const isEditable = editable && mutability !== 'READ_ONLY' && !readonlyFields.includes(name || '');

    let displayValue: string;
    if (hasValue) {
      displayValue = String(value);
    } else if (isEditable) {
      displayValue = getFieldPlaceholder(schema);
    } else {
      displayValue = '-';
    }

    return (
      <>
        <span className={styles.label}>{label}</span>
        <div className={cx(styles.value, !hasValue ? styles.valuePlaceholder : '')}>
          {!hasValue && isEditable && onStartEdit ? (
            <Button
              onClick={onStartEdit}
              variant="text"
              color="secondary"
              size="small"
              title="Click to edit"
              className={styles.editButton}
            >
              {displayValue}
            </Button>
          ) : (
            displayValue
          )}
        </div>
      </>
    );
  };

  const renderUserInfo = (schema: Schema) => {
    if (!schema || !schema.name) return null;

    const hasValue = schema.value !== undefined && schema.value !== '' && schema.value !== null;
    const isFieldEditing = editingFields[schema.name];
    const isReadonlyField = readonlyFields.includes(schema.name);

    const shouldShow = hasValue || isFieldEditing || (editable && schema.mutability === 'READ_WRITE');

    if (!shouldShow) {
      return null;
    }

    const fieldStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: theme.vars.spacing.unit,
    };

    return (
      <div className={styles.field}>
        <div className={styles.fieldInner}>
          {renderSchemaField(
            schema,
            isFieldEditing,
            value => {
              const tempEditedUser = {...editedUser};
              tempEditedUser[schema.name!] = value;
              setEditedUser(tempEditedUser);
            },
            () => toggleFieldEdit(schema.name!),
          )}
        </div>
        {editable && schema.mutability !== 'READ_ONLY' && !isReadonlyField && (
          <div className={styles.fieldActions}>
            {isFieldEditing && (
              <>
                <Button size="small" color="primary" variant="solid" onClick={() => handleFieldSave(schema)}>
                  Save
                </Button>
                <Button size="small" color="secondary" variant="solid" onClick={() => handleFieldCancel(schema.name!)}>
                  Cancel
                </Button>
              </>
            )}
            {!isFieldEditing && hasValue && (
              <Button
                size="small"
                color="tertiary"
                variant="icon"
                onClick={() => toggleFieldEdit(schema.name!)}
                title="Edit"
                className={styles.editButton}
              >
                <PencilIcon />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!profile && !flattenedProfile) {
    return fallback;
  }

  const containerClasses = cx(
    styles.root,
    cardLayout ? styles.card : '',
    withVendorCSSClassPrefix('user-profile'),
    className,
  );

  const currentUser = flattenedProfile || profile;
  const avatarAttributes = ['picture'];
  const excludedProps = avatarAttributes.map(attr => mergedMappings[attr] || attr);

  const renderProfileWithoutSchemas = () => {
    if (!currentUser) return null;

    const profileEntries = Object.entries(currentUser)
      .filter(([key, value]) => {
        if (!shouldShowField(key)) return false;

        return value !== undefined && value !== '' && value !== null;
      })
      .sort(([a], [b]) => a.localeCompare(b)); // Sort alphabetically

    return (
      <>
        {profileEntries.map(([key, value]) => (
          <div key={key} className={styles.field}>
            <span className={styles.label}>{formatLabel(key)}</span>
            <div className={styles.value}>
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </div>
          </div>
        ))}
      </>
    );
  };

  const profileContent = (
    <Card className={containerClasses}>
      {error && (
        <Alert variant="error" className={cx(withVendorCSSClassPrefix(bem('user-profile', 'alert')), styles.alert)}>
          <Alert.Title>{t('errors.title') || 'Error'}</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert>
      )}
      <div className={styles.header}>
        <Avatar
          imageUrl={getMappedUserProfileValue('picture', mergedMappings, currentUser)}
          name={getDisplayName(mergedMappings, profile)}
          size={80}
          alt={`${getDisplayName(mergedMappings, profile)}'s avatar`}
          isLoading={isLoading}
        />
      </div>
      <div className={styles.infoContainer}>
        {schemas && schemas.length > 0
          ? schemas
              .filter(schema => {
                if (!schema.name || !shouldShowField(schema.name)) return false;

                if (!editable) {
                  const value = flattenedProfile && schema.name ? flattenedProfile[schema.name] : undefined;
                  return value !== undefined && value !== '' && value !== null;
                }

                return true;
              })
              .sort((a, b) => {
                const orderA = a.displayOrder ? parseInt(a.displayOrder) : 999;
                const orderB = b.displayOrder ? parseInt(b.displayOrder) : 999;
                return orderA - orderB;
              })
              .map((schema, index) => {
                const value = flattenedProfile && schema.name ? flattenedProfile[schema.name] : undefined;
                const schemaWithValue = {
                  ...schema,
                  value,
                };

                return (
                  <div key={schema.name || index} className={styles.info}>
                    {renderUserInfo(schemaWithValue)}
                  </div>
                );
              })
          : renderProfileWithoutSchemas()}
      </div>
    </Card>
  );

  if (mode === 'popup') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Heading>{title ?? t('user.profile.title')}</Dialog.Heading>
          <div className={styles.popup}>{profileContent}</div>
        </Dialog.Content>
      </Dialog>
    );
  }

  return profileContent;
};

export default BaseUserProfile;
