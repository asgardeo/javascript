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

import {EmbeddedSignInFlowAuthenticator, EmbeddedSignInFlowAuthenticatorParamType} from '@asgardeo/browser';

/**
 * Interface for form field state.
 */
export interface FormField {
  param: string;
  type: EmbeddedSignInFlowAuthenticatorParamType;
  displayName: string;
  confidential: boolean;
  required: boolean;
  value: string;
}

/**
 * Base props that all authenticator components share.
 */
export interface BaseAuthenticatorProps {
  /**
   * The authenticator configuration.
   */
  authenticator: EmbeddedSignInFlowAuthenticator;

  /**
   * Current form values.
   */
  formValues: Record<string, string>;

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
   * Callback function called when the authenticator is submitted.
   */
  onSubmit: (authenticator: EmbeddedSignInFlowAuthenticator, formData?: Record<string, string>) => void;

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
 * Props for authenticator selector component.
 */
export interface AuthenticatorSelectorProps {
  /**
   * Available authenticators for selection.
   */
  authenticators: EmbeddedSignInFlowAuthenticator[];

  /**
   * Current form values.
   */
  formValues: Record<string, string>;

  /**
   * Whether the component is in loading state.
   */
  isLoading: boolean;

  /**
   * Error message to display.
   */
  error?: string | null;

  /**
   * Messages to display to the user.
   */
  messages: Array<{type: string; message: string}>;

  /**
   * Callback function called when input values change.
   */
  onInputChange: (param: string, value: string) => void;

  /**
   * Callback function called when an authenticator is selected.
   */
  onAuthenticatorSelection: (authenticator: EmbeddedSignInFlowAuthenticator, formData?: Record<string, string>) => void;

  /**
   * Custom CSS class names.
   */
  inputClassName?: string;
  buttonClassName?: string;
  errorClassName?: string;
  messageClassName?: string;

  /**
   * Text for the submit button.
   */
  submitButtonText?: string;
}

/**
 * Style configuration for authenticators.
 */
export interface AuthenticatorStyle {
  variant: 'solid' | 'outline';
  color: string;
}
