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
  AsgardeoNodeClient,
  LegacyAsgardeoNodeClient,
  type AuthClientConfig,
  type IdToken,
  type Organization,
  type OrganizationDetails,
  type CreateOrganizationPayload,
  type Storage,
  type TokenExchangeRequestConfig,
  type TokenResponse,
  type User,
  type UserProfile,
  type UpdateMeProfileConfig,
  type AllOrganizationsApiResponse,
  getBrandingPreference,
  getMeOrganizations,
  getAllOrganizations,
  createOrganization,
  getOrganization,
  getScim2Me,
  getSchemas,
  flattenUserSchema,
  generateFlattenedUserProfile,
  updateMeProfile,
  type GetBrandingPreferenceConfig,
  type BrandingPreference,
} from '@asgardeo/node';
import type {AsgardeoNuxtConfig, AsgardeoSessionPayload} from '../types';

/**
 * Singleton Asgardeo client for Nuxt applications.
 *
 * Mirrors the {@link AsgardeoNextClient} pattern: a single shared instance per
 * server process that delegates OAuth/OIDC operations to an internal
 * {@link LegacyAsgardeoNodeClient}. The legacy client provisions its own default
 * in-memory store (`MemoryCacheStore`) for PKCE state and tokens so that state
 * persists across the sign-in → callback boundary.
 *
 * Consumers call {@link getInstance} directly from server routes and plugins —
 * there is no per-request wrapper factory. Initialization happens once per
 * process (guarded by {@link isInitialized}) from the `asgardeo-init` Nitro
 * plugin on the first request.
 *
 * @example
 * ```ts
 * // In a Nitro API route:
 * export default defineEventHandler(async (event) => {
 *   const client = AsgardeoNuxtClient.getInstance();
 *   return client.getUser(sessionId);
 * });
 * ```
 */
class AsgardeoNuxtClient extends AsgardeoNodeClient<AsgardeoNuxtConfig> {
  private static instance: AsgardeoNuxtClient;

  private legacy: LegacyAsgardeoNodeClient<AsgardeoNuxtConfig>;

  public isInitialized: boolean = false;

  private constructor() {
    super();
    this.legacy = new LegacyAsgardeoNodeClient<AsgardeoNuxtConfig>();
  }

  /**
   * Get the singleton instance of AsgardeoNuxtClient.
   */
  public static getInstance(): AsgardeoNuxtClient {
    if (!AsgardeoNuxtClient.instance) {
      AsgardeoNuxtClient.instance = new AsgardeoNuxtClient();
    }
    return AsgardeoNuxtClient.instance;
  }

  /**
   * Initializes the underlying legacy client with OAuth/OIDC settings derived
   * from the Nuxt module config. Idempotent — repeated calls are no-ops after
   * the first successful initialization.
   */
  override async initialize(config: AsgardeoNuxtConfig, storage?: Storage): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    const authConfig: AuthClientConfig<AsgardeoNuxtConfig> = {
      baseUrl: config.baseUrl as string,
      clientId: config.clientId as string,
      clientSecret: config.clientSecret || undefined,
      afterSignInUrl: config.afterSignInUrl as string,
      afterSignOutUrl: config.afterSignOutUrl || '/',
      scopes: config.scopes || ['openid', 'profile'],
      enablePKCE: true,
    } as AuthClientConfig<AsgardeoNuxtConfig>;

    const result = await this.legacy.initialize(authConfig, storage);
    this.isInitialized = true;
    return result;
  }

  override async reInitialize(config: Partial<AsgardeoNuxtConfig>): Promise<boolean> {
    await this.legacy.reInitialize(config as any);
    return true;
  }

  /**
   * Seeds the legacy in-memory token store from a verified session JWT payload.
   *
   * The signed session cookie is the source of truth for tokens in this SDK — it
   * survives server restarts and new worker processes. The underlying
   * {@link LegacyAsgardeoNodeClient}, however, keeps tokens in a
   * {@link MemoryCacheStore} keyed by `sessionId`, and its
   * `getAccessToken` / `getUser` / `getDecodedIdToken` / `signOut` paths all
   * read from that store. Without rehydration, those calls fail whenever the
   * in-memory store and the cookie diverge (the classic case: `nuxi dev`
   * restart while the browser still holds a valid session cookie).
   *
   * Writes the snake_case token shape the legacy helper expects
   * (see `AuthenticationHelper.processTokenResponse`). Safe to call on every
   * request — it's an in-memory write and the cookie always reflects the
   * freshest tokens (the refresh path re-issues the cookie too).
   */
  async rehydrateSessionFromPayload(session: AsgardeoSessionPayload): Promise<void> {
    if (!this.isInitialized || !session?.sessionId || !session?.accessToken) {
      return;
    }

    const storageManager = await this.legacy.getStorageManager();
    const iatSeconds: number = typeof session.iat === 'number' ? session.iat : Math.floor(Date.now() / 1000);
    const expiresInSeconds: number =
      typeof session.accessTokenExpiresAt === 'number'
        ? Math.max(0, session.accessTokenExpiresAt - iatSeconds)
        : 3600;

    await storageManager.setSessionData(
      {
        access_token: session.accessToken,
        id_token: session.idToken ?? '',
        refresh_token: session.refreshToken ?? '',
        scope: session.scopes ?? '',
        expires_in: String(expiresInSeconds || 3600),
        token_type: 'Bearer',
        session_state: '',
        created_at: iatSeconds * 1000,
      },
      session.sessionId,
    );
  }

  /**
   * Initiates the authorization code flow or exchanges a code for tokens.
   *
   * Legacy call signature (used by the Nuxt route handlers):
   * ```
   * signIn(authURLCallback, sessionId, code?, sessionState?, state?, config?)
   * ```
   */
  override signIn(...args: any[]): Promise<any> {
    return this.legacy.signIn(args[0], args[1], args[2], args[3], args[4], args[5]);
  }

  /**
   * Clears the session and returns the RP-Initiated Logout URL.
   * Accepts either `(sessionId: string)` or `(options?, sessionId?, callback?)`.
   */
  override async signOut(...args: any[]): Promise<string> {
    const sessionId: string = typeof args[0] === 'string' ? args[0] : (args[1] as string);
    return this.legacy.signOut(sessionId);
  }

  override getUser(sessionId?: string): Promise<User> {
    return this.legacy.getUser(sessionId as string);
  }

  override getAccessToken(sessionId?: string): Promise<string> {
    return this.legacy.getAccessToken(sessionId as string);
  }

  /**
   * Decodes and returns the ID token claims for the given session.
   * Exposed here (as on {@link AsgardeoNextClient}) so route handlers can
   * access ID token claims without falling back to the legacy client.
   */
  getDecodedIdToken(sessionId?: string, idToken?: string): Promise<IdToken> {
    return this.legacy.getDecodedIdToken(sessionId as string, idToken);
  }

  override isSignedIn(sessionId?: string): Promise<boolean> {
    return this.legacy.isSignedIn(sessionId as string);
  }

  override exchangeToken(
    config: TokenExchangeRequestConfig,
    sessionId?: string,
  ): Promise<TokenResponse | Response> {
    return this.legacy.exchangeToken(config, sessionId);
  }

  /**
   * Fetches the flattened SCIM2 user profile for the given session.
   * Mirrors `AsgardeoNextClient.getUserProfile` — calls `getScim2Me` +
   * `getSchemas` + `generateFlattenedUserProfile` and falls back to
   * `getUser` claims if SCIM2 is unavailable.
   */
  override async getUserProfile(sessionId: string): Promise<UserProfile> {
    const accessToken: string = await this.getAccessToken(sessionId);
    const configData = await this.legacy.getConfigData?.() as (AuthClientConfig<AsgardeoNuxtConfig> | undefined);
    const baseUrl: string = (configData?.baseUrl ?? '') as string;

    try {
      const authHeaders = {Authorization: `Bearer ${accessToken}`};

      const [profile, schemas] = await Promise.all([
        getScim2Me({baseUrl, headers: authHeaders}),
        getSchemas({baseUrl, headers: authHeaders}),
      ]);

      const processedSchemas = flattenUserSchema(schemas);

      return {
        flattenedProfile: generateFlattenedUserProfile(profile, processedSchemas),
        profile,
        schemas: processedSchemas,
      };
    } catch {
      // Fall back to user claims from the ID token
      const user: User = await this.getUser(sessionId);
      return {flattenedProfile: user, profile: user, schemas: []};
    }
  }

  /**
   * Extracts the current organisation from the decoded ID token.
   * Returns null when the user is not acting within an organisation.
   */
  override async getCurrentOrganization(sessionId: string): Promise<Organization | null> {
    try {
      const idToken: IdToken = await this.getDecodedIdToken(sessionId);
      if (!idToken?.org_id) {
        return null;
      }
      return {
        id: idToken.org_id as string,
        name: (idToken.org_name ?? '') as string,
        orgHandle: (idToken.org_handle ?? '') as string,
      };
    } catch {
      return null;
    }
  }

  /**
   * Returns the list of organisations the authenticated user is a member of.
   */
  override async getMyOrganizations(sessionId: string): Promise<Organization[]> {
    const accessToken: string = await this.getAccessToken(sessionId);
    const configData = await this.legacy.getConfigData?.() as (AuthClientConfig<AsgardeoNuxtConfig> | undefined);
    const baseUrl: string = (configData?.baseUrl ?? '') as string;

    return getMeOrganizations({
      baseUrl,
      headers: {Authorization: `Bearer ${accessToken}`},
    });
  }

  /**
   * Fetches the branding preference for the tenant / application.
   * Delegates to the standalone `getBrandingPreference` API helper from
   * `@asgardeo/node`, which does not require an authenticated session.
   */
  async getBrandingPreference(config: GetBrandingPreferenceConfig): Promise<BrandingPreference> {
    return getBrandingPreference(config);
  }

  /**
   * Updates the SCIM2 /Me profile for the authenticated user.
   * Mirrors `AsgardeoNextClient.updateUserProfile`.
   */
  override async updateUserProfile(payload: UpdateMeProfileConfig, sessionId: string): Promise<User> {
    const accessToken: string = await this.getAccessToken(sessionId);
    const configData = await this.legacy.getConfigData?.() as (AuthClientConfig<AsgardeoNuxtConfig> | undefined);
    const baseUrl: string = (configData?.baseUrl ?? '') as string;

    return updateMeProfile({
      baseUrl,
      headers: {Authorization: `Bearer ${accessToken}`},
      payload,
    });
  }

  /**
   * Retrieves all organisations accessible to the authenticated user
   * (paginated). Mirrors `AsgardeoNextClient.getAllOrganizations`.
   */
  override async getAllOrganizations(options?: any, sessionId?: string): Promise<AllOrganizationsApiResponse> {
    const resolvedSessionId = sessionId ?? '';
    const accessToken: string = await this.getAccessToken(resolvedSessionId);
    const configData = await this.legacy.getConfigData?.() as (AuthClientConfig<AsgardeoNuxtConfig> | undefined);
    const baseUrl: string = (configData?.baseUrl ?? '') as string;

    return getAllOrganizations({
      baseUrl,
      headers: {Authorization: `Bearer ${accessToken}`},
    });
  }

  /**
   * Creates a new sub-organisation. Mirrors `AsgardeoNextClient.createOrganization`.
   */
  async createOrganization(payload: CreateOrganizationPayload, sessionId: string): Promise<Organization> {
    const accessToken: string = await this.getAccessToken(sessionId);
    const configData = await this.legacy.getConfigData?.() as (AuthClientConfig<AsgardeoNuxtConfig> | undefined);
    const baseUrl: string = (configData?.baseUrl ?? '') as string;

    return createOrganization({
      baseUrl,
      headers: {Authorization: `Bearer ${accessToken}`},
      payload,
    });
  }

  /**
   * Fetches the details of a single organisation by ID.
   * Mirrors `AsgardeoNextClient.getOrganization`.
   */
  async getOrganization(organizationId: string, sessionId: string): Promise<OrganizationDetails> {
    const accessToken: string = await this.getAccessToken(sessionId);
    const configData = await this.legacy.getConfigData?.() as (AuthClientConfig<AsgardeoNuxtConfig> | undefined);
    const baseUrl: string = (configData?.baseUrl ?? '') as string;

    return getOrganization({
      baseUrl,
      headers: {Authorization: `Bearer ${accessToken}`},
      organizationId,
    });
  }

  /**
   * Performs an organisation-switch token exchange and returns the new
   * `TokenResponse`. The caller (the Nitro route) is responsible for
   * persisting the new session cookie.
   *
   * Mirrors `AsgardeoNextClient.switchOrganization`.
   */
  override async switchOrganization(organization: Organization, sessionId: string): Promise<TokenResponse | Response> {
    if (!organization.id) {
      throw new Error('Organization ID is required for switching organizations.');
    }

    const exchangeConfig: TokenExchangeRequestConfig = {
      attachToken: false,
      data: {
        client_id: '{{clientId}}',
        client_secret: '{{clientSecret}}',
        grant_type: 'organization_switch',
        scope: '{{scopes}}',
        switching_organization: organization.id,
        token: '{{accessToken}}',
      },
      id: 'organization-switch',
      returnsSession: true,
      signInRequired: true,
    };

    return this.legacy.exchangeToken(exchangeConfig, sessionId);
  }
}

export default AsgardeoNuxtClient;
