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

import {FC, ReactElement} from 'react';
import TextField from '../primitives/TextField/TextField';
import Select from '../primitives/Select/Select';
import {SelectOption} from '../primitives/Select/Select';
import OtpField from '../primitives/OtpField/OtpField';
import PasswordField from '../primitives/PasswordField/PasswordField';
import DatePicker from '../primitives/DatePicker/DatePicker';
import Checkbox from '../primitives/Checkbox/Checkbox';
import {FieldType} from '@asgardeo/browser';

/**
 * Interface for field configuration.
 */
export interface FieldConfig {
  /**
   * The name of the field.
   */
  name: string;
  /**
   * The field type.
   */
  type: FieldType
  ;
  /**
   * Display name for the field.
   */
  label: string;
  /**
   * Whether the field is required.
   */
  required: boolean;
  /**
   * Current value of the field.
   */
  value: string;
  /**
   * Callback function when the field value changes.
   */
  onChange: (value: string) => void;
  /**
   * Callback function when the field loses focus.
   */
  onBlur?: () => void;
  /**
   * Whether the field is disabled.
   */
  disabled?: boolean;
  /**
   * Error message to display.
   */
  error?: string;
  /**
   * Additional CSS class name.
   */
  className?: string;
  /**
   * Additional options for multi-valued fields.
   */
  options?: SelectOption[];
  /**
   * Whether the field has been touched/interacted with by the user.
   */
  touched?: boolean;
  /**
   * Placeholder text for the field.
   */
  placeholder?: string;
}

/**
 * Utility function to validate field values based on type
 */
export const validateFieldValue = (
  value: string,
  type: FieldType,
  required: boolean = false,
  touched: boolean = false,
): string | null => {
  if (required && touched && (!value || value.trim() === '')) {
    return 'This field is required';
  }

  if (!value || value.trim() === '') {
    return null;
  }

  switch (type) {
    case FieldType.Number:
      const numValue = parseInt(value, 10);
      if (isNaN(numValue)) {
        return 'Please enter a valid number';
      }
      break;
  }

  return null;
};

/**
 * Factory function to create form fields based on the EmbeddedSignInFlowAuthenticatorParamType.
 *
 * @param config - The field configuration
 * @returns The appropriate React component for the field type
 *
 * @example
 * ```tsx
 * const field = createField({
 *   param: 'username',
 *   type: EmbeddedSignInFlowAuthenticatorParamType.String,
 *   label: 'Username',
 *   confidential: false,
 *   required: true,
 *   value: '',
 *   onChange: (value) => console.log(value)
 * });
 * ```
 */
export const createField = (config: FieldConfig): ReactElement => {
  const {
    name,
    type,
    label,
    required,
    value,
    onChange,
    onBlur,
    disabled = false,
    error,
    className,
    options = [],
    touched = false,
    placeholder,
  } = config;

  const validationError = error || validateFieldValue(value, type, required, touched);

  const commonProps = {
    name,
    label,
    required,
    disabled,
    error: validationError,
    className,
    value,
    placeholder,
    onBlur,
    'data-testid': `asgardeo-signin-${name}`,
  };

  switch (type) {
    case FieldType.Password:
      return <PasswordField {...commonProps} onChange={onChange} />;
    case FieldType.Text:
      return <TextField {...commonProps} type="text" onChange={e => onChange(e.target.value)} autoComplete="off" />;
    case FieldType.Email:
      return <TextField {...commonProps} type="email" onChange={e => onChange(e.target.value)} autoComplete="email" />;
    case FieldType.Date:
      return <DatePicker {...commonProps} onChange={e => onChange(e.target.value)} />;
    case FieldType.Checkbox:
      const isChecked = value === 'true' || (value as any) === true;
      return <Checkbox {...commonProps} checked={isChecked} onChange={e => onChange(e.target.checked.toString())} />;
    case FieldType.Otp:
      return <OtpField {...commonProps} onChange={e => onChange(e.target.value)} />;
    case FieldType.Number:
      return (
        <TextField
          {...commonProps}
          type="number"
          onChange={e => onChange(e.target.value)}
          helperText="Enter a numeric value"
        />
      );
    case FieldType.Select:
      const fieldOptions = options.length > 0 ? options : [];

      if (fieldOptions.length > 0) {
        return (
          <Select
            {...commonProps}
            options={fieldOptions}
            onChange={e => onChange(e.target.value)}
            helperText="Select from available options"
          />
        );
      }

      return (
        <TextField
          {...commonProps}
          type="text"
          onChange={e => onChange(e.target.value)}
          helperText="Enter multiple values separated by commas (e.g., value1, value2, value3)"
          placeholder="value1, value2, value3"
        />
      );

    default:
      return (
        <TextField
          {...commonProps}
          type="text"
          onChange={e => onChange(e.target.value)}
          helperText="Unknown field type, treating as text"
        />
      );
  }
};

/**
 * React component wrapper for the field factory.
 */
export const FieldFactory: FC<FieldConfig> = (props: FieldConfig): ReactElement => {
  return createField(props);
};

export default FieldFactory;
