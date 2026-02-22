import {inject} from '@angular/core';
import {CanActivateFn, Router, UrlTree} from '@angular/router';
import {AsgardeoAuthService} from '@asgardeo/angular';

/**
 * Auth guard that waits for the OAuth token exchange to complete
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
    await waitForSignal(() => authService.isSignedIn(), 10000);

    if (authService.isSignedIn()) {
      router.navigateByUrl(window.location.pathname);
      return true;
    }
  }

  // If still loading, wait for loading to finish
  if (authService.isLoading()) {
    await waitForSignal(() => !authService.isLoading(), 10000);

    if (authService.isSignedIn()) {
      return true;
    }
  }

  // Not signed in — redirect to landing page
  return router.createUrlTree(['/']);
};

function waitForSignal(predicate: () => boolean, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    if (predicate()) {
      resolve();
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if (predicate() || Date.now() - start > timeoutMs) {
        clearInterval(interval);
        resolve();
      }
    }, 50);
  });
}
