import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AsgardeoAuthService, AsgardeoSignedInDirective, AsgardeoSignedOutDirective} from '@asgardeo/angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, AsgardeoSignedInDirective, AsgardeoSignedOutDirective],
  template: `
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <a *asgardeoSignedOut routerLink="/" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">T</span>
              </div>
              <span class="text-xl font-bold text-gray-900">Teamspace</span>
            </a>
            <a *asgardeoSignedIn routerLink="/dashboard" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">T</span>
              </div>
              <span class="text-xl font-bold text-gray-900">Teamspace</span>
            </a>
          </div>

          <!-- Navigation - Signed In -->
          <nav *asgardeoSignedIn class="hidden md:flex items-center space-x-6">
            <a routerLink="/dashboard" class="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >Dashboard</a
            >
            <a routerLink="/debug" class="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >Debug</a
            >
          </nav>

          <!-- Actions -->
          <div class="flex items-center space-x-4">
            <!-- Signed In: User info + Sign Out -->
            <div *asgardeoSignedIn class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">{{ authService.user()?.given_name || 'User' }}</span>
              <button
                (click)="signOut()"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Sign Out
              </button>
            </div>

            <!-- Signed Out: Sign In / Sign Up buttons -->
            <div *asgardeoSignedOut class="flex items-center space-x-3">
              <button
                (click)="signIn()"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Sign In
              </button>
              <button
                (click)="signUp()"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  authService = inject(AsgardeoAuthService);

  signIn(): void {
    this.authService.signIn();
  }

  signUp(): void {
    this.authService.signUp();
  }

  signOut(): void {
    this.authService.signOut();
  }
}
