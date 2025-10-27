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
  EmbeddedSignInFlowAuthenticatorKnownIdPType,
  ApplicationNativeAuthenticationConstants,
  WithPreferences,
} from '@asgardeo/browser';
import {ReactElement} from 'react';
import UsernamePassword from './UsernamePassword';
import IdentifierFirst from './IdentifierFirst';
import GoogleButton from '../../../../adapters/GoogleButton';
import GitHubButton from '../../../../adapters/GitHubButton';
import MicrosoftButton from '../../../../adapters/MicrosoftButton';
import FacebookButton from '../../../../adapters/FacebookButton';
import LinkedInButton from '../../../../adapters/LinkedInButton';
import SignInWithEthereumButton from '../../../../adapters/SignInWithEthereumButton';
import EmailOtp from './EmailOtp';
import Totp from './Totp';
import SmsOtp from './SmsOtp';
import SocialButton from './SocialButton';
import MultiOptionButton from './MultiOptionButton';

/**
 * Base props that all sign-in option components share.
 */
export interface BaseSignInOptionProps extends WithPreferences {
  /**
   * The authenticator configuration.
   */
  authenticator?: EmbeddedSignInFlowAuthenticator;

  /**
   * Current form values.
   */
  formValues: Record<string, string>;

  /**
   * Touched state for form fields.
   */
  touchedFields: Record<string, boolean>;

  /**
   * Whether the component is in loading state.
   */
  isLoading: boolean;

  /**
   * Error message to display.
   */
  error?: string | null;

  /**
   * Callback function called when input values change.
   */
  onInputChange: (param: string, value: string) => void;

  /**
   * Callback function called when the option is submitted.
   */
  onSubmit?: (authenticator: EmbeddedSignInFlowAuthenticator, formData?: Record<string, string>) => void;

  /**
   * Custom CSS class name for form inputs.
   */
  inputClassName?: string;

  /**
   * Custom CSS class name for the submit button.
   */
  buttonClassName?: string;

  /**
   * Text for the submit button.
   */
  submitButtonText?: string;
}

/**
 * Creates the appropriate sign-in option component based on the authenticator's ID.
 */
export const createSignInOption = ({
  authenticator,
  onSubmit,
  buttonClassName,
  preferences,
  ...rest
}: BaseSignInOptionProps): ReactElement => {
  // Check if this authenticator has params (indicating it needs user input)
  const hasParams = authenticator.metadata?.params && authenticator.metadata.params.length > 0;

  // Use authenticatorId to determine the component type
  switch (authenticator.authenticatorId) {
    case ApplicationNativeAuthenticationConstants.SupportedAuthenticators.UsernamePassword:
      return <UsernamePassword authenticator={authenticator} preferences={preferences} onSubmit={onSubmit} {...rest} />;

    case ApplicationNativeAuthenticationConstants.SupportedAuthenticators.IdentifierFirst:
      return <IdentifierFirst authenticator={authenticator} preferences={preferences} onSubmit={onSubmit} {...rest} />;

    case ApplicationNativeAuthenticationConstants.SupportedAuthenticators.Google:
      return (
        <GoogleButton
          className={buttonClassName}
          onClick={() => onSubmit(authenticator)}
          preferences={preferences}
          {...rest}
        />
      );

    case ApplicationNativeAuthenticationConstants.SupportedAuthenticators.GitHub:
      return (
        <GitHubButton
          preferences={preferences}
          className={buttonClassName}
          onClick={() => onSubmit(authenticator)}
          {...rest}
        />
      );

    case ApplicationNativeAuthenticationConstants.SupportedAuthenticators.Microsoft:
      return (
        <MicrosoftButton
          preferences={preferences}
          className={buttonClassName}
          onClick={() => onSubmit(authenticator)}
          {...rest}
        />
      );

    case ApplicationNativeAuthenticationConstants.SupportedAuthenticators.Facebook:
      return (
        <FacebookButton
          preferences={preferences}
          className={buttonClassName}
          onClick={() => onSubmit(authenticator)}
          {...rest}
        />
      );

    case ApplicationNativeAuthenticationConstants.SupportedAuthenticators.LinkedIn:
      return (
        <LinkedInButton
          preferences={preferences}
          className={buttonClassName}
          onClick={() => onSubmit(authenticator)}
          {...rest}
        />
      );

    case ApplicationNativeAuthenticationConstants.SupportedAuthenticators.SignInWithEthereum:
      return (
        <SignInWithEthereumButton
          preferences={preferences}
          className={buttonClassName}
          onClick={() => onSubmit(authenticator)}
          {...rest}
        />
      );

    case ApplicationNativeAuthenticationConstants.SupportedAuthenticators.EmailOtp:
      // If it has params, render as input form, otherwise as selection button
      return hasParams ? (
        <EmailOtp authenticator={authenticator} preferences={preferences} onSubmit={onSubmit} {...rest} />
      ) : (
        <MultiOptionButton authenticator={authenticator} preferences={preferences} onSubmit={onSubmit} {...rest} />
      );

    case ApplicationNativeAuthenticationConstants.SupportedAuthenticators.Totp:
      // If it has params, render as input form, otherwise as selection button
      return hasParams ? (
        <Totp authenticator={authenticator} preferences={preferences} onSubmit={onSubmit} {...rest} />
      ) : (
        <MultiOptionButton authenticator={authenticator} preferences={preferences} onSubmit={onSubmit} {...rest} />
      );

    case ApplicationNativeAuthenticationConstants.SupportedAuthenticators.SmsOtp:
      // If it has params, render as input form, otherwise as selection button
      return hasParams ? (
        <SmsOtp authenticator={authenticator} preferences={preferences} onSubmit={onSubmit} {...rest} />
      ) : (
        <MultiOptionButton authenticator={authenticator} preferences={preferences} onSubmit={onSubmit} {...rest} />
      );

    default:
      // Check if it's a federated authenticator (non-LOCAL idp)
      if (authenticator.idp !== EmbeddedSignInFlowAuthenticatorKnownIdPType.Local) {
        // For unknown federated authenticators, use generic social login
        return (
          <SocialButton
            authenticator={authenticator}
            preferences={preferences}
            className={buttonClassName}
            onClick={() => onSubmit(authenticator)}
            {...rest}
          >
            {authenticator.idp}
          </SocialButton>
        );
      }

      // For LOCAL authenticators, decide based on whether they have params
      if (hasParams) {
        // Fallback to username/password for unknown local authenticators with params
        return (
          <UsernamePassword authenticator={authenticator} preferences={preferences} onSubmit={onSubmit} {...rest} />
        );
      } else {
        // Use multi-option button for LOCAL authenticators without params
        return (
          <MultiOptionButton authenticator={authenticator} preferences={preferences} onSubmit={onSubmit} {...rest} />
        );
      }
  }
};

/**
 * Convenience function that creates the appropriate sign-in option component from an authenticator.
 */
export const createSignInOptionFromAuthenticator = (
  authenticator: EmbeddedSignInFlowAuthenticator,
  formValues: Record<string, string>,
  touchedFields: Record<string, boolean>,
  isLoading: boolean,
  onInputChange: (param: string, value: string) => void,
  onSubmit: (authenticator: EmbeddedSignInFlowAuthenticator, formData?: Record<string, string>) => void,
  options?: {
    inputClassName?: string;
    buttonClassName?: string;
    error?: string | null;
  },
): ReactElement => {
  return createSignInOption({
    authenticator,
    formValues,
    touchedFields,
    isLoading,
    onInputChange,
    onSubmit,
    ...options,
  });
};
