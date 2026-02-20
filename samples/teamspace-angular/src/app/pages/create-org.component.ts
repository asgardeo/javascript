import {Component, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {AsgardeoAuthService, createOrganization} from '@asgardeo/angular';
import {HeaderComponent} from '../components/header.component';

@Component({
  selector: 'app-create-org',
  standalone: true,
  imports: [RouterLink, FormsModule, HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header />

      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Back link -->
        <div class="mb-8">
          <a routerLink="/organizations" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to organizations
          </a>
          <h1 class="text-3xl font-bold text-gray-900">Create a new organization</h1>
          <p class="text-gray-600 mt-2">
            Organizations are shared accounts where teams can collaborate across many projects at once.
          </p>
        </div>

        <!-- Create Form -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form (ngSubmit)="onCreate()" class="space-y-6">
            <div>
              <label for="orgName" class="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <input
                id="orgName"
                type="text"
                [(ngModel)]="orgName"
                name="orgName"
                required
                placeholder="Enter organization name"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <p class="mt-1 text-xs text-gray-500">This will be the display name for your organization.</p>
            </div>

            <div>
              <label for="orgDescription" class="block text-sm font-medium text-gray-700 mb-1">
                Description
                <span class="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="orgDescription"
                [(ngModel)]="orgDescription"
                name="orgDescription"
                rows="3"
                placeholder="Describe your organization"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              ></textarea>
            </div>

            @if (error()) {
              <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                <p class="text-sm text-red-600">{{ error() }}</p>
              </div>
            }

            @if (success()) {
              <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                <p class="text-sm text-green-600">Organization created successfully! Redirecting...</p>
              </div>
            }

            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <a
                routerLink="/organizations"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </a>
              <button
                type="submit"
                [disabled]="isSubmitting() || !orgName.trim()"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (isSubmitting()) {
                  <span class="inline-flex items-center">
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating...
                  </span>
                } @else {
                  Create Organization
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class CreateOrgComponent {
  private authService = inject(AsgardeoAuthService);
  private router = inject(Router);

  orgName = '';
  orgDescription = '';
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  async onCreate(): Promise<void> {
    if (!this.orgName.trim()) return;

    this.isSubmitting.set(true);
    this.error.set(null);
    this.success.set(false);

    try {
      await createOrganization({
        baseUrl: import.meta.env['VITE_ASGARDEO_BASE_URL'] || '',
        payload: {
          name: this.orgName.trim(),
          description: this.orgDescription.trim(),
          parentId: this.authService.currentOrganization()?.id || '',
          type: 'TENANT',
        },
      });
      await this.authService.getClient().getMyOrganizations();
      this.success.set(true);
      setTimeout(() => {
        this.router.navigate(['/organizations']);
      }, 1500);
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to create organization');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
