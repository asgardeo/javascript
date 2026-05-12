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
  type AuthClientConfig,
  type IdToken,
  type Organization,
  type OrganizationDetails,
  type CreateOrganizationPayload,
  type Storage,
  type StorageManager,
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
  initializeEmbeddedSignInFlow,
  executeEmbeddedSignInFlow,
  executeEmbeddedSignUpFlow,
  type EmbeddedFlowExecuteRequestConfig,
  type EmbeddedFlowExecuteRequestPayload,
  type EmbeddedFlowExecuteResponse,
  type ExtendedAuthorizeRequestUrlParams,
  type SignUpOptions,
} from '@asgardeo/node';
import type {AsgardeoNuxtConfig, AsgardeoSessionPayload} from '../types';

/**
 * Singleton Asgardeo client for Nuxt applications.
 *
 * Extends {@link AsgardeoNodeClient} directly — initialization happens once per
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

  public isInitialized: boolean = false;

  private constructor() {
    super();
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
   * Initializes the client with OAuth/OIDC settings derived from the Nuxt
   * module config. Idempotent — repeated calls are no-ops after the first
   * successful initialization.
   */
  override async initialize(config: AsgardeoNuxtConfig, storage?: Storage): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    const authConfig: AuthClientConfig<AsgardeoNuxtConfig> = {
      afterSignInUrl: config.afterSignInUrl as string,
      afterSignOutUrl: config.afterSignOutUrl || '/',
      baseUrl: config.baseUrl as string,
      clientId: config.clientId as string,
      clientSecret: config.clientSecret || undefined,
      enablePKCE: true,
      scopes: config.scopes || ['openid', 'profile'],
    } as AuthClientConfig<AsgardeoNuxtConfig>;

    const result: boolean = await super.initialize(authConfig as unknown as AsgardeoNuxtConfig, storage);
    this.isInitialized = true;
    return result;
  }

  override async reInitialize(config: Partial<AsgardeoNuxtConfig>): Promise<boolean> {
    await super.reInitialize(config);
    return true;
  }

  /**
   * Seeds the in-memory token store from a verified session JWT payload.
   *
   * The signed session cookie is the source of truth for tokens — it survives
   * server restarts and new worker processes. Without rehydration, token
   * lookups fail whenever the in-memory store and the cookie diverge (e.g.
   * after a `nuxi dev` restart while the browser still holds a valid cookie).
   */
  async rehydrateSessionFromPayload(session: AsgardeoSessionPayload): Promise<void> {
    if (!this.isInitialized || !session?.sessionId || !session?.accessToken) {
      return;
    }

    const storageManager: StorageManager<AsgardeoNuxtConfig> = this.getStorageManager();
    const iatSeconds: number = typeof session.iat === 'number' ? session.iat : Math.floor(Date.now() / 1000);
    const expiresInSeconds: number =
      typeof session.accessTokenExpiresAt === 'number' ? Math.max(0, session.accessTokenExpiresAt - iatSeconds) : 3600;

    await storageManager.setSessionData(
      {
        access_token: session.accessToken,
        created_at: iatSeconds * 1000,
        expires_in: String(expiresInSeconds || 3600),
        id_token: session.idToken ?? '',
        refresh_token: session.refreshToken ?? '',
        scope: session.scopes ?? '',
        session_state: '',
        token_type: 'Bearer',
      },
      session.sessionId,
    );
  }

  /**
   * Initiates the authorization code flow, handles an embedded sign-in step,
   * or exchanges a code for tokens.
   */
  override async signIn(...args: any[]): Promise<any> {
    const arg0: unknown = args[0];

    if (typeof arg0 === 'object' && arg0 !== null && 'flowId' in arg0) {
      const sessionId: string | undefined = args[2] as string | undefined;

      if (arg0.flowId === '') {
        return this.getAuthorizeRequestUrl(
          {client_secret: '{{clientSecret}}', response_mode: 'direct'},
          sessionId,
        ).then((authorizeUrl: string) => {
          const url: URL = new URL(authorizeUrl);
          return initializeEmbeddedSignInFlow({
            payload: Object.fromEntries(url.searchParams.entries()),
            url: `${url.origin}${url.pathname}`,
          });
        });
      }

      const request: EmbeddedFlowExecuteRequestConfig = args[1] ?? {};
      return executeEmbeddedSignInFlow({
        payload: arg0 as any,
        url: request.url,
      });
    }

    if (typeof arg0 === 'object' && arg0 !== null && ('code' in arg0 || 'state' in arg0)) {
      const payload: {code?: unknown; session_state?: unknown; state?: unknown} = arg0 as any;
      const code: string | undefined = typeof payload.code === 'string' ? payload.code : undefined;
      const sessionState: string | undefined =
        typeof payload.session_state === 'string' ? payload.session_state : undefined;
      const state: string | undefined = typeof payload.state === 'string' ? payload.state : undefined;
      const extraParams: Record<string, string | boolean> = {};

      if (code) extraParams.code = code;
      if (sessionState) extraParams.session_state = sessionState;
      if (state) extraParams.state = state;

      return super.signIn(args[3], args[2], code, sessionState, state, extraParams);
    }

    return super.signIn(args[0], args[1], args[2], args[3], args[4], args[5]);
  }

  /**
   * Executes the embedded sign-up flow step.
   */
  override signUp(options?: SignUpOptions): Promise<void>;
  override signUp(payload: EmbeddedFlowExecuteRequestPayload): Promise<EmbeddedFlowExecuteResponse>;
  override async signUp(
    payloadOrOptions?: EmbeddedFlowExecuteRequestPayload | SignUpOptions,
  ): Promise<void | EmbeddedFlowExecuteResponse> {
    if (!payloadOrOptions || !('flowType' in payloadOrOptions)) {
      return undefined;
    }
    const configData: AuthClientConfig<AsgardeoNuxtConfig> = await this.getConfigData();
    const baseUrl: string | undefined = configData?.baseUrl as string | undefined;
    return executeEmbeddedSignUpFlow({
      baseUrl,
      payload: payloadOrOptions as EmbeddedFlowExecuteRequestPayload,
    });
  }

  /**
   * Returns the OAuth2 authorization URL.
   */
  public async getAuthorizeRequestUrl(
    customParams: ExtendedAuthorizeRequestUrlParams,
    userId?: string,
  ): Promise<string> {
    return super.getSignInUrl(customParams, userId);
  }

  override async signOut(...args: any[]): Promise<string> {
    const sessionId: string = typeof args[0] === 'string' ? args[0] : (args[1] as string);
    return super.signOut(sessionId);
  }

  override getUser(sessionId?: string): Promise<User> {
    return super.getUser(sessionId);
  }

  override getAccessToken(sessionId?: string): Promise<string> {
    return super.getAccessToken(sessionId);
  }

  override getDecodedIdToken(sessionId?: string, idToken?: string): Promise<IdToken> {
    return super.getDecodedIdToken(sessionId, idToken);
  }

  override isSignedIn(sessionId?: string): Promise<boolean> {
    return super.isSignedIn(sessionId);
  }

  override exchangeToken(config: TokenExchangeRequestConfig, sessionId?: string): Promise<TokenResponse | Response> {
    return super.exchangeToken(config, sessionId);
  }

  override async getUserProfile(sessionId: string): Promise<UserProfile> {
    const accessToken: string = await this.getAccessToken(sessionId);
    const configData: AuthClientConfig<AsgardeoNuxtConfig> = await this.getConfigData();
    const baseUrl: string = (configData?.baseUrl ?? '') as string;

    try {
      const authHeaders: Record<string, string> = {Authorization: `Bearer ${accessToken}`};

      const [profile, schemas] = await Promise.all([
        getScim2Me({baseUrl, headers: authHeaders}),
        getSchemas({baseUrl, headers: authHeaders}),
      ]);

      const processedSchemas: ReturnType<typeof flattenUserSchema> = flattenUserSchema(schemas);

      return {
        flattenedProfile: generateFlattenedUserProfile(profile, processedSchemas),
        profile,
        schemas: processedSchemas,
      };
    } catch {
      const user: User = await this.getUser(sessionId);
      return {flattenedProfile: user, profile: user, schemas: []};
    }
  }

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

  override async getMyOrganizations(sessionId: string): Promise<Organization[]> {
    const accessToken: string = await this.getAccessToken(sessionId);
    const configData: AuthClientConfig<AsgardeoNuxtConfig> = await this.getConfigData();
    const baseUrl: string = (configData?.baseUrl ?? '') as string;

    return getMeOrganizations({
      baseUrl,
      headers: {Authorization: `Bearer ${accessToken}`},
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async getBrandingPreference(config: GetBrandingPreferenceConfig): Promise<BrandingPreference> {
    return getBrandingPreference(config);
  }

  override async updateUserProfile(config: UpdateMeProfileConfig, sessionId: string): Promise<User> {
    const accessToken: string = await this.getAccessToken(sessionId);
    const configData: AuthClientConfig<AsgardeoNuxtConfig> = await this.getConfigData();
    const baseUrl: string = (configData?.baseUrl ?? '') as string;

    return updateMeProfile({
      ...config,
      baseUrl,
      headers: {...config.headers, Authorization: `Bearer ${accessToken}`},
    });
  }

  override async getAllOrganizations(options?: any, sessionId?: string): Promise<AllOrganizationsApiResponse> {
    const resolvedSessionId: string = sessionId ?? '';
    const accessToken: string = await this.getAccessToken(resolvedSessionId);
    const configData: AuthClientConfig<AsgardeoNuxtConfig> = await this.getConfigData();
    const baseUrl: string = (configData?.baseUrl ?? '') as string;

    return getAllOrganizations({
      baseUrl,
      headers: {Authorization: `Bearer ${accessToken}`},
    });
  }

  async createOrganization(payload: CreateOrganizationPayload, sessionId: string): Promise<Organization> {
    const accessToken: string = await this.getAccessToken(sessionId);
    const configData: AuthClientConfig<AsgardeoNuxtConfig> = await this.getConfigData();
    const baseUrl: string = (configData?.baseUrl ?? '') as string;

    return createOrganization({
      baseUrl,
      headers: {Authorization: `Bearer ${accessToken}`},
      payload,
    });
  }

  async getOrganization(organizationId: string, sessionId: string): Promise<OrganizationDetails> {
    const accessToken: string = await this.getAccessToken(sessionId);
    const configData: AuthClientConfig<AsgardeoNuxtConfig> = await this.getConfigData();
    const baseUrl: string = (configData?.baseUrl ?? '') as string;

    return getOrganization({
      baseUrl,
      headers: {Authorization: `Bearer ${accessToken}`},
      organizationId,
    });
  }

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

    return super.exchangeToken(exchangeConfig, sessionId);
  }
}

export default AsgardeoNuxtClient;
