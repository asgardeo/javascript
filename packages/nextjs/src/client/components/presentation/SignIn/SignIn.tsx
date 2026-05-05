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

'use client';

import {
  AsgardeoRuntimeError,
  EmbeddedFlowExecuteRequestConfig,
  EmbeddedSignInFlowHandleRequestPayload,
  EmbeddedSignInFlowHandleResponse,
  EmbeddedSignInFlowInitiateResponse,
  Platform,
} from '@asgardeo/node';
import {BaseSignIn, BaseSignInProps, SignInV2, SignInRenderProps} from '@asgardeo/react';
import {FC, ReactElement} from 'react';
import useAsgardeo from '../../../contexts/Asgardeo/useAsgardeo';

/**
 * Props for the SignIn component.
 * Extends BaseSignInProps for full compatibility with the React BaseSignIn component
 */
export type SignInProps = Pick<BaseSignInProps, 'className' | 'onSuccess' | 'onError' | 'variant' | 'size'> & {
  /**
   * Render function for custom UI (render props pattern).
   */
  children?: (props: SignInRenderProps) => ReactElement;
  /**
   * Component-level preferences to override global i18n and theme settings.
   */
  preferences?: any;
};

/**
 * A SignIn component for Next.js that provides native authentication flow.
 * This component delegates to the BaseSignIn from @asgardeo/react and requires
 * the API functions to be provided as props.
 *
 * @remarks This component requires the authentication API functions to be provided
 * as props. For a complete working example, you'll need to implement the server-side
 * authentication endpoints or use the traditional OAuth flow with SignInButton.
 *
 * @example
 * ```tsx
 * import { SignIn } from '@asgardeo/nextjs';
 * import { executeEmbeddedSignInFlow } from '@asgardeo/browser';
 *
 * const LoginPage = () => {
 *   const handleInitialize = async () => {
 *     return await executeEmbeddedSignInFlow({
 *       response_mode: 'direct',
 *     });
 *   };
 *
 *   const handleSubmit = async (flow) => {
 *     return await executeEmbeddedSignInFlow({ flow });
 *   };
 *
 *   return (
 *     <SignIn
 *       onInitialize={handleInitialize}
 *       onSubmit={handleSubmit}
 *       onSuccess={(authData) => {
 *         console.log('Authentication successful:', authData);
 *       }}
 *       onError={(error) => {
 *         console.error('Authentication failed:', error);
 *       }}
 *       size="medium"
 *       variant="outlined"
 *       afterSignInUrl="/dashboard"
 *     />
 *   );
 * };
 * ```
 */
const SignIn: FC<SignInProps> = ({className, size = 'medium', variant = 'outlined', children, preferences, ...rest}: SignInProps) => {
  const {signIn, afterSignInUrl, platform} = useAsgardeo();

  const handleInitialize = async (): Promise<EmbeddedSignInFlowInitiateResponse> =>
    signIn &&
    (await signIn({
      flowId: '',
      selectedAuthenticator: {
        authenticatorId: '',
        params: {},
      },
    }));

  const handleOnSubmit = async (
    payload: EmbeddedSignInFlowHandleRequestPayload,
    request: EmbeddedFlowExecuteRequestConfig,
  ): Promise<EmbeddedSignInFlowHandleResponse> => {
    if (!signIn) {
      throw new AsgardeoRuntimeError(
        '`signIn` function is not available.',
        'SignIn-handleOnSubmit-RuntimeError-001',
        'nextjs',
      );
    }

    return (await signIn(payload, request)) as Promise<EmbeddedSignInFlowHandleResponse>;
  };

  if (platform === Platform.AsgardeoV2) {
    return (
      <SignInV2
        className={className}
        size={size}
        variant={variant}
        onSuccess={rest.onSuccess}
        onError={rest.onError}
        preferences={preferences}
      >
        {children}
      </SignInV2>
    );
  }

  return (
    <BaseSignIn
      // isLoading={isLoading || !isInitialized}
      afterSignInUrl={afterSignInUrl}
      onInitialize={handleInitialize}
      onSubmit={handleOnSubmit}
      className={className}
      size={size}
      variant={variant}
      preferences={preferences}
      {...rest}
    />
  );
};

SignIn.displayName = 'SignIn';

export default SignIn;
