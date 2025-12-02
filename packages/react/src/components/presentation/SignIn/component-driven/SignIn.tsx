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

import {FC, useState, useEffect, useRef, ReactNode} from 'react';
import BaseSignIn, {BaseSignInProps} from './BaseSignIn';
import useAsgardeo from '../../../../contexts/Asgardeo/useAsgardeo';
import {
  AsgardeoRuntimeError,
  EmbeddedFlowComponent,
  EmbeddedFlowType,
  EmbeddedSignInFlowResponseV2,
  EmbeddedSignInFlowRequestV2,
  EmbeddedSignInFlowStatusV2,
  EmbeddedSignInFlowTypeV2,
} from '@asgardeo/browser';
import {normalizeFlowResponse} from './transformer';
import useTranslation from '../../../../hooks/useTranslation';

/**
 * Render props function parameters
 */
export interface SignInRenderProps {
  /**
   * Function to manually initialize the flow
   */
  initialize: () => Promise<void>;

  /**
   * Function to submit authentication data (primary)
   */
  onSubmit: (payload: EmbeddedSignInFlowRequestV2) => Promise<void>;

  /**
   * Loading state indicator
   */
  isLoading: boolean;

  /**
   * Whether the flow has been initialized
   */
  isInitialized: boolean;

  /**
   * Current flow components
   */
  components: EmbeddedFlowComponent[];

  /**
   * Current error if any
   */
  error: Error | null;
}

/**
 * Props for the SignIn component.
 * Matches the interface from the main SignIn component for consistency.
 */
export type SignInProps = {
  /**
   * Custom CSS class name for the form container.
   */
  className?: string;

  /**
   * Callback function called when authentication is successful.
   * @param authData - The authentication data returned upon successful completion.
   */
  onSuccess?: (authData: Record<string, any>) => void;

  /**
   * Callback function called when authentication fails.
   * @param error - The error that occurred during authentication.
   */
  onError?: (error: Error) => void;

  /**
   * Theme variant for the component.
   */
  variant?: BaseSignInProps['variant'];

  /**
   * Size variant for the component.
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Render props function for custom UI
   */
  children?: (props: SignInRenderProps) => ReactNode;
};

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
const SignIn: FC<SignInProps> = ({className, size = 'medium', onSuccess, onError, variant, children}) => {
  const {applicationId, afterSignInUrl, signIn, isInitialized, isLoading} = useAsgardeo();
  const {t} = useTranslation();

  // State management for the flow
  const [components, setComponents] = useState<EmbeddedFlowComponent[]>([]);
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [isFlowInitialized, setIsFlowInitialized] = useState(false);
  const [flowError, setFlowError] = useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initializationAttemptedRef = useRef(false);
  const oauthCodeProcessedRef = useRef(false);

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
    sessionStorage.removeItem('asgardeo_session_data_key');
    // Reset refs to allow new flows to start properly
    oauthCodeProcessedRef.current = false;
  };

  /**
   * Parse URL parameters used in flows.
   */
  const getUrlParams = () => {
    const urlParams = new URL(window?.location?.href ?? '').searchParams;
    return {
      code: urlParams.get('code'),
      error: urlParams.get('error'),
      errorDescription: urlParams.get('error_description'),
      state: urlParams.get('state'),
      nonce: urlParams.get('nonce'),
      flowId: urlParams.get('flowId'),
      applicationId: urlParams.get('applicationId'),
      sessionDataKey: urlParams.get('sessionDataKey'),
    };
  };

  /**
   * Handle sessionDataKey from URL and store it in sessionStorage.
   */
  const handleSessionDataKey = (sessionDataKey: string | null): void => {
    if (sessionDataKey) {
      sessionStorage.setItem('asgardeo_session_data_key', sessionDataKey);
    }
  };

  /**
   * Resolve flowId from multiple sources with priority: currentFlowId > state > flowIdFromUrl > storedFlowId
   */
  const resolveFlowId = (
    currentFlowId: string | null,
    state: string | null,
    flowIdFromUrl: string | null,
    storedFlowId: string | null,
  ): string | null => {
    return currentFlowId || state || flowIdFromUrl || storedFlowId || null;
  };

  /**
   * Clean up OAuth-related URL parameters from the browser URL.
   */
  const cleanupOAuthUrlParams = (includeNonce = false): void => {
    if (!window?.location?.href) return;
    const url = new URL(window.location.href);
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
   * Clean up flow-related URL parameters (flowId, sessionDataKey) from the browser URL.
   * Used after flowId is set in state to prevent using invalidated flowId from URL.
   */
  const cleanupFlowUrlParams = (): void => {
    if (!window?.location?.href) return;
    const url = new URL(window.location.href);
    url.searchParams.delete('flowId');
    url.searchParams.delete('sessionDataKey');
    url.searchParams.delete('applicationId');
    window?.history?.replaceState({}, '', url.toString());
  };

  /**
   * Handle OAuth error from URL parameters.
   * Clears flow state, creates error, and cleans up URL.
   */
  const handleOAuthError = (error: string, errorDescription: string | null): void => {
    console.warn('[SignIn] OAuth error detected:', error);
    clearFlowState();
    const errorMessage = errorDescription || `OAuth error: ${error}`;
    const err = new AsgardeoRuntimeError(
      errorMessage,
      'SIGN_IN_ERROR',
      'react',
    );
    setError(err);
    cleanupOAuthUrlParams(true);
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
   * Handle REDIRECTION response by storing flow state and redirecting to OAuth provider.
   */
  const handleRedirection = (response: EmbeddedSignInFlowResponseV2): boolean => {
    if (response.type === EmbeddedSignInFlowTypeV2.Redirection) {
      const redirectURL = (response.data as any)?.redirectURL || (response as any)?.redirectURL;

      if (redirectURL && window?.location) {
        if (response.flowId) {
          setFlowId(response.flowId);
        }

        const urlParams = getUrlParams();
        handleSessionDataKey(urlParams.sessionDataKey);

        window.location.href = redirectURL;
        return true;
      }
    }
    return false;
  };

  /**
   * Initialize the flow and handle cleanup of stale flow state.
   */
  useEffect(() => {
    const storedFlowId = sessionStorage.getItem('asgardeo_flow_id');
    const urlParams = getUrlParams();

    // Check for OAuth error in URL
    if (urlParams.error) {
      handleOAuthError(urlParams.error, urlParams.errorDescription);
      return;
    }

    handleSessionDataKey(urlParams.sessionDataKey);

    // Skip OAuth code processing - let the dedicated OAuth useEffect handle it
    if (urlParams.code || urlParams.state) {
      return;
    }

    // Only initialize if we're not processing an OAuth callback or submission
    const currentUrlParams = getUrlParams();
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
   * Initialize the authentication flow.
   * Priority: flowId > applicationId (from context) > applicationId (from URL)
   */
  const initializeFlow = async (): Promise<void> => {
    const urlParams = getUrlParams();

    // Reset OAuth code processed ref when starting a new flow
    oauthCodeProcessedRef.current = false;

    handleSessionDataKey(urlParams.sessionDataKey);

    const effectiveApplicationId = applicationId || urlParams.applicationId;

    if (!urlParams.flowId && !effectiveApplicationId) {
      const error = new AsgardeoRuntimeError(
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
        response = await signIn({
          flowId: urlParams.flowId,
        }) as EmbeddedSignInFlowResponseV2;
      } else {
        response = await signIn({
          applicationId: effectiveApplicationId,
          flowType: EmbeddedFlowType.Authentication,
        }) as EmbeddedSignInFlowResponseV2;
      }

      if (handleRedirection(response)) {
        return;
      }

      const { flowId, components } = normalizeFlowResponse(response, t);

      if (flowId && components) {
        setFlowId(flowId);
        setComponents(components);
        setIsFlowInitialized(true);
        // Clean up flowId from URL after setting it in state
        cleanupFlowUrlParams();
      }
    } catch (error) {
      const err = error as Error;
      clearFlowState();

      // Extract error message
      const errorMessage = err instanceof Error ? err.message : String(err);

      // Create error with backend message
      const displayError = new AsgardeoRuntimeError(
        errorMessage,
        'SIGN_IN_ERROR',
        'react',
      );
      setError(displayError);
      initializationAttemptedRef.current = false;
      return;
    }
  };

  /**
   * Handle form submission from BaseSignIn or render props.
   */
  const handleSubmit = async (payload: EmbeddedSignInFlowRequestV2): Promise<void> => {
    // Use flowId from payload if available, otherwise fall back to currentFlowId
    const effectiveFlowId = payload.flowId || currentFlowId;

    if (!effectiveFlowId) {
      console.error('[SignIn] handleSubmit - ERROR: No flowId available', {
        payloadFlowId: payload.flowId,
        currentFlowId,
      });
      throw new Error('No active flow ID');
    }

    try {
      setIsSubmitting(true);
      setFlowError(null);

      const response: EmbeddedSignInFlowResponseV2 = await signIn({
        flowId: effectiveFlowId,
        ...payload,
      }) as EmbeddedSignInFlowResponseV2;

      if (handleRedirection(response)) {
        return;
      }

      const { flowId, components } = normalizeFlowResponse(response, t);

      // Handle Error flow status - flow has failed and is invalidated
      if (response.flowStatus === EmbeddedSignInFlowStatusV2.Error) {
        console.error('[SignIn] Flow returned Error status, clearing flow state');
        clearFlowState();
        // Extract failureReason from response if available
        const failureReason = (response as any)?.failureReason;
        const errorMessage = failureReason || 'Authentication flow failed. Please try again.';
        const err = new AsgardeoRuntimeError(
          errorMessage,
          'SIGN_IN_ERROR',
          'react',
        );
        setError(err);
        cleanupFlowUrlParams();
        return;
      }

      if (response.flowStatus === EmbeddedSignInFlowStatusV2.Complete) {
        // Get redirectUrl from response (from /oauth2/authorize) or fall back to afterSignInUrl
        const redirectUrl = (response as any)?.redirectUrl || (response as any)?.redirect_uri;
        const finalRedirectUrl = redirectUrl || afterSignInUrl;

        // Clear submitting state before redirect
        setIsSubmitting(false);

        // Clear all OAuth-related storage on successful completion
        setFlowId(null);
        setIsFlowInitialized(false);
        sessionStorage.removeItem('asgardeo_flow_id');
        sessionStorage.removeItem('asgardeo_session_data_key');

        // Clean up OAuth URL params before redirect
        cleanupOAuthUrlParams(true);

        onSuccess &&
          onSuccess({
            redirectUrl: finalRedirectUrl,
            ...(response.data || {}),
          });

        if (finalRedirectUrl && window?.location) {
          window.location.href = finalRedirectUrl;
        } else {
          console.warn('[SignIn] Flow completed but no redirect URL available');
        }

        return;
      }

      // Update flowId if response contains a new one
      if (flowId && components) {
        setFlowId(flowId);
        setComponents(components);
        // Ensure flow is marked as initialized when we have components
        setIsFlowInitialized(true);
        // Clean up flowId from URL after setting it in state
        cleanupFlowUrlParams();
      }
    } catch (error) {
      const err = error as Error;
      clearFlowState();

      // Extract error message
      const errorMessage = err instanceof Error ? err.message : String(err);

      const displayError = new AsgardeoRuntimeError(
        errorMessage,
        'SIGN_IN_ERROR',
        'react',
      );
      setError(displayError);
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle authentication errors.
   */
  const handleError = (error: Error): void => {
    console.error('Authentication error:', error);
    setError(error);
  };

  /**
   * Handle OAuth code processing from external OAuth providers.
   */
  useEffect(() => {
    const urlParams = getUrlParams();
    const storedFlowId = sessionStorage.getItem('asgardeo_flow_id');

    // Check for OAuth error first - if present, don't process code
    if (urlParams.error) {
      handleOAuthError(urlParams.error, urlParams.errorDescription);
      oauthCodeProcessedRef.current = true; // Mark as processed to prevent retry
      return;
    }

    if (!urlParams.code || oauthCodeProcessedRef.current || isSubmitting) {
      return;
    }

    const flowIdToUse = resolveFlowId(
      currentFlowId,
      urlParams.state,
      urlParams.flowId,
      storedFlowId,
    );

    if (!flowIdToUse || !signIn) {
      return;
    }

    oauthCodeProcessedRef.current = true;

    if (!currentFlowId) {
      setFlowId(flowIdToUse);
    }
    const submitPayload: EmbeddedSignInFlowRequestV2 = {
      flowId: flowIdToUse,
      inputs: {
        code: urlParams.code,
        ...(urlParams.nonce && { nonce: urlParams.nonce }),
      },
    };

    handleSubmit(submitPayload).catch((error) => {
      console.error('[SignIn] OAuth callback submission failed:', error);
      cleanupOAuthUrlParams(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlowInitialized, currentFlowId, isInitialized, isLoading, isSubmitting, signIn]);

  if (children) {
    const renderProps: SignInRenderProps = {
      initialize: initializeFlow,
      onSubmit: handleSubmit,
      isLoading: isLoading || isSubmitting || !isInitialized,
      isInitialized: isFlowInitialized,
      components,
      error: flowError,
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
      className={className}
      size={size}
      variant={variant}
    />
  );
};

export default SignIn;
