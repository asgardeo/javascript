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

import {FC, useState, useCallback, ReactElement, ReactNode} from 'react';
import {cx} from '@emotion/css';
import {
  withVendorCSSClassPrefix,
  EmbeddedSignInFlowRequestV2 as EmbeddedSignInFlowRequest,
  EmbeddedFlowComponentV2 as EmbeddedFlowComponent,
} from '@asgardeo/browser';
import useTranslation from '../../../../../hooks/useTranslation';
import Card, {CardProps} from '../../../../primitives/Card/Card';
import Spinner from '../../../../primitives/Spinner/Spinner';
import Alert from '../../../../primitives/Alert/Alert';
import Logo from '../../../../primitives/Logo/Logo';
import Typography from '../../../../primitives/Typography/Typography';
import useTheme from '../../../../../contexts/Theme/useTheme';
import useStyles from '../BaseSignIn.styles';
import useFlow from '../../../../../contexts/Flow/useFlow';
import FlowProvider from '../../../../../contexts/Flow/FlowProvider';
import {FormField, useForm} from '../../../../../hooks/useForm';
import {renderSignInComponents} from '../../AuthOptionFactory';
import {extractErrorMessage} from '../../../../../utils/v2/flowTransformer';
import getAuthComponentHeadings from '../../../../../utils/v2/getAuthComponentHeadings';

/**
 * Render props for custom UI rendering
 */
export interface BaseSignInRenderProps {
  /**
   * Form values
   */
  values: Record<string, string>;

  /**
   * Field validation errors
   */
  fieldErrors: Record<string, string>;

  /**
   * API error (if any)
   */
  error?: Error | null;

  /**
   * Touched fields
   */
  touched: Record<string, boolean>;

  /**
   * Whether the form is valid
   */
  isValid: boolean;

  /**
   * Loading state
   */
  isLoading: boolean;

  /**
   * Flow components
   */
  components: EmbeddedFlowComponent[];

  /**
   * Function to handle input changes
   */
  handleInputChange: (name: string, value: string) => void;

  /**
   * Function to handle form submission
   */
  handleSubmit: (component: EmbeddedFlowComponent, data?: Record<string, any>) => Promise<void>;

  /**
   * Function to validate the form
   */
  validateForm: () => {isValid: boolean; fieldErrors: Record<string, string>};

  /**
   * Flow title
   */
  title: string;

  /**
   * Flow subtitle
   */
  subtitle: string;

  /**
   * Flow messages
   */
  messages: Array<{message: string; type: string}>;
}

/**
 * Props for the BaseSignIn component.
 */
export interface BaseSignInProps {
  /**
   * Custom CSS class name for the submit button.
   */
  buttonClassName?: string;

  /**
   * Custom CSS class name for the form container.
   */
  className?: string;

  /**
   * Array of flow components to render.
   */
  components?: EmbeddedFlowComponent[];

  /**
   * Custom CSS class name for error messages.
   */
  errorClassName?: string;

  /**
   * Error object to display
   */
  error?: Error | null;

  /**
   * Flag to determine if the component is ready to be rendered.
   */
  isLoading?: boolean;

  /**
   * Custom CSS class name for form inputs.
   */
  inputClassName?: string;

  /**
   * Custom CSS class name for info messages.
   */
  messageClassName?: string;

  /**
   * Callback function called when authentication fails.
   * @param error - The error that occurred during authentication.
   */
  onError?: (error: Error) => void;

  /**
   * Function to handle form submission.
   * @param payload - The form data to submit.
   * @param component - The component that triggered the submission.
   */
  onSubmit?: (payload: EmbeddedSignInFlowRequest, component: EmbeddedFlowComponent) => Promise<void>;

  /**
   * Callback function called when authentication is successful.
   * @param authData - The authentication data returned upon successful completion.
   */
  onSuccess?: (authData: Record<string, any>) => void;

  /**
   * Size variant for the component.
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Theme variant for the component.
   */
  variant?: CardProps['variant'];

  /**
   * Render props function for custom UI
   */
  children?: (props: BaseSignInRenderProps) => ReactNode;

  /**
   * Whether to show the title.
   */
  showTitle?: boolean;

  /**
   * Whether to show the subtitle.
   */
  showSubtitle?: boolean;

  /**
   * Whether to show the logo.
   */
  showLogo?: boolean;
}

/**
 * Base SignIn component that provides generic authentication flow.
 * This component handles component-driven UI rendering and can transform input
 * structure to component-driven format automatically.
 *
 * @example
 * // Default UI
 * ```tsx
 * import { BaseSignIn } from '@asgardeo/react';
 *
 * const MySignIn = () => {
 *   return (
 *     <BaseSignIn
 *       components={components}
 *       onSubmit={async (payload) => {
 *         return await handleAuth(payload);
 *       }}
 *       onSuccess={(authData) => {
 *         console.log('Success:', authData);
 *       }}
 *       className="max-w-md mx-auto"
 *     />
 *   );
 * };
 * ```
 *
 * @example
 * // Custom UI with render props
 * ```tsx
 * <BaseSignIn components={components} onSubmit={handleSubmit}>
 *   {({values, errors, handleInputChange, handleSubmit, isLoading, components}) => (
 *     <div className="custom-form">
 *       <input
 *         name="username"
 *         value={values.username || ''}
 *         onChange={(e) => handleInputChange('username', e.target.value)}
 *       />
 *       {errors.username && <span>{errors.username}</span>}
 *       <button
 *         onClick={() => handleSubmit(components[0], values)}
 *         disabled={isLoading}
 *       >
 *         Sign In
 *       </button>
 *     </div>
 *   )}
 * </BaseSignIn>
 * ```
 */
const BaseSignIn: FC<BaseSignInProps> = ({showLogo = true, ...rest}: BaseSignInProps): ReactElement => {
  const {theme} = useTheme();
  const styles = useStyles(theme, theme.vars.colors.text.primary);

  return (
    <div>
      {showLogo && (
        <div className={styles.logoContainer}>
          <Logo size="large" />
        </div>
      )}
      <FlowProvider>
        <BaseSignInContent showLogo={showLogo} {...rest} />
      </FlowProvider>
    </div>
  );
};

/**
 * Internal component that consumes FlowContext and renders the sign-in UI.
 */
const BaseSignInContent: FC<BaseSignInProps> = ({
  components = [],
  onSubmit,
  onError,
  error: externalError,
  className = '',
  inputClassName = '',
  buttonClassName = '',
  errorClassName = '',
  messageClassName = '',
  size = 'medium',
  variant = 'outlined',
  isLoading: externalIsLoading,
  children,
  showTitle = true,
  showSubtitle = true,
  showLogo = true,
}) => {
  const {theme} = useTheme();
  const {t} = useTranslation();
  const {subtitle: flowSubtitle, title: flowTitle, messages: flowMessages, addMessage, clearMessages} = useFlow();
  const styles = useStyles(theme, theme.vars.colors.text.primary);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<Error | null>(null);

  const isLoading: boolean = externalIsLoading || isSubmitting;

  /**
   * Handle error responses and extract meaningful error messages
   * Uses the transformer's extractErrorMessage function for consistency
   */
  const handleError = useCallback(
    (error: any) => {
      // Extract error message from response failureReason or use extractErrorMessage
      const errorMessage: string = error?.failureReason || extractErrorMessage(error, t);

      // Set the API error state
      setApiError(error instanceof Error ? error : new Error(errorMessage));

      // Clear existing messages and add the error message
      clearMessages();
      addMessage({
        type: 'error',
        message: errorMessage,
      });
    },
    [t, addMessage, clearMessages],
  );

  /**
   * Extract form fields from flow components
   */
  const extractFormFields: (components: EmbeddedFlowComponent[]) => FormField[] = useCallback(
    (components: EmbeddedFlowComponent[]): FormField[] => {
      const fields: FormField[] = [];

      const processComponents = (comps: EmbeddedFlowComponent[]) => {
        comps.forEach(component => {
          if (
            component.type === 'TEXT_INPUT' ||
            component.type === 'PASSWORD_INPUT' ||
            component.type === 'EMAIL_INPUT'
          ) {
            const identifier: string = component.ref;
            fields.push({
              name: identifier,
              required: component.required || false,
              initialValue: '',
              validator: (value: string) => {
                if (component.required && (!value || value.trim() === '')) {
                  return t('validations.required.field.error');
                }
                // Add email validation if it's an email field
                if (
                  (component.type === 'EMAIL_INPUT' || component.variant === 'EMAIL') &&
                  value &&
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                ) {
                  return t('field.email.invalid');
                }

                return null;
              },
            });
          }
          if (component.components) {
            processComponents(component.components);
          }
        });
      };

      processComponents(components);
      return fields;
    },
    [t],
  );

  const formFields: FormField[] = components ? extractFormFields(components) : [];

  const form: ReturnType<typeof useForm> = useForm<Record<string, string>>({
    initialValues: {},
    fields: formFields,
    validateOnBlur: true,
    validateOnChange: false,
    requiredMessage: t('validations.required.field.error'),
  });

  const {
    values: formValues,
    touched: touchedFields,
    errors: formErrors,
    isValid: isFormValid,
    setValue: setFormValue,
    setTouched: setFormTouched,
    validateForm,
    touchAllFields,
  } = form;

  /**
   * Handle input value changes.
   * Only updates the value without marking as touched.
   * Touched state is set on blur to avoid premature validation.
   */
  const handleInputChange = (name: string, value: string): void => {
    setFormValue(name, value);
  };

  /**
   * Handle input blur event.
   * Marks the field as touched, which triggers validation.
   */
  const handleInputBlur = (name: string): void => {
    setFormTouched(name, true);
  };

  /**
   * Handle component submission (for buttons and actions).
   */
  const handleSubmit = async (
    component: EmbeddedFlowComponent,
    data?: Record<string, any>,
    skipValidation?: boolean,
  ): Promise<void> => {
    // Only validate for form submit actions, skip for social/trigger actions
    if (!skipValidation) {
      // Mark all fields as touched before validation
      touchAllFields();

      const validation: ReturnType<typeof validateForm> = validateForm();

      if (!validation.isValid) {
        return;
      }
    }

    setIsSubmitting(true);
    setApiError(null);
    clearMessages();

    try {
      // Filter out empty or undefined input values
      const filteredInputs: Record<string, any> = {};
      if (data) {
        Object.keys(data).forEach(key => {
          if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
            filteredInputs[key] = data[key];
          }
        });
      }

      let payload: EmbeddedSignInFlowRequest = {};

      // For V2, we always send inputs and action
      payload = {
        ...payload,
        ...(component.id && {action: component.id}),
        inputs: filteredInputs,
      };

      await onSubmit?.(payload, component);
    } catch (err) {
      handleError(err);
      onError?.(err as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate CSS classes
  const containerClasses = cx(
    [
      withVendorCSSClassPrefix('signin'),
      withVendorCSSClassPrefix(`signin--${size}`),
      withVendorCSSClassPrefix(`signin--${variant}`),
    ],
    className,
  );

  const inputClasses = cx(
    [
      withVendorCSSClassPrefix('signin__input'),
      size === 'small' && withVendorCSSClassPrefix('signin__input--small'),
      size === 'large' && withVendorCSSClassPrefix('signin__input--large'),
    ],
    inputClassName,
  );

  const buttonClasses = cx(
    [
      withVendorCSSClassPrefix('signin__button'),
      size === 'small' && withVendorCSSClassPrefix('signin__button--small'),
      size === 'large' && withVendorCSSClassPrefix('signin__button--large'),
    ],
    buttonClassName,
  );

  const errorClasses = cx([withVendorCSSClassPrefix('signin__error')], errorClassName);

  const messageClasses = cx([withVendorCSSClassPrefix('signin__messages')], messageClassName);

  /**
   * Render components based on flow data using the factory
   */
  const renderComponents = useCallback(
    (components: EmbeddedFlowComponent[]): ReactElement[] =>
      renderSignInComponents(
        components,
        formValues,
        touchedFields,
        formErrors,
        isLoading,
        isFormValid,
        handleInputChange,
        {
          buttonClassName: buttonClasses,
          inputClassName: inputClasses,
          onInputBlur: handleInputBlur,
          onSubmit: handleSubmit,
          size,
          variant,
        },
      ),
    [
      formValues,
      touchedFields,
      formErrors,
      isFormValid,
      isLoading,
      size,
      variant,
      inputClasses,
      buttonClasses,
      handleInputBlur,
      handleSubmit,
    ],
  );

  // If render props are provided, use them
  if (children) {
    const renderProps: BaseSignInRenderProps = {
      values: formValues,
      fieldErrors: formErrors,
      error: apiError,
      touched: touchedFields,
      isValid: isFormValid,
      isLoading,
      components,
      handleInputChange,
      handleSubmit,
      validateForm: () => {
        const result = validateForm();
        return {isValid: result.isValid, fieldErrors: result.errors};
      },
      title: flowTitle || t('signin.heading'),
      subtitle: flowSubtitle || t('signin.subheading'),
      messages: flowMessages || [],
    };

    return <div className={containerClasses}>{children(renderProps)}</div>;
  }

  // Default UI rendering
  if (isLoading) {
    return (
      <Card className={cx(containerClasses, styles.card)} variant={variant}>
        <Card.Content>
          <div style={{display: 'flex', justifyContent: 'center', padding: '2rem'}}>
            <Spinner />
          </div>
        </Card.Content>
      </Card>
    );
  }

  if (!components || components.length === 0) {
    return (
      <Card className={cx(containerClasses, styles.card)} variant={variant}>
        <Card.Content>
          <Alert variant="warning">
            <Typography variant="body1">{t('errors.signin.components.not.available')}</Typography>
          </Alert>
        </Card.Content>
      </Card>
    );
  }

  // Extract heading and subheading components and filter them from the main components
  const {title, subtitle, componentsWithoutHeadings} = getAuthComponentHeadings(
    components as any,
    flowTitle,
    flowSubtitle,
    t('signin.heading'),
    t('signin.subheading'),
  );

  return (
    <Card className={cx(containerClasses, styles.card)} variant={variant}>
      {(showTitle || showSubtitle) && (
        <Card.Header className={styles.header}>
          {showTitle && (
            <Card.Title level={2} className={styles.title}>
              {title}
            </Card.Title>
          )}
          {showSubtitle && (
            <Typography variant="body1" className={styles.subtitle}>
              {subtitle}
            </Typography>
          )}
        </Card.Header>
      )}
      <Card.Content>
        {externalError && (
          <div className={styles.flowMessagesContainer}>
            <Alert variant="error" className={cx(styles.flowMessageItem, messageClasses)}>
              <Alert.Description>{externalError.message}</Alert.Description>
            </Alert>
          </div>
        )}
        {flowMessages && flowMessages.length > 0 && (
          <div className={styles.flowMessagesContainer}>
            {flowMessages.map((message, index) => (
              <Alert
                key={index}
                variant={message.type === 'error' ? 'error' : 'info'}
                className={cx(styles.flowMessageItem, messageClasses)}
              >
                <Alert.Description>{message.message}</Alert.Description>
              </Alert>
            ))}
          </div>
        )}
        <div className={styles.contentContainer}>
          {componentsWithoutHeadings && renderComponents(componentsWithoutHeadings)}
        </div>
      </Card.Content>
    </Card>
  );
};

export default BaseSignIn;
