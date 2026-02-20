import {Component, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AsgardeoAuthService} from '@asgardeo/angular';

@Component({
  selector: 'app-callback-page',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  `,
})
export class CallbackPageComponent implements OnInit {
  private authService = inject(AsgardeoAuthService);
  private router = inject(Router);

  async ngOnInit(): Promise<void> {
    // The SDK's APP_INITIALIZER processes the OAuth code on this page
    // (because afterSignInUrl points here). Wait for it to finish.
    await this.waitForAuth();

    if (this.authService.isSignedIn()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  private waitForAuth(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.authService.isLoading()) {
        resolve();
        return;
      }
      const interval = setInterval(() => {
        if (!this.authService.isLoading()) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  }
}
