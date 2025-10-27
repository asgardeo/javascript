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

import React, {ReactElement} from 'react';
import {AsgardeoRuntimeError, EmbeddedFlowComponent, FieldType} from '@asgardeo/browser';
import {EmbeddedFlowComponentType} from '@asgardeo/browser';
import {createField} from '../../../factories/FieldFactory';
import Button from '../../../primitives/Button/Button';
import GoogleButton from '../../../adapters/GoogleButton';
import GitHubButton from '../../../adapters/GitHubButton';
import FacebookButton from '../../../adapters/FacebookButton';
import Typography from '../../../primitives/Typography/Typography';
import Divider from '../../../primitives/Divider/Divider';
import SmsOtpButton from '../../../adapters/SmsOtpButton';

/**
 * Get the appropriate FieldType for an input component.
 */
const getFieldType = (variant: string): FieldType => {
  switch (variant) {
    case 'EMAIL':
      return FieldType.Email;
    case 'PASSWORD':
      return FieldType.Password;
    case 'TEXT':
    default:
      return FieldType.Text;
  }
};

/**
 * Get typography variant from component variant.
 */
const getTypographyVariant = (variant: string) => {
  const variantMap: Record<string, any> = {
    H1: 'h1',
    H2: 'h2',
    H3: 'h3',
    H4: 'h4',
    H5: 'h5',
    H6: 'h6',
  };
  return variantMap[variant] || 'h3';
};

/**
 * Create a sign-in component from flow component configuration.
 */
const createSignInComponentFromFlow = (
  component: EmbeddedFlowComponent,
  formValues: Record<string, string>,
  touchedFields: Record<string, boolean>,
  formErrors: Record<string, string>,
  isLoading: boolean,
  isFormValid: boolean,
  onInputChange: (name: string, value: string) => void,
  options: {
    buttonClassName?: string;
    error?: string | null;
    inputClassName?: string;
    key?: string | number;
    onSubmit?: (component: EmbeddedFlowComponent, data?: Record<string, any>) => void;
    size?: 'small' | 'medium' | 'large';
    variant?: any;
  } = {},
): ReactElement | null => {
  const key = options.key || component.id;

  switch (component.type) {
    case EmbeddedFlowComponentType.Input: {
      const identifier = component.config['identifier'] || component.id;
      const value = formValues[identifier] || '';
      const isTouched = touchedFields[identifier] || false;
      const error = isTouched ? formErrors[identifier] : undefined;
      const fieldType = getFieldType(component.variant || 'TEXT');

      const field = createField({
        type: fieldType,
        name: identifier,
        label: component.config['label'] || '',
        placeholder: component.config['placeholder'] || '',
        required: component.config['required'] || false,
        value,
        error,
        onChange: (newValue: string) => onInputChange(identifier, newValue),
        className: options.inputClassName,
      });

      return React.cloneElement(field, {key});
    }

    case EmbeddedFlowComponentType.Button: {
      const handleClick = () => {
        if (options.onSubmit) {
          const formData: Record<string, any> = {};
          Object.keys(formValues).forEach(field => {
            if (formValues[field]) {
              formData[field] = formValues[field];
            }
          });
          options.onSubmit(component, formData);
        }
      };

      // Render branded social login buttons for known action IDs
      const actionId: string = component.config['actionId'];

      if (actionId === 'google_auth') {
        return <GoogleButton key={key} onClick={handleClick} className={options.buttonClassName} />;
      }
      if (actionId === 'github_auth') {
        return <GitHubButton key={key} onClick={handleClick} className={options.buttonClassName} />;
      }
      if (actionId === 'facebook_auth') {
        return <FacebookButton key={key} onClick={handleClick} className={options.buttonClassName} />;
      }
      if (actionId === 'prompt_mobile') {
        return <SmsOtpButton key={key} onClick={handleClick} className={options.buttonClassName} />;
      }

      // Fallback to generic button
      return (
        <Button
          fullWidth
          key={key}
          onClick={handleClick}
          disabled={isLoading || !isFormValid}
          className={options.buttonClassName}
          variant={component.variant?.toLowerCase() === 'primary' ? 'solid' : 'outline'}
          color={component.variant?.toLowerCase() === 'primary' ? 'primary' : 'secondary'}
        >
          {component.config['text'] || 'Submit'}
        </Button>
      );
    }

    case EmbeddedFlowComponentType.Typography: {
      const variant = getTypographyVariant(component.variant || 'H3');
      return (
        <Typography key={key} variant={variant}>
          {component.config['text'] || ''}
        </Typography>
      );
    }

    case EmbeddedFlowComponentType.Form: {
      if (component.components && component.components.length > 0) {
        const formComponents = component.components
          .map((childComponent, index) =>
            createSignInComponentFromFlow(
              childComponent,
              formValues,
              touchedFields,
              formErrors,
              isLoading,
              isFormValid,
              onInputChange,
              {
                ...options,
                key: childComponent.id || `${component.id}_${index}`,
              },
            ),
          )
          .filter(Boolean);

        return (
          <form key={key} onSubmit={e => e.preventDefault()}>
            {formComponents}
          </form>
        );
      }
      return null;
    }

    case EmbeddedFlowComponentType.Divider: {
      return <Divider key={key} />;
    }

    default:
      throw new AsgardeoRuntimeError(
        `Unsupported component type: ${component.type}`,
        'SignIn-UnsupportedComponentType-001',
        'react',
        'Something went wrong while rendering the sign-in component. Please try again later.',
      );
  }
};

/**
 * Processes an array of components and renders them as React elements.
 */
export const renderSignInComponents = (
  components: EmbeddedFlowComponent[],
  formValues: Record<string, string>,
  touchedFields: Record<string, boolean>,
  formErrors: Record<string, string>,
  isLoading: boolean,
  isFormValid: boolean,
  onInputChange: (name: string, value: string) => void,
  options?: {
    buttonClassName?: string;
    error?: string | null;
    inputClassName?: string;
    onSubmit?: (component: EmbeddedFlowComponent, data?: Record<string, any>) => void;
    size?: 'small' | 'medium' | 'large';
    variant?: any;
  },
): ReactElement[] =>
  components
    .map((component, index) =>
      createSignInComponentFromFlow(
        component,
        formValues,
        touchedFields,
        formErrors,
        isLoading,
        isFormValid,
        onInputChange,
        {
          ...options,
          key: component.id || index,
        },
      ),
    )
    .filter(Boolean);
