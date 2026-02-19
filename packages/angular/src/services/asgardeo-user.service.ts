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

import {Injectable, Signal, WritableSignal, computed, signal} from '@angular/core';
import {User, UserProfile} from '@asgardeo/browser';
import {BehaviorSubject, Observable} from 'rxjs';
import {AsgardeoAuthService} from './asgardeo-auth.service';
import updateMeProfile, {UpdateMeProfileConfig} from '../api/updateMeProfile';

/**
 * Service for managing user profile data.
 * Angular equivalent of React's `UserProvider` + `useUser()` hook.
 */
@Injectable()
export class AsgardeoUserService {
  private readonly _isLoading: WritableSignal<boolean> = signal(false);

  private readonly _error: WritableSignal<Error | null> = signal(null);

  readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();

  readonly error: Signal<Error | null> = this._error.asReadonly();

  /** The full user profile (profile, flattenedProfile, schemas). Delegates to AsgardeoAuthService. */
  readonly userProfile: Signal<UserProfile | null>;

  readonly flattenedProfile: Signal<User | null>;

  readonly profile: Signal<User | null>;

  readonly schemas: Signal<any[]>;

  // Observable variants
  private readonly _isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  readonly isLoading$: Observable<boolean> = this._isLoading$.asObservable();

  constructor(private authService: AsgardeoAuthService) {
    // Delegate to auth service's user profile signal
    this.userProfile = this.authService.userProfile;
    this.flattenedProfile = this.authService.flattenedProfile;
    this.profile = this.authService.profile;
    this.schemas = computed(() => this.authService.userProfile()?.schemas ?? []);
  }

  /**
   * Refreshes the user profile by re-fetching from the server.
   */
  async refreshUser(): Promise<void> {
    this._isLoading.set(true);
    this._isLoading$.next(true);
    this._error.set(null);

    try {
      // Re-initialize to trigger updateSession which refreshes the user data
      await this.authService.reInitialize({});
    } catch (error) {
      this._error.set(error instanceof Error ? error : new Error('Failed to refresh user profile'));
    } finally {
      this._isLoading.set(false);
      this._isLoading$.next(false);
    }
  }

  /**
   * Updates the user profile via the SCIM2 API.
   *
   * @param config - The update configuration containing operations and baseUrl.
   * @returns The updated user profile data.
   */
  async updateUser(config: UpdateMeProfileConfig): Promise<User> {
    this._isLoading.set(true);
    this._isLoading$.next(true);
    this._error.set(null);

    try {
      const result: User = await updateMeProfile(config);
      return result;
    } catch (error) {
      this._error.set(error instanceof Error ? error : new Error('Failed to update user profile'));
      throw error;
    } finally {
      this._isLoading.set(false);
      this._isLoading$.next(false);
    }
  }
}
