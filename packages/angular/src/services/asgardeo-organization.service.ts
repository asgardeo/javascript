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

import {Injectable, Signal, WritableSignal, signal} from '@angular/core';
import {Organization, AllOrganizationsApiResponse, TokenResponse} from '@asgardeo/browser';
import {BehaviorSubject, Observable} from 'rxjs';
import {AsgardeoAuthService} from './asgardeo-auth.service';
import createOrganization, {CreateOrganizationConfig} from '../api/createOrganization';

/**
 * Service for managing organizations.
 * Angular equivalent of React's `OrganizationProvider` + `useOrganization()` hook.
 */
@Injectable()
export class AsgardeoOrganizationService {
  private readonly _isLoading: WritableSignal<boolean> = signal(false);

  private readonly _error: WritableSignal<string | null> = signal(null);

  readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();

  readonly error: Signal<string | null> = this._error.asReadonly();

  /** Delegates to AsgardeoAuthService signals. */
  readonly myOrganizations: Signal<Organization[]>;

  readonly currentOrganization: Signal<Organization | null>;

  // Observable variants
  private readonly _isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  readonly isLoading$: Observable<boolean> = this._isLoading$.asObservable();

  constructor(private authService: AsgardeoAuthService) {
    this.myOrganizations = this.authService.myOrganizations;
    this.currentOrganization = this.authService.currentOrganization;
  }

  /**
   * Fetches all organizations with pagination support.
   */
  async getAllOrganizations(): Promise<AllOrganizationsApiResponse> {
    this._isLoading.set(true);
    this._isLoading$.next(true);
    this._error.set(null);

    try {
      return await this.authService.getClient().getAllOrganizations();
    } catch (error) {
      const errorMessage: string = error instanceof Error ? error.message : 'Failed to fetch organizations';
      this._error.set(errorMessage);
      throw error;
    } finally {
      this._isLoading.set(false);
      this._isLoading$.next(false);
    }
  }

  /**
   * Switches to the specified organization.
   */
  async switchOrganization(organization: Organization): Promise<TokenResponse | Response> {
    return this.authService.switchOrganization(organization);
  }

  /**
   * Re-fetches the user's organizations from the server.
   */
  async revalidateMyOrganizations(): Promise<Organization[]> {
    this._isLoading.set(true);
    this._isLoading$.next(true);
    this._error.set(null);

    try {
      return await this.authService.getClient().getMyOrganizations();
    } catch (error) {
      const errorMessage: string = error instanceof Error ? error.message : 'Failed to fetch organizations';
      this._error.set(errorMessage);
      throw error;
    } finally {
      this._isLoading.set(false);
      this._isLoading$.next(false);
    }
  }

  /**
   * Creates a new organization.
   */
  async createOrganization(config: CreateOrganizationConfig): Promise<Organization> {
    this._isLoading.set(true);
    this._isLoading$.next(true);
    this._error.set(null);

    try {
      return await createOrganization(config);
    } catch (error) {
      const errorMessage: string = error instanceof Error ? error.message : 'Failed to create organization';
      this._error.set(errorMessage);
      throw error;
    } finally {
      this._isLoading.set(false);
      this._isLoading$.next(false);
    }
  }
}
