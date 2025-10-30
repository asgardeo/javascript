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
  EmbeddedFlowResponseType,
  EmbeddedFlowType,
} from '@asgardeo/browser';
import {FC} from 'react';
import BaseSignUp, {BaseSignUpProps} from './BaseSignUp';
import useAsgardeo from '../../../contexts/Asgardeo/useAsgardeo';

/**
 * Props for the SignUp component.
 */
export type SignUpProps = BaseSignUpProps;

/**
 * A styled SignUp component that provides embedded sign-up flow with pre-built styling.
 * This component handles the API calls for sign-up and delegates UI logic to BaseSignUp.
 *
 * @example
 * ```tsx
 * import { SignUp } from '@asgardeo/react';
 *
 * const App = () => {
 *   return (
 *     <SignUp
 *       onSuccess={(response) => {
 *         console.log('Sign-up successful:', response);
 *         // Handle successful sign-up (e.g., redirect, show confirmation)
 *       }}
 *       onError={(error) => {
 *         console.error('Sign-up failed:', error);
 *       }}
 *       onComplete={(redirectUrl) => {
 *         // Platform-specific redirect handling (e.g., Next.js router.push)
 *         router.push(redirectUrl); // or window.location.href = redirectUrl
 *       }}
 *       size="medium"
 *       variant="outlined"
 *       afterSignUpUrl="/welcome"
 *     />
 *   );
 * };
 * ```
 */
const SignUp: FC<SignUpProps> = ({
  className,
  size = 'medium',
  afterSignUpUrl,
  onError,
  onComplete,
  shouldRedirectAfterSignUp = true,
  ...rest
}) => {
  const {signUp, isInitialized} = useAsgardeo();

  /**
   * Initialize the sign-up flow.
   */
  const handleInitialize = async (payload?: EmbeddedFlowExecuteRequestPayload): Promise<EmbeddedFlowExecuteResponse> =>
    await signUp(
      payload || {
        flowType: EmbeddedFlowType.Registration,
      },
    ) as EmbeddedFlowExecuteResponse;

  /**
   * Handle sign-up steps.
   */
  const handleOnSubmit = async (payload: EmbeddedFlowExecuteRequestPayload): Promise<EmbeddedFlowExecuteResponse> =>
    await signUp(payload) as EmbeddedFlowExecuteResponse;

  /**
   * Handle successful sign-up and redirect.
   */
  const handleComplete = (response: EmbeddedFlowExecuteResponse) => {
    onComplete?.(response);

    // For non-redirection responses (regular sign-up completion), handle redirect if configured
    if (shouldRedirectAfterSignUp && response?.type !== EmbeddedFlowResponseType.Redirection && afterSignUpUrl) {
      window.location.href = afterSignUpUrl;
    }

    // For redirection responses (social sign-up), they are handled by BaseSignUp's popup mechanism
    // and we only redirect after the OAuth flow is complete if shouldRedirectAfterSignUp is true
    if (
      shouldRedirectAfterSignUp &&
      response?.type === EmbeddedFlowResponseType.Redirection &&
      response?.data?.redirectURL &&
      !response.data.redirectURL.includes('oauth') && // Not a social provider redirect
      !response.data.redirectURL.includes('auth') // Not an auth provider redirect
    ) {
      window.location.href = response.data.redirectURL;
    }
  };

  return (
    <BaseSignUp
      afterSignUpUrl={afterSignUpUrl}
      onInitialize={handleInitialize}
      onSubmit={handleOnSubmit}
      onError={onError}
      onComplete={handleComplete}
      className={className}
      size={size}
      isInitialized={isInitialized}
      {...rest}
    />
  );
};

export default SignUp;
