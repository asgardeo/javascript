import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AsgardeoOrganizationService} from '@asgardeo/angular';
import {HeaderComponent} from '../components/header.component';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [RouterLink, HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header />

      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Back link -->
        <div class="mb-8">
          <a routerLink="/dashboard" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to dashboard
          </a>
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Organizations</h1>
              <p class="text-gray-600 mt-2">Manage your organizations and switch between them</p>
            </div>
            <a
              routerLink="/organizations/new"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New Organization
            </a>
          </div>
        </div>

        @if (orgService.isLoading()) {
          <div class="flex items-center justify-center py-12">
            <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        } @else if (orgService.error()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-600">{{ orgService.error() }}</p>
          </div>
        } @else {
          <!-- Current Organization -->
          @if (orgService.currentOrganization(); as currentOrg) {
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-blue-800">Current Organization</p>
                  <p class="text-lg font-semibold text-blue-900">{{ currentOrg.name || currentOrg.id }}</p>
                </div>
                <div class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Active</div>
              </div>
            </div>
          }

          <!-- Organization List -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            @if (orgService.myOrganizations().length === 0) {
              <div class="p-8 text-center">
                <svg class="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p class="text-gray-500 mb-4">No organizations found</p>
                <a
                  routerLink="/organizations/new"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  Create your first organization
                </a>
              </div>
            } @else {
              <ul class="divide-y divide-gray-200">
                @for (org of orgService.myOrganizations(); track org.id) {
                  <li class="p-4 hover:bg-gray-50 transition-colors">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <p class="text-sm font-medium text-gray-900">{{ org.name || org.id }}</p>
                          @if (org.id) {
                            <p class="text-xs text-gray-500">{{ org.id }}</p>
                          }
                        </div>
                      </div>
                      <div class="flex items-center space-x-2">
                        @if (orgService.currentOrganization()?.id === org.id) {
                          <span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Current</span>
                        } @else {
                          <button
                            (click)="switchTo(org)"
                            class="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Switch
                          </button>
                        }
                      </div>
                    </div>
                  </li>
                }
              </ul>
            }
          </div>

          <!-- Refresh -->
          <div class="mt-4 flex justify-end">
            <button
              (click)="revalidate()"
              [disabled]="orgService.isLoading()"
              class="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class OrganizationsComponent {
  orgService = inject(AsgardeoOrganizationService);

  async switchTo(org: any): Promise<void> {
    await this.orgService.switchOrganization(org);
  }

  async revalidate(): Promise<void> {
    await this.orgService.revalidateMyOrganizations();
  }
}
