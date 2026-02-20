import {inject} from '@angular/core';
import {CanActivateFn, Router, UrlTree} from '@angular/router';
import {AsgardeoAuthService} from '@asgardeo/angular';

/**
 * Custom auth guard that waits for the OAuth token exchange to complete
 * before checking authentication status.
 *
 * The SDK's APP_INITIALIZER may resolve before the async token exchange finishes,
 * so this guard polls isSignedIn() when OAuth params are detected in the URL.
 */
export const authGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const authService = inject(AsgardeoAuthService);
  const router = inject(Router);

  // If already signed in, allow immediately
  if (authService.isSignedIn()) {
    return true;
  }

  // If the URL has OAuth params (code), the token exchange is likely in progress.
  // Wait for it to complete.
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('code')) {
    await waitForSignIn(authService, 10000);

    if (authService.isSignedIn()) {
      // Clean the OAuth params from the URL
      router.navigateByUrl(window.location.pathname);
      return true;
    }
  }

  // If still loading, wait for loading to finish
  if (authService.isLoading()) {
    await waitForLoading(authService, 10000);

    if (authService.isSignedIn()) {
      return true;
    }
  }

  // Not signed in — redirect to landing page
  return router.createUrlTree(['/']);
};

function waitForSignIn(authService: AsgardeoAuthService, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (authService.isSignedIn() || Date.now() - start > timeoutMs) {
        clearInterval(interval);
        resolve();
      }
    }, 50);
  });
}

function waitForLoading(authService: AsgardeoAuthService, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (!authService.isLoading() || Date.now() - start > timeoutMs) {
        clearInterval(interval);
        resolve();
      }
    }, 50);
  });
}
