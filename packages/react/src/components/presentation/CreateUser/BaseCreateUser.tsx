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

import {cx} from '@emotion/css';
import {CSSProperties, FC, ReactElement, ReactNode, useState} from 'react';
import {useForm, FormField} from '../../../hooks/useForm';
import useTheme from '../../../contexts/Theme/useTheme';
import useTranslation from '../../../hooks/useTranslation';
import useStyles from './CreateUser.styles';
import Alert from '../../primitives/Alert/Alert';
import Button from '../../primitives/Button/Button';
import Dialog from '../../primitives/Dialog/Dialog';
import FormControl from '../../primitives/FormControl/FormControl';
import InputLabel from '../../primitives/InputLabel/InputLabel';
import TextField from '../../primitives/TextField/TextField';
import DatePicker from '../../primitives/DatePicker/DatePicker';
import Checkbox from '../../primitives/Checkbox/Checkbox';
import Select from '../../primitives/Select/Select';

export interface BaseCreateUserProps {
  cardLayout?: boolean;
  className?: string;
  error?: string | null;
  loading?: boolean;
  mode?: 'inline' | 'popup';
  onCancel?: () => void;
  onCreate: (payload: any) => Promise<void>;
  onPopupClose?: (open: boolean) => void;
  onSuccess?: (user: any) => void;
  popupOpen?: boolean;
  renderAdditionalFields?: () => ReactNode;
  schemas: any[];
  style?: CSSProperties;
  title?: string;
  userstores?: any;
}

const BaseCreateUser: FC<BaseCreateUserProps> = ({
  cardLayout = true,
  className = '',
  error = null,
  loading = false,
  mode = 'inline',
  onCancel,
  onCreate,
  onPopupClose,
  onSuccess,
  popupOpen = false,
  renderAdditionalFields,
  schemas,
  style,
  title = 'Create User',
  userstores = [],
}): ReactElement => {
  const {theme, colorScheme} = useTheme();
  const {t} = useTranslation();
  const styles = useStyles(theme, colorScheme);

  // Build form fields for useForm (flat attribute array)
  const formFields: FormField[] = [];
  // Add userstore dropdown field
  formFields.push({
    name: 'userstore',
    required: true,
    initialValue: userstores.length > 0 ? userstores[0].id : '',
    validator: value => {
      if (!value) return t('field.required');
      return null;
    },
  });
  schemas?.forEach(attr => {
    if (attr.subAttributes && Array.isArray(attr.subAttributes)) {
      attr.subAttributes.forEach(subAttr => {
        formFields.push({
          name: `${attr.name}.${subAttr.name}`,
          required: !!subAttr.required,
          initialValue: '',
          validator: value => {
            if (subAttr.required && (!value || value.trim() === '')) {
              return t('field.required');
            }
            return null;
          },
        });
      });
    } else {
      formFields.push({
        name: attr.name,
        required: !!attr.required,
        initialValue: '',
        validator: value => {
          if (attr.required && (!value || value.trim() === '')) {
            return t('field.required');
          }
          return null;
        },
      });
    }
  });

  const form = useForm<Record<string, string>>({
    initialValues: {},
    fields: formFields,
    validateOnBlur: true,
    validateOnChange: true,
    requiredMessage: t('field.required'),
  });

  const {
    values: formState,
    errors,
    touched,
    isValid: isFormValid,
    setValue,
    setTouched,
    validateForm,
    touchAllFields,
    reset: resetForm,
  } = form;

  const handleChange = (name: string, value: any) => {
    setValue(name, value);
    setTouched(name, true);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    touchAllFields();
    const validation = validateForm();
    if (!validation.isValid || loading) return;

    try {
      await onCreate(formState);

      if (onSuccess) {
        onSuccess(formState);
      }

      resetForm();
    } catch (submitError) {
      // Error handling is done by parent component
      console.error('Form submission error:', submitError);
    }
  };

  // Helper to get placeholder
  const getFieldPlaceholder = (schema: any): string => {
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
  };

  // Render a single field based on type
  const renderField = (fieldName: string, schema: any) => {
    const {type, required} = schema;
    const value = formState[fieldName] || '';
    const errorMsg = touched[fieldName] && errors[fieldName] ? errors[fieldName] : undefined;

    switch (type) {
      case 'STRING':
        return (
          <TextField
            className={cx(styles.input)}
            id={fieldName}
            name={fieldName}
            value={value}
            onChange={e => handleChange(fieldName, e.target.value)}
            required={!!required}
            error={errorMsg}
            placeholder={getFieldPlaceholder(schema)}
            disabled={loading}
          />
        );
      case 'DATE_TIME':
        return (
          <DatePicker
            className={cx(styles.input)}
            id={fieldName}
            name={fieldName}
            value={value}
            onChange={e => handleChange(fieldName, e.target.value)}
            required={!!required}
            error={errorMsg}
            placeholder={getFieldPlaceholder(schema)}
            disabled={loading}
          />
        );
      case 'BOOLEAN':
        return (
          <Checkbox
            className={cx(styles.input)}
            id={fieldName}
            name={fieldName}
            checked={!!value}
            onChange={e => handleChange(fieldName, e.target.checked)}
            required={!!required}
            label={getFieldPlaceholder(schema)}
            error={errorMsg}
            disabled={loading}
          />
        );
      case 'COMPLEX':
        return (
          <FormControl error={errorMsg}>
            <textarea
              className={cx(styles.textarea, errorMsg && styles.textareaError)}
              id={fieldName}
              name={fieldName}
              value={value}
              onChange={e => handleChange(fieldName, e.target.value)}
              required={!!required}
              placeholder={getFieldPlaceholder(schema)}
              disabled={loading}
            />
          </FormControl>
        );
      default:
        return (
          <TextField
            className={cx(styles.input)}
            id={fieldName}
            name={fieldName}
            value={value}
            onChange={e => handleChange(fieldName, e.target.value)}
            required={!!required}
            error={errorMsg}
            placeholder={getFieldPlaceholder(schema)}
            disabled={loading}
          />
        );
    }
  };

  // Render form fields based on flat attribute array
  const renderFields = () => {
    const fields: ReactElement[] = [];
    // Userstore dropdown
    // if (userstores.length > 0) {
    //   fields.push(
    //     <div key="userstore" className={cx(styles.fieldGroup)}>
    //       <Select
    //         id="userstore"
    //         name="userstore"
    //         className={cx(styles.input)}
    //         value={formState['userstore'] || ''}
    //         onChange={e => handleChange('userstore', e.target.value)}
    //         disabled={loading}
    //         // required
    //         options={userstores.map(us => ({value: us.id, label: us.name}))}
    //         label={t('user.create.userstore') || 'Userstore'}
    //         error={touched['userstore'] && errors['userstore'] ? errors['userstore'] : undefined}
    //       />
    //     </div>,
    //   );
    // }
    schemas?.forEach(attr => {
      if (attr.subAttributes && Array.isArray(attr.subAttributes)) {
        attr.subAttributes.forEach(subAttr => {
          const fieldName = `${attr.name}.${subAttr.name}`;
          fields.push(
            <div key={fieldName} className={cx(styles.fieldGroup)}>
              <InputLabel required={!!subAttr.required} htmlFor={fieldName}>
                {subAttr.displayName || subAttr.name}
              </InputLabel>
              {renderField(fieldName, subAttr)}
            </div>,
          );
        });
      } else {
        fields.push(
          <div key={attr.name} className={cx(styles.fieldGroup)}>
            <InputLabel required={!!attr.required} htmlFor={attr.name}>
              {attr.displayName || attr.name}
            </InputLabel>
            {renderField(attr.name, attr)}
          </div>,
        );
      }
    });
    return fields;
  };

  const createUserContent = (
    <div className={cx(styles.root, cardLayout && styles.card, className)} style={style}>
      <div className={cx(styles.content)}>
        <form id="create-user-form" className={cx(styles.form)} onSubmit={handleSubmit}>
          {error && (
            <Alert variant="error" className={styles.errorAlert}>
              <Alert.Title>Error</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert>
          )}
          {renderFields()}
          {renderAdditionalFields && renderAdditionalFields()}
        </form>
        <div className={cx(styles.actions)}>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              {t('user.create.cancel')}
            </Button>
          )}
          <Button type="submit" variant="solid" color="primary" disabled={loading} form="create-user-form">
            {loading ? t('user.create.submitting') : t('user.create.submit')}
          </Button>
        </div>
      </div>
    </div>
  );

  if (mode === 'popup') {
    return (
      <Dialog open={popupOpen} onOpenChange={onPopupClose}>
        <Dialog.Content>
          <Dialog.Heading>{title}</Dialog.Heading>
          <div className={styles.popup}>{createUserContent}</div>
        </Dialog.Content>
      </Dialog>
    );
  }

  return createUserContent;
};

export default BaseCreateUser;
