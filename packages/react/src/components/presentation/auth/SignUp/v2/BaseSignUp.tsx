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
  EmbeddedFlowExecuteRequestPayload,
  EmbeddedFlowExecuteResponse,
  EmbeddedFlowStatus,
  EmbeddedFlowResponseType,
  withVendorCSSClassPrefix,
  EmbeddedFlowComponentTypeV2 as EmbeddedFlowComponentType,
} from '@asgardeo/browser';
import {cx} from '@emotion/css';
import {FC, ReactElement, ReactNode, useEffect, useState, useCallback, useRef} from 'react';
import {renderSignUpComponents} from '../../AuthOptionFactory';
import {normalizeFlowResponse, extractErrorMessage} from '../../../../../utils/v2/flowTransformer';
import FlowProvider from '../../../../../contexts/Flow/FlowProvider';
import useFlow from '../../../../../contexts/Flow/useFlow';
import {useForm, FormField} from '../../../../../hooks/useForm';
import useTranslation from '../../../../../hooks/useTranslation';
import useTheme from '../../../../../contexts/Theme/useTheme';
import useAsgardeo from '../../../../../contexts/Asgardeo/useAsgardeo';
import Alert from '../../../../primitives/Alert/Alert';
import Card, {CardProps} from '../../../../primitives/Card/Card';
import Logo from '../../../../primitives/Logo/Logo';
import Spinner from '../../../../primitives/Spinner/Spinner';
import Typography from '../../../../primitives/Typography/Typography';
import useStyles from '../BaseSignUp.styles';
import getAuthComponentHeadings from '../../../../../utils/v2/getAuthComponentHeadings';

/**
 * Render props for custom UI rendering
 */
export interface BaseSignUpRenderProps {
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
  components: any[];

  /**
   * Function to handle input changes
   */
  handleInputChange: (name: string, value: string) => void;

  /**
   * Function to handle form submission
   */
  handleSubmit: (component: any, data?: Record<string, any>) => Promise<void>;

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
 * Props for the BaseSignUp component.
 */
export interface BaseSignUpProps {
  /**
   * URL to redirect after successful sign-up.
   */
  afterSignUpUrl?: string;

  /**
   * Custom CSS class name for the submit button.
   */
  buttonClassName?: string;

  /**
   * Custom CSS class name for the form container.
   */
  className?: string;

  /**
   * Custom CSS class name for error messages.
   */
  errorClassName?: string;

  /**
   * Error object to display
   */
  error?: Error | null;

  /**
   * Custom CSS class name for form inputs.
   */
  inputClassName?: string;

  isInitialized?: boolean;

  /**
   * Custom CSS class name for info messages.
   */
  messageClassName?: string;

  /**
   * Callback function called when the sign-up flow completes and requires redirection.
   * This allows platform-specific handling of redirects (e.g., Next.js router.push).
   * @param response - The response from the sign-up flow containing the redirect URL, etc.
   */
  onComplete?: (response: EmbeddedFlowExecuteResponse) => void;

  /**
   * Callback function called when sign-up fails.
   * @param error - The error that occurred during sign-up.
   */
  onError?: (error: Error) => void;

  /**
   * Callback function called when sign-up flow status changes.
   * @param response - The current sign-up response.
   */
  onFlowChange?: (response: EmbeddedFlowExecuteResponse) => void;

  /**
   * Function to initialize sign-up flow.
   * @returns Promise resolving to the initial sign-up response.
   */
  onInitialize?: (payload?: EmbeddedFlowExecuteRequestPayload) => Promise<EmbeddedFlowExecuteResponse>;

  /**
   * Function to handle sign-up steps.
   * @param payload - The sign-up payload.
   * @returns Promise resolving to the sign-up response.
   */
  onSubmit?: (payload: EmbeddedFlowExecuteRequestPayload) => Promise<EmbeddedFlowExecuteResponse>;

  /**
   * Size variant for the component.
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Theme variant for the component.
   */
  variant?: CardProps['variant'];

  /**
   *  Whether to redirect after sign-up.
   */
  shouldRedirectAfterSignUp?: boolean;

  /**
   * Render props function for custom UI
   */
  children?: (props: BaseSignUpRenderProps) => ReactNode;

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
 * BaseSignUp component that provides embedded sign-up flow for AsgardeoV2.
 * This component handles both the presentation layer and sign-up flow logic.
 * It accepts API functions as props to maintain framework independence.
 */
const BaseSignUp: FC<BaseSignUpProps> = ({showLogo = true, ...rest}: BaseSignUpProps): ReactElement => {
  const {theme, colorScheme} = useTheme();
  const styles = useStyles(theme, colorScheme);

  return (
    <div>
      {showLogo && (
        <div className={styles.logoContainer}>
          <Logo size="large" />
        </div>
      )}
      <FlowProvider>
        <BaseSignUpContent showLogo={showLogo} {...rest} />
      </FlowProvider>
    </div>
  );
};

/**
 * Internal component that consumes FlowContext and renders the sign-up UI.
 */
const BaseSignUpContent: FC<BaseSignUpProps> = ({
  afterSignUpUrl,
  onInitialize,
  onSubmit,
  onError,
  onFlowChange,
  onComplete,
  error: externalError,
  className = '',
  inputClassName = '',
  buttonClassName = '',
  errorClassName = '',
  messageClassName = '',
  size = 'medium',
  variant = 'outlined',
  isInitialized,
  children,
  showTitle = true,
  showSubtitle = true,
}) => {
  const {theme, colorScheme} = useTheme();
  const {t} = useTranslation();
  const {subtitle: flowSubtitle, title: flowTitle, messages: flowMessages, addMessage, clearMessages} = useFlow();
  const {platform} = useAsgardeo();
  const styles = useStyles(theme, colorScheme);

  /**
   * Handle error responses and extract meaningful error messages
   * Uses the transformer's extractErrorMessage function.
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

  const [isLoading, setIsLoading] = useState(false);
  const [isFlowInitialized, setIsFlowInitialized] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<EmbeddedFlowExecuteResponse | null>(null);
  const [apiError, setApiError] = useState<Error | null>(null);

  const initializationAttemptedRef = useRef(false);

  /**
   * Normalize flow response to ensure component-driven format
   * Uses normalizeFlowResponse for modern API format responses
   */
  const normalizeFlowResponseLocal = useCallback(
    (response: EmbeddedFlowExecuteResponse): EmbeddedFlowExecuteResponse => {
      // If response already has components, return as-is
      if (response?.data?.components && Array.isArray(response.data.components)) {
        return response;
      }

      // Use the transformer to handle meta.components structure
      if (response?.data) {
        try {
          const {components} = normalizeFlowResponse(response, t, {
            defaultErrorKey: 'components.signUp.errors.generic',
            resolveTranslations: !children,
          });

          return {
            ...response,
            data: {
              ...response.data,
              components: components as any,
            },
          };
        } catch (error) {
          // If transformer throws (e.g., error response), re-throw
          throw error;
        }
      }

      // Return as-is if no transformation needed
      return response;
    },
    [t, children],
  );

  /**
   * Extract form fields from flow components
   */
  const extractFormFields = useCallback(
    (components: any[]): FormField[] => {
      const fields: FormField[] = [];

      const processComponents = (comps: any[]) => {
        comps.forEach(component => {
          if (
            component.type === EmbeddedFlowComponentType.TextInput ||
            component.type === EmbeddedFlowComponentType.PasswordInput ||
            component.type === EmbeddedFlowComponentType.EmailInput ||
            component.type === EmbeddedFlowComponentType.Select
          ) {
            // Use component.ref (mapped identifier) as the field name instead of component.id
            // This ensures form field names match what the input components use
            const fieldName = component.ref || component.id;

            fields.push({
              name: fieldName,
              required: component.required || false,
              initialValue: '',
              validator: (value: string) => {
                if (component.required && (!value || value.trim() === '')) {
                  return t('validations.required.field.error');
                }
                // Add email validation if it's an email field
                if (
                  (component.type === EmbeddedFlowComponentType.EmailInput || component.variant === 'EMAIL') &&
                  value &&
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                ) {
                  return t('field.email.invalid');
                }

                return null;
              },
            });
          }

          if (component.components && Array.isArray(component.components)) {
            processComponents(component.components);
          }
        });
      };

      processComponents(components);
      return fields;
    },
    [t],
  );

  const formFields = currentFlow?.data?.components ? extractFormFields(currentFlow.data.components) : [];

  const form = useForm<Record<string, string>>({
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
    clearErrors: clearFormErrors,
    validateField: validateFormField,
    validateForm,
    touchAllFields,
    reset: resetForm,
  } = form;

  /**
   * Setup form fields based on the current flow.
   */
  const setupFormFields = useCallback(
    (flowResponse: EmbeddedFlowExecuteResponse) => {
      const fields = extractFormFields(flowResponse.data?.components || []);
      const initialValues: Record<string, string> = {};

      fields.forEach(field => {
        initialValues[field.name] = field.initialValue || '';
      });

      resetForm();

      Object.keys(initialValues).forEach(key => {
        setFormValue(key, initialValues[key]);
      });
    },
    [extractFormFields, resetForm, setFormValue],
  );

  /**
   * Handle input value changes.
   * Only updates the value without marking as touched.
   * Touched state is set on blur to avoid premature validation.
   */
  const handleInputChange = (name: string, value: string) => {
    setFormValue(name, value);
  };

  /**
   * Handle input blur event.
   * Marks the field as touched, which triggers validation.
   */
  const handleInputBlur = (name: string) => {
    setFormTouched(name, true);
  };

  /**
   * Handle component submission (for buttons outside forms).
   */
  const handleSubmit = async (component: any, data?: Record<string, any>, skipValidation?: boolean) => {
    if (!currentFlow) {
      return;
    }

    // Only validate for form submit actions, skip for social/trigger actions
    if (!skipValidation) {
      // Mark all fields as touched before validation
      touchAllFields();

      const validation: ReturnType<typeof validateForm> = validateForm();

      if (!validation.isValid) {
        return;
      }
    }

    setIsLoading(true);
    setApiError(null);
    clearMessages();

    try {
      // Filter out empty or undefined input values
      const filteredInputs: Record<string, any> = {};
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            filteredInputs[key] = value;
          }
        });
      }

      const payload: EmbeddedFlowExecuteRequestPayload = {
        ...(currentFlow.flowId && {flowId: currentFlow.flowId}),
        flowType: (currentFlow as any).flowType || 'REGISTRATION',
        ...(component.id && {action: component.id}),
        inputs: filteredInputs,
      } as any;

      const rawResponse = await onSubmit(payload);
      const response = normalizeFlowResponseLocal(rawResponse);
      onFlowChange?.(response);

      if (response.flowStatus === EmbeddedFlowStatus.Complete) {
        onComplete?.(response);
        return;
      }

      if (response.flowStatus === EmbeddedFlowStatus.Incomplete) {
        if (handleRedirectionIfNeeded(response, component)) {
          return;
        }

        setCurrentFlow(response);
        setupFormFields(response);
      }
    } catch (err) {
      handleError(err);
      onError?.(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if the response contains a redirection URL and perform the redirect if necessary.
   * @param response - The sign-up response
   * @param component - The component that triggered the submission (needed for action)
   * @returns true if a redirect was performed, false otherwise
   */
  const handleRedirectionIfNeeded = (response: EmbeddedFlowExecuteResponse, component: any): boolean => {
    if (response?.type === EmbeddedFlowResponseType.Redirection && response?.data?.redirectURL) {
      /**
       * Open a popup window to handle redirection prompts for social sign-up
       */
      const redirectUrl = response.data.redirectURL;
      const popup = window.open(redirectUrl, 'oauth_popup', 'width=500,height=600,scrollbars=yes,resizable=yes');

      if (!popup) {
        console.error('Failed to open popup window');
        return false;
      }

      /**
       * Add an event listener to the window to capture the message from the popup
       */
      const messageHandler = async function messageEventHandler(event: MessageEvent) {
        /**
         * Check if the message is from our popup window
         */
        if (event.source !== popup) {
          return;
        }

        /**
         * Check the origin of the message to ensure it's from a trusted source
         */
        const expectedOrigin = afterSignUpUrl ? new URL(afterSignUpUrl).origin : window.location.origin;
        if (event.origin !== expectedOrigin && event.origin !== window.location.origin) {
          return;
        }

        const {code, state} = event.data;

        if (code && state) {
          const payload: EmbeddedFlowExecuteRequestPayload = {
            ...(currentFlow.flowId && {flowId: currentFlow.flowId}),
            flowType: (currentFlow as any).flowType || 'REGISTRATION',
            inputs: {
              code,
              state,
            },
            action: '',
          } as any;

          try {
            const continueResponse = await onSubmit(payload);
            onFlowChange?.(continueResponse);

            if (continueResponse.flowStatus === EmbeddedFlowStatus.Complete) {
              onComplete?.(continueResponse);
            } else if (continueResponse.flowStatus === EmbeddedFlowStatus.Incomplete) {
              setCurrentFlow(continueResponse);
              setupFormFields(continueResponse);
            }

            popup.close();
            cleanup();
          } catch (err) {
            handleError(err);
            onError?.(err as Error);
            popup.close();
            cleanup();
          }
        }
      };

      const cleanup = () => {
        window.removeEventListener('message', messageHandler);
        if (popupMonitor) {
          clearInterval(popupMonitor);
        }
      };

      window.addEventListener('message', messageHandler);

      /**
       * Monitor popup for closure and URL changes
       */
      let hasProcessedCallback = false; // Prevent multiple processing
      const popupMonitor = setInterval(async () => {
        try {
          if (popup.closed) {
            cleanup();
            return;
          }

          // Skip if we've already processed a callback
          if (hasProcessedCallback) {
            return;
          }

          // Try to access popup URL to check for callback
          try {
            const popupUrl = popup.location.href;

            // Check if we've been redirected to the callback URL
            if (popupUrl && (popupUrl.includes('code=') || popupUrl.includes('error='))) {
              hasProcessedCallback = true; // Set flag to prevent multiple processing

              // Parse the URL for OAuth parameters
              const url = new URL(popupUrl);
              const code = url.searchParams.get('code');
              const state = url.searchParams.get('state');
              const error = url.searchParams.get('error');

              if (error) {
                console.error('OAuth error:', error);
                popup.close();
                cleanup();
                return;
              }

              if (code && state) {
                const payload: EmbeddedFlowExecuteRequestPayload = {
                  ...(currentFlow.flowId && {flowId: currentFlow.flowId}),
                  flowType: (currentFlow as any).flowType || 'REGISTRATION',
                  inputs: {
                    code,
                    state,
                  },
                  action: '',
                } as any;

                try {
                  const continueResponse = await onSubmit(payload);
                  onFlowChange?.(continueResponse);

                  if (continueResponse.flowStatus === EmbeddedFlowStatus.Complete) {
                    onComplete?.(continueResponse);
                  } else if (continueResponse.flowStatus === EmbeddedFlowStatus.Incomplete) {
                    setCurrentFlow(continueResponse);
                    setupFormFields(continueResponse);
                  }

                  popup.close();
                } catch (err) {
                  handleError(err);
                  onError?.(err as Error);
                  popup.close();
                }
              }
            }
          } catch (e) {
            // Cross-origin error is expected when popup navigates to OAuth provider
            // This is normal and we can ignore it
          }
        } catch (e) {
          console.error('Error monitoring popup:', e);
        }
      }, 1000);

      return true;
    }

    return false;
  };

  const containerClasses = cx(
    [
      withVendorCSSClassPrefix('signup'),
      withVendorCSSClassPrefix(`signup--${size}`),
      withVendorCSSClassPrefix(`signup--${variant}`),
    ],
    className,
  );

  const inputClasses = cx(
    [
      withVendorCSSClassPrefix('signup__input'),
      size === 'small' && withVendorCSSClassPrefix('signup__input--small'),
      size === 'large' && withVendorCSSClassPrefix('signup__input--large'),
    ],
    inputClassName,
  );

  const buttonClasses = cx(
    [
      withVendorCSSClassPrefix('signup__button'),
      size === 'small' && withVendorCSSClassPrefix('signup__button--small'),
      size === 'large' && withVendorCSSClassPrefix('signup__button--large'),
    ],
    buttonClassName,
  );

  const errorClasses = cx([withVendorCSSClassPrefix('signup__error')], errorClassName);

  const messageClasses = cx([withVendorCSSClassPrefix('signup__messages')], messageClassName);

  /**
   * Render form components based on flow data using the factory
   */
  const renderComponents = useCallback(
    (components: any[]): ReactElement[] =>
      renderSignUpComponents(
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
      handleSubmit,
      handleInputBlur,
    ],
  );

  /**
   * Parse URL parameters to check for OAuth redirect state.
   */
  const getUrlParams = () => {
    const urlParams = new URL(window?.location?.href ?? '').searchParams;
    return {
      code: urlParams.get('code'),
      state: urlParams.get('state'),
      error: urlParams.get('error'),
    };
  };

  // Initialize the flow on component mount
  useEffect(() => {
    // Skip initialization if we're in an OAuth redirect state.
    const urlParams = getUrlParams();
    if (urlParams.code || urlParams.state) {
      return;
    }

    if (isInitialized && !isFlowInitialized && !initializationAttemptedRef.current) {
      initializationAttemptedRef.current = true;

      (async () => {
        setIsLoading(true);
        setApiError(null);
        clearMessages();

        try {
          const rawResponse = await onInitialize();
          const response = normalizeFlowResponseLocal(rawResponse);

          setCurrentFlow(response);
          setIsFlowInitialized(true);
          onFlowChange?.(response);

          if (response.flowStatus === EmbeddedFlowStatus.Complete) {
            onComplete?.(response);
            return;
          }

          if (response.flowStatus === EmbeddedFlowStatus.Incomplete) {
            setupFormFields(response);
          }
        } catch (err) {
          handleError(err);
          onError?.(err as Error);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [
    isInitialized,
    isFlowInitialized,
    onInitialize,
    onComplete,
    onError,
    onFlowChange,
    setupFormFields,
    normalizeFlowResponseLocal,
    afterSignUpUrl,
    t,
  ]);

  // If render props are provided, use them
  if (children) {
    const renderProps: BaseSignUpRenderProps = {
      values: formValues,
      fieldErrors: formErrors,
      error: apiError,
      touched: touchedFields,
      isValid: isFormValid,
      isLoading,
      components: currentFlow?.data?.components || [],
      handleInputChange,
      handleSubmit,
      validateForm: () => {
        const result = validateForm();
        return {isValid: result.isValid, fieldErrors: result.errors};
      },
      title: flowTitle || t('signup.heading'),
      subtitle: flowSubtitle || t('signup.subheading'),
      messages: flowMessages || [],
    };

    return <div className={containerClasses}>{children(renderProps)}</div>;
  }

  if (!isFlowInitialized && isLoading) {
    return (
      <Card className={cx(containerClasses, styles.card)} variant={variant}>
        <Card.Content>
          <div className={styles.loadingContainer}>
            <Spinner size="medium" />
          </div>
        </Card.Content>
      </Card>
    );
  }

  if (!currentFlow) {
    return (
      <Card className={cx(containerClasses, styles.card)} variant={variant}>
        <Card.Content>
          <Alert variant="error" className={errorClasses}>
            <Alert.Title>{t('errors.heading')}</Alert.Title>
            <Alert.Description>{t('errors.signup.flow.initialization.failure')}</Alert.Description>
          </Alert>
        </Card.Content>
      </Card>
    );
  }

  // Extract heading and subheading components and filter them from the main components
  const componentsToRender = currentFlow.data?.components || [];
  const {title, subtitle, componentsWithoutHeadings} = getAuthComponentHeadings(
    componentsToRender,
    flowTitle,
    flowSubtitle,
    t('signup.heading'),
    t('signup.subheading'),
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
            {flowMessages.map((message: any, index: number) => (
              <Alert
                key={message.id || index}
                variant={message.type?.toLowerCase() === 'error' ? 'error' : 'info'}
                className={cx(styles.flowMessageItem, messageClasses)}
              >
                <Alert.Description>{message.message}</Alert.Description>
              </Alert>
            ))}
          </div>
        )}
        <div className={styles.contentContainer}>
          {componentsWithoutHeadings && componentsWithoutHeadings.length > 0 ? (
            renderComponents(componentsWithoutHeadings)
          ) : (
            <Alert variant="warning">
              <Typography variant="body1">{t('errors.signup.components.not.available')}</Typography>
            </Alert>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};

export default BaseSignUp;
