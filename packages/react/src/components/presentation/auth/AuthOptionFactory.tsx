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
  FieldType,
  EmbeddedFlowComponentV2 as EmbeddedFlowComponent,
  EmbeddedFlowComponentTypeV2 as EmbeddedFlowComponentType,
  EmbeddedFlowTextVariantV2 as EmbeddedFlowTextVariant,
  EmbeddedFlowActionVariantV2 as EmbeddedFlowActionVariant,
  EmbeddedFlowEventTypeV2 as EmbeddedFlowEventType,
  createPackageComponentLogger,
} from '@asgardeo/browser';
import {cloneElement, ReactElement} from 'react';
import FacebookButton from '../../adapters/FacebookButton';
import GitHubButton from '../../adapters/GitHubButton';
import GoogleButton from '../../adapters/GoogleButton';
import LinkedInButton from '../../adapters/LinkedInButton';
import MicrosoftButton from '../../adapters/MicrosoftButton';
import SignInWithEthereumButton from '../../adapters/SignInWithEthereumButton';
import SmsOtpButton from '../../adapters/SmsOtpButton';
import {createField} from '../../factories/FieldFactory';
import Button from '../../primitives/Button/Button';
import Divider from '../../primitives/Divider/Divider';
import Select from '../../primitives/Select/Select';
import Typography from '../../primitives/Typography/Typography';
import {TypographyVariant} from '../../primitives/Typography/Typography.styles';

const logger: ReturnType<typeof createPackageComponentLogger> = createPackageComponentLogger(
  '@asgardeo/react',
  'AuthOptionFactory',
);

export type AuthType = 'signin' | 'signup';

/**
 * Get the appropriate FieldType for an input component.
 */
const getFieldType = (variant: EmbeddedFlowComponentType): FieldType => {
  switch (variant) {
    case EmbeddedFlowComponentType.EmailInput:
      return FieldType.Email;
    case EmbeddedFlowComponentType.PasswordInput:
      return FieldType.Password;
    case EmbeddedFlowComponentType.TextInput:
    default:
      return FieldType.Text;
  }
};

/**
 * Get typography variant from component variant.
 */
const getTypographyVariant = (variant: string): any => {
  const variantMap: Record<EmbeddedFlowTextVariant, TypographyVariant> = {
    BODY_1: 'body1',
    BODY_2: 'body2',
    BUTTON_TEXT: 'button',
    CAPTION: 'caption',
    HEADING_1: 'h1',
    HEADING_2: 'h2',
    HEADING_3: 'h3',
    HEADING_4: 'h4',
    HEADING_5: 'h5',
    HEADING_6: 'h6',
    OVERLINE: 'overline',
    SUBTITLE_1: 'subtitle1',
    SUBTITLE_2: 'subtitle2',
  };

  return variantMap[variant] || 'h3';
};

/**
 * Check if a button text or action matches a social provider.
 */
const matchesSocialProvider = (
  actionId: string,
  eventType: string,
  buttonText: string,
  provider: string,
  authType: AuthType,
  componentVariant?: string,
): boolean => {
  const providerId: any = `${provider}_auth`;
  const providerMatches: any = actionId === providerId || eventType === providerId;

  // For social variant, also check button text for provider name
  if (componentVariant?.toUpperCase() === EmbeddedFlowActionVariant.Social) {
    return buttonText.toLowerCase().includes(provider);
  }

  // For signup, also check button text
  if (authType === 'signup') {
    return providerMatches || buttonText.toLowerCase().includes(provider);
  }

  return providerMatches;
};

/**
 * Create an auth component from flow component configuration.
 */
const createAuthComponentFromFlow = (
  component: EmbeddedFlowComponent,
  formValues: Record<string, string>,
  touchedFields: Record<string, boolean>,
  formErrors: Record<string, string>,
  isLoading: boolean,
  isFormValid: boolean,
  onInputChange: (name: string, value: string) => void,
  authType: AuthType,
  options: {
    buttonClassName?: string;
    inputClassName?: string;
    key?: string | number;
    onInputBlur?: (name: string) => void;
    onSubmit?: (component: EmbeddedFlowComponent, data?: Record<string, any>, skipValidation?: boolean) => void;
    size?: 'small' | 'medium' | 'large';
    variant?: any;
  } = {},
): ReactElement | null => {
  const key: string | number = options.key || component.id;

  switch (component.type) {
    case EmbeddedFlowComponentType.TextInput:
    case EmbeddedFlowComponentType.PasswordInput:
    case EmbeddedFlowComponentType.EmailInput: {
      const identifier: string = component.ref;
      const value: string = formValues[identifier] || '';
      const isTouched: boolean = touchedFields[identifier] || false;
      const error: string = isTouched ? formErrors[identifier] : undefined;
      const fieldType: string = getFieldType(component.type);

      const field: any = createField({
        className: options.inputClassName,
        error,
        label: component.label || '',
        name: identifier,
        onBlur: () => options.onInputBlur?.(identifier),
        onChange: (newValue: string) => onInputChange(identifier, newValue),
        placeholder: component.placeholder || '',
        required: component.required || false,
        type: fieldType as FieldType,
        value,
      });

      return cloneElement(field, {key});
    }

    case EmbeddedFlowComponentType.Action: {
      const actionId: string = component.id;
      const eventType: string = (component.eventType as string) || '';
      const buttonText: string = component.label || '';
      const componentVariant: string = (component.variant as string) || '';

      // Only validate on submit type events.
      const shouldSkipValidation: boolean = eventType.toUpperCase() === EmbeddedFlowEventType.Trigger;

      const handleClick = (): any => {
        if (options.onSubmit) {
          const formData: Record<string, any> = {};
          Object.keys(formValues).forEach((field: any) => {
            // Include all values, even empty strings, to ensure proper submission
            formData[field] = formValues[field];
          });
          options.onSubmit(component, formData, shouldSkipValidation);
        }
      };

      // Render branded social login buttons for known action IDs

      if (matchesSocialProvider(actionId, eventType, buttonText, 'google', authType, componentVariant)) {
        return <GoogleButton key={key} onClick={handleClick} className={options.buttonClassName} />;
      }
      if (matchesSocialProvider(actionId, eventType, buttonText, 'github', authType, componentVariant)) {
        return <GitHubButton key={key} onClick={handleClick} className={options.buttonClassName} />;
      }
      if (matchesSocialProvider(actionId, eventType, buttonText, 'facebook', authType, componentVariant)) {
        return <FacebookButton key={key} onClick={handleClick} className={options.buttonClassName} />;
      }
      if (matchesSocialProvider(actionId, eventType, buttonText, 'microsoft', authType, componentVariant)) {
        return <MicrosoftButton key={key} onClick={handleClick} className={options.buttonClassName} />;
      }
      if (matchesSocialProvider(actionId, eventType, buttonText, 'linkedin', authType, componentVariant)) {
        return <LinkedInButton key={key} onClick={handleClick} className={options.buttonClassName} />;
      }
      if (matchesSocialProvider(actionId, eventType, buttonText, 'ethereum', authType, componentVariant)) {
        return <SignInWithEthereumButton key={key} onClick={handleClick} className={options.buttonClassName} />;
      }
      if (actionId === 'prompt_mobile' || eventType === 'prompt_mobile') {
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
          data-testid="asgardeo-signin-submit"
          variant={component.variant?.toLowerCase() === 'primary' ? 'solid' : 'outline'}
          color={component.variant?.toLowerCase() === 'primary' ? 'primary' : 'secondary'}
        >
          {buttonText || 'Submit'}
        </Button>
      );
    }

    case EmbeddedFlowComponentType.Text: {
      const variant: any = getTypographyVariant(component.variant);
      return (
        <Typography key={key} variant={variant}>
          {component.label || ''}
        </Typography>
      );
    }

    case EmbeddedFlowComponentType.Divider: {
      return <Divider key={key}>{component.label || ''}</Divider>;
    }

    case EmbeddedFlowComponentType.Select: {
      const identifier: string = component.ref;
      const value: string = formValues[identifier] || '';
      const isTouched: boolean = touchedFields[identifier] || false;
      const error: string = isTouched ? formErrors[identifier] : undefined;

      // Options are pre-sanitized by flowTransformer to {value: string, label: string} format
      const selectOptions: any = (component.options || []).map((opt: any) => ({
        label: typeof opt === 'string' ? opt : String(opt.label ?? opt.value ?? ''),
        value: typeof opt === 'string' ? opt : String(opt.value ?? ''),
      }));

      return (
        <Select
          key={key}
          name={identifier}
          label={component.label || ''}
          placeholder={component.placeholder}
          required={component.required}
          options={selectOptions}
          value={value}
          error={error}
          onChange={(e: any): void => onInputChange(identifier, e.target.value)}
          onBlur={(): any => options.onInputBlur?.(identifier)}
          className={options.inputClassName}
        />
      );
    }

    case EmbeddedFlowComponentType.Block: {
      if (component.components && component.components.length > 0) {
        const blockComponents: any = component.components
          .map((childComponent: any, index: any) =>
            createAuthComponentFromFlow(
              childComponent,
              formValues,
              touchedFields,
              formErrors,
              isLoading,
              isFormValid,
              onInputChange,
              authType,
              {
                ...options,
                key: childComponent.id || `${component.id}_${index}`,
              },
            ),
          )
          .filter(Boolean);

        return (
          <form id={component.id} key={key}>
            {blockComponents}
          </form>
        );
      }
      return null;
    }

    default:
      // Gracefully handle unsupported component types by returning null
      logger.warn(`Unsupported component type: ${component.type}. Skipping render.`);
      return null;
  }
};

/**
 * Processes an array of components and renders them as React elements for sign-in.
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
    inputClassName?: string;
    onInputBlur?: (name: string) => void;
    onSubmit?: (component: EmbeddedFlowComponent, data?: Record<string, any>, skipValidation?: boolean) => void;
    size?: 'small' | 'medium' | 'large';
    variant?: any;
  },
): ReactElement[] =>
  components
    .map((component: any, index: any) =>
      createAuthComponentFromFlow(
        component,
        formValues,
        touchedFields,
        formErrors,
        isLoading,
        isFormValid,
        onInputChange,
        'signin',
        {
          ...options,
          key: component.id || index,
        },
      ),
    )
    .filter(Boolean);

/**
 * Processes an array of components and renders them as React elements for sign-up.
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
    inputClassName?: string;
    onInputBlur?: (name: string) => void;
    onSubmit?: (component: EmbeddedFlowComponent, data?: Record<string, any>, skipValidation?: boolean) => void;
    size?: 'small' | 'medium' | 'large';
    variant?: any;
  },
): ReactElement[] =>
  components
    .map((component: any, index: any) =>
      createAuthComponentFromFlow(
        component,
        formValues,
        touchedFields,
        formErrors,
        isLoading,
        isFormValid,
        onInputChange,
        'signup',
        {
          ...options,
          key: component.id || index,
        },
      ),
    )
    .filter(Boolean);

/**
 * Processes an array of components and renders them as React elements for invite user.
 * This is used by both InviteUser and AcceptInvite components.
 */
export const renderInviteUserComponents = (
  components: EmbeddedFlowComponent[],
  formValues: Record<string, string>,
  touchedFields: Record<string, boolean>,
  formErrors: Record<string, string>,
  isLoading: boolean,
  isFormValid: boolean,
  onInputChange: (name: string, value: string) => void,
  options?: {
    buttonClassName?: string;
    inputClassName?: string;
    onInputBlur?: (name: string) => void;
    onSubmit?: (component: EmbeddedFlowComponent, data?: Record<string, any>, skipValidation?: boolean) => void;
    size?: 'small' | 'medium' | 'large';
    variant?: any;
  },
): ReactElement[] =>
  components
    .map((component: any, index: any) =>
      createAuthComponentFromFlow(
        component,
        formValues,
        touchedFields,
        formErrors,
        isLoading,
        isFormValid,
        onInputChange,
        'signup',
        {
          ...options,
          key: component.id || index,
        },
      ),
    )
    .filter(Boolean);
