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
  EmbeddedSignInFlowAuthenticator,
  EmbeddedSignInFlowInitiateResponse,
  EmbeddedSignInFlowHandleResponse,
  EmbeddedSignInFlowStepType,
  EmbeddedSignInFlowStatus,
  EmbeddedSignInFlowAuthenticatorPromptType,
  ApplicationNativeAuthenticationConstants,
  AsgardeoAPIError,
  withVendorCSSClassPrefix,
  EmbeddedSignInFlowHandleRequestPayload,
  EmbeddedFlowExecuteRequestConfig,
  handleWebAuthnAuthentication,
} from '@asgardeo/browser';
import {cx} from '@emotion/css';
import {FC, FormEvent, useEffect, useState, useCallback, useRef, ReactElement} from 'react';
import {createSignInOptionFromAuthenticator} from './options/SignInOptionFactory';
import FlowProvider from '../../../../../contexts/Flow/FlowProvider';
import useFlow from '../../../../../contexts/Flow/useFlow';
import {useForm, FormField} from '../../../../../hooks/useForm';
import useTranslation from '../../../../../hooks/useTranslation';
import useTheme from '../../../../../contexts/Theme/useTheme';
import Alert from '../../../../primitives/Alert/Alert';
import Card, {CardProps} from '../../../../primitives/Card/Card';
import Divider from '../../../../primitives/Divider/Divider';
import Logo from '../../../../primitives/Logo/Logo';
import Spinner from '../../../../primitives/Spinner/Spinner';
import Typography from '../../../../primitives/Typography/Typography';
import useStyles from '../BaseSignIn.styles';

/**
 * Check if the authenticator is a passkey/FIDO authenticator
 */
const isPasskeyAuthenticator = (authenticator: EmbeddedSignInFlowAuthenticator): boolean =>
  authenticator.authenticatorId === ApplicationNativeAuthenticationConstants.SupportedAuthenticators.Passkey &&
  authenticator.metadata?.promptType === EmbeddedSignInFlowAuthenticatorPromptType.InternalPrompt &&
  (authenticator.metadata as any)?.additionalData?.challengeData;

/**
 * Props for the BaseSignIn component.
 */
export interface BaseSignInProps {
  afterSignInUrl?: string;

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
   * Callback function called when authentication flow status changes.
   * @param response - The current authentication response.
   */
  onFlowChange?: (response: EmbeddedSignInFlowInitiateResponse | EmbeddedSignInFlowHandleResponse) => void;

  /**
   * Flag to determine the component is ready to be rendered.
   */
  isLoading?: boolean;

  /**
   * Function to initialize authentication flow.
   * @returns Promise resolving to the initial authentication response.
   */
  onInitialize?: () => Promise<EmbeddedSignInFlowInitiateResponse>;

  /**
   * Function to handle authentication steps.
   * @param payload - The authentication payload.
   * @returns Promise resolving to the authentication response.
   */
  onSubmit?: (
    payload: EmbeddedSignInFlowHandleRequestPayload,
    request: EmbeddedFlowExecuteRequestConfig,
  ) => Promise<EmbeddedSignInFlowHandleResponse>;

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
 * Base SignIn component that provides native authentication flow.
 * This component handles both the presentation layer and authentication flow logic.
 * It accepts API functions as props to maintain framework independence.
 *
 * @example
 * ```tsx
 * import { BaseSignIn } from '@asgardeo/react';
 *
 * const MySignIn = () => {
 *   return (
 *     <BaseSignIn
 *       onInitialize={async () => {
 *         // Your API call to initialize authentication
 *         return await initializeAuth();
 *       }}
 *       onSubmit={async (payload) => {
 *         // Your API call to handle authentication
 *         return await handleAuth(payload);
 *       }}
 *       onSuccess={(authData) => {
 *         console.log('Success:', authData);
 *       }}
 *       onError={(error) => {
 *         console.error('Error:', error);
 *       }}
 *       className="max-w-md mx-auto"
 *     />
 *   );
 * };
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
 * `T3JnYW5pemF0aW9uQXV0aGVudGljYXRvcjpTU08` - OrganizationSSO
 *    Currently, `App-Native Authentication` doesn't support organization SSO.
 *    Tracker: TODO: Create `product-is` issue for this.
 */
const HIDDEN_AUTHENTICATORS: string[] = ['T3JnYW5pemF0aW9uQXV0aGVudGljYXRvcjpTU08'];

/**
 * Internal component that consumes FlowContext and renders the sign-in UI.
 */
const BaseSignInContent: FC<BaseSignInProps> = ({
  afterSignInUrl,
  onInitialize,
  isLoading: externalIsLoading,
  onSubmit,
  onSuccess,
  onError,
  onFlowChange,
  className = '',
  inputClassName = '',
  buttonClassName = '',
  errorClassName = '',
  messageClassName = '',
  size = 'medium',
  variant = 'outlined',
  showTitle = true,
  showSubtitle = true,
}: BaseSignInProps) => {
  const {theme} = useTheme();
  const {t} = useTranslation();
  const {subtitle: flowSubtitle, title: flowTitle, messages: flowMessages} = useFlow();
  const styles = useStyles(theme, theme.vars.colors.text.primary);

  const [isSignInInitializationRequestLoading, setIsSignInInitializationRequestLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<EmbeddedSignInFlowInitiateResponse | null>(null);
  const [currentAuthenticator, setCurrentAuthenticator] = useState<EmbeddedSignInFlowAuthenticator | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{message: string; type: string}>>([]);

  const isLoading = externalIsLoading || isSignInInitializationRequestLoading;

  const reRenderCheckRef = useRef(false);

  const formFields: FormField[] =
    currentAuthenticator?.metadata?.params?.map(param => ({
      name: param.param,
      required: currentAuthenticator.requiredParams.includes(param.param),
      initialValue: '',
      validator: (value: string) => {
        if (currentAuthenticator.requiredParams.includes(param.param) && (!value || value.trim() === '')) {
          return t('validations.required.field.error');
        }
        return null;
      },
    })) || [];

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
   * Setup form fields based on the current authenticator.
   */
  const setupFormFields = useCallback(
    (authenticator: EmbeddedSignInFlowAuthenticator) => {
      const initialValues: Record<string, string> = {};
      authenticator.metadata?.params?.forEach(param => {
        initialValues[param.param] = '';
      });

      // Reset form with new values
      resetForm();

      // Set initial values for all fields
      Object.keys(initialValues).forEach(key => {
        setFormValue(key, initialValues[key]);
      });
    },
    [resetForm, setFormValue],
  );

  /**
   * Mark all fields as touched for validation purposes.
   */
  const markAllFieldsAsTouched = () => {
    touchAllFields();
  };

  /**
   * Check if the response contains a redirection URL and perform the redirect if necessary.
   * @param response - The authentication response
   * @returns true if a redirect was performed, false otherwise
   */
  const handleRedirectionIfNeeded = (response: EmbeddedSignInFlowHandleResponse): boolean => {
    if (
      response &&
      'nextStep' in response &&
      response.nextStep &&
      (response.nextStep as any).stepType === EmbeddedSignInFlowStepType.AuthenticatorPrompt &&
      (response.nextStep as any).authenticators &&
      (response.nextStep as any).authenticators.length === 1
    ) {
      const responseAuthenticator = (response.nextStep as any).authenticators[0];
      if (
        responseAuthenticator.metadata?.promptType === EmbeddedSignInFlowAuthenticatorPromptType.RedirectionPrompt &&
        (responseAuthenticator.metadata as any)?.additionalData?.redirectUrl
      ) {
        /**
         * Open a popup window to handle redirection prompts
         */
        const redirectUrl = (responseAuthenticator.metadata as any)?.additionalData?.redirectUrl;
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
            // Don't log every message rejection to reduce noise
            if (event.source !== window && event.source !== window.parent) {
              // TODO: Add logs
            }
            return;
          }

          /**
           * Check the origin of the message to ensure it's from a trusted source
           */
          const expectedOrigin = afterSignInUrl ? new URL(afterSignInUrl).origin : window.location.origin;
          if (event.origin !== expectedOrigin && event.origin !== window.location.origin) {
            return;
          }

          const {code, state} = event.data;

          if (code && state) {
            const payload = {
              flowId: currentFlow.flowId,
              selectedAuthenticator: {
                authenticatorId: responseAuthenticator.authenticatorId,
                params: {
                  code,
                  state,
                },
              },
            };

            await onSubmit(payload, {
              method: currentFlow?.links[0].method,
              url: currentFlow?.links[0].href,
            });

            popup.close();
            cleanup();
          } else {
            // TODO: Add logs
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
                  const payload = {
                    flowId: currentFlow.flowId,
                    selectedAuthenticator: {
                      authenticatorId: responseAuthenticator.authenticatorId,
                      params: {
                        code,
                        state,
                      },
                    },
                  };

                  const response = await onSubmit(payload, {
                    method: currentFlow?.links[0].method,
                    url: currentFlow?.links[0].href,
                  });

                  popup.close();

                  onFlowChange?.(response);

                  if (response?.flowStatus === EmbeddedSignInFlowStatus.SuccessCompleted) {
                    onSuccess?.(response.authData);
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
    }
    return false;
  };

  /**
   * Handle form submission.
   */
  const handleSubmit = async (submittedValues: Record<string, string>) => {
    if (!currentFlow || !currentAuthenticator) {
      return;
    }

    // Mark all fields as touched before validation
    touchAllFields();

    const validation = validateForm();
    if (!validation.isValid) {
      return;
    }

    setIsSignInInitializationRequestLoading(true);
    setError(null);
    setMessages([]);

    try {
      const payload = {
        flowId: currentFlow.flowId,
        selectedAuthenticator: {
          authenticatorId: currentAuthenticator.authenticatorId,
          params: submittedValues,
        },
      };

      const response = await onSubmit(payload, {
        method: currentFlow?.links[0].method,
        url: currentFlow?.links[0].href,
      });
      onFlowChange?.(response);

      if (response?.flowStatus === EmbeddedSignInFlowStatus.SuccessCompleted) {
        onSuccess?.(response.authData);
        return;
      }

      if (
        response?.flowStatus === EmbeddedSignInFlowStatus.FailCompleted ||
        response?.flowStatus === EmbeddedSignInFlowStatus.FailIncomplete
      ) {
        setError(t('errors.signin.flow.completion.failure'));
        return;
      }

      // Check if the response contains a redirection URL and redirect if needed
      if (handleRedirectionIfNeeded(response)) {
        return;
      }

      if (response && 'flowId' in response && 'nextStep' in response) {
        const nextStepResponse = response as any;
        setCurrentFlow(nextStepResponse);

        if (nextStepResponse.nextStep?.authenticators?.length > 0) {
          if (
            nextStepResponse.nextStep.stepType === EmbeddedSignInFlowStepType.MultiOptionsPrompt &&
            nextStepResponse.nextStep.authenticators.length > 1
          ) {
            setCurrentAuthenticator(null);
          } else {
            const nextAuthenticator = nextStepResponse.nextStep.authenticators[0];
            setCurrentAuthenticator(nextAuthenticator);
            setupFormFields(nextAuthenticator);
          }
        }

        if (nextStepResponse.nextStep?.messages) {
          setMessages(
            nextStepResponse.nextStep.messages.map((msg: any) => ({
              type: msg.type || 'INFO',
              message: msg.message || '',
            })),
          );
        }
      }
    } catch (err) {
      const errorMessage = err instanceof AsgardeoAPIError ? err.message : t('errors.signin.flow.failure');
      setError(errorMessage);
      onError?.(err as Error);
    } finally {
      setIsSignInInitializationRequestLoading(false);
    }
  };

  /**
   * Handle authenticator selection for multi-option prompts.
   */
  const handleAuthenticatorSelection = async (
    authenticator: EmbeddedSignInFlowAuthenticator,
    formData?: Record<string, string>,
  ) => {
    if (!currentFlow) {
      return;
    }

    // Mark all fields as touched if we have form data (i.e., this is a submission)
    if (formData) {
      touchAllFields();
    }

    setIsSignInInitializationRequestLoading(true);
    setError(null);
    setMessages([]);

    try {
      // Handle passkey/FIDO authentication
      if (isPasskeyAuthenticator(authenticator)) {
        try {
          const challengeData = (authenticator.metadata as any)?.additionalData?.challengeData;
          if (!challengeData) {
            throw new Error('Missing challenge data for passkey authentication');
          }

          const tokenResponse = await handleWebAuthnAuthentication(challengeData);

          const payload = {
            flowId: currentFlow.flowId,
            selectedAuthenticator: {
              authenticatorId: authenticator.authenticatorId,
              params: {
                tokenResponse,
              },
            },
          };

          const response = await onSubmit(payload, {
            method: currentFlow?.links[0].method,
            url: currentFlow?.links[0].href,
          });
          onFlowChange?.(response);

          if (response?.flowStatus === EmbeddedSignInFlowStatus.SuccessCompleted) {
            onSuccess?.(response.authData);
            return;
          }

          if (
            response?.flowStatus === EmbeddedSignInFlowStatus.FailCompleted ||
            response?.flowStatus === EmbeddedSignInFlowStatus.FailIncomplete
          ) {
            setError(t('errors.signin.flow.passkeys.completion.failure'));
            return;
          }

          // Handle next step if authentication is not complete
          if (response && 'flowId' in response && 'nextStep' in response) {
            const nextStepResponse = response as any;
            setCurrentFlow(nextStepResponse);

            if (nextStepResponse.nextStep?.authenticators?.length > 0) {
              if (
                nextStepResponse.nextStep.stepType === EmbeddedSignInFlowStepType.MultiOptionsPrompt &&
                nextStepResponse.nextStep.authenticators.length > 1
              ) {
                setCurrentAuthenticator(null);
              } else {
                const nextAuthenticator = nextStepResponse.nextStep.authenticators[0];

                // Check if the next authenticator is also a passkey - if so, auto-trigger it
                if (isPasskeyAuthenticator(nextAuthenticator)) {
                  // Recursively handle the passkey authenticator without showing UI
                  handleAuthenticatorSelection(nextAuthenticator);
                  return;
                }
                setCurrentAuthenticator(nextAuthenticator);
                setupFormFields(nextAuthenticator);
              }
            }

            if (nextStepResponse.nextStep?.messages) {
              setMessages(
                nextStepResponse.nextStep.messages.map((msg: any) => ({
                  type: msg.type || 'INFO',
                  message: msg.message || '',
                })),
              );
            }
          }
        } catch (passkeyError) {
          console.error('Passkey authentication error:', passkeyError);

          // Provide more context for common errors
          let errorMessage =
            passkeyError instanceof Error ? passkeyError.message : t('errors.signin.flow.passkeys.failure');

          // Add additional context for security errors
          if (passkeyError instanceof Error && passkeyError.message.includes('security')) {
            errorMessage +=
              ' This may be due to browser security settings, an insecure connection, or device restrictions.';
          }

          setError(errorMessage);
        }
      } else if (authenticator.metadata?.promptType === EmbeddedSignInFlowAuthenticatorPromptType.RedirectionPrompt) {
        const payload = {
          flowId: currentFlow.flowId,
          selectedAuthenticator: {
            authenticatorId: authenticator.authenticatorId,
            params: {},
          },
        };

        const response = await onSubmit(payload, {
          method: currentFlow?.links[0].method,
          url: currentFlow?.links[0].href,
        });
        onFlowChange?.(response);

        if (response?.flowStatus === EmbeddedSignInFlowStatus.SuccessCompleted) {
          onSuccess?.(response.authData);
          return;
        }

        // Check if the response contains a redirection URL and redirect if needed
        if (handleRedirectionIfNeeded(response)) {
        }
      } else if (formData) {
        const validation = validateForm();
        if (!validation.isValid) {
          return;
        }

        const payload = {
          flowId: currentFlow.flowId,
          selectedAuthenticator: {
            authenticatorId: authenticator.authenticatorId,
            params: formData,
          },
        };

        const response = await onSubmit(payload, {
          method: currentFlow?.links[0].method,
          url: currentFlow?.links[0].href,
        });
        onFlowChange?.(response);

        if (response?.flowStatus === EmbeddedSignInFlowStatus.SuccessCompleted) {
          onSuccess?.(response.authData);
          return;
        }

        if (
          response?.flowStatus === EmbeddedSignInFlowStatus.FailCompleted ||
          response?.flowStatus === EmbeddedSignInFlowStatus.FailIncomplete
        ) {
          setError('Authentication failed. Please check your credentials and try again.');
          return;
        }

        // Check if the response contains a redirection URL and redirect if needed
        if (handleRedirectionIfNeeded(response)) {
          return;
        }

        if (response && 'flowId' in response && 'nextStep' in response) {
          const nextStepResponse = response as any;
          setCurrentFlow(nextStepResponse);

          if (nextStepResponse.nextStep?.authenticators?.length > 0) {
            if (
              nextStepResponse.nextStep.stepType === EmbeddedSignInFlowStepType.MultiOptionsPrompt &&
              nextStepResponse.nextStep.authenticators.length > 1
            ) {
              setCurrentAuthenticator(null);
            } else {
              const nextAuthenticator = nextStepResponse.nextStep.authenticators[0];

              // Check if the next authenticator is a passkey - if so, auto-trigger it
              if (isPasskeyAuthenticator(nextAuthenticator)) {
                // Recursively handle the passkey authenticator without showing UI
                handleAuthenticatorSelection(nextAuthenticator);
                return;
              }
              setCurrentAuthenticator(nextAuthenticator);
              setupFormFields(nextAuthenticator);
            }
          }

          if (nextStepResponse.nextStep?.messages) {
            setMessages(
              nextStepResponse.nextStep.messages.map((msg: any) => ({
                type: msg.type || 'INFO',
                message: msg.message || '',
              })),
            );
          }
        }
      } else {
        // Check if the authenticator requires user input
        const hasParams = authenticator.metadata?.params && authenticator.metadata.params.length > 0;

        if (!hasParams) {
          // If no parameters are required, directly authenticate
          const payload = {
            flowId: currentFlow.flowId,
            selectedAuthenticator: {
              authenticatorId: authenticator.authenticatorId,
              params: {},
            },
          };

          const response = await onSubmit(payload, {
            method: currentFlow?.links[0].method,
            url: currentFlow?.links[0].href,
          });
          onFlowChange?.(response);

          if (response?.flowStatus === EmbeddedSignInFlowStatus.SuccessCompleted) {
            onSuccess?.(response.authData);
            return;
          }

          if (
            response?.flowStatus === EmbeddedSignInFlowStatus.FailCompleted ||
            response?.flowStatus === EmbeddedSignInFlowStatus.FailIncomplete
          ) {
            setError('Authentication failed. Please try again.');
            return;
          }

          // Check if the response contains a redirection URL and redirect if needed
          if (handleRedirectionIfNeeded(response)) {
            return;
          }

          if (response && 'flowId' in response && 'nextStep' in response) {
            const nextStepResponse = response as any;
            setCurrentFlow(nextStepResponse);

            if (nextStepResponse.nextStep?.authenticators?.length > 0) {
              if (
                nextStepResponse.nextStep.stepType === EmbeddedSignInFlowStepType.MultiOptionsPrompt &&
                nextStepResponse.nextStep.authenticators.length > 1
              ) {
                setCurrentAuthenticator(null);
              } else {
                const nextAuthenticator = nextStepResponse.nextStep.authenticators[0];

                // Check if the next authenticator is a passkey - if so, auto-trigger it
                if (isPasskeyAuthenticator(nextAuthenticator)) {
                  // Recursively handle the passkey authenticator without showing UI
                  handleAuthenticatorSelection(nextAuthenticator);
                  return;
                }
                setCurrentAuthenticator(nextAuthenticator);
                setupFormFields(nextAuthenticator);
              }
            }

            if (nextStepResponse.nextStep?.messages) {
              setMessages(
                nextStepResponse.nextStep.messages.map((msg: any) => ({
                  type: msg.type || 'INFO',
                  message: msg.message || '',
                })),
              );
            }
          }
        } else {
          // If parameters are required, show the form
          setCurrentAuthenticator(authenticator);
          setupFormFields(authenticator);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof AsgardeoAPIError ? err?.message : 'Authenticator selection failed';
      setError(errorMessage);
      onError?.(err as Error);
    } finally {
      setIsSignInInitializationRequestLoading(false);
    }
  };

  /**
   * Handle input value changes.
   */
  const handleInputChange = (param: string, value: string) => {
    setFormValue(param, value);
    setFormTouched(param, true);
  };

  /**
   * Check if current flow has multiple authenticator options.
   */
  const hasMultipleOptions = useCallback(
    (): boolean =>
      currentFlow &&
      'nextStep' in currentFlow &&
      currentFlow.nextStep?.stepType === EmbeddedSignInFlowStepType.MultiOptionsPrompt &&
      currentFlow.nextStep?.authenticators &&
      currentFlow.nextStep.authenticators.length > 1,
    [currentFlow],
  );

  /**
   * Get available authenticators for selection.
   */
  const getAvailableAuthenticators = useCallback((): EmbeddedSignInFlowAuthenticator[] => {
    if (!currentFlow || !('nextStep' in currentFlow) || !currentFlow.nextStep?.authenticators) {
      return [];
    }
    return currentFlow.nextStep.authenticators;
  }, [currentFlow]);

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

  const messageClasses = cx([withVendorCSSClassPrefix('signin__messages')], messageClassName); // Initialize the flow on component mount

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // React 18.x Strict.Mode has a new check for `Ensuring reusable state` to facilitate an upcoming react feature.
    // https://reactjs.org/docs/strict-mode.html#ensuring-reusable-state
    // This will remount all the useEffects to ensure that there are no unexpected side effects.
    // When react remounts the SignIn, it will send two authorize requests.
    // https://github.com/reactwg/react-18/discussions/18#discussioncomment-795623
    if (reRenderCheckRef.current) {
      return;
    }

    reRenderCheckRef.current = true;

    (async () => {
      setIsSignInInitializationRequestLoading(true);
      setError(null);

      try {
        const response = await onInitialize();

        setCurrentFlow(response);
        setIsInitialized(true);
        onFlowChange?.(response);

        if (response?.flowStatus === EmbeddedSignInFlowStatus.SuccessCompleted) {
          onSuccess?.((response as any).authData || {});
          return;
        }

        if (response?.nextStep?.authenticators?.length > 0) {
          if (
            response.nextStep.stepType === EmbeddedSignInFlowStepType.MultiOptionsPrompt &&
            response.nextStep.authenticators.length > 1
          ) {
            setCurrentAuthenticator(null);
          } else {
            const authenticator = response.nextStep.authenticators[0];
            setCurrentAuthenticator(authenticator);
            setupFormFields(authenticator);
          }
        }

        if (response && 'nextStep' in response && response.nextStep && 'messages' in response.nextStep) {
          const stepMessages = (response.nextStep as any).messages || [];
          setMessages(
            stepMessages.map((msg: any) => ({
              type: msg.type || 'INFO',
              message: msg.message || '',
            })),
          );
        }
      } catch (err) {
        const errorMessage = err instanceof AsgardeoAPIError ? err.message : t('errors.signin.initialization');
        setError(errorMessage);
        onError?.(err as Error);
      } finally {
        setIsSignInInitializationRequestLoading(false);
      }
    })();
  }, [isLoading]);

  if (!isInitialized && isLoading) {
    return (
      <Card className={cx(containerClasses, styles.card)} variant={variant} data-testid="asgardeo-signin">
        <Card.Content>
          <div className={styles.loadingContainer}>
            <Spinner size="medium" />
            <Typography variant="body1" className={styles.loadingText}>
              {t('messages.loading.placeholder')}
            </Typography>
          </div>
        </Card.Content>
      </Card>
    );
  }

  if (hasMultipleOptions() && !currentAuthenticator) {
    const availableAuthenticators = getAvailableAuthenticators();

    const userPromptAuthenticators = availableAuthenticators.filter(
      auth =>
        auth.metadata?.promptType === EmbeddedSignInFlowAuthenticatorPromptType.UserPrompt ||
        // Fallback: LOCAL authenticators with params are typically user prompts
        (auth.idp === 'LOCAL' && auth.metadata?.params && auth.metadata.params.length > 0),
    );

    const optionAuthenticators = availableAuthenticators
      .filter(auth => !userPromptAuthenticators.includes(auth))
      .filter(authenticator => !HIDDEN_AUTHENTICATORS.includes(authenticator.authenticatorId));

    return (
      <Card className={cx(containerClasses, styles.card)} variant={variant} data-testid="asgardeo-signin">
        {(showTitle || showSubtitle) && (
          <Card.Header className={styles.header}>
            {showTitle && (
              <Card.Title level={2} className={styles.title}>
                {flowTitle || t('signin.heading')}
              </Card.Title>
            )}
            {showSubtitle && (
              <Typography variant="body1" className={styles.subtitle}>
                {flowSubtitle || t('signin.subheading')}
              </Typography>
            )}
          </Card.Header>
        )}
        <Card.Content>
          {flowMessages && flowMessages.length > 0 && (
            <div className={styles.flowMessagesContainer}>
              {flowMessages.map((flowMessage, index) => (
                <Alert
                  key={flowMessage.id || index}
                  variant={flowMessage.type}
                  className={cx(styles.flowMessageItem, messageClasses)}
                >
                  <Alert.Description>{flowMessage.message}</Alert.Description>
                </Alert>
              ))}
            </div>
          )}
          {messages.length > 0 && (
            <div className={styles.messagesContainer}>
              {messages.map((message, index) => {
                const variant =
                  message.type.toLowerCase() === 'error'
                    ? 'error'
                    : message.type.toLowerCase() === 'warning'
                    ? 'warning'
                    : message.type.toLowerCase() === 'success'
                    ? 'success'
                    : 'info';

                return (
                  <Alert key={index} variant={variant} className={cx(styles.messageItem, messageClasses)}>
                    <Alert.Description>{message.message}</Alert.Description>
                  </Alert>
                );
              })}
            </div>
          )}
          {error && (
            <Alert variant="error" className={cx(styles.errorContainer, errorClasses)}>
              <Alert.Title>Error</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert>
          )}

          <div className={styles.contentContainer}>
            {/* Render USER_PROMPT authenticators as form fields */}
            {userPromptAuthenticators.map((authenticator, index) => (
              <div key={authenticator.authenticatorId} className={styles.authenticatorItem}>
                {index > 0 && <Divider className={styles.divider}>OR</Divider>}
                <form
                  className={styles.form}
                  onSubmit={e => {
                    e.preventDefault();
                    const formData: Record<string, string> = {};
                    authenticator.metadata?.params?.forEach(param => {
                      formData[param.param] = formValues[param.param] || '';
                    });
                    handleAuthenticatorSelection(authenticator, formData);
                  }}
                >
                  {createSignInOptionFromAuthenticator(
                    authenticator,
                    formValues,
                    touchedFields,
                    isLoading,
                    handleInputChange,
                    (auth, formData) => handleAuthenticatorSelection(auth, formData),
                    {
                      inputClassName: inputClasses,
                      buttonClassName: buttonClasses,
                      error,
                    },
                  )}
                </form>
              </div>
            ))}

            {/* Add divider between user prompts and option authenticators if both exist */}
            {userPromptAuthenticators.length > 0 && optionAuthenticators.length > 0 && (
              <Divider className={styles.divider}>OR</Divider>
            )}

            {/* Render all other authenticators (REDIRECTION_PROMPT, multi-option buttons, etc.) */}
            {optionAuthenticators.map((authenticator, index) => (
              <div key={authenticator.authenticatorId} className={styles.authenticatorItem}>
                {createSignInOptionFromAuthenticator(
                  authenticator,
                  formValues,
                  touchedFields,
                  isLoading,
                  handleInputChange,
                  (auth, formData) => handleAuthenticatorSelection(auth, formData),
                  {
                    inputClassName: inputClasses,
                    buttonClassName: buttonClasses,
                    error,
                  },
                )}
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    );
  }

  if (!currentAuthenticator) {
    return (
      <Card className={cx(containerClasses, styles.noAuthenticatorCard)} variant={variant} data-testid="asgardeo-signin">
        <Card.Content>
          {error && (
            <Alert variant="error" className={styles.errorAlert}>
              <Alert.Title>{t('errors.heading') || 'Error'}</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert>
          )}
        </Card.Content>
      </Card>
    );
  }

  // If the current authenticator is a passkey, auto-trigger it instead of showing a form
  if (isPasskeyAuthenticator(currentAuthenticator) && !isLoading) {
    // Auto-trigger passkey authentication
    useEffect(() => {
      handleAuthenticatorSelection(currentAuthenticator);
    }, [currentAuthenticator]);

    // Show loading state while passkey authentication is in progress
    return (
      <Card className={cx(containerClasses, styles.card)} variant={variant} data-testid="asgardeo-signin">
        <Card.Content>
          <div className={styles.centeredContainer}>
            <div className={styles.passkeyContainer}>
              <Spinner size="large" />
            </div>
            <Typography variant="body1">{t('passkey.authenticating') || 'Authenticating with passkey...'}</Typography>
            <Typography variant="body2" className={styles.passkeyText}>
              {t('passkey.instruction') || 'Please use your fingerprint, face, or security key to authenticate.'}
            </Typography>
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card className={cx(containerClasses, styles.card)} variant={variant} data-testid="asgardeo-signin">
      <Card.Header className={styles.header}>
        <Card.Title level={2} className={styles.title}>
          {flowTitle || t('signin.heading')}
        </Card.Title>
        <Typography variant="body1" className={styles.subtitle}>
          {flowSubtitle || t('signin.subheading')}
        </Typography>
        {flowMessages && flowMessages.length > 0 && (
          <div className={styles.flowMessagesContainer}>
            {flowMessages.map((flowMessage, index) => (
              <Alert
                key={flowMessage.id || index}
                variant={flowMessage.type}
                className={cx(styles.flowMessageItem, messageClasses)}
              >
                <Alert.Description>{flowMessage.message}</Alert.Description>
              </Alert>
            ))}
          </div>
        )}
        {messages.length > 0 && (
          <div className={styles.messagesContainer}>
            {messages.map((message, index) => {
              const variant =
                message.type.toLowerCase() === 'error'
                  ? 'error'
                  : message.type.toLowerCase() === 'warning'
                  ? 'warning'
                  : message.type.toLowerCase() === 'success'
                  ? 'success'
                  : 'info';

              return (
                <Alert key={index} variant={variant} className={cx(styles.messageItem, messageClasses)}>
                  <Alert.Description>{message.message}</Alert.Description>
                </Alert>
              );
            })}
          </div>
        )}
      </Card.Header>

      <Card.Content>
        {error && (
          <Alert variant="error" className={cx(styles.errorContainer, errorClasses)}>
            <Alert.Title>{t('errors.heading')}</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert>
        )}

        <form
          className={styles.form}
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formData: Record<string, string> = {};
            currentAuthenticator.metadata?.params?.forEach(param => {
              formData[param.param] = formValues[param.param] || '';
            });
            handleSubmit(formData);
          }}
        >
          {createSignInOptionFromAuthenticator(
            currentAuthenticator,
            formValues,
            touchedFields,
            isLoading,
            handleInputChange,
            (authenticator, formData) => handleSubmit(formData || formValues),
            {
              inputClassName: inputClasses,
              buttonClassName: buttonClasses,
              error,
            },
          )}
        </form>
      </Card.Content>
    </Card>
  );
};

export default BaseSignIn;
