import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {AsgardeoAuthService} from '@asgardeo/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent implements OnInit {
  private authService = inject(AsgardeoAuthService);
  private router = inject(Router);

  async ngOnInit(): Promise<void> {
    const url = new URL(window.location.href);

    // Workaround: The SDK's APP_INITIALIZER may skip the OAuth code exchange
    // because the state param format doesn't match. If we detect OAuth params
    // in the URL and we're not signed in, trigger the code exchange manually.
    if (url.searchParams.has('code') && !this.authService.isSignedIn()) {
      try {
        await this.authService.signIn({callOnlyOnRedirect: true});
      } catch {
        // signIn may fail if the code has already been consumed
      }
      // After successful sign-in, clean the URL
      if (this.authService.isSignedIn()) {
        this.router.navigateByUrl(url.pathname);
      }
    }
  }
}
