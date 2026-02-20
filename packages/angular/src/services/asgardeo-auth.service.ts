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

import {Injectable, Inject, Injector, signal, computed, OnDestroy, Signal, WritableSignal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {
  AsgardeoRuntimeError,
  User,
  UserProfile,
  Organization,
  IdToken,
  TokenResponse,
  SignInOptions,
  SignOutOptions,
  HttpRequestConfig,
  HttpResponse,
  TokenExchangeRequestConfig,
  hasAuthParamsInUrl,
  hasCalledForThisInstanceInUrl,
  Platform,
  extractUserClaimsFromIdToken,
  generateFlattenedUserProfile,
} from '@asgardeo/browser';
import {Observable} from 'rxjs';
import AsgardeoAngularClient from '../AsgardeoAngularClient';
import {AsgardeoAngularConfig} from '../models/config';
import {ASGARDEO_CONFIG} from '../providers/asgardeo-config.token';

/**
 * Core authentication service for Asgardeo Angular SDK.
 *
 * This service manages the authentication lifecycle and provides reactive state
 * via Angular Signals (primary) with RxJS Observable accessors derived via `toObservable()`.
 *
 * It is the Angular equivalent of React's `AsgardeoProvider` + `useAsgardeo()` hook.
 */
@Injectable()
export class AsgardeoAuthService implements OnDestroy {
  // --- Angular Signals (primary reactive state) ---
  private readonly _isLoading: WritableSignal<boolean> = signal(true);

  private readonly _isSignedIn: WritableSignal<boolean> = signal(false);

  private readonly _isInitialized: WritableSignal<boolean> = signal(false);

  private readonly _user: WritableSignal<User | null> = signal(null);

  private readonly _currentOrganization: WritableSignal<Organization | null> = signal(null);

  private readonly _userProfile: WritableSignal<UserProfile | null> = signal(null);

  private readonly _myOrganizations: WritableSignal<Organization[]> = signal([]);

  private readonly _baseUrl: WritableSignal<string> = signal('');

  // --- Read-only public signals ---
  readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();

  readonly isSignedIn: Signal<boolean> = this._isSignedIn.asReadonly();

  readonly isInitialized: Signal<boolean> = this._isInitialized.asReadonly();

  readonly user: Signal<User | null> = this._user.asReadonly();

  readonly currentOrganization: Signal<Organization | null> = this._currentOrganization.asReadonly();

  readonly userProfile: Signal<UserProfile | null> = this._userProfile.asReadonly();

  readonly myOrganizations: Signal<Organization[]> = this._myOrganizations.asReadonly();

  // --- Computed signals ---
  readonly flattenedProfile: Signal<User | null> = computed(() => this._userProfile()?.flattenedProfile ?? null);

  readonly profile: Signal<User | null> = computed(() => this._userProfile()?.profile ?? null);

  // --- RxJS Observables (derived from signals via toObservable) ---
  readonly isLoading$: Observable<boolean>;

  readonly isSignedIn$: Observable<boolean>;

  readonly isInitialized$: Observable<boolean>;

  readonly user$: Observable<User | null>;

  // --- Internal state ---
  private client: AsgardeoAngularClient;

  private config: AsgardeoAngularConfig;

  private signInCheckInterval: ReturnType<typeof setInterval> | null = null;

  private loadingCheckInterval: ReturnType<typeof setInterval> | null = null;

  private isUpdatingSession: boolean = false;

  constructor(
    @Inject(ASGARDEO_CONFIG) config: AsgardeoAngularConfig,
    injector: Injector,
  ) {
    this.config = {...config};
    this.client = new AsgardeoAngularClient(config.instanceId ?? 0);
    this._baseUrl.set(config.baseUrl || '');

    // Derive observables from signals within the injection context
    this.isLoading$ = toObservable(this.isLoading, {injector});
    this.isSignedIn$ = toObservable(this.isSignedIn, {injector});
    this.isInitialized$ = toObservable(this.isInitialized, {injector});
    this.user$ = toObservable(this.user, {injector});
  }

  /**
   * Initialize the Asgardeo client. This is called automatically via APP_INITIALIZER.
   * It mirrors the initialization logic from AsgardeoProvider's useEffect.
   */
  async initialize(): Promise<void> {
    try {
      await this.client.initialize(this.config);
      const initializedConfig: AsgardeoAngularConfig = await this.client.getConfigurationAsync();
      this.config = initializedConfig;

      if (initializedConfig?.platform) {
        sessionStorage.setItem('asgardeo_platform', initializedConfig.platform);
      }
      if (initializedConfig?.baseUrl) {
        sessionStorage.setItem('asgardeo_base_url', initializedConfig.baseUrl);
        this._baseUrl.set(initializedConfig.baseUrl);
      }

      this.setInitializedState(true);

      // Check if user is already signed in
      const isAlreadySignedIn: boolean = await this.client.isSignedIn();

      if (isAlreadySignedIn) {
        await this.updateSession();
        this.startSignInPolling();
        return;
      }

      // Check for auth params in URL (OAuth callback handling)
      const currentUrl: URL = new URL(window.location.href);
      const afterSignInUrl: string = this.config.afterSignInUrl || window.location.origin;
      const instanceId: number = this.config.instanceId ?? 0;

      const hasParams: boolean =
        hasAuthParamsInUrl() &&
        new URL(currentUrl.origin + currentUrl.pathname).toString() === new URL(afterSignInUrl).toString();
      const isForThisInstance: boolean = hasCalledForThisInstanceInUrl(instanceId, currentUrl.search);

      if (hasParams && isForThisInstance) {
        try {
          this.isUpdatingSession = true;
          this.setLoadingState(true);

          await this.client.signIn({callOnlyOnRedirect: true} as any);

          if (await this.client.isSignedIn()) {
            await this.updateSession();
          }
        } catch (error) {
          throw new AsgardeoRuntimeError(
            `Sign in failed: ${error instanceof Error ? error.message : String(JSON.stringify(error))}`,
            'asgardeo-signIn-Error',
            'angular',
            'An error occurred while trying to sign in.',
          );
        } finally {
          this.isUpdatingSession = false;
          this.setLoadingState(this.client.isLoading());
        }
      } else {
        this.setLoadingState(false);
      }

      this.startSignInPolling();
      this.startLoadingStateTracking();
    } catch (error) {
      this.setLoadingState(false);
      throw error;
    }
  }

  // --- Auth Methods ---

  async signIn(options?: SignInOptions): Promise<User> {
    try {
      this.isUpdatingSession = true;
      this.setLoadingState(true);

      const response: User = await this.client.signIn(options);

      if (await this.client.isSignedIn()) {
        await this.updateSession();
      }

      return response;
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Sign in failed: ${error instanceof Error ? error.message : String(JSON.stringify(error))}`,
        'asgardeo-signIn-Error',
        'angular',
        'An error occurred while trying to sign in.',
      );
    } finally {
      this.isUpdatingSession = false;
      this.setLoadingState(this.client.isLoading());
    }
  }

  async signInSilently(options?: SignInOptions): Promise<User | boolean> {
    try {
      this.isUpdatingSession = true;
      this.setLoadingState(true);
      const response: User | boolean = await this.client.signInSilently(options);

      if (await this.client.isSignedIn()) {
        await this.updateSession();
      }

      return response;
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Error while signing in silently: ${error instanceof Error ? error.message : String(JSON.stringify(error))}`,
        'asgardeo-signInSilently-Error',
        'angular',
        'An error occurred while trying to sign in silently.',
      );
    } finally {
      this.isUpdatingSession = false;
      this.setLoadingState(this.client.isLoading());
    }
  }

  async signOut(options?: SignOutOptions): Promise<string> {
    return this.client.signOut(options);
  }

  async signUp(): Promise<void> {
    return this.client.signUp();
  }

  async switchOrganization(organization: Organization): Promise<TokenResponse | Response> {
    try {
      this.isUpdatingSession = true;
      this.setLoadingState(true);
      const response: TokenResponse | Response = await this.client.switchOrganization(organization);

      if (await this.client.isSignedIn()) {
        await this.updateSession();
      }

      return response;
    } catch (error) {
      throw new AsgardeoRuntimeError(
        `Failed to switch organization: ${error instanceof Error ? error.message : String(JSON.stringify(error))}`,
        'asgardeo-switchOrganization-Error',
        'angular',
        'An error occurred while switching to the specified organization.',
      );
    } finally {
      this.isUpdatingSession = false;
      this.setLoadingState(this.client.isLoading());
    }
  }

  // --- Token Methods ---

  async getAccessToken(sessionId?: string): Promise<string> {
    return this.client.getAccessToken(sessionId);
  }

  async getIdToken(): Promise<string> {
    return this.client.getIdToken();
  }

  async getDecodedIdToken(sessionId?: string): Promise<IdToken> {
    return this.client.getDecodedIdToken(sessionId);
  }

  async exchangeToken(config: TokenExchangeRequestConfig): Promise<TokenResponse | Response> {
    return this.client.exchangeToken(config);
  }

  async decodeJwtToken<T>(token: string): Promise<T> {
    return this.client.decodeJwtToken<T>(token);
  }

  // --- HTTP ---

  async request(requestConfig?: HttpRequestConfig): Promise<HttpResponse<any>> {
    return this.client.request(requestConfig);
  }

  async requestAll(requestConfigs?: HttpRequestConfig[]): Promise<HttpResponse<any>[]> {
    return this.client.requestAll(requestConfigs);
  }

  // --- Session ---

  clearSession(sessionId?: string): void {
    this.client.clearSession(sessionId);
  }

  async setSession(data: Record<string, unknown>, sessionId?: string): Promise<void> {
    return this.client.setSession(data, sessionId);
  }

  // --- Configuration ---

  getConfiguration(): AsgardeoAngularConfig {
    return this.config;
  }

  /**
   * Returns the resolved base URL, including the `/o` suffix for organization logins.
   */
  getBaseUrl(): string {
    return this._baseUrl();
  }

  async reInitialize(config: Partial<AsgardeoAngularConfig>): Promise<boolean> {
    return this.client.reInitialize(config);
  }

  // --- Session Refresh ---

  /**
   * Re-fetches user, profile, and organization data from the server.
   * Use this to refresh the cached session state without re-initializing the client.
   */
  async refreshSession(): Promise<void> {
    return this.updateSession();
  }

  // --- State Mutations (for secondary services) ---

  /**
   * Updates the cached user and user profile after a successful SCIM2 PATCH.
   *
   * @param updatedUser - The updated user object returned from the SCIM2 API.
   */
  handleProfileUpdate(updatedUser: User): void {
    this._user.set(updatedUser);

    const currentProfile: UserProfile | null = this._userProfile();
    this._userProfile.set({
      ...currentProfile,
      flattenedProfile: generateFlattenedUserProfile(updatedUser, currentProfile?.schemas),
      profile: updatedUser,
    } as UserProfile);
  }

  /**
   * Updates the cached list of the user's organizations.
   *
   * @param organizations - The updated list of organizations.
   */
  setMyOrganizations(organizations: Organization[]): void {
    this._myOrganizations.set(organizations);
  }

  // --- Internal: Expose client for secondary services ---

  /** @internal */
  getClient(): AsgardeoAngularClient {
    return this.client;
  }

  // --- Private Methods ---

  /**
   * Fetches user, user profile, and organization data after sign-in.
   * Mirrors AsgardeoProvider's updateSession() function.
   */
  private async updateSession(): Promise<void> {
    try {
      this.isUpdatingSession = true;
      this.setLoadingState(true);
      let resolvedBaseUrl: string = this._baseUrl();

      const decodedToken: IdToken = await this.client.getDecodedIdToken();

      // If there's a `user_org` claim, treat this as an organization login
      if (decodedToken?.['user_org']) {
        resolvedBaseUrl = `${(await this.client.getConfigurationAsync()).baseUrl}/o`;
        this._baseUrl.set(resolvedBaseUrl);
      }

      if (this.config.platform === Platform.AsgardeoV2) {
        const claims: Record<string, any> = extractUserClaimsFromIdToken(decodedToken);
        this._user.set(claims as User);
        this._userProfile.set({
          flattenedProfile: claims as User,
          profile: claims as User,
          schemas: [],
        });
      } else {
        try {
          const fetchedUser: User = await this.client.getUser({baseUrl: resolvedBaseUrl});
          this._user.set(fetchedUser);
        } catch {
          // Silently handle user fetch failure
        }

        try {
          const fetchedUserProfile: UserProfile = await this.client.getUserProfile({baseUrl: resolvedBaseUrl});
          this._userProfile.set(fetchedUserProfile);
        } catch {
          // Silently handle profile fetch failure
        }

        try {
          const fetchedOrganization: Organization = await this.client.getCurrentOrganization();
          this._currentOrganization.set(fetchedOrganization);
        } catch {
          // Silently handle organization fetch failure
        }

        try {
          const fetchedMyOrganizations: Organization[] = await this.client.getMyOrganizations();
          this._myOrganizations.set(fetchedMyOrganizations);
        } catch {
          // Silently handle organizations list fetch failure
        }
      }

      // Update sign-in status BEFORE setting loading to false
      const currentSignInStatus: boolean = await this.client.isSignedIn();
      this.setSignedInState(currentSignInStatus);
    } catch {
      // Silently handle session update failure
    } finally {
      this.isUpdatingSession = false;
      this.setLoadingState(this.client.isLoading());
    }
  }

  /**
   * Polls for sign-in status changes. Mirrors AsgardeoProvider's sign-in status polling useEffect.
   */
  private startSignInPolling(): void {
    if (this.signInCheckInterval) {
      return;
    }

    this.client.isSignedIn().then((status: boolean) => {
      this.setSignedInState(status);

      if (!status) {
        this.signInCheckInterval = setInterval(async () => {
          const newStatus: boolean = await this.client.isSignedIn();

          if (newStatus) {
            this.setSignedInState(true);
            if (this.signInCheckInterval) {
              clearInterval(this.signInCheckInterval);
              this.signInCheckInterval = null;
            }
          }
        }, 1000);
      }
    });
  }

  /**
   * Tracks loading state changes from the client.
   */
  private startLoadingStateTracking(): void {
    this.loadingCheckInterval = setInterval(() => {
      if (this.isUpdatingSession) {
        return;
      }

      const currentUrl: URL = new URL(window.location.href);
      const afterSignInUrl: string = this.config.afterSignInUrl || window.location.origin;
      if (!this._isSignedIn() && hasAuthParamsInUrl()) {
        const currentPathUrl: string = new URL(currentUrl.origin + currentUrl.pathname).toString();
        const afterSignInPathUrl: string = new URL(afterSignInUrl).toString();
        if (currentPathUrl === afterSignInPathUrl) {
          return;
        }
      }

      this.setLoadingState(this.client.isLoading());
    }, 100);
  }

  private setLoadingState(value: boolean): void {
    this._isLoading.set(value);
  }

  private setSignedInState(value: boolean): void {
    this._isSignedIn.set(value);
  }

  private setInitializedState(value: boolean): void {
    this._isInitialized.set(value);
  }

  ngOnDestroy(): void {
    if (this.signInCheckInterval) {
      clearInterval(this.signInCheckInterval);
      this.signInCheckInterval = null;
    }
    if (this.loadingCheckInterval) {
      clearInterval(this.loadingCheckInterval);
      this.loadingCheckInterval = null;
    }
  }
}
