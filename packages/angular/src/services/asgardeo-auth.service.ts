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

import {Injectable, Inject, signal, computed, OnDestroy, Signal, WritableSignal} from '@angular/core';
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
} from '@asgardeo/browser';
import {BehaviorSubject, Observable} from 'rxjs';
import AsgardeoAngularClient from '../AsgardeoAngularClient';
import {AsgardeoAngularConfig} from '../models/config';
import {ASGARDEO_CONFIG} from '../providers/asgardeo-config.token';

/**
 * Core authentication service for Asgardeo Angular SDK.
 *
 * This service manages the authentication lifecycle and provides reactive state
 * via both Angular Signals and RxJS Observables.
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

  // --- RxJS Observables (for consumers preferring Observable API) ---
  private readonly _isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  private readonly _isSignedIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private readonly _isInitialized$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private readonly _user$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  readonly isLoading$: Observable<boolean> = this._isLoading$.asObservable();

  readonly isSignedIn$: Observable<boolean> = this._isSignedIn$.asObservable();

  readonly isInitialized$: Observable<boolean> = this._isInitialized$.asObservable();

  readonly user$: Observable<User | null> = this._user$.asObservable();

  // --- Internal state ---
  private client: AsgardeoAngularClient;

  private config: AsgardeoAngularConfig;

  private signInCheckInterval: ReturnType<typeof setInterval> | null = null;

  private loadingCheckInterval: ReturnType<typeof setInterval> | null = null;

  private isUpdatingSession: boolean = false;

  constructor(@Inject(ASGARDEO_CONFIG) config: AsgardeoAngularConfig) {
    this.config = {...config};
    this.client = new AsgardeoAngularClient(config.instanceId ?? 0);
    this._baseUrl.set(config.baseUrl || '');
  }

  /**
   * Initialize the Asgardeo client. This is called automatically via APP_INITIALIZER.
   * It mirrors the initialization logic from AsgardeoProvider's useEffect.
   */
  async initialize(): Promise<void> {
    try {
      await this.client.initialize(this.config);
      const initializedConfig: AsgardeoAngularConfig = this.client.getConfiguration();
      this.config = initializedConfig;

      if (initializedConfig?.platform) {
        sessionStorage.setItem('asgardeo_platform', initializedConfig.platform);
      }
      if (initializedConfig?.baseUrl) {
        sessionStorage.setItem('asgardeo_base_url', initializedConfig.baseUrl);
        this._baseUrl.set(initializedConfig.baseUrl);
      }

      this.syncState('isInitialized', true);

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
          this.syncState('isLoading', true);

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
          this.syncState('isLoading', this.client.isLoading());
        }
      } else {
        this.syncState('isLoading', false);
      }

      this.startSignInPolling();
      this.startLoadingStateTracking();
    } catch (error) {
      this.syncState('isLoading', false);
      throw error;
    }
  }

  // --- Auth Methods ---

  async signIn(options?: SignInOptions): Promise<User> {
    try {
      this.isUpdatingSession = true;
      this.syncState('isLoading', true);

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
      this.syncState('isLoading', this.client.isLoading());
    }
  }

  async signInSilently(options?: SignInOptions): Promise<User | boolean> {
    try {
      this.isUpdatingSession = true;
      this.syncState('isLoading', true);
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
      this.syncState('isLoading', this.client.isLoading());
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
      this.syncState('isLoading', true);
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
      this.syncState('isLoading', this.client.isLoading());
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

  async reInitialize(config: Partial<AsgardeoAngularConfig>): Promise<boolean> {
    return this.client.reInitialize(config);
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
      this.syncState('isLoading', true);
      let resolvedBaseUrl: string = this._baseUrl();

      const decodedToken: IdToken = await this.client.getDecodedIdToken();

      // If there's a `user_org` claim, treat this as an organization login
      if (decodedToken?.['user_org']) {
        resolvedBaseUrl = `${this.client.getConfiguration().baseUrl}/o`;
        this._baseUrl.set(resolvedBaseUrl);
      }

      if (this.config.platform === Platform.AsgardeoV2) {
        const claims: Record<string, any> = extractUserClaimsFromIdToken(decodedToken);
        this._user.set(claims as User);
        this._user$.next(claims as User);
        this._userProfile.set({
          flattenedProfile: claims as User,
          profile: claims as User,
          schemas: [],
        });
      } else {
        try {
          const fetchedUser: User = await this.client.getUser({baseUrl: resolvedBaseUrl});
          this._user.set(fetchedUser);
          this._user$.next(fetchedUser);
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
      this.syncState('isSignedIn', currentSignInStatus);
    } catch {
      // Silently handle session update failure
    } finally {
      this.isUpdatingSession = false;
      this.syncState('isLoading', this.client.isLoading());
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
      this.syncState('isSignedIn', status);

      if (!status) {
        this.signInCheckInterval = setInterval(async () => {
          const newStatus: boolean = await this.client.isSignedIn();

          if (newStatus) {
            this.syncState('isSignedIn', true);
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
   * Tracks loading state changes from the client. Mirrors AsgardeoProvider's loading state tracking useEffect.
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

      this.syncState('isLoading', this.client.isLoading());
    }, 100);
  }

  /**
   * Syncs a state value across both the signal and BehaviorSubject.
   */
  private syncState(key: string, value: any): void {
    switch (key) {
      case 'isLoading':
        this._isLoading.set(value);
        this._isLoading$.next(value);
        break;
      case 'isSignedIn':
        this._isSignedIn.set(value);
        this._isSignedIn$.next(value);
        break;
      case 'isInitialized':
        this._isInitialized.set(value);
        this._isInitialized$.next(value);
        break;
      default:
        break;
    }
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
    this._isLoading$.complete();
    this._isSignedIn$.complete();
    this._isInitialized$.complete();
    this._user$.complete();
  }
}
