import {Component, inject, signal, OnInit} from '@angular/core';
import {JsonPipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {AsgardeoAuthService} from '@asgardeo/angular';
import {HeaderComponent} from '../components/header.component';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [JsonPipe, RouterLink, HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header />

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <a routerLink="/dashboard" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to dashboard
          </a>
          <h1 class="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Debug Information
          </h1>
          <p class="text-gray-600">View session data and decoded tokens for debugging purposes.</p>
        </div>

        <!-- Auth State -->
        <div class="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p class="text-sm text-gray-500">Signed In</p>
            <p class="text-lg font-semibold" [class]="authService.isSignedIn() ? 'text-green-600' : 'text-red-600'">
              {{ authService.isSignedIn() ? 'Yes' : 'No' }}
            </p>
          </div>
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p class="text-sm text-gray-500">Loading</p>
            <p class="text-lg font-semibold" [class]="authService.isLoading() ? 'text-yellow-600' : 'text-gray-900'">
              {{ authService.isLoading() ? 'Yes' : 'No' }}
            </p>
          </div>
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p class="text-sm text-gray-500">Initialized</p>
            <p class="text-lg font-semibold" [class]="authService.isInitialized() ? 'text-green-600' : 'text-yellow-600'">
              {{ authService.isInitialized() ? 'Yes' : 'No' }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Access Token -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Access Token</h2>
              <button
                (click)="fetchAccessToken()"
                class="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Refresh
              </button>
            </div>
            <div class="p-4">
              @if (accessToken()) {
                <div class="bg-gray-50 rounded-lg p-3 overflow-auto max-h-48">
                  <pre class="text-xs font-mono text-gray-700 whitespace-pre-wrap break-all">{{ accessToken() }}</pre>
                </div>
              } @else {
                <p class="text-sm text-gray-500">No access token available</p>
              }
            </div>
          </div>

          <!-- ID Token (raw) -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">ID Token (JWT)</h2>
              <button
                (click)="fetchIdToken()"
                class="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Refresh
              </button>
            </div>
            <div class="p-4">
              @if (idToken()) {
                <div class="bg-gray-50 rounded-lg p-3 overflow-auto max-h-48">
                  <pre class="text-xs font-mono text-gray-700 whitespace-pre-wrap break-all">{{ idToken() }}</pre>
                </div>
              } @else {
                <p class="text-sm text-gray-500">No ID token available</p>
              }
            </div>
          </div>

          <!-- Decoded ID Token -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Decoded ID Token</h2>
              <button
                (click)="fetchDecodedIdToken()"
                class="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Refresh
              </button>
            </div>
            <div class="p-4">
              @if (decodedIdToken()) {
                <div class="bg-gray-50 rounded-lg p-3 overflow-auto max-h-64">
                  <pre class="text-xs font-mono text-gray-700 whitespace-pre-wrap">{{ decodedIdToken() | json }}</pre>
                </div>
              } @else {
                <p class="text-sm text-gray-500">No decoded ID token available</p>
              }
            </div>
          </div>

          <!-- User Signal -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">User Signal</h2>
            </div>
            <div class="p-4">
              @if (authService.user()) {
                <div class="bg-gray-50 rounded-lg p-3 overflow-auto max-h-64">
                  <pre class="text-xs font-mono text-gray-700 whitespace-pre-wrap">{{ authService.user() | json }}</pre>
                </div>
              } @else {
                <p class="text-sm text-gray-500">No user data available</p>
              }
            </div>
          </div>

          <!-- Current Organization -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Current Organization</h2>
            </div>
            <div class="p-4">
              @if (authService.currentOrganization()) {
                <div class="bg-gray-50 rounded-lg p-3 overflow-auto max-h-64">
                  <pre class="text-xs font-mono text-gray-700 whitespace-pre-wrap">{{ authService.currentOrganization() | json }}</pre>
                </div>
              } @else {
                <p class="text-sm text-gray-500">No organization context</p>
              }
            </div>
          </div>

          <!-- My Organizations -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">My Organizations</h2>
            </div>
            <div class="p-4">
              @if (authService.myOrganizations().length > 0) {
                <div class="bg-gray-50 rounded-lg p-3 overflow-auto max-h-64">
                  <pre class="text-xs font-mono text-gray-700 whitespace-pre-wrap">{{ authService.myOrganizations() | json }}</pre>
                </div>
              } @else {
                <p class="text-sm text-gray-500">No organizations</p>
              }
            </div>
          </div>
        </div>

        <!-- Configuration -->
        <div class="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">SDK Configuration</h2>
          </div>
          <div class="p-4">
            <div class="bg-gray-50 rounded-lg p-3 overflow-auto max-h-64">
              <pre class="text-xs font-mono text-gray-700 whitespace-pre-wrap">{{ getConfig() | json }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DebugComponent implements OnInit {
  authService = inject(AsgardeoAuthService);

  accessToken = signal<string | null>(null);
  idToken = signal<string | null>(null);
  decodedIdToken = signal<Record<string, unknown> | null>(null);

  ngOnInit(): void {
    this.fetchAll();
  }

  async fetchAll(): Promise<void> {
    await Promise.all([this.fetchAccessToken(), this.fetchIdToken(), this.fetchDecodedIdToken()]);
  }

  async fetchAccessToken(): Promise<void> {
    try {
      const token = await this.authService.getAccessToken();
      this.accessToken.set(token);
    } catch {
      this.accessToken.set(null);
    }
  }

  async fetchIdToken(): Promise<void> {
    try {
      const token = await this.authService.getIdToken();
      this.idToken.set(token);
    } catch {
      this.idToken.set(null);
    }
  }

  async fetchDecodedIdToken(): Promise<void> {
    try {
      const token = await this.authService.getDecodedIdToken();
      this.decodedIdToken.set(token as Record<string, unknown>);
    } catch {
      this.decodedIdToken.set(null);
    }
  }

  getConfig(): Record<string, unknown> {
    try {
      const config = this.authService.getConfiguration();
      return config as unknown as Record<string, unknown>;
    } catch {
      return {};
    }
  }
}
