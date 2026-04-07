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
  AsgardeoBrowserClient,
  flattenUserSchema,
  generateFlattenedUserProfile,
  UserProfile,
  SignInOptions,
  SignOutOptions,
  User,
  generateUserProfile,
  EmbeddedFlowExecuteResponse,
  SignUpOptions,
  EmbeddedFlowExecuteRequestPayload,
  AsgardeoRuntimeError,
  executeEmbeddedSignUpFlow,
  EmbeddedSignInFlowHandleRequestPayload,
  executeEmbeddedSignInFlow,
  executeEmbeddedSignInFlowV2,
  Organization,
  IdToken,
  EmbeddedFlowExecuteRequestConfig,
  deriveOrganizationHandleFromBaseUrl,
  AllOrganizationsApiResponse,
  extractUserClaimsFromIdToken,
  TokenResponse,
  HttpRequestConfig,
  HttpResponse,
  navigate,
  getRedirectBasedSignUpUrl,
  Config,
  TokenExchangeRequestConfig,
  Platform,
  isEmpty,
  EmbeddedSignInFlowResponseV2,
  executeEmbeddedSignUpFlowV2,
  EmbeddedSignInFlowStatusV2,
} from '@asgardeo/browser';
import AuthAPI from './__temp__/api';
import getAllOrganizations from './api/getAllOrganizations';
import getMeOrganizations from './api/getMeOrganizations';
import getSchemas from './api/getSchemas';
import getScim2Me from './api/getScim2Me';
import {AsgardeoVueConfig} from './models/config';

/**
 * Client for implementing Asgardeo in Vue applications.
 * This class provides the core functionality for managing user authentication and sessions.
 *
 * @typeParam T - Configuration type that extends AsgardeoVueConfig.
 */
class AsgardeoVueClient<T extends AsgardeoVueConfig = AsgardeoVueConfig> extends AsgardeoBrowserClient<T> {
  private asgardeo: AuthAPI;

  private loadingState: boolean = false;

  private clientInstanceId: number;

  constructor(instanceId: number = 0) {
    super();
    this.clientInstanceId = instanceId;

    // FIXME: This has to be the browser client from `@asgardeo/browser` package.
    this.asgardeo = new AuthAPI(undefined, instanceId);
  }

  public getInstanceId(): number {
    return this.clientInstanceId;
  }

  private setLoading(loading: boolean): void {
    this.loadingState = loading;
  }

  private async withLoading<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    this.setLoading(true);
    try {
      const result: TResult = await operation();
      return result;
    } finally {
      this.setLoading(false);
    }
  }

  override initialize(config: AsgardeoVueConfig): Promise<boolean> {
    let resolvedOrganizationHandle: string | undefined = config?.organizationHandle;

    if (!resolvedOrganizationHandle) {
      resolvedOrganizationHandle = deriveOrganizationHandleFromBaseUrl(config?.baseUrl);
    }

    return this.withLoading(async () =>
      this.asgardeo.init({...config, organizationHandle: resolvedOrganizationHandle} as any),
    );
  }

  override reInitialize(config: Partial<AsgardeoVueConfig>): Promise<boolean> {
    return this.withLoading(async () => {
      let isInitialized: boolean;

      try {
        await this.asgardeo.reInitialize(config as any);
        isInitialized = true;
      } catch (error) {
        throw new AsgardeoRuntimeError(
          `Failed to check if the client is initialized: ${error instanceof Error ? error.message : String(error)}`,
          'AsgardeoVueClient-reInitialize-RuntimeError-001',
          'vue',
          'An error occurred while checking the initialization status of the client.',
        );
      }

      return isInitialized;
    });
  }

  // eslint-disable-next-line class-methods-use-this
  override async updateUserProfile(): Promise<User> {
    throw new Error('Not implemented');
  }

  override async getUser(options?: any): Promise<User> {
    try {
      let baseUrl: string = options?.baseUrl;

      if (!baseUrl) {
        const configData: any = await this.asgardeo.getConfigData();
        baseUrl = configData?.baseUrl;
      }

      const profile: User = await getScim2Me({baseUrl});
      const schemas: any = await getSchemas({baseUrl});

      return generateUserProfile(profile, flattenUserSchema(schemas));
    } catch (error) {
      return extractUserClaimsFromIdToken(await this.getDecodedIdToken());
    }
  }

  async getDecodedIdToken(sessionId?: string): Promise<IdToken> {
    return this.asgardeo.getDecodedIdToken(sessionId);
  }

  async getIdToken(): Promise<string> {
    return this.withLoading(async () => this.asgardeo.getIdToken());
  }

  override async getUserProfile(options?: any): Promise<UserProfile> {
    return this.withLoading(async () => {
      try {
        let baseUrl: string = options?.baseUrl;

        if (!baseUrl) {
          const configData: any = await this.asgardeo.getConfigData();
          baseUrl = configData?.baseUrl;
        }

        const profile: User = await getScim2Me({baseUrl, instanceId: this.getInstanceId()});
        const schemas: any = await getSchemas({baseUrl, instanceId: this.getInstanceId()});

        const processedSchemas: any = flattenUserSchema(schemas);

        const output: UserProfile = {
          flattenedProfile: generateFlattenedUserProfile(profile, processedSchemas),
          profile,
          schemas: processedSchemas,
        };

        return output;
      } catch (error) {
        return {
          flattenedProfile: extractUserClaimsFromIdToken(await this.getDecodedIdToken()),
          profile: extractUserClaimsFromIdToken(await this.getDecodedIdToken()),
          schemas: [],
        };
      }
    });
  }

  override async getMyOrganizations(options?: any): Promise<Organization[]> {
    try {
      let baseUrl: string = options?.baseUrl;

      if (!baseUrl) {
        const configData: any = await this.asgardeo.getConfigData();
        baseUrl = configData?.baseUrl;
      }

      return await getMeOrganizations({baseUrl, instanceId: this.getInstanceId()});
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Failed to fetch the user's associated organizations: ${
          error instanceof Error ? error.message : String(error)
        }`,
        'AsgardeoVueClient-getMyOrganizations-RuntimeError-001',
        'vue',
        'An error occurred while fetching associated organizations of the signed-in user.',
      );
    }
  }

  override async getAllOrganizations(options?: any): Promise<AllOrganizationsApiResponse> {
    try {
      let baseUrl: string = options?.baseUrl;

      if (!baseUrl) {
        const configData: any = await this.asgardeo.getConfigData();
        baseUrl = configData?.baseUrl;
      }

      return await getAllOrganizations({baseUrl, instanceId: this.getInstanceId()});
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Failed to fetch all organizations: ${error instanceof Error ? error.message : String(error)}`,
        'AsgardeoVueClient-getAllOrganizations-RuntimeError-001',
        'vue',
        'An error occurred while fetching all the organizations associated with the user.',
      );
    }
  }

  override async getCurrentOrganization(): Promise<Organization | null> {
    try {
      return await this.withLoading(async () => {
        const idToken: IdToken = await this.getDecodedIdToken();
        return {
          id: idToken?.org_id,
          name: idToken?.org_name,
          orgHandle: idToken?.org_handle,
        };
      });
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Failed to fetch the current organization: ${error instanceof Error ? error.message : String(error)}`,
        'AsgardeoVueClient-getCurrentOrganization-RuntimeError-001',
        'vue',
        'An error occurred while fetching the current organization of the signed-in user.',
      );
    }
  }

  override async switchOrganization(organization: Organization): Promise<TokenResponse | Response> {
    return this.withLoading(async () => {
      try {
        const configData: any = await this.asgardeo.getConfigData();
        const sourceInstanceId: number | undefined = configData?.organizationChain?.sourceInstanceId;

        if (!organization.id) {
          throw new AsgardeoRuntimeError(
            'Organization ID is required for switching organizations',
            'vue-AsgardeoVueClient-SwitchOrganizationError-001',
            'vue',
            'The organization object must contain a valid ID to perform the organization switch.',
          );
        }

        const exchangeConfig: TokenExchangeRequestConfig = {
          attachToken: false,
          data: {
            client_id: '{{clientId}}',
            grant_type: 'organization_switch',
            scope: '{{scopes}}',
            switching_organization: organization.id,
            token: '{{accessToken}}',
          },
          id: 'organization-switch',
          returnsSession: true,
          signInRequired: sourceInstanceId === undefined,
        };

        return (await this.asgardeo.exchangeToken(exchangeConfig, () => {})) as TokenResponse | Response;
      } catch (error) {
        throw new AsgardeoRuntimeError(
          `Failed to switch organization: ${error.message || error}`,
          'vue-AsgardeoVueClient-SwitchOrganizationError-003',
          'vue',
          'An error occurred while switching to the specified organization. Please try again.',
        );
      }
    });
  }

  override isLoading(): boolean {
    return this.loadingState || this.asgardeo.isLoading();
  }

  async isInitialized(): Promise<boolean> {
    return this.asgardeo.isInitialized();
  }

  override async isSignedIn(): Promise<boolean> {
    return this.asgardeo.isSignedIn();
  }

  override getConfiguration(): T {
    return this.asgardeo.getConfigData() as unknown as T;
  }

  override async exchangeToken(config: TokenExchangeRequestConfig): Promise<TokenResponse | Response> {
    return this.withLoading(
      async () => this.asgardeo.exchangeToken(config, () => {}) as unknown as TokenResponse | Response,
    );
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
  override async signIn(...args: any[]): Promise<User | EmbeddedSignInFlowResponseV2> {
    return this.withLoading(async () => {
      const arg1: any = args[0];
      const arg2: any = args[1];

      const config: AsgardeoVueConfig | undefined = (await this.asgardeo.getConfigData()) as
        | AsgardeoVueConfig
        | undefined;

      const platformFromStorage: string | null = sessionStorage.getItem('asgardeo_platform');
      const isV2Platform: boolean =
        (config && config.platform === Platform.AsgardeoV2) || platformFromStorage === 'AsgardeoV2';

      if (isV2Platform && typeof arg1 === 'object' && arg1 !== null && (arg1 as any).callOnlyOnRedirect === true) {
        return undefined as any;
      }

      if (
        isV2Platform &&
        typeof arg1 === 'object' &&
        arg1 !== null &&
        !isEmpty(arg1) &&
        ('executionId' in arg1 || 'applicationId' in arg1)
      ) {
        const authIdFromUrl: string = new URL(window.location.href).searchParams.get('authId');
        const authIdFromStorage: string = sessionStorage.getItem('asgardeo_auth_id');
        const authId: string = authIdFromUrl || authIdFromStorage;
        const baseUrlFromStorage: string = sessionStorage.getItem('asgardeo_base_url');
        const baseUrl: string = config?.baseUrl || baseUrlFromStorage;

        const response: EmbeddedSignInFlowResponseV2 = await executeEmbeddedSignInFlowV2({
          authId,
          baseUrl,
          payload: arg1 as EmbeddedSignInFlowHandleRequestPayload,
          url: arg2?.url,
        });

        if (
          isV2Platform &&
          response &&
          typeof response === 'object' &&
          response['flowStatus'] === EmbeddedSignInFlowStatusV2.Complete &&
          response['assertion']
        ) {
          const decodedAssertion: {
            [key: string]: unknown;
            exp?: number;
            iat?: number;
            scope?: string;
          } = await this.decodeJwtToken<{
            [key: string]: unknown;
            exp?: number;
            iat?: number;
            scope?: string;
          }>(response['assertion']);

          const createdAt: number = decodedAssertion.iat ? decodedAssertion.iat * 1000 : Date.now();
          const expiresIn: number =
            decodedAssertion.exp && decodedAssertion.iat ? decodedAssertion.exp - decodedAssertion.iat : 3600;

          await this.setSession({
            access_token: response['assertion'],
            created_at: createdAt,
            expires_in: expiresIn,
            id_token: response['assertion'],
            scope: decodedAssertion.scope,
            token_type: 'Bearer',
          });
        }

        return response;
      }

      if (typeof arg1 === 'object' && 'flowId' in arg1 && typeof arg2 === 'object' && 'url' in arg2) {
        return executeEmbeddedSignInFlow({
          payload: arg1,
          url: arg2.url,
        });
      }

      return (await this.asgardeo.signIn(arg1 as any)) as unknown as Promise<User>;
    });
  }

  override async signInSilently(options?: SignInOptions): Promise<User | boolean> {
    return this.asgardeo.signInSilently(options as Record<string, string | boolean>);
  }

  override signOut(options?: SignOutOptions, afterSignOut?: (afterSignOutUrl: string) => void): Promise<string>;
  override signOut(
    options?: SignOutOptions,
    sessionId?: string,
    afterSignOut?: (afterSignOutUrl: string) => void,
  ): Promise<string>;
  override async signOut(...args: any[]): Promise<string> {
    let afterSignOut: ((url: string) => void) | undefined;

    if (typeof args[1] === 'string') {
      // Overload 2: signOut(options, sessionId, afterSignOut?)
      [, , afterSignOut] = args;
    } else if (typeof args[1] === 'function') {
      // Overload 1: signOut(options, afterSignOut)
      [, afterSignOut] = args;
    }

    const config: AsgardeoVueConfig = (await this.asgardeo.getConfigData()) as AsgardeoVueConfig;

    if (config.platform === Platform.AsgardeoV2) {
      this.asgardeo.clearSession();

      if (config.signInUrl) {
        navigate(config.signInUrl);
      } else {
        this.signIn(config.signInOptions);
      }

      afterSignOut?.(config.afterSignOutUrl || '');

      return Promise.resolve(config.afterSignOutUrl || '');
    }

    const response: boolean = await this.asgardeo.signOut(afterSignOut as any);

    return Promise.resolve(String(response));
  }

  override async signUp(options?: SignUpOptions): Promise<void>;
  override async signUp(payload: EmbeddedFlowExecuteRequestPayload): Promise<EmbeddedFlowExecuteResponse>;
  override async signUp(...args: any[]): Promise<void | EmbeddedFlowExecuteResponse> {
    const config: AsgardeoVueConfig = (await this.asgardeo.getConfigData()) as AsgardeoVueConfig;
    const firstArg: any = args[0];
    const baseUrl: string = config?.baseUrl;

    if (config.platform === Platform.AsgardeoV2) {
      const authIdFromUrl: string = new URL(window.location.href).searchParams.get('authId');
      const authIdFromStorage: string = sessionStorage.getItem('asgardeo_auth_id');
      const authId: string = authIdFromUrl || authIdFromStorage;

      if (authIdFromUrl && !authIdFromStorage) {
        sessionStorage.setItem('asgardeo_auth_id', authIdFromUrl);
      }

      return executeEmbeddedSignUpFlowV2({
        authId,
        baseUrl,
        payload:
          typeof firstArg === 'object' && 'flowType' in firstArg
            ? {...(firstArg as EmbeddedFlowExecuteRequestPayload), verbose: true}
            : (firstArg as EmbeddedFlowExecuteRequestPayload),
      }) as any;
    }

    if (typeof firstArg === 'object' && 'flowType' in firstArg) {
      return executeEmbeddedSignUpFlow({
        baseUrl,
        payload: firstArg as EmbeddedFlowExecuteRequestPayload,
      });
    }

    navigate(getRedirectBasedSignUpUrl(config as Config));
    return undefined;
  }

  async request(requestConfig?: HttpRequestConfig): Promise<HttpResponse<any>> {
    return this.asgardeo.httpRequest(requestConfig);
  }

  async requestAll(requestConfigs?: HttpRequestConfig[]): Promise<HttpResponse<any>[]> {
    return this.asgardeo.httpRequestAll(requestConfigs);
  }

  override async getAccessToken(sessionId?: string): Promise<string> {
    return this.asgardeo.getAccessToken(sessionId);
  }

  override clearSession(sessionId?: string): void {
    this.asgardeo.clearSession(sessionId);
  }

  override async setSession(sessionData: Record<string, unknown>, sessionId?: string): Promise<void> {
    return (await this.asgardeo.getStorageManager()).setSessionData(sessionData, sessionId);
  }

  override decodeJwtToken<TResult = Record<string, unknown>>(token: string): Promise<TResult> {
    return this.asgardeo.decodeJwtToken<TResult>(token);
  }
}

export default AsgardeoVueClient;
