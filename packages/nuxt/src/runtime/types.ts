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

import type {JWTPayload} from 'jose';
import type {BrandingPreference, I18nPreferences, Organization, User, UserProfile} from '@asgardeo/node';

/**
 * Configuration for the Asgardeo Nuxt module.
 */
export interface AsgardeoNuxtConfig {
  /** Base URL of the Asgardeo org tenant (e.g. https://api.asgardeo.io/t/your_org) */
  baseUrl?: string;
  /** OAuth2 Client ID */
  clientId?: string;
  /** OAuth2 Client Secret (server-only, use ASGARDEO_CLIENT_SECRET env var) */
  clientSecret?: string;
  /** Secret for signing session JWTs (use ASGARDEO_SESSION_SECRET env var) */
  sessionSecret?: string;
  /** OAuth2 scopes to request */
  scopes?: string[];
  /** URL to redirect to after sign-in (default: '/') */
  afterSignInUrl?: string;
  /** URL to redirect to after sign-out (default: '/') */
  afterSignOutUrl?: string;
  /**
   * Feature-gating preferences that control which server-side data fetches
   * the Nitro plugin performs on every SSR request.
   */
  preferences?: {
    user?: {
      /** Whether to fetch the SCIM2 user profile during SSR (default: true). */
      fetchUserProfile?: boolean;
      /** Whether to fetch the user's organisations during SSR (default: true). */
      fetchOrganizations?: boolean;
    };
    theme?: {
      /**
       * When true (default), the Nitro plugin fetches the branding preference
       * from Asgardeo and passes it to `BrandingProvider` / `ThemeProvider`.
       */
      inheritFromBranding?: boolean;
      /**
       * Theme mode forwarded to the Vue SDK's `ThemeProvider`.
       * - `'light'` (default) | `'dark'`: Fixed color scheme. Toggle at runtime with `useTheme().toggleTheme()`.
       * - `'system'`: Follows the OS `prefers-color-scheme`.
       * - `'class'`: Reads a CSS class on `<html>` (works well with Tailwind dark-mode).
       * - `'branding'`: Follows the active theme from the tenant's branding preference.
       */
      mode?: 'light' | 'dark' | 'system' | 'class' | 'branding';
    };
    /** i18n configuration forwarded to `I18nProvider`. */
    i18n?: I18nPreferences;
  };
}

/**
 * Payload stored in the session JWT cookie.
 */
export interface AsgardeoSessionPayload extends JWTPayload {
  sessionId: string;
  sub: string;
  accessToken: string;
  scopes: string;
  organizationId?: string;
  /** Unix timestamp (seconds) when the access token expires. Used for proactive refresh. */
  accessTokenExpiresAt?: number;
  /** Refresh token for obtaining new access tokens without re-authentication. */
  refreshToken?: string;
  /** Raw ID token string (for userinfo derivation without in-memory store). */
  idToken?: string;
  iat: number;
  exp: number;
}

/**
 * Payload stored in the temporary session JWT cookie (during OAuth flow).
 */
export interface AsgardeoTempSessionPayload extends JWTPayload {
  sessionId: string;
  type: 'temp';
  /** URL to redirect to after successful sign-in */
  returnTo?: string;
}

/**
 * Full SSR payload resolved by the Nitro plugin on each page request.
 * Written to `event.context.asgardeo.ssr` and subsequently seeded into
 * hydrated `useState` keys so the client never re-fetches on first render.
 */
export interface AsgardeoSSRData {
  isSignedIn: boolean;
  session: AsgardeoSessionPayload | null;
  user: User | null;
  /** Flattened SCIM2 profile + raw profile + schemas (null when `preferences.user.fetchUserProfile` is false). */
  userProfile: UserProfile | null;
  /** The organisation the user is currently acting within (null when not in an org). */
  currentOrganization: Organization | null;
  /** All organisations the user is a member of (empty array when `preferences.user.fetchOrganizations` is false). */
  myOrganizations: Organization[];
  /** Branding preference fetched from Asgardeo (null when `preferences.theme.inheritFromBranding` is false). */
  brandingPreference: BrandingPreference | null;
  /**
   * The base URL actually used for this request.
   * Equals `${baseUrl}/o` when the user is acting within an organisation
   * (derived from the `user_org` claim in the ID token), otherwise equals
   * the configured `baseUrl`.
   */
  resolvedBaseUrl: string | null;
}

/**
 * Auth state hydrated from server to client via useState.
 */
export interface AsgardeoAuthState {
  isSignedIn: boolean;
  user: User | null;
  isLoading: boolean;
}
