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

import type {BrandingPreference, I18nPreferences, Organization, User, UserProfile} from '@asgardeo/node';
import type {JWTPayload} from 'jose';

/**
 * Configuration for the Asgardeo Nuxt module.
 */
export interface AsgardeoNuxtConfig {
  /** URL to redirect to after sign-in (default: '/') */
  afterSignInUrl?: string;
  /** URL to redirect to after sign-out (default: '/') */
  afterSignOutUrl?: string;
  /**
   * Asgardeo application id (`spId`) — appended to the redirect-based sign-up
   * URL when present. Mirrors `applicationId` in the React/Next.js SDKs.
   */
  applicationId?: string;
  /** Base URL of the Asgardeo org tenant (e.g. https://api.asgardeo.io/t/your_org) */
  baseUrl?: string;
  /** OAuth2 Client ID */
  clientId?: string;
  /** OAuth2 Client Secret (server-only, use ASGARDEO_CLIENT_SECRET env var) */
  clientSecret?: string;
  /**
   * Feature-gating preferences that control which server-side data fetches
   * the Nitro plugin performs on every SSR request.
   */
  preferences?: {
    /** i18n configuration forwarded to `I18nProvider`. */
    i18n?: I18nPreferences;
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
    user?: {
      /** Whether to fetch the user's organisations during SSR (default: true). */
      fetchOrganizations?: boolean;
      /** Whether to fetch the SCIM2 user profile during SSR (default: true). */
      fetchUserProfile?: boolean;
    };
  };
  /** OAuth2 scopes to request */
  scopes?: string[];
  /** Secret for signing session JWTs (use ASGARDEO_SESSION_SECRET env var) */
  sessionSecret?: string;
  /**
   * Optional override for the redirect-based sign-in URL. Reserved for
   * parity with the React/Next.js SDKs; not currently used by the redirect
   * flow (which goes through `/api/auth/signin`).
   */
  signInUrl?: string;
  /**
   * Optional override for the redirect-based sign-up URL. When set,
   * `<AsgardeoSignUpButton>` and `useAsgardeo().signUp()` (no-arg) navigate
   * here instead of deriving the URL from `baseUrl`/`clientId`.
   */
  signUpUrl?: string;
}

/**
 * Payload stored in the session JWT cookie.
 */
export interface AsgardeoSessionPayload extends JWTPayload {
  accessToken: string;
  /** Unix timestamp (seconds) when the access token expires. Used for proactive refresh. */
  accessTokenExpiresAt?: number;
  exp: number;
  iat: number;
  /** Raw ID token string (for userinfo derivation without in-memory store). */
  idToken?: string;
  organizationId?: string;
  /** Refresh token for obtaining new access tokens without re-authentication. */
  refreshToken?: string;
  scopes: string;
  sessionId: string;
  sub: string;
}

/**
 * Payload stored in the temporary session JWT cookie (during OAuth flow).
 */
export interface AsgardeoTempSessionPayload extends JWTPayload {
  /** URL to redirect to after successful sign-in */
  returnTo?: string;
  sessionId: string;
  type: 'temp';
}

/**
 * Full SSR payload resolved by the Nitro plugin on each page request.
 * Written to `event.context.asgardeo.ssr` and subsequently seeded into
 * hydrated `useState` keys so the client never re-fetches on first render.
 */
export interface AsgardeoSSRData {
  /** Branding preference fetched from Asgardeo (null when `preferences.theme.inheritFromBranding` is false). */
  brandingPreference: BrandingPreference | null;
  /** The organisation the user is currently acting within (null when not in an org). */
  currentOrganization: Organization | null;
  isSignedIn: boolean;
  /** All organisations the user is a member of (empty array when `preferences.user.fetchOrganizations` is false). */
  myOrganizations: Organization[];
  /**
   * The base URL actually used for this request.
   * Equals `${baseUrl}/o` when the user is acting within an organisation
   * (derived from the `user_org` claim in the ID token), otherwise equals
   * the configured `baseUrl`.
   */
  resolvedBaseUrl: string | null;
  session: AsgardeoSessionPayload | null;
  user: User | null;
  /** Flattened SCIM2 profile + raw profile + schemas (null when `preferences.user.fetchUserProfile` is false). */
  userProfile: UserProfile | null;
}

/**
 * Auth state hydrated from server to client via useState.
 */
export interface AsgardeoAuthState {
  isLoading: boolean;
  isSignedIn: boolean;
  user: User | null;
}
