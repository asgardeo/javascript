/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
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
  AsgardeoSPAClient,
  AsgardeoRuntimeError,
  flattenUserSchema,
  generateFlattenedUserProfile,
  generateUserProfile,
  extractUserClaimsFromIdToken,
  deriveOrganizationHandleFromBaseUrl,
  navigate,
  getRedirectBasedSignUpUrl,
  User,
  UserProfile,
  Organization,
  IdToken,
  TokenResponse,
  HttpRequestConfig,
  HttpResponse,
  AllOrganizationsApiResponse,
  TokenExchangeRequestConfig,
  SignInOptions,
  SignUpOptions,
  Config,
  Platform,
} from '@asgardeo/browser';
import getAllOrganizations from './api/getAllOrganizations';
import getMeOrganizations from './api/getMeOrganizations';
import getSchemas from './api/getSchemas';
import getScim2Me from './api/getScim2Me';
import {AsgardeoAngularConfig} from './models/config';

/**
 * Client for implementing Asgardeo in Angular applications.
 * This class provides the core functionality for managing user authentication and sessions.
 * It uses AsgardeoSPAClient directly without the __temp__/api.ts wrapper layer.
 *
 * @typeParam T - Configuration type that extends AsgardeoAngularConfig.
 */
class AsgardeoAngularClient<T extends AsgardeoAngularConfig = AsgardeoAngularConfig> extends AsgardeoBrowserClient<T> {
  private spaClient: AsgardeoSPAClient;

  private loadingState: boolean = false;

  private clientInstanceId: number;

  /**
   * Creates a new AsgardeoAngularClient instance.
   * @param instanceId - Optional instance ID for multi-auth context support. Defaults to 0.
   */
  constructor(instanceId: number = 0) {
    super();
    this.clientInstanceId = instanceId;
    this.spaClient = AsgardeoSPAClient.getInstance(instanceId);
  }

  /**
   * Get the instance ID for this client.
   * @returns The instance ID used for multi-auth context support.
   */
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

  override initialize(config: AsgardeoAngularConfig): Promise<boolean> {
    let resolvedOrganizationHandle: string | undefined = config?.organizationHandle;

    if (!resolvedOrganizationHandle) {
      resolvedOrganizationHandle = deriveOrganizationHandleFromBaseUrl(config?.baseUrl);
    }

    return this.withLoading(async () =>
      this.spaClient.initialize({...config, organizationHandle: resolvedOrganizationHandle} as any),
    );
  }

  override reInitialize(config: Partial<AsgardeoAngularConfig>): Promise<boolean> {
    return this.withLoading(async () => {
      try {
        await this.spaClient.reInitialize(config as any);
        return true;
      } catch (error) {
        throw new AsgardeoRuntimeError(
          `Failed to re-initialize the client: ${error instanceof Error ? error.message : String(error)}`,
          'AsgardeoAngularClient-reInitialize-RuntimeError-001',
          'angular',
          'An error occurred while re-initializing the client.',
        );
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  override async updateUserProfile(): Promise<User> {
    throw new AsgardeoRuntimeError(
      'updateUserProfile() is not supported in the Angular SDK. Use AsgardeoUserService.updateUser() instead.',
      'AsgardeoAngularClient-updateUserProfile-NotSupported',
      'angular',
      'Use AsgardeoUserService.updateUser() to update the user profile via the SCIM2 API.',
    );
  }

  override async getUser(options?: any): Promise<User> {
    try {
      let baseUrl: string = options?.baseUrl;

      if (!baseUrl) {
        const configData: any = await this.spaClient.getConfigData();
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
    return this.spaClient.getDecodedIdToken(sessionId);
  }

  async getIdToken(): Promise<string> {
    return this.withLoading(async () => this.spaClient.getIdToken());
  }

  async getUserProfile(options?: any): Promise<UserProfile> {
    return this.withLoading(async () => {
      try {
        let baseUrl: string = options?.baseUrl;

        if (!baseUrl) {
          const configData: any = await this.spaClient.getConfigData();
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
        const configData: any = await this.spaClient.getConfigData();
        baseUrl = configData?.baseUrl;
      }

      return await getMeOrganizations({baseUrl, instanceId: this.getInstanceId()});
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Failed to fetch the user's associated organizations: ${
          error instanceof Error ? error.message : String(error)
        }`,
        'AsgardeoAngularClient-getMyOrganizations-RuntimeError-001',
        'angular',
        'An error occurred while fetching associated organizations of the signed-in user.',
      );
    }
  }

  override async getAllOrganizations(options?: any): Promise<AllOrganizationsApiResponse> {
    try {
      let baseUrl: string = options?.baseUrl;

      if (!baseUrl) {
        const configData: any = await this.spaClient.getConfigData();
        baseUrl = configData?.baseUrl;
      }

      return await getAllOrganizations({baseUrl, instanceId: this.getInstanceId()});
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Failed to fetch all organizations: ${error instanceof Error ? error.message : String(error)}`,
        'AsgardeoAngularClient-getAllOrganizations-RuntimeError-001',
        'angular',
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
        'AsgardeoAngularClient-getCurrentOrganization-RuntimeError-001',
        'angular',
        'An error occurred while fetching the current organization of the signed-in user.',
      );
    }
  }

  override async switchOrganization(organization: Organization): Promise<TokenResponse | Response> {
    return this.withLoading(async () => {
      try {
        if (!organization.id) {
          throw new AsgardeoRuntimeError(
            'Organization ID is required for switching organizations',
            'angular-AsgardeoAngularClient-SwitchOrganizationError-001',
            'angular',
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
          signInRequired: true,
        };

        return (await this.spaClient.exchangeToken(exchangeConfig)) as TokenResponse | Response;
      } catch (error) {
        throw new AsgardeoRuntimeError(
          `Failed to switch organization: ${error instanceof Error ? error.message : String(error)}`,
          'angular-AsgardeoAngularClient-SwitchOrganizationError-003',
          'angular',
          'An error occurred while switching to the specified organization. Please try again.',
        );
      }
    });
  }

  override isLoading(): boolean {
    return this.loadingState;
  }

  async isInitialized(): Promise<boolean> {
    return this.spaClient.isInitialized();
  }

  override async isSignedIn(): Promise<boolean> {
    return this.spaClient.isSignedIn();
  }

  /**
   * @deprecated This method returns a Promise at runtime despite its sync return type
   * (inherited from the base class). Use {@link getConfigurationAsync} instead.
   *
   * Calling `getConfiguration().baseUrl` will return `undefined` because the
   * return value is actually a Promise, not the config object.
   */
  override getConfiguration(): T {
    return this.spaClient.getConfigData() as unknown as T;
  }

  /**
   * Returns the resolved configuration data.
   * Always use this instead of {@link getConfiguration} for correct behavior.
   */
  async getConfigurationAsync(): Promise<T> {
    return (await this.spaClient.getConfigData()) as unknown as T;
  }

  override async exchangeToken(config: TokenExchangeRequestConfig): Promise<TokenResponse | Response> {
    return this.withLoading(async () => this.spaClient.exchangeToken(config) as unknown as TokenResponse | Response);
  }

  override async signIn(options?: SignInOptions): Promise<User> {
    return this.withLoading(async () => (await this.spaClient.signIn(options as any)) as unknown as Promise<User>);
  }

  override async signInSilently(options?: SignInOptions): Promise<User | boolean> {
    return this.spaClient.signInSilently(options as Record<string, string | boolean>);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override async signOut(..._args: any[]): Promise<string> {
    const config: AsgardeoAngularConfig = (await this.spaClient.getConfigData()) as any;

    if (config.platform === Platform.AsgardeoV2) {
      this.spaClient.clearSession();
      return Promise.resolve(config.afterSignOutUrl || '');
    }

    const response: boolean = await this.spaClient.signOut();
    return Promise.resolve(String(response));
  }

  override async signUp(options?: SignUpOptions): Promise<void>;
  override async signUp(payload: any): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override async signUp(..._args: any[]): Promise<void | any> {
    const config: AsgardeoAngularConfig = (await this.spaClient.getConfigData()) as any;
    navigate(getRedirectBasedSignUpUrl(config as Config));
  }

  async request(requestConfig?: HttpRequestConfig): Promise<HttpResponse<any>> {
    return this.spaClient.httpRequest(requestConfig);
  }

  async requestAll(requestConfigs?: HttpRequestConfig[]): Promise<HttpResponse<any>[]> {
    return this.spaClient.httpRequestAll(requestConfigs);
  }

  override async getAccessToken(sessionId?: string): Promise<string> {
    return this.spaClient.getAccessToken(sessionId);
  }

  override clearSession(sessionId?: string): void {
    this.spaClient.clearSession(sessionId);
  }

  override async setSession(sessionData: Record<string, unknown>, sessionId?: string): Promise<void> {
    return (await this.spaClient.getStorageManager()).setSessionData(sessionData, sessionId);
  }

  override decodeJwtToken<TResult = Record<string, unknown>>(token: string): Promise<TResult> {
    return this.spaClient.decodeJwtToken<TResult>(token);
  }
}

export default AsgardeoAngularClient;
