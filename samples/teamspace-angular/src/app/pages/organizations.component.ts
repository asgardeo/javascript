import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AsgardeoOrganizationListComponent} from '@asgardeo/angular';
import {HeaderComponent} from '../components/header.component';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [RouterLink, HeaderComponent, AsgardeoOrganizationListComponent],
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

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-4">
          <asgardeo-organization-list [showStatus]="true" />
        </div>
      </div>
    </div>
  `,
})
export class OrganizationsComponent {}
