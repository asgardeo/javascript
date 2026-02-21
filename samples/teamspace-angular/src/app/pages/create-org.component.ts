import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AsgardeoCreateOrganizationComponent} from '@asgardeo/angular';
import {HeaderComponent} from '../components/header.component';

@Component({
  selector: 'app-create-org',
  standalone: true,
  imports: [RouterLink, HeaderComponent, AsgardeoCreateOrganizationComponent],
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

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <asgardeo-create-organization
            (created)="onCreated()"
            (cancelled)="onCancel()"
          />
        </div>
      </div>
    </div>
  `,
})
export class CreateOrgComponent {
  private router = inject(Router);

  onCreated(): void {
    this.router.navigate(['/organizations']);
  }

  onCancel(): void {
    this.router.navigate(['/organizations']);
  }
}
