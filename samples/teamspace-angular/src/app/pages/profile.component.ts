import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {JsonPipe} from '@angular/common';
import {AsgardeoAuthService} from '@asgardeo/angular';
import {HeaderComponent} from '../components/header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, JsonPipe, HeaderComponent],
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
          <h1 class="text-3xl font-bold text-gray-900">Profile</h1>
          <p class="text-gray-600 mt-2">
            View your profile information, including your display name, email, and other details.
          </p>
        </div>

        @if (authService.isLoading()) {
          <div class="flex items-center justify-center py-12">
            <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        } @else {
          <!-- Profile Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <!-- Avatar + Name Header -->
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {{ getInitials() }}
                </div>
                <div class="text-white">
                  <h2 class="text-xl font-semibold">{{ getDisplayName() }}</h2>
                  @if (getEmail()) {
                    <p class="text-blue-100">{{ getEmail() }}</p>
                  }
                </div>
              </div>
            </div>

            <!-- Profile Details -->
            <div class="p-6 space-y-6">
              @if (authService.flattenedProfile(); as profile) {
                <!-- Basic Info -->
                <div>
                  <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Basic Information</h3>
                  <div class="space-y-3">
                    @if (profile['given_name'] || profile['name']?.['givenName']) {
                      <div class="flex justify-between py-2 border-b border-gray-100">
                        <span class="text-sm text-gray-500">First Name</span>
                        <span class="text-sm font-medium text-gray-900">{{ profile['given_name'] || profile['name']?.['givenName'] }}</span>
                      </div>
                    }
                    @if (profile['family_name'] || profile['name']?.['familyName']) {
                      <div class="flex justify-between py-2 border-b border-gray-100">
                        <span class="text-sm text-gray-500">Last Name</span>
                        <span class="text-sm font-medium text-gray-900">{{ profile['family_name'] || profile['name']?.['familyName'] }}</span>
                      </div>
                    }
                    @if (getEmail()) {
                      <div class="flex justify-between py-2 border-b border-gray-100">
                        <span class="text-sm text-gray-500">Email</span>
                        <span class="text-sm font-medium text-gray-900">{{ getEmail() }}</span>
                      </div>
                    }
                    @if (profile['phone_number']) {
                      <div class="flex justify-between py-2 border-b border-gray-100">
                        <span class="text-sm text-gray-500">Phone</span>
                        <span class="text-sm font-medium text-gray-900">{{ profile['phone_number'] }}</span>
                      </div>
                    }
                    @if (profile['sub']) {
                      <div class="flex justify-between py-2 border-b border-gray-100">
                        <span class="text-sm text-gray-500">User ID</span>
                        <span class="text-sm font-medium text-gray-900 truncate ml-4">{{ profile['sub'] }}</span>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Raw Profile Data -->
              <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Raw Profile Data</h3>
                <div class="bg-gray-50 rounded-lg p-4 overflow-auto max-h-64">
                  <pre class="text-xs font-mono text-gray-700 whitespace-pre-wrap">{{ authService.flattenedProfile() | json }}</pre>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  (click)="refresh()"
                  [disabled]="authService.isLoading()"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Profile
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ProfileComponent {
  authService = inject(AsgardeoAuthService);

  getDisplayName(): string {
    const profile = this.authService.flattenedProfile();
    if (!profile) return 'User';
    return (
      (profile as Record<string, any>)['given_name'] ||
      (profile as Record<string, any>)['name']?.['givenName'] ||
      (profile as Record<string, any>)['email'] ||
      'User'
    );
  }

  getEmail(): string {
    const profile = this.authService.flattenedProfile();
    if (!profile) return '';
    return (profile as Record<string, any>)['email'] || '';
  }

  getInitials(): string {
    const name = this.getDisplayName();
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  async refresh(): Promise<void> {
    await this.authService.reInitialize({});
  }
}
