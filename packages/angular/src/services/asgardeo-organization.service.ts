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

import {Injectable, Signal, WritableSignal, inject, signal} from '@angular/core';
import {Organization, AllOrganizationsApiResponse, TokenResponse, OrganizationDetails} from '@asgardeo/browser';
import {AsgardeoAuthService} from './asgardeo-auth.service';
import createOrganization, {CreateOrganizationConfig} from '../api/createOrganization';
import getOrganizationApi from '../api/getOrganization';
import updateOrganizationApi, {createPatchOperations} from '../api/updateOrganization';

/**
 * Service for managing organizations.
 * Angular equivalent of React's `OrganizationProvider` + `useOrganization()` hook.
 */
@Injectable()
export class AsgardeoOrganizationService {
  private readonly _isLoading: WritableSignal<boolean> = signal(false);

  private readonly _error: WritableSignal<Error | null> = signal(null);

  readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();

  readonly error: Signal<Error | null> = this._error.asReadonly();

  /** Delegates to AsgardeoAuthService signals. */
  readonly myOrganizations: Signal<Organization[]>;

  readonly currentOrganization: Signal<Organization | null>;

  private readonly authService: AsgardeoAuthService = inject(AsgardeoAuthService);

  constructor() {
    this.myOrganizations = this.authService.myOrganizations;
    this.currentOrganization = this.authService.currentOrganization;
  }

  /**
   * Fetches all organizations with pagination support.
   */
  async getAllOrganizations(): Promise<AllOrganizationsApiResponse> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      return await this.authService.getClient().getAllOrganizations();
    } catch (error) {
      this._error.set(error instanceof Error ? error : new Error('Failed to fetch organizations'));
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Switches to the specified organization.
   */
  async switchOrganization(organization: Organization): Promise<TokenResponse | Response> {
    return this.authService.switchOrganization(organization);
  }

  /**
   * Re-fetches the user's organizations from the server and updates the cached state.
   */
  async revalidateMyOrganizations(): Promise<Organization[]> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const organizations: Organization[] = await this.authService.getClient().getMyOrganizations();
      this.authService.setMyOrganizations(organizations);
      return organizations;
    } catch (error) {
      this._error.set(error instanceof Error ? error : new Error('Failed to fetch organizations'));
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Creates a new organization.
   */
  async createOrganization(config: CreateOrganizationConfig): Promise<Organization> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      return await createOrganization(config);
    } catch (error) {
      this._error.set(error instanceof Error ? error : new Error('Failed to create organization'));
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Fetches detailed information for a specific organization.
   */
  async getOrganization(organizationId: string): Promise<OrganizationDetails> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const baseUrl: string = this.authService.getBaseUrl();
      const instanceId: number = this.authService.getClient().getInstanceId();
      return await getOrganizationApi({baseUrl, instanceId, organizationId});
    } catch (error) {
      this._error.set(error instanceof Error ? error : new Error('Failed to fetch organization'));
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Updates an organization using PATCH operations.
   */
  async updateOrganization(organizationId: string, data: Record<string, any>): Promise<OrganizationDetails> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const baseUrl: string = this.authService.getBaseUrl();
      const instanceId: number = this.authService.getClient().getInstanceId();
      const operations: Array<{operation: 'REPLACE' | 'REMOVE'; path: string; value?: any}> =
        createPatchOperations(data);
      return await updateOrganizationApi({baseUrl, instanceId, operations, organizationId});
    } catch (error) {
      this._error.set(error instanceof Error ? error : new Error('Failed to update organization'));
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }
}
