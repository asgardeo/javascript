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
import CheckboxInput from '../../adapters/CheckboxInput';
import DateInput from '../../adapters/DateInput';
import DividerComponent from '../../adapters/DividerComponent';
import EmailInput from '../../adapters/EmailInput';
import FormContainer from '../../adapters/FormContainer';
import ImageComponent from '../../adapters/ImageComponent';
import NumberInput from '../../adapters/NumberInput';
import PasswordInput from '../../adapters/PasswordInput';
import ButtonComponent from '../../adapters/SubmitButton';
import TelephoneInput from '../../adapters/TelephoneInput';
import TextInput from '../../adapters/TextInput';
import Typography from '../../adapters/Typography';
import GoogleButton from '../../adapters/GoogleButton';
import GitHubButton from '../../adapters/GitHubButton';
import MicrosoftButton from '../../adapters/MicrosoftButton';
import LinkedInButton from '../../adapters/LinkedInButton';
import FacebookButton from '../../adapters/FacebookButton';
import SignInWithEthereumButton from '../../adapters/SignInWithEthereumButton';

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
export const createSignUpComponent = ({component, onSubmit, ...rest}: BaseSignUpOptionProps): ReactElement => {
  switch (component.type) {
    case EmbeddedFlowComponentType.Typography:
      return <Typography component={component} onSubmit={onSubmit} {...rest} />;

    case EmbeddedFlowComponentType.Input:
      // Determine input type based on variant or config
      const inputVariant: string = component.variant?.toUpperCase();
      const inputType: string = (component.config['type'] as string)?.toLowerCase();

      if (inputVariant === 'EMAIL' || inputType === 'email') {
        return <EmailInput component={component} onSubmit={onSubmit} {...rest} />;
      }

      if (inputVariant === 'PASSWORD' || inputType === 'password') {
        return <PasswordInput component={component} onSubmit={onSubmit} {...rest} />;
      }

      if (inputVariant === 'TELEPHONE' || inputType === 'tel') {
        return <TelephoneInput component={component} onSubmit={onSubmit} {...rest} />;
      }

      if (inputVariant === 'NUMBER' || inputType === 'number') {
        return <NumberInput component={component} onSubmit={onSubmit} {...rest} />;
      }

      if (inputVariant === 'DATE' || inputType === 'date') {
        return <DateInput component={component} onSubmit={onSubmit} {...rest} />;
      }

      if (inputVariant === 'CHECKBOX' || inputType === 'checkbox') {
        return <CheckboxInput component={component} onSubmit={onSubmit} {...rest} />;
      }

      return <TextInput component={component} onSubmit={onSubmit} {...rest} />;

    case EmbeddedFlowComponentType.Button: {
      const buttonVariant: string | undefined = component.variant?.toUpperCase();
      const buttonText: string = component.config['text'] as string || component.config['label'] as string || '';

      // TODO: The connection type should come as metadata.
      if (buttonVariant === 'SOCIAL') {
        if (buttonText.toLowerCase().includes('google')) {
          return (
            <GoogleButton onClick={() => onSubmit(component, {})} {...rest}>
              {buttonText}
            </GoogleButton>
          );
        }

        if (buttonText.toLowerCase().includes('github')) {
          return (
            <GitHubButton onClick={() => onSubmit(component, {})} {...rest}>
              {buttonText}
            </GitHubButton>
          );
        }

        if (buttonText.toLowerCase().includes('microsoft')) {
          return (
            <MicrosoftButton onClick={() => onSubmit(component, {})} {...rest}>
              {buttonText}
            </MicrosoftButton>
          );
        }

        if (buttonText.toLowerCase().includes('facebook')) {
          return (
            <FacebookButton onClick={() => onSubmit(component, {})} {...rest}>
              {buttonText}
            </FacebookButton>
          );
        }

        if (buttonText.toLowerCase().includes('linkedin')) {
          return (
            <LinkedInButton onClick={() => onSubmit(component, {})} {...rest}>
              {buttonText}
            </LinkedInButton>
          );
        }

        if (buttonText.toLowerCase().includes('ethereum')) {
          return (
            <SignInWithEthereumButton onClick={() => onSubmit(component, {})} {...rest}>
              {buttonText}
            </SignInWithEthereumButton>
          );
        }
      }

      // Use the generic ButtonComponent for all other button variants
      // It will handle PRIMARY, SECONDARY, TEXT, SOCIAL mappings internally
      return <ButtonComponent component={component} onSubmit={onSubmit} {...rest} />;
    }

    case EmbeddedFlowComponentType.Form:
      return <FormContainer component={component} onSubmit={onSubmit} {...rest} />;

    case EmbeddedFlowComponentType.Divider:
      return <DividerComponent component={component} onSubmit={onSubmit} {...rest} />;

    case EmbeddedFlowComponentType.Image:
      return <ImageComponent component={component} onSubmit={onSubmit} {...rest} />;

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
