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

import {I18nBundle} from './i18n';
import {RecursivePartial} from './utility-types';
import {ThemeConfig, ThemeMode} from '../theme/types';

/**
 * Interface representing the additional parameters to be sent in the sign-in request.
 * This can include custom parameters that your authorization server supports.
 * These parameters will be included in the authorization request sent to the server.
 * If not provided, no additional parameters will be sent.
 *
 * @example
 * signInOptions: { prompt: "login", fidp: "OrganizationSSO" }
 */
export type SignInOptions = Record<string, any>;

/**
 * Interface representing the additional parameters to be sent in the sign-out request.
 * This can include custom parameters that your authorization server supports.
 * These parameters will be included in the sign-out request sent to the server.
 * If not provided, no additional parameters will be sent.
 *
 * @example
 * signOutOptions: { idTokenHint: "your-id-token-hint" }
 */
export type SignOutOptions = Record<string, unknown>;

/**
 * Interface representing the additional parameters to be sent in the sign-up request.
 * This can include custom parameters that your authorization server supports.
 * These parameters will be included in the sign-up request sent to the server.
 * If not provided, no additional parameters will be sent.
 *
 * @example
 * signUpOptions: { appId: "your-app-id" }
 */
export type SignUpOptions = Record<string, unknown>;

export interface BaseConfig<T = unknown> extends WithPreferences {
  /**
   * Optional URL where the authorization server should redirect after authentication.
   * This must match one of the allowed redirect URIs configured in your IdP.
   * If not provided, the framework layer will use the default redirect URL based on the application type.
   *
   * @example
   * For development: "http://localhost:3000/api/auth/callback"
   * For production: "https://your-app.com/api/auth/callback"
   */
  afterSignInUrl?: string | undefined;

  /**
   * Optional URL where the authorization server should redirect after sign out.
   * This must match one of the allowed post logout redirect URIs configured in your IdP
   * and is used to redirect the user after they have signed out.
   * If not provided, the framework layer will use the default sign out URL based on the
   *
   * @example
   * For development: "http://localhost:3000/api/auth/signout"
   * For production: "https://your-app.com/api/auth/signout"
   */
  afterSignOutUrl?: string | undefined;

  /**
   * Optional organization handle for the Organization in Asgardeo.
   * This is used to identify the organization in the Asgardeo identity server in cases like Branding, etc.
   * If not provided, the framework layer will try to use the `baseUrl` to determine the organization handle.
   * @remarks This is mandatory if a custom domain is configured for the Asgardeo organization.
   */
  organizationHandle?: string | undefined;

  /**
   * Optional UUID of the Asgardeo application.
   * This is used to identify the application in the Asgardeo identity server for Application Branding,
   * obtaining the access URL in the sign-up flow, etc.
   * If not provided, the framework layer will use the default application ID based on the application.
   */
  applicationId?: string | undefined;

  /**
   * The base URL of the Asgardeo identity server.
   * Example: "https://api.asgardeo.io/t/{org_name}"
   */
  baseUrl: string | undefined;

  /**
   * The client ID obtained from the Asgardeo application registration.
   * This is used to identify your application during authentication.
   */
  clientId: string | undefined;

  /**
   * Optional client secret for the application.
   * Only required when using confidential client flows.
   * Not recommended for public clients like browser applications.
   */
  clientSecret?: string | undefined;

  /**
   * The scopes to request during authentication.
   * Accepts either a space-separated string or an array of strings.
   *
   * These define what access the token should grant (e.g., openid, profile, email).
   * If not provided, defaults to `["openid"]`.
   *
   * @example
   * scopes: "openid profile email"
   * @example
   * scopes: ["openid", "profile", "email"]
   */
  scopes?: string | string[] | undefined;

  /**
   * Optional URL to redirect the user to sign-in.
   * By default, this will be the sign-in page of Asgardeo.
   * If you want to use a custom sign-in page, you can provide the URL here and use the `SignIn` component to render it.
   */
  signInUrl?: string | undefined;

  /**
   * Optional URL to redirect the user to sign-up.
   * By default, this will be the sign-up page of Asgardeo.
   * If you want to use a custom sign-up page, you can provide the URL here
   * and use the `SignUp` component to render it.
   */
  signUpUrl?: string | undefined;

  /**
   * Token validation configuration.
   * This allows you to configure how the SDK validates tokens received from the authorization server.
   * It includes options for ID token validation, such as whether to validate the token,
   * whether to validate the issuer, and the allowed clock tolerance for token validation.
   * If not provided, the SDK will use default validation settings.
   */
  tokenValidation?: {
    /**
     * ID token validation config.
     */
    idToken?: {
      /**
       * Whether to validate ID tokens.
       */
      validate?: boolean;
      /**
       * Whether to validate the issuer of ID tokens.
       */
      validateIssuer?: boolean;
      /**
       * Allowed leeway for ID tokens (in seconds).
       */
      clockTolerance?: number;
    };
  };

  /**
   * Optional additional parameters to be sent in the authorize request.
   * @see {@link SignInOptions} for more details.
   */
  signInOptions?: SignInOptions;

  /**
   * Optional additional parameters to be sent in the sign-out request.
   * @see {@link SignOutOptions} for more details.
   */
  signOutOptions?: SignOutOptions;

  /**
   * Optional additional parameters to be sent in the sign-up request.
   * @see {@link SignUpOptions} for more details.
   */
  signUpOptions?: SignUpOptions;

  /**
   * Flag to indicate whether the Application session should be synchronized with the IdP session.
   * @remarks This uses the OIDC iframe base session management feature to keep the application session in sync with the IdP session.
   * WARNING: This may not work in all browsers due to 3rd party cookie restrictions.
   * It is recommended to use this feature only if you are aware of the implications and have tested it in your target browsers.
   * If you are not sure, it is safer to leave this option as `false`.
   * @example
   * syncSession: true
   * @see {@link https://openid.net/specs/openid-connect-session-management-1_0.html#IframeBasedSessionManagement}
   */
  syncSession?: boolean;
}

export interface WithPreferences {
  /**
   * Preferences for customizing the Asgardeo UI components
   */
  preferences?: Preferences;
}

export type Config<T = unknown> = BaseConfig<T>;

export interface ThemePreferences {
  /**
   * Inherit from Branding from WSO2 Identity Server or Asgardeo.
   */
  inheritFromBranding?: boolean;
  /**
   * The theme mode to use. Defaults to 'system'.
   */
  mode?: ThemeMode;
  /**
   * Theme overrides to customize the default theme
   */
  overrides?: RecursivePartial<ThemeConfig>;
}

export interface I18nPreferences {
  /**
   * Custom translations to override default ones.
   */
  bundles?: {
    [key: string]: I18nBundle;
  };
  /**
   * The fallback language to use if translations are not available in the specified language.
   * Defaults to 'en-US'.
   */
  fallbackLanguage?: string;
  /**
   * The language to use for translations.
   * Defaults to the browser's default language.
   */
  language?: string;
}

export interface Preferences {
  /**
   * Internationalization preferences for the Asgardeo UI components
   */
  i18n?: I18nPreferences;
  /**
   * Theme preferences for the Asgardeo UI components
   */
  theme?: ThemePreferences;
}
