/**
 * Copyright (c) 2025-2026, WSO2 LLC. (https://www.wso2.com).
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

import {AsgardeoAuthClient} from './__legacy__/client';
import {AuthClientConfig} from './__legacy__/models/client-config';
import executeEmbeddedSignInFlow from './api/executeEmbeddedSignInFlow';
import initializeEmbeddedSignInFlow from './api/initializeEmbeddedSignInFlow';
import {DefaultCacheStore} from './DefaultCacheStore';
import {DefaultCrypto} from './DefaultCrypto';
import {AgentConfig} from './models/agent';
import {AuthCodeResponse} from './models/auth-code-response';
import {AsgardeoClient} from './models/client';
import {Config, SignInOptions, SignOutOptions, SignUpOptions} from './models/config';
import {Crypto} from './models/crypto';
import {
  EmbeddedFlowExecuteRequestConfig,
  EmbeddedFlowExecuteRequestPayload,
  EmbeddedFlowExecuteResponse,
} from './models/embedded-flow';
import {
  EmbeddedSignInFlowAuthenticator,
  EmbeddedSignInFlowHandleResponse,
  EmbeddedSignInFlowInitiateResponse,
  EmbeddedSignInFlowStatus,
} from './models/embedded-signin-flow';
import {OIDCDiscoveryApiResponse} from './models/oidc-discovery';
import {AllOrganizationsApiResponse, Organization, OrgDiscoveryType} from './models/organization';
import {Storage} from './models/store';
import {TokenExchangeRequestConfig, TokenResponse} from './models/token';
import {User, UserProfile} from './models/user';
import StorageManager from './StorageManager';

/**
 * Authorization parameter keys that are managed by the SDK when building an organization authorization URL.
 */
const RESERVED_AUTH_KEYS: ReadonlySet<string> = new Set<string>([
  'client_id',
  'redirect_uri',
  'scope',
  'state',
  'response_type',
  'resource',
  'fidp',
  'requested_actor',
  'orgId',
  'orgHandle',
  'org',
  'login_hint',
  'orgDiscoveryType',
  'code_challenge',
  'code_challenge_method',
]);

/**
 * Options accepted by {@link AsgardeoJavaScriptClient.getOrgAuthorizationUrl}.
 */
export interface OrgAuthorizationUrlOptions {
  /**
   * Additional query parameters to append to the authorization URL.
   */
  additionalParams?: Record<string, string>;
  /**
   * Optional agent configuration. When provided, the resulting URL is
   * decorated with `requested_actor=<agentID>` so the issued user token is
   * delegated on-behalf-of the agent.
   */
  agentConfig?: AgentConfig;
  /**
   * When `true`, the `fidp=OrganizationSSO` query parameter is omitted so the
   * enhanced organization authentication flow can take over discovery.
   * Defaults to `false`.
   */
  isEnhancedOrgAuth?: boolean;
  /**
   * Optional `resource` query parameter to forward to the authorize endpoint.
   */
  resource?: string;
  /**
   * Optional `state` value to seed request correlation with. If omitted, the
   * underlying SDK generates one.
   */
  state?: string;
}

class AsgardeoJavaScriptClient<T = Config> implements AsgardeoClient<T> {
  private cacheStore: Storage;

  private cryptoUtils: Crypto;

  private auth: AsgardeoAuthClient<T>;

  private storageManager: StorageManager<T>;

  private baseURL: string;

  private initPromise: Promise<void> | undefined;

  constructor(config?: AuthClientConfig<T>, cacheStore?: Storage, cryptoUtils?: Crypto) {
    this.cacheStore = cacheStore ?? new DefaultCacheStore();
    this.cryptoUtils = cryptoUtils ?? new DefaultCrypto();
    this.auth = new AsgardeoAuthClient();

    if (config) {
      this.initPromise = this.auth.initialize(config, this.cacheStore, this.cryptoUtils);
      this.storageManager = this.auth.getStorageManager();
    }

    this.baseURL = config?.baseUrl ?? '';
  }

  protected async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  public async getDiscoveryResponse(): Promise<OIDCDiscoveryApiResponse | null> {
    await this.ensureInitialized();
    if (!this.storageManager) {
      return null;
    }

    return this.storageManager.loadOpenIDProviderConfiguration();
  }

  /* eslint-disable class-methods-use-this, @typescript-eslint/no-unused-vars */
  switchOrganization(_organization: Organization, _sessionId?: string): Promise<TokenResponse | Response> {
    throw new Error('Method not implemented.');
  }

  initialize(_config: T, _storage?: Storage): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  reInitialize(_config: Partial<T>): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  getUser(_options?: any): Promise<User> {
    throw new Error('Method not implemented.');
  }

  getAllOrganizations(_options?: any, _sessionId?: string): Promise<AllOrganizationsApiResponse> {
    throw new Error('Method not implemented.');
  }

  getMyOrganizations(_options?: any, _sessionId?: string): Promise<Organization[]> {
    throw new Error('Method not implemented.');
  }

  getCurrentOrganization(_sessionId?: string): Promise<Organization | null> {
    throw new Error('Method not implemented.');
  }

  getUserProfile(_options?: any): Promise<UserProfile> {
    throw new Error('Method not implemented.');
  }

  isLoading(): boolean {
    throw new Error('Method not implemented.');
  }

  isSignedIn(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  updateUserProfile(_payload: any, _userId?: string): Promise<User> {
    throw new Error('Method not implemented.');
  }

  getConfiguration(): T {
    throw new Error('Method not implemented.');
  }

  exchangeToken(_config: TokenExchangeRequestConfig, _sessionId?: string): Promise<TokenResponse | Response> {
    throw new Error('Method not implemented.');
  }

  signInSilently(_options?: SignInOptions): Promise<User | boolean> {
    throw new Error('Method not implemented.');
  }

  getAccessToken(_sessionId?: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  clearSession(_sessionId?: string): void {
    throw new Error('Method not implemented.');
  }

  setSession(_sessionData: Record<string, unknown>, _sessionId?: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  decodeJwtToken<R = Record<string, unknown>>(_token: string): Promise<R> {
    throw new Error('Method not implemented.');
  }

  signIn(_options?: SignInOptions): Promise<User> {
    throw new Error('Method not implemented.');
  }

  signOut(
    _options?: SignOutOptions,
    _sessionIdOrAfterSignOut?: string | ((afterSignOutUrl: string) => void),
    _afterSignOut?: (afterSignOutUrl: string) => void,
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }

  recover(_payload: EmbeddedFlowExecuteRequestPayload): Promise<EmbeddedFlowExecuteResponse> {
    throw new Error('Method not implemented.');
  }

  signUp(options?: SignUpOptions): Promise<void>;

  signUp(payload: EmbeddedFlowExecuteRequestPayload): Promise<EmbeddedFlowExecuteResponse>;

  signUp(
    _optionsOrPayload?: SignUpOptions | EmbeddedFlowExecuteRequestPayload,
  ): Promise<void | EmbeddedFlowExecuteResponse> {
    throw new Error('Method not implemented.');
  }
  /* eslint-enable class-methods-use-this, @typescript-eslint/no-unused-vars */

  public async getAgentToken(agentConfig: AgentConfig): Promise<TokenResponse> {
    await this.ensureInitialized();

    if (!agentConfig?.agentID) {
      throw new Error('agentConfig.agentID is required for getAgentToken().');
    }
    if (!agentConfig.agentSecret) {
      throw new Error(
        'agentConfig.agentSecret is required for getAgentToken(). ' +
          'The agent must authenticate against the token endpoint.',
      );
    }

    const customParam: Record<string, string> = {
      response_mode: 'direct',
    };

    const authorizeURL: URL = new URL(await this.auth.getSignInUrl(customParam));

    const authorizeResponse: EmbeddedSignInFlowInitiateResponse = await initializeEmbeddedSignInFlow({
      payload: Object.fromEntries(authorizeURL.searchParams.entries()),
      url: `${authorizeURL.origin}${authorizeURL.pathname}`,
    });

    const authenticatorName: string = agentConfig.authenticatorName ?? AgentConfig.DEFAULT_AUTHENTICATOR_NAME;

    const targetAuthenticator: EmbeddedSignInFlowAuthenticator | undefined =
      authorizeResponse.nextStep.authenticators.find(
        (auth: EmbeddedSignInFlowAuthenticator) => auth.authenticator === authenticatorName,
      );

    if (!targetAuthenticator) {
      throw new Error(`Authenticator '${authenticatorName}' not found among authentication steps.`);
    }

    const authnRequest: EmbeddedFlowExecuteRequestConfig = {
      baseUrl: this.baseURL,
      payload: {
        flowId: authorizeResponse.flowId,
        selectedAuthenticator: {
          authenticatorId: targetAuthenticator.authenticatorId,
          params: {
            password: agentConfig.agentSecret,
            username: agentConfig.agentID,
          },
        },
      },
    };

    const authnResponse: EmbeddedSignInFlowHandleResponse = await executeEmbeddedSignInFlow(authnRequest);

    if (authnResponse.flowStatus !== EmbeddedSignInFlowStatus.SuccessCompleted) {
      throw new Error('Agent authentication failed.');
    }

    return this.auth.requestAccessToken(
      authnResponse.authData['code'],
      authnResponse.authData['session_state'],
      authnResponse.authData['state'],
    );
  }

  public async getOBOSignInURL(agentConfig: AgentConfig): Promise<string> {
    await this.ensureInitialized();
    const customParam: Record<string, string> = {
      requested_actor: agentConfig.agentID,
    };

    const authURL: string | undefined = await this.auth.getSignInUrl(customParam);

    if (authURL) {
      return authURL.toString();
    }

    throw new Error('Could not build Authorize URL');
  }

  public async getOBOToken(agentConfig: AgentConfig, authCodeResponse: AuthCodeResponse): Promise<TokenResponse> {
    const agentToken: TokenResponse = await this.getAgentToken(agentConfig);

    const tokenRequestConfig: {params: {actor_token: string}} = {
      params: {
        actor_token: agentToken.accessToken,
      },
    };

    return this.auth.requestAccessToken(
      authCodeResponse.code,
      authCodeResponse.session_state,
      authCodeResponse.state,
      undefined,
      tokenRequestConfig,
    );
  }

  /**
   * Builds a `/oauth2/authorize` URL targeting a specific child organization.
   *
   * The target organization can be identified by its UUID (`orgID`), handle
   * (`orgHandle`), display name (`org`) or via email-domain based discovery
   * (`emailDomain`).
   *
   * @param orgDiscoveryType - The organization discovery strategy to use.
   * @param discoveryValue   - The identifier whose meaning depends on
   *                            `orgDiscoveryType` (UUID, handle, name or email).
   * @param options          - Optional state, resource, agent delegation and
   *                            additional query parameters.
   * @returns The fully-built authorization URL.
   */
  public async getOrgAuthorizationUrl(
    orgDiscoveryType: OrgDiscoveryType,
    discoveryValue: string,
    options: OrgAuthorizationUrlOptions = {},
  ): Promise<string> {
    await this.ensureInitialized();
    const customParam: Record<string, string> = AsgardeoJavaScriptClient.buildOrgAuthorizationParams(
      orgDiscoveryType,
      discoveryValue,
      options,
    );

    const authURL: string | undefined = await this.auth.getSignInUrl(customParam);

    if (!authURL) {
      throw new Error('Could not build organization authorization URL');
    }

    return authURL.toString();
  }

  /**
   * Exchanges an existing access token for one scoped to a target organization,
   * using the `organization_switch` grant type.
   *
   * Unlike {@link AsgardeoJavaScriptClient.exchangeToken} this method does
   * not require an active SDK session — the caller supplies the source
   * access token directly. This makes it safe to use from server-side agent
   * flows where there is no user session yet.
   *
   * @param token                  - The current access token to be switched.
   * @param switchingOrganization  - The ID/UUID of the target organization.
   * @param scopes                 - Optional list of scopes to request for the switched token.
   * @returns A normalized {@link TokenResponse} for the switched organization.
   */
  public async switchTokenToOrganization(
    token: string,
    switchingOrganization: string,
    scopes?: string[],
  ): Promise<TokenResponse> {
    await this.ensureInitialized();
    if (!token) {
      throw new Error('Token is required for organization switch.');
    }
    if (!switchingOrganization) {
      throw new Error('switchingOrganization is required.');
    }

    if (!this.storageManager) {
      throw new Error('Client is not initialized. Call initialize() before switching organizations.');
    }

    const configData: AuthClientConfig<T> | null = await this.storageManager.getConfigData();

    if (!configData) {
      throw new Error('Client configuration is unavailable. Initialize the client before switching organizations.');
    }

    const tokenEndpoint: string = await this.resolveTokenEndpoint();

    const body: URLSearchParams = new URLSearchParams();
    const {clientId, clientSecret} = configData as unknown as {clientId: string; clientSecret?: string};
    const hasSecret: boolean = Boolean(clientSecret && clientSecret.trim().length > 0);

    body.set('grant_type', 'organization_switch');
    body.set('token', token);
    body.set('switching_organization', switchingOrganization);
    body.set('client_id', clientId);

    if (hasSecret) {
      body.set('client_secret', clientSecret as string);
    }

    if (scopes && scopes.length > 0) {
      body.set('scope', scopes.join(' '));
    }

    let response: Response;
    try {
      response = await fetch(tokenEndpoint, {
        body,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      });
    } catch (error) {
      throw new Error(`Organization switch request failed: ${(error as Error)?.message ?? String(error)}`);
    }

    if (!response.ok) {
      let errorBody: string;
      try {
        errorBody = JSON.stringify(await response.json());
      } catch {
        errorBody = response.statusText;
      }
      throw new Error(`Organization switch failed (${response.status}): ${errorBody}`);
    }

    const parsed: {
      access_token: string;
      created_at?: number;
      expires_in: string;
      id_token: string;
      refresh_token: string;
      scope: string;
      token_type: string;
    } = await response.json();

    return {
      accessToken: parsed.access_token,
      createdAt: parsed.created_at ?? Date.now(),
      expiresIn: parsed.expires_in,
      idToken: parsed.id_token,
      refreshToken: parsed.refresh_token,
      scope: parsed.scope,
      tokenType: parsed.token_type,
    };
  }

  /**
   * Resolves the OAuth2 token endpoint URL.
   *
   * Prefers the value advertised by the OIDC well-known document (when it
   * has already been loaded into the storage manager) and falls back to
   * `${baseURL}/oauth2/token` derived from the SDK configuration.
   */
  private async resolveTokenEndpoint(): Promise<string> {
    const discovery: OIDCDiscoveryApiResponse | null = this.storageManager
      ? await this.storageManager.loadOpenIDProviderConfiguration()
      : null;

    const discovered: string | undefined = discovery?.token_endpoint;
    if (discovered && discovered.trim().length > 0) {
      return discovered;
    }

    if (this.baseURL && this.baseURL.trim().length > 0) {
      return `${this.baseURL.replace(/\/$/, '')}/oauth2/token`;
    }

    throw new Error(
      'Unable to resolve the token endpoint. Provide a baseUrl in the client configuration or ensure OIDC discovery has been performed.',
    );
  }

  /**
   * Authenticates as the agent and switches the issued agent token into a
   * target child organization in a single call.
   *
   * @param agentConfig            - Agent credentials used to obtain the parent-org agent token.
   * @param switchingOrganization  - The ID/UUID of the target organization.
   * @param orgScopes              - Optional scopes to request for the organization-scoped token.
   * @returns A normalized {@link TokenResponse} scoped to the target organization.
   */
  public async getOrganizationAgentToken(
    agentConfig: AgentConfig,
    switchingOrganization: string,
    orgScopes?: string[],
  ): Promise<TokenResponse> {
    if (!switchingOrganization) {
      throw new Error('switchingOrganization is required.');
    }

    const agentToken: TokenResponse = await this.getAgentToken(agentConfig);

    return this.switchTokenToOrganization(agentToken.accessToken, switchingOrganization, orgScopes);
  }

  /**
   * Builds the custom query-parameter map for an organization-scoped authorization request.
   */
  private static buildOrgAuthorizationParams(
    orgDiscoveryType: OrgDiscoveryType,
    discoveryValue: string,
    options: OrgAuthorizationUrlOptions,
  ): Record<string, string> {
    const trimmedValue: string = (discoveryValue ?? '').trim();

    if (!trimmedValue) {
      throw new Error('discoveryValue is required.');
    }

    const customParam: Record<string, string> = {};

    if (!options.isEnhancedOrgAuth) {
      customParam['fidp'] = 'OrganizationSSO';
    }

    switch (orgDiscoveryType) {
      case 'orgID':
        customParam['orgId'] = trimmedValue;
        break;
      case 'orgHandle':
        customParam['orgHandle'] = trimmedValue;
        break;
      case 'org':
        customParam['org'] = trimmedValue;
        break;
      case 'emailDomain':
        customParam['login_hint'] = trimmedValue;
        customParam['orgDiscoveryType'] = 'emailDomain';
        break;
      default:
        throw new Error(`Unsupported orgDiscoveryType: ${orgDiscoveryType as string}`);
    }

    if (options.resource) {
      customParam['resource'] = options.resource;
    }

    if (options.state) {
      customParam['state'] = options.state;
    }

    if (options.agentConfig) {
      customParam['requested_actor'] = options.agentConfig.agentID;
    }

    if (options.additionalParams) {
      const conflicts: string[] = Object.keys(options.additionalParams).filter((key: string) =>
        RESERVED_AUTH_KEYS.has(key),
      );

      if (conflicts.length > 0) {
        throw new Error(`Reserved authorization parameters cannot be overridden: ${conflicts.sort().join(', ')}`);
      }

      Object.assign(customParam, options.additionalParams);
    }

    return customParam;
  }
}

export default AsgardeoJavaScriptClient;
