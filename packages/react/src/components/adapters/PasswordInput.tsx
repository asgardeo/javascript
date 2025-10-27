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

import {FieldType} from '@asgardeo/browser';
import {FC} from 'react';
import {BaseSignUpOptionProps} from '../presentation/SignUp/SignUpOptionFactory';
import {createField} from '../factories/FieldFactory';

/**
 * Password input component for sign-up forms.
 */
const PasswordInput: FC<BaseSignUpOptionProps> = ({
  component,
  formValues,
  touchedFields,
  formErrors,
  onInputChange,
  inputClassName,
}) => {
  const config = component.config || {};
  const fieldName = config['identifier'] || config['name'] || component.id;
  const value = formValues[fieldName] || '';
  const error = touchedFields[fieldName] ? formErrors[fieldName] : undefined;

  // Extract validation rules from the component config if available
  const validations = config['validations'] || [];
  const validationHints: string[] = [];

  validations.forEach((validation: any) => {
    if (validation.name === 'LengthValidator') {
      const minLength = validation.conditions?.find((c: any) => c.key === 'min.length')?.value;
      const maxLength = validation.conditions?.find((c: any) => c.key === 'max.length')?.value;
      if (minLength || maxLength) {
        validationHints.push(`Length: ${minLength || '0'}-${maxLength || '∞'} characters`);
      }
    } else if (validation.name === 'UpperCaseValidator') {
      const minLength = validation.conditions?.find((c: any) => c.key === 'min.length')?.value;
      if (minLength && parseInt(minLength, 10) > 0) {
        validationHints.push('Must contain uppercase letter(s)');
      }
    } else if (validation.name === 'LowerCaseValidator') {
      const minLength = validation.conditions?.find((c: any) => c.key === 'min.length')?.value;
      if (minLength && parseInt(minLength, 10) > 0) {
        validationHints.push('Must contain lowercase letter(s)');
      }
    } else if (validation.name === 'NumeralValidator') {
      const minLength = validation.conditions?.find((c: any) => c.key === 'min.length')?.value;
      if (minLength && parseInt(minLength, 10) > 0) {
        validationHints.push('Must contain number(s)');
      }
    } else if (validation.name === 'SpecialCharacterValidator') {
      const minLength = validation.conditions?.find((c: any) => c.key === 'min.length')?.value;
      if (minLength && parseInt(minLength, 10) > 0) {
        validationHints.push('Must contain special character(s)');
      }
    }
  });

  const hint = validationHints.length > 0 ? validationHints.join(', ') : config['hint'] || '';

  return createField({
    type: FieldType.Password,
    name: fieldName,
    label: config['label'] || 'Password',
    placeholder: config['placeholder'] || 'Enter your password',
    required: config['required'] || false,
    value,
    error,
    onChange: (newValue: string) => onInputChange(fieldName, newValue),
    className: inputClassName,
  });
};

export default PasswordInput;
