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
 * Email input component for sign-up forms.
 */
const EmailInput: FC<BaseSignUpOptionProps> = ({
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

  return createField({
    type: FieldType.Email,
    name: fieldName,
    label: config['label'] || 'Email',
    placeholder: config['placeholder'] || 'Enter your email',
    required: config['required'] || false,
    value,
    error,
    onChange: (newValue: string) => onInputChange(fieldName, newValue),
    className: inputClassName,
  });
};

export default EmailInput;
