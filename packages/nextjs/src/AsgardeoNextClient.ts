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
  AllOrganizationsApiResponse,
  AsgardeoNodeClient,
  AsgardeoRuntimeError,
  AuthClientConfig,
  CreateOrganizationPayload,
  EmbeddedFlowExecuteRequestConfig,
  EmbeddedFlowExecuteRequestPayload,
  EmbeddedFlowExecuteResponse,
  EmbeddedSignInFlowHandleRequestPayload,
  ExtendedAuthorizeRequestUrlParams,
  FlattenedSchema,
  IdToken,
  LegacyAsgardeoNodeClient,
  Organization,
  OrganizationDetails,
  Schema,
  SignInOptions,
  SignOutOptions,
  SignUpOptions,
  Storage,
  TokenExchangeRequestConfig,
  TokenResponse,
  User,
  UserProfile,
  createOrganization,
  deriveOrganizationHandleFromBaseUrl,
  executeEmbeddedSignInFlow,
  executeEmbeddedSignUpFlow,
  extractUserClaimsFromIdToken,
  flattenUserSchema,
  generateFlattenedUserProfile,
  generateUserProfile,
  getAllOrganizations,
  getMeOrganizations,
  getOrganization,
  getScim2Me,
  getSchemas,
  initializeEmbeddedSignInFlow,
  updateMeProfile,
} from '@asgardeo/node';
import {AsgardeoNextConfig} from './models/config';
import getClientOrigin from './server/actions/getClientOrigin';
import getSessionId from './server/actions/getSessionId';
import decorateConfigWithNextEnv from './utils/decorateConfigWithNextEnv';

/**
 * Client for mplementing Asgardeo in Next.js applications.
 * This class provides the core functionality for managing user authentication and sessions.
 *
 * This class is implemented as a singleton to ensure a single instance across the application.
 *
 * @typeParam T - Configuration type that extends AsgardeoNextConfig.
 */
class AsgardeoNextClient<T extends AsgardeoNextConfig = AsgardeoNextConfig> extends AsgardeoNodeClient<T> {
  private static instance: AsgardeoNextClient<any>;

  private asgardeo: LegacyAsgardeoNodeClient<T>;

  public isInitialized: boolean = false;

  private constructor() {
    super();

    this.asgardeo = new LegacyAsgardeoNodeClient();
  }

  /**
   * Get the singleton instance of AsgardeoNextClient
   */
  public static getInstance<T extends AsgardeoNextConfig = AsgardeoNextConfig>(): AsgardeoNextClient<T> {
    if (!AsgardeoNextClient.instance) {
      AsgardeoNextClient.instance = new AsgardeoNextClient<T>();
    }
    return AsgardeoNextClient.instance as AsgardeoNextClient<T>;
  }

  /**
   * Ensures the client is initialized before using it.
   * Throws an error if the client is not initialized.
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error(
        '[AsgardeoNextClient] Client is not initialized. Make sure you have wrapped your app with AsgardeoProvider and provided the required configuration (baseUrl, clientId, etc.).',
      );
    }
  }

  override async initialize(config: T, storage?: Storage): Promise<boolean> {
    if (this.isInitialized) {
      return Promise.resolve(true);
    }

    const {
      baseUrl,
      organizationHandle,
      clientId,
      clientSecret,
      signInUrl,
      afterSignInUrl,
      afterSignOutUrl,
      signUpUrl,
      ...rest
    } = decorateConfigWithNextEnv(config);

    this.isInitialized = true;

    let resolvedOrganizationHandle: string | undefined = organizationHandle;

    if (!resolvedOrganizationHandle) {
      resolvedOrganizationHandle = deriveOrganizationHandleFromBaseUrl(baseUrl);
    }

    const origin: string = await getClientOrigin();

    return this.asgardeo.initialize(
      {
        afterSignInUrl: afterSignInUrl ?? origin,
        afterSignOutUrl: afterSignOutUrl ?? origin,
        baseUrl,
        clientId,
        clientSecret,
        enablePKCE: false,
        organizationHandle: resolvedOrganizationHandle,
        signInUrl,
        signUpUrl,
        ...rest,
      } as any,
      storage,
    );
  }

  override async reInitialize(config: Partial<T>): Promise<boolean> {
    let isInitialized: boolean = false;

    try {
      await this.asgardeo.reInitialize(config as any);

      isInitialized = true;
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Failed to re-initialize the client: ${error instanceof Error ? error.message : String(error)}`,
        'AsgardeoNextClient-reInitialize-RuntimeError-001',
        'nextjs',
        'An error occurred while re-initializing the client. Please check your configuration and network connection.',
      );
    }

    return isInitialized;
  }

  override async getUser(userId?: string): Promise<User> {
    await this.ensureInitialized();
    const resolvedSessionId: string = userId || ((await getSessionId()) as string);

    try {
      const configData: AuthClientConfig<T> = await this.asgardeo.getConfigData();
      const baseUrl: string | undefined = configData?.baseUrl;

      const profile: User = await getScim2Me({
        baseUrl,
        headers: {
          Authorization: `Bearer ${await this.getAccessToken(userId)}`,
        },
      });

      const schemas: Schema[] = await getSchemas({
        baseUrl,
        headers: {
          Authorization: `Bearer ${await this.getAccessToken(userId)}`,
        },
      });

      return generateUserProfile(profile, flattenUserSchema(schemas));
    } catch (error) {
      return this.asgardeo.getUser(resolvedSessionId);
    }
  }

  override async getUserProfile(userId?: string): Promise<UserProfile> {
    await this.ensureInitialized();

    try {
      const configData: AuthClientConfig<T> = await this.asgardeo.getConfigData();
      const baseUrl: string | undefined = configData?.baseUrl;

      const profile: User = await getScim2Me({
        baseUrl,
        headers: {
          Authorization: `Bearer ${await this.getAccessToken(userId)}`,
        },
      });

      const schemas: Schema[] = await getSchemas({
        baseUrl,
        headers: {
          Authorization: `Bearer ${await this.getAccessToken(userId)}`,
        },
      });

      const processedSchemas: FlattenedSchema[] = flattenUserSchema(schemas);

      const output: UserProfile = {
        flattenedProfile: generateFlattenedUserProfile(profile, processedSchemas),
        profile,
        schemas: processedSchemas,
      };

      return output;
    } catch (error) {
      return {
        flattenedProfile: extractUserClaimsFromIdToken(await this.asgardeo.getDecodedIdToken(userId)),
        profile: extractUserClaimsFromIdToken(await this.asgardeo.getDecodedIdToken(userId)),
        schemas: [],
      };
    }
  }

  override async updateUserProfile(payload: any, userId?: string): Promise<User> {
    await this.ensureInitialized();

    try {
      const configData: AuthClientConfig<T> = await this.asgardeo.getConfigData();
      const baseUrl: string | undefined = configData?.baseUrl;

      return await updateMeProfile({
        baseUrl,
        headers: {
          Authorization: `Bearer ${await this.getAccessToken(userId)}`,
        },
        payload,
      });
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Failed to update user profile: ${error instanceof Error ? error.message : String(error)}`,
        'AsgardeoNextClient-UpdateProfileError-001',
        'react',
        'An error occurred while updating the user profile. Please check your configuration and network connection.',
      );
    }
  }

  async createOrganization(payload: CreateOrganizationPayload, userId?: string): Promise<Organization> {
    try {
      const configData: AuthClientConfig<T> = await this.asgardeo.getConfigData();
      const baseUrl: string = configData?.baseUrl as string;

      return await createOrganization({
        baseUrl,
        headers: {
          Authorization: `Bearer ${await this.getAccessToken(userId)}`,
        },
        payload,
      });
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Failed to create organization: ${error instanceof Error ? error.message : String(error)}`,
        'AsgardeoReactClient-createOrganization-RuntimeError-001',
        'nextjs',
        'An error occurred while creating the organization. Please check your configuration and network connection.',
      );
    }
  }

  async getOrganization(organizationId: string, userId?: string): Promise<OrganizationDetails> {
    try {
      const configData: AuthClientConfig<T> = await this.asgardeo.getConfigData();
      const baseUrl: string = configData?.baseUrl as string;

      return await getOrganization({
        baseUrl,
        headers: {
          Authorization: `Bearer ${await this.getAccessToken(userId)}`,
        },
        organizationId,
      });
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Failed to fetch the organization details of ${organizationId}: ${String(error)}`,
        'AsgardeoReactClient-getOrganization-RuntimeError-001',
        'nextjs',
        `An error occurred while fetching the organization with the id: ${organizationId}.`,
      );
    }
  }

  override async getMyOrganizations(options?: any, userId?: string): Promise<Organization[]> {
    try {
      const configData: AuthClientConfig<T> = await this.asgardeo.getConfigData();
      const baseUrl: string = configData?.baseUrl as string;

      return await getMeOrganizations({
        baseUrl,
        headers: {
          Authorization: `Bearer ${await this.getAccessToken(userId)}`,
        },
      });
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Failed to fetch the user's associated organizations: ${
          error instanceof Error ? error.message : String(error)
        }`,
        'AsgardeoNextClient-getMyOrganizations-RuntimeError-001',
        'nextjs',
        'An error occurred while fetching associated organizations of the signed-in user.',
      );
    }
  }

  override async getAllOrganizations(options?: any, userId?: string): Promise<AllOrganizationsApiResponse> {
    try {
      const configData: AuthClientConfig<T> = await this.asgardeo.getConfigData();
      const baseUrl: string = configData?.baseUrl as string;

      return await getAllOrganizations({
        baseUrl,
        headers: {
          Authorization: `Bearer ${await this.getAccessToken(userId)}`,
        },
      });
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Failed to fetch all organizations: ${error instanceof Error ? error.message : String(error)}`,
        'AsgardeoNextClient-getAllOrganizations-RuntimeError-001',
        'nextjs',
        'An error occurred while fetching all the organizations associated with the user.',
      );
    }
  }

  override async getCurrentOrganization(userId?: string): Promise<Organization | null> {
    const idToken: IdToken = await this.asgardeo.getDecodedIdToken(userId);

    return {
      id: idToken?.org_id as string,
      name: idToken?.org_name as string,
      orgHandle: idToken?.org_handle as string,
    };
  }

  override async switchOrganization(organization: Organization, userId?: string): Promise<TokenResponse | Response> {
    try {
      if (!organization.id) {
        throw new AsgardeoRuntimeError(
          'Organization ID is required for switching organizations',
          'AsgardeoNextClient-switchOrganization-ValidationError-001',
          'nextjs',
          'The organization object must contain a valid ID to perform the organization switch.',
        );
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

      return await this.asgardeo.exchangeToken(exchangeConfig, userId);
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Failed to switch organization: ${error instanceof Error ? error.message : String(JSON.stringify(error))}`,
        'AsgardeoReactClient-RuntimeError-003',
        'nextjs',
        'An error occurred while switching to the specified organization. Please try again.',
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  override isLoading(): boolean {
    return false;
  }

  override isSignedIn(sessionId?: string): Promise<boolean> {
    return this.asgardeo.isSignedIn(sessionId as string);
  }

  override exchangeToken(config: TokenExchangeRequestConfig, sessionId?: string): Promise<TokenResponse | Response> {
    return this.asgardeo.exchangeToken(config, sessionId);
  }

  /**
   * Gets the access token from the session cookie if no sessionId is provided,
   * otherwise falls back to legacy client method.
   */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  async getAccessToken(_sessionId?: string): Promise<string> {
    const {default: getAccessToken} = await import('./server/actions/getAccessToken');
    const token: string | undefined = await getAccessToken();

    if (typeof token !== 'string' || !token) {
      throw new AsgardeoRuntimeError(
        'Failed to get access token.',
        'AsgardeoNextClient-getAccessToken-RuntimeError-003',
        'nextjs',
        'An error occurred while obtaining the access token. Please check your configuration and network connection.',
      );
    }

    return token;
  }

  /**
   * Get the decoded ID token for a session
   */
  async getDecodedIdToken(sessionId?: string, idToken?: string): Promise<IdToken> {
    await this.ensureInitialized();
    return this.asgardeo.getDecodedIdToken(sessionId as string, idToken);
  }

  async getIdToken(sessionId?: string): Promise<string> {
    await this.ensureInitialized();
    const resolvedSessionId: string = sessionId || ((await getSessionId()) as string);
    return this.asgardeo.getIdToken(resolvedSessionId);
  }

  override getConfiguration(): T {
    return this.asgardeo.getConfigData() as unknown as T;
  }

  override signIn(
    options?: SignInOptions,
    sessionId?: string,
    onSignInSuccess?: (afterSignInUrl: string) => void,
  ): Promise<User>;
  override signIn(
    payload: EmbeddedSignInFlowHandleRequestPayload,
    request: EmbeddedFlowExecuteRequestConfig,
    sessionId?: string,
    onSignInSuccess?: (afterSignInUrl: string) => void,
  ): Promise<User>;
  override async signIn(...args: any[]): Promise<User> {
    const arg1: any = args[0];
    const arg2: any = args[1];
    const arg3: any = args[2];
    const arg4: any = args[3];

    if (typeof arg1 === 'object' && 'flowId' in arg1) {
      if (arg1.flowId === '') {
        const defaultSignInUrl: URL = new URL(
          await this.getAuthorizeRequestUrl({
            client_secret: '{{clientSecret}}',
            response_mode: 'direct',
          }),
        );

        return initializeEmbeddedSignInFlow({
          payload: Object.fromEntries(defaultSignInUrl.searchParams.entries()),
          url: `${defaultSignInUrl.origin}${defaultSignInUrl.pathname}`,
        });
      }

      return executeEmbeddedSignInFlow({
        payload: arg1,
        url: arg2.url,
      });
    }

    return this.asgardeo.signIn(
      arg4,
      arg3,
      arg1?.code,
      arg1?.session_state,
      arg1?.state,
      arg1 as any,
    ) as unknown as Promise<User>;
  }

  override signOut(options?: SignOutOptions, afterSignOut?: (afterSignOutUrl: string) => void): Promise<string>;
  override signOut(
    options?: SignOutOptions,
    sessionId?: string,
    afterSignOut?: (afterSignOutUrl: string) => void,
  ): Promise<string>;
  override async signOut(...args: any[]): Promise<string> {
    if (args[1] && typeof args[1] !== 'string') {
      throw new Error('The second argument must be a string.');
    }

    const resolvedSessionId: string = args[1] || ((await getSessionId()) as string);

    return Promise.resolve(await this.asgardeo.signOut(resolvedSessionId));
  }

  override async signUp(options?: SignUpOptions): Promise<void>;
  override async signUp(payload: EmbeddedFlowExecuteRequestPayload): Promise<EmbeddedFlowExecuteResponse>;
  override async signUp(...args: any[]): Promise<void | EmbeddedFlowExecuteResponse> {
    if (args.length === 0) {
      throw new AsgardeoRuntimeError(
        'No arguments provided for signUp method.',
        'AsgardeoNextClient-ValidationError-001',
        'nextjs',
        'The signUp method requires at least one argument, either a SignUpOptions object or an EmbeddedFlowExecuteRequestPayload.',
      );
    }

    const firstArg: any = args[0];

    if (typeof firstArg === 'object' && 'flowType' in firstArg) {
      const configData: AuthClientConfig<T> = await this.asgardeo.getConfigData();
      const baseUrl: string | undefined = configData?.baseUrl;

      return executeEmbeddedSignUpFlow({
        baseUrl,
        payload: firstArg as EmbeddedFlowExecuteRequestPayload,
      });
    }
    throw new AsgardeoRuntimeError(
      'Not implemented',
      'AsgardeoNextClient-ValidationError-002',
      'nextjs',
      'The signUp method with SignUpOptions is not implemented in the Next.js client.',
    );
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  override signInSilently(_options?: SignInOptions): Promise<User | boolean> {
    throw new AsgardeoRuntimeError(
      'Not implemented',
      'AsgardeoNextClient-signInSilently-NotImplementedError-001',
      'nextjs',
      'The signInSilently method is not implemented in the Next.js client.',
    );
  }

  /**
   * Gets the sign-in URL for authentication.
   * Ensures the client is initialized before making the call.
   *
   * @param customParams - Custom parameters to include in the sign-in URL.
   * @param userId - The user ID
   * @returns Promise that resolves to the sign-in URL
   */
  public async getAuthorizeRequestUrl(
    customParams: ExtendedAuthorizeRequestUrlParams,
    userId?: string,
  ): Promise<string> {
    await this.ensureInitialized();
    return this.asgardeo.getSignInUrl(customParams, userId);
  }

  /**
   * Gets the storage manager from the underlying Asgardeo client.
   * Ensures the client is initialized before making the call.
   *
   * @returns Promise that resolves to the storage manager
   */
  public async getStorageManager(): Promise<any> {
    await this.ensureInitialized();
    return this.asgardeo.getStorageManager();
  }

  // eslint-disable-next-line class-methods-use-this
  public async clearSession(): Promise<void> {
    throw new AsgardeoRuntimeError(
      'Not implemented',
      'AsgardeoNextClient-clearSession-NotImplementedError-001',
      'nextjs',
      'The clearSession method is not implemented in the Next.js client.',
    );
  }

  override async setSession(sessionData: Record<string, unknown>, sessionId?: string): Promise<void> {
    return (await this.asgardeo.getStorageManager()).setSessionData(sessionData, sessionId);
  }

  override decodeJwtToken<R = Record<string, unknown>>(token: string): Promise<R> {
    return this.asgardeo.decodeJwtToken<R>(token);
  }
}

export default AsgardeoNextClient;
