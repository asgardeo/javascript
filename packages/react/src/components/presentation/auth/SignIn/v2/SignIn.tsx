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
  AsgardeoRuntimeError,
  EmbeddedFlowComponentV2 as EmbeddedFlowComponent,
  EmbeddedFlowType,
  EmbeddedSignInFlowResponseV2,
  EmbeddedSignInFlowRequestV2,
  EmbeddedSignInFlowStatusV2,
  EmbeddedSignInFlowTypeV2,
  FlowMetadataResponse,
} from '@asgardeo/browser';
import {FC, ReactElement, useState, useEffect, useRef, ReactNode} from 'react';
// eslint-disable-next-line import/no-named-as-default
import BaseSignIn, {BaseSignInProps} from './BaseSignIn';
import useAsgardeo from '../../../../../contexts/Asgardeo/useAsgardeo';
import {useOAuthCallback} from '../../../../../hooks/v2/useOAuthCallback';
import useTranslation from '../../../../../hooks/useTranslation';
import {initiateOAuthRedirect} from '../../../../../utils/oauth';
import {normalizeFlowResponse} from '../../../../../utils/v2/flowTransformer';
import {handlePasskeyAuthentication, handlePasskeyRegistration} from '../../../../../utils/v2/passkey';

/**
 * Render props function parameters
 */
export interface SignInRenderProps {
  /**
   * Current flow components
   */
  components: EmbeddedFlowComponent[];

  /**
   * Current error if any
   */
  error: Error | null;

  /**
   * Function to manually initialize the flow
   */
  initialize: () => Promise<void>;

  /**
   * Whether the flow has been initialized
   */
  isInitialized: boolean;

  /**
   * Loading state indicator
   */
  isLoading: boolean;

  /**
   * Flow metadata returned by the platform (v2 only). `null` while loading or unavailable.
   */
  meta: FlowMetadataResponse | null;

  /**
   * Function to submit authentication data (primary)
   */
  onSubmit: (payload: EmbeddedSignInFlowRequestV2) => Promise<void>;
}

/**
 * Props for the SignIn component.
 * Matches the interface from the main SignIn component for consistency.
 */
export type SignInProps = {
  /**
   * Render props function for custom UI
   */
  children?: (props: SignInRenderProps) => ReactNode;

  /**
   * Custom CSS class name for the form container.
   */
  className?: string;

  /**
   * Callback function called when authentication fails.
   * @param error - The error that occurred during authentication.
   */
  onError?: (error: Error) => void;

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
  variant?: BaseSignInProps['variant'];
};

/**
 * State for tracking passkey registration
 */
interface PasskeyState {
  actionId: string | null;
  challenge: string | null;
  creationOptions: string | null;
  error: Error | null;
  flowId: string | null;
  isActive: boolean;
}

/**
 * A component-driven SignIn component that provides authentication flow with pre-built styling.
 * This component handles the flow API calls for authentication and delegates UI logic to BaseSignIn.
 * It automatically transforms simple input-based responses into component-driven UI format.
 *
 * @example
 * // Default UI
 * ```tsx
 * import { SignIn } from '@asgardeo/react/component-driven';
 *
 * const App = () => {
 *   return (
 *     <SignIn
 *       onSuccess={(authData) => {
 *         console.log('Authentication successful:', authData);
 *       }}
 *       onError={(error) => {
 *         console.error('Authentication failed:', error);
 *       }}
 *       size="medium"
 *       variant="outlined"
 *     />
 *   );
 * };
 * ```
 *
 * @example
 * // Custom UI with render props
 * ```tsx
 * import { SignIn } from '@asgardeo/react/component-driven';
 *
 * const App = () => {
 *   return (
 *     <SignIn
 *       onSuccess={(authData) => console.log('Success:', authData)}
 *       onError={(error) => console.error('Error:', error)}
 *     >
 *       {({signIn, isLoading, components, error, isInitialized}) => (
 *         <div className="custom-signin">
 *           <h1>Custom Sign In</h1>
 *           {!isInitialized ? (
 *             <p>Initializing...</p>
 *           ) : error ? (
 *             <div className="error">{error.message}</div>
 *           ) : (
 *             <form onSubmit={(e) => {
 *               e.preventDefault();
 *               signIn({inputs: {username: 'user', password: 'pass'}});
 *             }}>
 *               <button type="submit" disabled={isLoading}>
 *                 {isLoading ? 'Signing in...' : 'Sign In'}
 *               </button>
 *             </form>
 *           )}
 *         </div>
 *       )}
 *     </SignIn>
 *   );
 * };
 * ```
 */
const SignIn: FC<SignInProps> = ({
  className,
  size = 'medium',
  onSuccess,
  onError,
  variant,
  children,
}: SignInProps): ReactElement => {
  const {applicationId, afterSignInUrl, signIn, isInitialized, isLoading, meta} = useAsgardeo();
  const {t} = useTranslation();

  // State management for the flow
  const [components, setComponents] = useState<EmbeddedFlowComponent[]>([]);
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [isFlowInitialized, setIsFlowInitialized] = useState(false);
  const [flowError, setFlowError] = useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passkeyState, setPasskeyState] = useState<PasskeyState>({
    actionId: null,
    challenge: null,
    creationOptions: null,
    error: null,
    flowId: null,
    isActive: false,
  });
  const initializationAttemptedRef: any = useRef(false);
  const oauthCodeProcessedRef: any = useRef(false);
  const passkeyProcessedRef: any = useRef(false);
  /**
   * Sets flowId between sessionStorage and state.
   * This ensures both are always in sync.
   */
  const setFlowId = (flowId: string | null): void => {
    setCurrentFlowId(flowId);
    if (flowId) {
      sessionStorage.setItem('asgardeo_flow_id', flowId);
    } else {
      sessionStorage.removeItem('asgardeo_flow_id');
    }
  };

  /**
   * Clear all flow-related storage and state.
   */
  const clearFlowState = (): void => {
    setFlowId(null);
    setIsFlowInitialized(false);
    sessionStorage.removeItem('asgardeo_auth_id');
    // Reset refs to allow new flows to start properly
    oauthCodeProcessedRef.current = false;
  };

  /**
   * Parse URL parameters used in flows.
   */
  const getUrlParams = (): any => {
    const urlParams: any = new URL(window?.location?.href ?? '').searchParams;
    return {
      applicationId: urlParams.get('applicationId'),
      authId: urlParams.get('authId'),
      code: urlParams.get('code'),
      error: urlParams.get('error'),
      errorDescription: urlParams.get('error_description'),
      flowId: urlParams.get('flowId'),
      nonce: urlParams.get('nonce'),
      state: urlParams.get('state'),
    };
  };

  /**
   * Handle authId from URL and store it in sessionStorage.
   */
  const handleAuthId = (authId: string | null): void => {
    if (authId) {
      sessionStorage.setItem('asgardeo_auth_id', authId);
    }
  };

  /**
   * Clean up OAuth-related URL parameters from the browser URL.
   */
  const cleanupOAuthUrlParams = (includeNonce: boolean = false): void => {
    if (!window?.location?.href) return;
    const url: any = new URL(window.location.href);
    url.searchParams.delete('error');
    url.searchParams.delete('error_description');
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    if (includeNonce) {
      url.searchParams.delete('nonce');
    }
    window?.history?.replaceState({}, '', url.toString());
  };

  /**
   * Clean up flow-related URL parameters (flowId, authId) from the browser URL.
   * Used after flowId is set in state to prevent using invalidated flowId from URL.
   */
  const cleanupFlowUrlParams = (): void => {
    if (!window?.location?.href) return;
    const url: any = new URL(window.location.href);
    url.searchParams.delete('flowId');
    url.searchParams.delete('authId');
    url.searchParams.delete('applicationId');
    window?.history?.replaceState({}, '', url.toString());
  };

  /**
   * Set error state and call onError callback.
   * Ensures isFlowInitialized is true so errors can be displayed in the UI.
   */
  const setError = (error: Error): void => {
    setFlowError(error);
    setIsFlowInitialized(true);
    onError?.(error);
  };

  /**
   * Handle OAuth error from URL parameters.
   * Clears flow state, creates error, and cleans up URL.
   */
  const handleOAuthError = (error: string, errorDescription: string | null): void => {
    clearFlowState();
    const errorMessage: any = errorDescription || `OAuth error: ${error}`;
    const err: any = new AsgardeoRuntimeError(errorMessage, 'SIGN_IN_ERROR', 'react');
    setError(err);
    cleanupOAuthUrlParams(true);
  };

  /**
   * Handle REDIRECTION response by storing flow state and redirecting to OAuth provider.
   */
  const handleRedirection = (response: EmbeddedSignInFlowResponseV2): boolean => {
    if (response.type === EmbeddedSignInFlowTypeV2.Redirection) {
      const redirectURL: any = (response.data as any)?.redirectURL || (response as any)?.redirectURL;

      if (redirectURL && window?.location) {
        if (response.flowId) {
          setFlowId(response.flowId);
        }

        const urlParams: any = getUrlParams();
        handleAuthId(urlParams.authId);

        initiateOAuthRedirect(redirectURL);
        return true;
      }
    }
    return false;
  };

  /**
   * Initialize the authentication flow.
   * Priority: flowId > applicationId (from context) > applicationId (from URL)
   */
  const initializeFlow = async (): Promise<void> => {
    const urlParams: any = getUrlParams();

    // Reset OAuth code processed ref when starting a new flow
    oauthCodeProcessedRef.current = false;

    handleAuthId(urlParams.authId);

    const effectiveApplicationId: any = applicationId || urlParams.applicationId;

    if (!urlParams.flowId && !effectiveApplicationId) {
      const error: any = new AsgardeoRuntimeError(
        'Either flowId or applicationId is required for authentication',
        'SIGN_IN_ERROR',
        'react',
      );
      setError(error);
      throw error;
    }

    try {
      setFlowError(null);

      let response: EmbeddedSignInFlowResponseV2;

      if (urlParams.flowId) {
        response = (await signIn({
          flowId: urlParams.flowId,
        })) as EmbeddedSignInFlowResponseV2;
      } else {
        response = (await signIn({
          applicationId: effectiveApplicationId,
          flowType: EmbeddedFlowType.Authentication,
        })) as EmbeddedSignInFlowResponseV2;
      }

      if (handleRedirection(response)) {
        return;
      }

      const {flowId: normalizedFlowId, components: normalizedComponents} = normalizeFlowResponse(response, t, {
        resolveTranslations: !children,
      });

      if (normalizedFlowId && normalizedComponents) {
        setFlowId(normalizedFlowId);
        setComponents(normalizedComponents);
        setIsFlowInitialized(true);
        // Clean up flowId from URL after setting it in state
        cleanupFlowUrlParams();
      }
    } catch (error) {
      const err: any = error as any;
      clearFlowState();

      // Extract error message from response or error object
      const errorMessage: any = err?.failureReason || (err instanceof Error ? err.message : String(err));

      // Set error with the extracted message
      setError(new Error(errorMessage));
      initializationAttemptedRef.current = false;
    }
  };

  /**
   * Initialize the flow and handle cleanup of stale flow state.
   */
  useEffect(() => {
    const urlParams: any = getUrlParams();

    // Check for OAuth error in URL
    if (urlParams.error) {
      handleOAuthError(urlParams.error, urlParams.errorDescription);
      return;
    }

    handleAuthId(urlParams.authId);

    // Skip OAuth code processing - let the dedicated OAuth useEffect handle it
    if (urlParams.code || urlParams.state) {
      return;
    }

    // Only initialize if we're not processing an OAuth callback or submission
    const currentUrlParams: any = getUrlParams();
    if (
      isInitialized &&
      !isLoading &&
      !isFlowInitialized &&
      !initializationAttemptedRef.current &&
      !currentFlowId &&
      !currentUrlParams.code &&
      !currentUrlParams.state &&
      !isSubmitting &&
      !oauthCodeProcessedRef.current
    ) {
      initializationAttemptedRef.current = true;
      initializeFlow();
    }
  }, [isInitialized, isLoading, isFlowInitialized, currentFlowId]);

  /**
   * Handle form submission from BaseSignIn or render props.
   */
  const handleSubmit = async (payload: EmbeddedSignInFlowRequestV2): Promise<void> => {
    // Use flowId from payload if available, otherwise fall back to currentFlowId
    const effectiveFlowId: any = payload.flowId || currentFlowId;

    if (!effectiveFlowId) {
      throw new Error('No active flow ID');
    }

    try {
      setIsSubmitting(true);
      setFlowError(null);

      const response: EmbeddedSignInFlowResponseV2 = (await signIn({
        flowId: effectiveFlowId,
        ...payload,
      })) as EmbeddedSignInFlowResponseV2;

      if (handleRedirection(response)) {
        return;
      }
      if (
        response.data?.additionalData?.['passkeyChallenge'] ||
        response.data?.additionalData?.['passkeyCreationOptions']
      ) {
        const {passkeyChallenge, passkeyCreationOptions}: any = response.data.additionalData;
        const effectiveFlowIdForPasskey: any = response.flowId || effectiveFlowId;

        // Reset passkey processed ref to allow processing
        passkeyProcessedRef.current = false;

        // Set passkey state to trigger the passkey
        setPasskeyState({
          actionId: 'submit',
          challenge: passkeyChallenge,
          creationOptions: passkeyCreationOptions,
          error: null,
          flowId: effectiveFlowIdForPasskey,
          isActive: true,
        });
        setIsSubmitting(false);

        return;
      }

      const {flowId: normalizedFlowId, components: normalizedComponents} = normalizeFlowResponse(response, t, {
        resolveTranslations: !children,
      });

      // Handle Error flow status - flow has failed and is invalidated
      if (response.flowStatus === EmbeddedSignInFlowStatusV2.Error) {
        clearFlowState();
        // Extract failureReason from response if available
        const failureReason: any = (response as any)?.failureReason;
        const errorMessage: any = failureReason || 'Authentication flow failed. Please try again.';
        const err: any = new Error(errorMessage);
        setError(err);
        cleanupFlowUrlParams();
        // Throw the error so it's caught by the catch block and propagated to BaseSignIn
        throw err;
      }

      if (response.flowStatus === EmbeddedSignInFlowStatusV2.Complete) {
        // Get redirectUrl from response (from /oauth2/auth/callback) or fall back to afterSignInUrl
        const redirectUrl: any = (response as any)?.redirectUrl || (response as any)?.redirect_uri;
        const finalRedirectUrl: any = redirectUrl || afterSignInUrl;

        // Clear submitting state before redirect
        setIsSubmitting(false);

        // Clear all OAuth-related storage on successful completion
        setFlowId(null);
        setIsFlowInitialized(false);
        sessionStorage.removeItem('asgardeo_flow_id');
        sessionStorage.removeItem('asgardeo_auth_id');

        // Clean up OAuth URL params before redirect
        cleanupOAuthUrlParams(true);

        if (onSuccess) {
          onSuccess({
            redirectUrl: finalRedirectUrl,
            ...(response.data || {}),
          });
        }

        if (finalRedirectUrl && window?.location) {
          window.location.href = finalRedirectUrl;
        }

        return;
      }

      // Update flowId if response contains a new one
      if (normalizedFlowId && normalizedComponents) {
        setFlowId(normalizedFlowId);
        setComponents(normalizedComponents);
        // Ensure flow is marked as initialized when we have components
        setIsFlowInitialized(true);
        // Clean up flowId from URL after setting it in state
        cleanupFlowUrlParams();
      }
    } catch (error) {
      const err: any = error as any;
      clearFlowState();

      // Extract error message from response or error object
      const errorMessage: any = err?.failureReason || (err instanceof Error ? err.message : String(err));

      setError(new Error(errorMessage));
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle authentication errors.
   */
  const handleError = (error: Error): void => {
    setError(error);
  };

  useOAuthCallback({
    currentFlowId,
    isInitialized: isInitialized && !isLoading,
    isSubmitting,
    onError: (err: any) => {
      clearFlowState();
      setError(err instanceof Error ? err : new Error(String(err)));
    },
    onSubmit: async (payload: any) => handleSubmit({flowId: payload.flowId, inputs: payload.inputs}),
    processedRef: oauthCodeProcessedRef,
    setFlowId,
  });

  /**
   * Handle passkey authentication/registration when passkey state becomes active.
   * This effect auto-triggers the browser passkey popup and submits the result.
   */
  useEffect(() => {
    if (!passkeyState.isActive || (!passkeyState.challenge && !passkeyState.creationOptions) || !passkeyState.flowId) {
      return;
    }

    // Prevent re-processing
    if (passkeyProcessedRef.current) {
      return;
    }
    passkeyProcessedRef.current = true;

    const performPasskeyProcess = async (): Promise<void> => {
      let inputs: Record<string, string>;

      if (passkeyState.challenge) {
        const passkeyResponse: any = await handlePasskeyAuthentication(passkeyState.challenge!);
        const passkeyResponseObj: any = JSON.parse(passkeyResponse);

        inputs = {
          authenticatorData: passkeyResponseObj.response.authenticatorData,
          clientDataJSON: passkeyResponseObj.response.clientDataJSON,
          credentialId: passkeyResponseObj.id,
          signature: passkeyResponseObj.response.signature,
          userHandle: passkeyResponseObj.response.userHandle,
        };
      } else if (passkeyState.creationOptions) {
        const passkeyResponse: any = await handlePasskeyRegistration(passkeyState.creationOptions!);
        const passkeyResponseObj: any = JSON.parse(passkeyResponse);

        inputs = {
          attestationObject: passkeyResponseObj.response.attestationObject,
          clientDataJSON: passkeyResponseObj.response.clientDataJSON,
          credentialId: passkeyResponseObj.id,
        };
      } else {
        throw new Error('No passkey challenge or creation options available');
      }

      await handleSubmit({
        flowId: passkeyState.flowId!,
        inputs,
      });
    };

    performPasskeyProcess()
      .then(() => {
        setPasskeyState({
          actionId: null,
          challenge: null,
          creationOptions: null,
          error: null,
          flowId: null,
          isActive: false,
        });
      })
      .catch((error: any) => {
        setPasskeyState((prev: any) => ({...prev, error: error as Error, isActive: false}));
        setFlowError(error as Error);
        onError?.(error as Error);
      });
  }, [passkeyState.isActive, passkeyState.challenge, passkeyState.creationOptions, passkeyState.flowId]);

  if (children) {
    const renderProps: SignInRenderProps = {
      components,
      error: flowError,
      initialize: initializeFlow,
      isInitialized: isFlowInitialized,
      isLoading: isLoading || isSubmitting || !isInitialized,
      meta,
      onSubmit: handleSubmit,
    };

    return <>{children(renderProps)}</>;
  }
  // Otherwise, render the default BaseSignIn component
  return (
    <BaseSignIn
      components={components}
      isLoading={isLoading || !isInitialized || !isFlowInitialized}
      onSubmit={handleSubmit}
      onError={handleError}
      error={flowError}
      className={className}
      size={size}
      variant={variant}
    />
  );
};

export default SignIn;
