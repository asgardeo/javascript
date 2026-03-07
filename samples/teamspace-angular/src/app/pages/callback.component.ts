import {Component, effect, inject} from '@angular/core';
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
export class CallbackPageComponent {
  private authService = inject(AsgardeoAuthService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      const loading = this.authService.isLoading();
      if (loading) return;

      if (this.authService.isSignedIn()) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/']);
      }
    });
  }
}
