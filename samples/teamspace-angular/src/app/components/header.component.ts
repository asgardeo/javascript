import {Component, inject, signal, HostListener, computed} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AsgardeoAuthService, AsgardeoSignedInDirective, AsgardeoSignedOutDirective, AsgardeoUserProfileComponent} from '@asgardeo/angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, AsgardeoSignedInDirective, AsgardeoSignedOutDirective, AsgardeoUserProfileComponent],
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
            <a routerLink="/organizations" class="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >Organizations</a
            >
            <a routerLink="/debug" class="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >Debug</a
            >
          </nav>

          <!-- Actions -->
          <div class="flex items-center space-x-4">
            <!-- Signed In: User Dropdown (matches React SDK UserDropdown) -->
            <div *asgardeoSignedIn class="asgardeo-user-dropdown" style="position: relative;">
              <button
                (click)="toggleDropdown($event)"
                class="asgardeo-user-dropdown__trigger"
              >
                @if (getProfileUrl(); as url) {
                  <img [src]="url" [alt]="getDisplayName()" class="asgardeo-avatar" style="width: 32px; height: 32px;" />
                } @else {
                  <div
                    class="asgardeo-avatar"
                    [style.background]="avatarGradient()"
                    style="width: 32px; height: 32px; font-size: 13px;"
                  >
                    {{ getInitials() }}
                  </div>
                }
              </button>

              @if (dropdownOpen()) {
                <div class="asgardeo-user-dropdown__content">
                  <!-- Header: avatar + name + username -->
                  <div class="asgardeo-user-dropdown__header">
                    @if (getProfileUrl(); as url) {
                      <img [src]="url" [alt]="getDisplayName()" class="asgardeo-avatar" style="width: 40px; height: 40px;" />
                    } @else {
                      <div
                        class="asgardeo-avatar"
                        [style.background]="avatarGradient()"
                        style="width: 40px; height: 40px; font-size: 15px;"
                      >
                        {{ getInitials() }}
                      </div>
                    }
                    <div class="asgardeo-user-dropdown__header-info">
                      <span class="asgardeo-user-dropdown__header-name">{{ getDisplayName() }}</span>
                      <span class="asgardeo-user-dropdown__header-email">{{ getUserName() }}</span>
                    </div>
                  </div>

                  <!-- Custom Menu Items -->
                  <div class="asgardeo-user-dropdown__menu">
                    <a routerLink="/dashboard" (click)="closeDropdown()" class="asgardeo-user-dropdown__menu-item">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span>Dashboard</span>
                    </a>
                    <a routerLink="/organizations" (click)="closeDropdown()" class="asgardeo-user-dropdown__menu-item">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Organizations</span>
                    </a>
                    <a routerLink="/debug" (click)="closeDropdown()" class="asgardeo-user-dropdown__menu-item">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Debug</span>
                    </a>

                    <!-- Divider -->
                    <div class="asgardeo-user-dropdown__menu-divider"></div>

                    <!-- Manage Profile (matches React SDK default) -->
                    <button (click)="openProfile()" class="asgardeo-user-dropdown__menu-item">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Manage Profile</span>
                    </button>

                    <!-- Sign Out (matches React SDK default) -->
                    <button (click)="signOut()" class="asgardeo-user-dropdown__menu-item">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Signed Out: Sign In / Sign Up buttons -->
            @if (!authService.isSignedIn()) {
              <div class="flex items-center space-x-3">
                <button
                  (click)="signIn()"
                  [disabled]="signingIn()"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  @if (signingIn()) {
                    <div class="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-1.5"></div>
                  }
                  Sign In
                </button>
                <button
                  (click)="signUp()"
                  [disabled]="signingIn()"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Sign Up
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </header>

    <!-- User Profile Popup (matches React SDK's UserProfile mode="popup") -->
    <asgardeo-user-profile
      mode="popup"
      [(open)]="showProfile"
    />
  `,
  styles: `
    /* Matches the React SDK's BaseUserDropdown styles */
    .asgardeo-user-dropdown__trigger {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px;
      background: none;
      border: none;
      cursor: pointer;
      border-radius: 8px;
      transition: none;
      box-shadow: none;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }

      &:focus {
        outline: 2px solid #4f46e5;
        outline-offset: 2px;
      }
    }

    .asgardeo-avatar {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 500;
      overflow: hidden;
      flex-shrink: 0;
    }

    .asgardeo-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .asgardeo-user-dropdown__content {
      position: absolute;
      right: 0;
      margin-top: 5px;
      min-width: 250px;
      max-width: 600px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid #e5e7eb;
      overflow: hidden;
      z-index: 9999;
    }

    .asgardeo-user-dropdown__header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .asgardeo-user-dropdown__header-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }

    .asgardeo-user-dropdown__header-name {
      font-size: 1rem;
      font-weight: 500;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .asgardeo-user-dropdown__header-email {
      font-size: 0.875rem;
      color: #6b7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .asgardeo-user-dropdown__menu {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .asgardeo-user-dropdown__menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      width: 100%;
      color: #111827;
      text-decoration: none;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 0.875rem;
      text-align: start;
      border-radius: 0;
      font-family: inherit;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }

    .asgardeo-user-dropdown__menu-divider {
      margin: 4px 0;
      border-bottom: 1px solid #e5e7eb;
    }
  `,
})
export class HeaderComponent {
  authService = inject(AsgardeoAuthService);
  dropdownOpen = signal(false);
  showProfile = signal(false);
  signingIn = signal(false);

  /** Computed gradient background matching the React SDK Avatar's name-seeded algorithm */
  avatarGradient = computed(() => {
    const name = this.getDisplayName();
    if (!name) return 'linear-gradient(135deg, #6366f1, #8b5cf6)';
    return this.generateBackgroundColor(name);
  });

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.dropdownOpen()) {
      this.dropdownOpen.set(false);
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen.update(v => !v);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  getProfileUrl(): string | null {
    const user = this.authService.user();
    if (!user) return null;
    return (
      (user as any)['profile'] ||
      (user as any)['profileUrl'] ||
      (user as any)['picture'] ||
      (user as any)['URL'] ||
      null
    );
  }

  getUserName(): string {
    const user = this.authService.user();
    if (!user) return '';
    return (user as any)['userName'] || (user as any)['username'] || (user as any)['user_name'] || '';
  }

  getEmail(): string {
    const user = this.authService.user();
    if (!user) return '';
    const emails = (user as any)['emails'];
    if (Array.isArray(emails)) return emails[0] || '';
    return (user as any)['email'] || '';
  }

  getDisplayName(): string {
    const user = this.authService.user();
    if (!user) return '';
    const firstName =
      (user as any)['name']?.['givenName'] || (user as any)['given_name'] || '';
    const lastName =
      (user as any)['name']?.['familyName'] || (user as any)['family_name'] || '';
    if (firstName && lastName) return `${firstName} ${lastName}`;
    return this.getUserName() || this.getEmail() || (user as any)['name'] || 'User';
  }

  getInitials(): string {
    const name = this.getDisplayName();
    return name
      .split(' ')
      .map((part: string) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  openProfile(): void {
    this.closeDropdown();
    this.showProfile.set(true);
  }

  signIn(): void {
    this.signingIn.set(true);
    this.authService.signIn();
  }

  signUp(): void {
    this.authService.signUp();
  }

  signOut(): void {
    this.closeDropdown();
    this.authService.signOut();
  }

  /** Same algorithm as React SDK's Avatar component for name-seeded gradient */
  private generateBackgroundColor(inputString: string): string {
    let hash = inputString.split('').reduce((acc: number, char: string) => {
      const charCode = char.charCodeAt(0);
      return ((acc << 5) - acc + charCode) & 0xffffffff;
    }, 0);

    const seed = Math.abs(hash);
    const hue1 = (seed + seed) % 360;
    const hue2 = (hue1 + 60 + (seed % 120)) % 360;
    const saturation = 70 + (seed % 20);
    const lightness1 = 55 + (seed % 15);
    const lightness2 = 60 + ((seed + seed) % 15);
    const angle = 45 + (seed % 91);

    return `linear-gradient(${angle}deg, hsl(${hue1}, ${saturation}%, ${lightness1}%), hsl(${hue2}, ${saturation}%, ${lightness2}%))`;
  }
}
