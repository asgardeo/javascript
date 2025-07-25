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

import {EmbeddedFlowComponent, EmbeddedFlowComponentType, WithPreferences} from '@asgardeo/browser';
import {ReactElement} from 'react';
import CheckboxInput from './CheckboxInput';
import DateInput from './DateInput';
import DividerComponent from './DividerComponent';
import EmailInput from './EmailInput';
import FormContainer from './FormContainer';
import GoogleButton from './GoogleButton';
import ImageComponent from './ImageComponent';
import NumberInput from './NumberInput';
import PasswordInput from './PasswordInput';
import ButtonComponent from './SubmitButton';
import TelephoneInput from './TelephoneInput';
import TextInput from './TextInput';
import Typography from './Typography';

/**
 * Base props that all sign-up option components share.
 */
export interface BaseSignUpOptionProps extends WithPreferences {
  /**
   * Custom CSS class name for buttons.
   */
  buttonClassName?: string;

  /**
   * The component configuration from the flow response.
   */
  component: EmbeddedFlowComponent;

  /**
   * Global error message to display.
   */
  error?: string | null;

  /**
   * Form validation errors.
   */
  formErrors: Record<string, string>;

  /**
   * Current form values.
   */
  formValues: Record<string, string>;

  /**
   * Custom CSS class name for form inputs.
   */
  inputClassName?: string;

  /**
   * Whether the form is valid.
   */
  isFormValid: boolean;

  /**
   * Whether the component is in loading state.
   */
  isLoading: boolean;

  /**
   * Callback function called when input values change.
   */
  onInputChange: (name: string, value: string) => void;

  onSubmit?: (component: EmbeddedFlowComponent, data?: Record<string, any>) => void;

  /**
   * Component size variant.
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Touched state for form fields.
   */
  touchedFields: Record<string, boolean>;

  /**
   * Component theme variant.
   */
  variant?: any;
}

/**
 * Creates the appropriate sign-up component based on the component type.
 */
export const createSignUpComponent = (props: BaseSignUpOptionProps): ReactElement => {
  const {component} = props;

  switch (component.type) {
    case EmbeddedFlowComponentType.Typography:
      return <Typography {...props} />;

    case EmbeddedFlowComponentType.Input:
      // Determine input type based on variant or config
      const inputVariant = component.variant?.toUpperCase();
      const inputType = component.config['type']?.toLowerCase();

      if (inputVariant === 'EMAIL' || inputType === 'email') {
        return <EmailInput {...props} />;
      }
      if (inputVariant === 'PASSWORD' || inputType === 'password') {
        return <PasswordInput {...props} />;
      }
      if (inputVariant === 'TELEPHONE' || inputType === 'tel') {
        return <TelephoneInput {...props} />;
      }
      if (inputVariant === 'NUMBER' || inputType === 'number') {
        return <NumberInput {...props} />;
      }
      if (inputVariant === 'DATE' || inputType === 'date') {
        return <DateInput {...props} />;
      }
      if (inputVariant === 'CHECKBOX' || inputType === 'checkbox') {
        return <CheckboxInput {...props} />;
      }
      return <TextInput {...props} />;

    case EmbeddedFlowComponentType.Button: {
      const buttonVariant: string | undefined = component.variant?.toUpperCase();
      const buttonText: string = component.config['text'] || component.config['label'] || '';

      // TODO: The connection type should come as metadata.
      if (buttonVariant === 'SOCIAL' && buttonText.toLowerCase().includes('google')) {
        return <GoogleButton {...props} />;
      }

      // Use the generic ButtonComponent for all other button variants
      // It will handle PRIMARY, SECONDARY, TEXT, SOCIAL mappings internally
      return <ButtonComponent {...props} />;
    }

    case EmbeddedFlowComponentType.Form:
      return <FormContainer {...props} />;

    case EmbeddedFlowComponentType.Divider:
      return <DividerComponent {...props} />;

    case EmbeddedFlowComponentType.Image:
      return <ImageComponent {...props} />;

    default:
      return <div />;
  }
};

/**
 * Convenience function that creates the appropriate sign-up component from flow component data.
 */
export const createSignUpOptionFromComponent = (
  component: EmbeddedFlowComponent,
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
    key?: string | number;
    onSubmit?: (component: EmbeddedFlowComponent, data?: Record<string, any>) => void;
    size?: 'small' | 'medium' | 'large';
    variant?: any;
  },
): ReactElement =>
  createSignUpComponent({
    component,
    formErrors,
    formValues,
    isFormValid,
    isLoading,
    onInputChange,
    touchedFields,
    ...options,
  });

/**
 * Processes an array of components and renders them as React elements.
 */
export const renderSignUpComponents = (
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
      createSignUpOptionFromComponent(
        component,
        formValues,
        touchedFields,
        formErrors,
        isLoading,
        isFormValid,
        onInputChange,
        {
          ...options,
          // Use component id as key, fallback to index
          key: component.id || index,
        },
      ),
    )
    .filter(Boolean);
