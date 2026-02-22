import {Component, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {
  AsgardeoAuthService,
  AsgardeoSignedInDirective,
} from '@asgardeo/angular';
import {HeaderComponent} from '../components/header.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, HeaderComponent, AsgardeoSignedInDirective],
  template: `
    <div class="min-h-screen bg-white">
      <app-header />

      <!-- Hero Section -->
      <section class="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div class="max-w-3xl mx-auto text-center space-y-8">
            <div class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Powered by Asgardeo Angular SDK
            </div>

            <h1 class="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Where teams
              <span class="text-blue-600"> collaborate</span> and ideas come to life
            </h1>

            <p class="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Streamline your team's workflow with our all-in-one collaboration platform. Built with Angular and
              Asgardeo authentication.
            </p>

            @if (!authService.isSignedIn()) {
              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  (click)="signIn()"
                  [disabled]="signingIn()"
                  class="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  @if (signingIn()) {
                    <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  }
                  Sign In
                  @if (!signingIn()) {
                    <svg class="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  }
                </button>
                <button
                  (click)="signUp()"
                  [disabled]="signingIn()"
                  class="inline-flex items-center justify-center px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Create Account
                </button>
              </div>
            }

            <div *asgardeoSignedIn class="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                routerLink="/dashboard"
                class="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
                <svg class="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

            <div class="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div class="flex items-center">
                <svg class="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Redirect-based authentication
              </div>
              <div class="flex items-center">
                <svg class="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Angular Signals
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="bg-gray-50 py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <p class="text-gray-600">SDK Features Demonstrated</p>
          </div>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="text-center">
              <div class="text-3xl lg:text-4xl font-bold text-gray-900">3</div>
              <div class="text-gray-600 mt-2">Services</div>
            </div>
            <div class="text-center">
              <div class="text-3xl lg:text-4xl font-bold text-gray-900">3</div>
              <div class="text-gray-600 mt-2">Directives</div>
            </div>
            <div class="text-center">
              <div class="text-3xl lg:text-4xl font-bold text-gray-900">1</div>
              <div class="text-gray-600 mt-2">Route Guard</div>
            </div>
            <div class="text-center">
              <div class="text-3xl lg:text-4xl font-bold text-gray-900">1</div>
              <div class="text-gray-600 mt-2">HTTP Interceptor</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">SDK Features</h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              This sample app demonstrates all the key features of the Asgardeo Angular SDK.
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Redirect Authentication</h3>
              <p class="text-gray-600 leading-relaxed">
                Sign in and sign up via Asgardeo's hosted login page with OAuth 2.0 redirect flow.
              </p>
            </div>

            <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-6">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Route Guards</h3>
              <p class="text-gray-600 leading-relaxed">
                Protect routes with asgardeoGuard — automatically redirects unauthenticated users.
              </p>
            </div>

            <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div class="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-6">
                <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">User Profile</h3>
              <p class="text-gray-600 leading-relaxed">
                Access user data via Angular Signals — user, userProfile, flattenedProfile, and more.
              </p>
            </div>

            <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div class="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mb-6">
                <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Organizations</h3>
              <p class="text-gray-600 leading-relaxed">
                List, create, and switch between organizations using AsgardeoOrganizationService.
              </p>
            </div>

            <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div class="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-6">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Token Management</h3>
              <p class="text-gray-600 leading-relaxed">
                Access and decode tokens, with automatic Bearer token attachment via HTTP interceptor.
              </p>
            </div>

            <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div class="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-6">
                <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Structural Directives</h3>
              <p class="text-gray-600 leading-relaxed">
                Conditionally render content with *asgardeoSignedIn, *asgardeoSignedOut, and *asgardeoLoading.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-gray-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div class="flex items-center justify-center mb-4">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">T</span>
            </div>
            <span class="ml-2 text-xl font-bold">Teamspace</span>
          </div>
          <p class="text-gray-400">
            Built with Angular 21 and &#64;asgardeo/angular SDK. A sample application for demonstration purposes.
          </p>
        </div>
      </footer>
    </div>
  `,
})
export class LandingComponent {
  authService = inject(AsgardeoAuthService);
  signingIn = signal(false);

  signIn(): void {
    this.signingIn.set(true);
    this.authService.signIn();
  }

  signUp(): void {
    this.authService.signUp();
  }
}
