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

import {useEffect, useRef, type RefObject} from 'react';

export interface UseOAuthCallbackOptions {
  /**
   * Function to submit OAuth code to the server
   */
  onSubmit: (payload: OAuthCallbackPayload) => Promise<any>;

  /**
   * Callback when OAuth flow completes successfully
   */
  onComplete?: () => void;

  /**
   * Callback when OAuth flow encounters an error
   */
  onError?: (error: any) => void;

  /**
   * Current flowId from component state
   */
  currentFlowId: string | null;

  /**
   * SessionStorage key for flowId (defaults to 'asgardeo_flow_id')
   */
  flowIdStorageKey?: string;

  /**
   * Whether the component is initialized and ready to process OAuth callback
   */
  isInitialized: boolean;

  /**
   * Whether a submission is currently in progress
   */
  isSubmitting?: boolean;

  /**
   * Function to handle flow response after submission
   */
  onFlowChange?: (response: any) => void;

  /**
   * Additional handler for setting state (e.g., setFlowId)
   */
  setFlowId?: (flowId: string) => void;

  /**
   * Ref to mark that token validation was attempted (prevents duplicate validation)
   * Used in AcceptInvite to coordinate between OAuth callback and token validation
   */
  tokenValidationAttemptedRef?: RefObject<boolean>;

  /**
   * Callback to set loading state at the start of OAuth processing
   */
  onProcessingStart?: () => void;

  /**
   * Optional external ref to track processed state. If provided, the component
   * manages the ref (allowing resets on flow clear/retry). Otherwise hook manages internally.
   */
  processedRef?: RefObject<boolean>;
}

export interface OAuthCallbackPayload {
  flowId: string;
  inputs: {
    code: string;
    nonce?: string;
  };
}

/**
 * Processes OAuth callbacks by detecting auth code in URL, resolving flowId, and submitting to server.
 * Used by SignIn, SignUp, and AcceptInvite components.
 */
export function useOAuthCallback({
  onSubmit,
  onComplete,
  onError,
  currentFlowId,
  flowIdStorageKey = 'asgardeo_flow_id',
  isInitialized,
  isSubmitting = false,
  onFlowChange,
  setFlowId,
  tokenValidationAttemptedRef,
  onProcessingStart,
  processedRef,
}: UseOAuthCallbackOptions): void {
  const internalRef = useRef(false);
  const oauthCodeProcessedRef = processedRef ?? internalRef;

  useEffect(() => {
    if (!isInitialized || isSubmitting) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const nonce = urlParams.get('nonce');
    const state = urlParams.get('state');
    const flowIdFromUrl = urlParams.get('flowId');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (error) {
      oauthCodeProcessedRef.current = true;
      if (tokenValidationAttemptedRef) {
        tokenValidationAttemptedRef.current = true;
      }
      onError?.(new Error(errorDescription || error || 'OAuth authentication failed'));
      cleanupUrlParams();
      return;
    }

    if (!code || oauthCodeProcessedRef.current) {
      return;
    }

    if (tokenValidationAttemptedRef?.current) {
      return;
    }

    const storedFlowId = sessionStorage.getItem(flowIdStorageKey);
    const flowIdToUse = currentFlowId || storedFlowId || flowIdFromUrl || state || null;

    if (!flowIdToUse) {
      oauthCodeProcessedRef.current = true;
      onError?.(new Error('Invalid flow. Missing flowId.'));
      cleanupUrlParams();
      return;
    }

    oauthCodeProcessedRef.current = true;

    if (tokenValidationAttemptedRef) {
      tokenValidationAttemptedRef.current = true;
    }

    onProcessingStart?.();

    if (!currentFlowId && setFlowId) {
      setFlowId(flowIdToUse);
    }

    (async () => {
      try {
        const payload: OAuthCallbackPayload = {
          flowId: flowIdToUse,
          inputs: {
            code,
            ...(nonce && {nonce}),
          },
        };

        const response = await onSubmit(payload);

        onFlowChange?.(response);

        if (response?.flowStatus === 'COMPLETE' || response?.status === 'COMPLETE') {
          onComplete?.();
        }

        if (response?.flowStatus === 'ERROR' || response?.status === 'ERROR') {
          onError?.(response);
        }

        cleanupUrlParams();
      } catch (err) {
        onError?.(err);
        cleanupUrlParams();
      }
    })();
  }, [
    isInitialized,
    currentFlowId,
    isSubmitting,
    onSubmit,
    onComplete,
    onError,
    onFlowChange,
    setFlowId,
    flowIdStorageKey,
  ]);
}

function cleanupUrlParams(): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('nonce');
  url.searchParams.delete('state');
  url.searchParams.delete('error');
  url.searchParams.delete('error_description');

  window.history.replaceState({}, '', url.toString());
}
