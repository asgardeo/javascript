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

import {FC, useEffect, useRef} from 'react';

/**
 * Props for BaseCallback component
 */
export interface BaseCallbackProps {
  /**
   * Function to navigate to a different path
   */
  onNavigate: (path: string) => void;

  /**
   * Callback function called when an error occurs
   */
  onError?: (error: Error) => void;
}

/**
 * BaseCallback is a headless component that handles OAuth callback parameter forwarding.
 * This component extracts OAuth parameters (code, state, error) from the URL and forwards them
 * to the original component that initiated the OAuth flow.
 *
 * This component is framework-agnostic and should be wrapped by framework-specific
 * implementations that provide navigation functions.
 *
 * Flow: Extract OAuth parameters from URL -> Parse state parameter -> Redirect to original path with parameters
 *
 * The original component (SignIn/AcceptInvite) is responsible for:
 * - Processing the OAuth code via the SDK
 * - Calling /flow/execute
 * - Handling the assertion and auth/callback POST
 * - Managing the authenticated session
 */
export const BaseCallback: FC<BaseCallbackProps> = ({
  onNavigate,
  onError,
}) => {
  // Prevent double execution in React Strict Mode
  const processingRef = useRef(false);

  useEffect(() => {
    const processOAuthCallback = (): void => {
      // Guard against double execution
      if (processingRef.current) {
        return;
      }
      processingRef.current = true;

      // Declare variables outside try block for use in catch
      var returnPath = '/';

      try {
        // Extract OAuth parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const nonce = urlParams.get('nonce');
        const oauthError = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // Validate and retrieve OAuth state from sessionStorage
        if (!state) {
          throw new Error('Missing OAuth state parameter - possible security issue');
        }

        const storedData = sessionStorage.getItem(`asgardeo_oauth_${state}`);
        if (!storedData) {
          // If state not found, might be an error callback - try to handle gracefully
          if (oauthError) {
            const errorMsg = errorDescription || oauthError || 'OAuth authentication failed';
            const err = new Error(errorMsg);
            onError?.(err);

            const params = new URLSearchParams();
            params.set('error', oauthError);
            if (errorDescription) {
              params.set('error_description', errorDescription);
            }

            onNavigate(`/?${params.toString()}`);
            return;
          }
          throw new Error('Invalid OAuth state - possible CSRF attack');
        }

        const {path, timestamp} = JSON.parse(storedData);
        returnPath = path || '/';

        // Validate state freshness
        const MAX_STATE_AGE = 600000; // 10 minutes
        if (Date.now() - timestamp > MAX_STATE_AGE) {
          sessionStorage.removeItem(`asgardeo_oauth_${state}`);
          throw new Error('OAuth state expired - please try again');
        }

        // Clean up state
        sessionStorage.removeItem(`asgardeo_oauth_${state}`);

        // Handle OAuth error response
        if (oauthError) {
          const errorMsg = errorDescription || oauthError || 'OAuth authentication failed';
          const err = new Error(errorMsg);
          onError?.(err);

          const params = new URLSearchParams();
          params.set('error', oauthError);
          if (errorDescription) {
            params.set('error_description', errorDescription);
          }

          onNavigate(`${returnPath}?${params.toString()}`);
          return;
        }

        // Validate required parameters
        if (!code) {
          throw new Error('Missing OAuth authorization code');
        }

        // Forward OAuth code to original component
        // The component (SignIn/AcceptInvite) will retrieve flowId/authId from sessionStorage
        const params = new URLSearchParams();
        params.set('code', code);
        if (nonce) {
          params.set('nonce', nonce);
        }

        onNavigate(`${returnPath}?${params.toString()}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'OAuth callback processing failed';
        console.error('OAuth callback error:', err);

        onError?.(err instanceof Error ? err : new Error(errorMessage));

        // Redirect back with OAuth error format
        const params = new URLSearchParams();
        params.set('error', 'callback_error');
        params.set('error_description', errorMessage);

        onNavigate(`${returnPath}?${params.toString()}`);
      }
    };

    processOAuthCallback();
  }, [onNavigate, onError]);

  // Headless component - no UI, just processing logic
  return null;
};

export default BaseCallback;
