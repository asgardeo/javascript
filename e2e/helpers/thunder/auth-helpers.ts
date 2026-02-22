/**
 * Thunder-specific authentication helpers for e2e tests.
 */

import {type Page} from '@playwright/test';
import {getSampleApp} from '../../setup/constants';
import {SELECTORS} from '../selectors';
import {THUNDER_SELECTORS} from './selectors';

/**
 * Fills the Thunder Gate login form with credentials and submits.
 *
 * Assumes the browser is already on the Gate login page.
 * This is reusable across all frameworks (React, Angular, etc.).
 */
export async function fillThunderLoginForm(page: Page, credentials: {username: string; password: string}): Promise<void> {
  await page.waitForSelector(THUNDER_SELECTORS.gate.usernameInput, {timeout: 15_000});

  await page.locator(THUNDER_SELECTORS.gate.usernameInput).fill(credentials.username);
  await page.locator(THUNDER_SELECTORS.gate.passwordInput).fill(credentials.password);
  await page.getByRole('button', {name: THUNDER_SELECTORS.gate.submitButtonText}).click();
}

/**
 * Performs sign-in via the redirect-based flow for Thunder.
 *
 * 1. Navigate to the sample app's sign-in path → app calls signIn() → browser redirects to Gate
 * 2. Fill username/password on the Gate page
 * 3. Submit → Thunder redirects back to /callback with auth code
 * 4. SDK exchanges code for tokens → CallbackPage navigates to /dashboard
 */
export async function performThunderSignIn(
  page: Page,
  credentials: {username: string; password: string},
): Promise<void> {
  const sampleApp = getSampleApp();

  await page.goto(sampleApp.signInPath);

  // Wait for redirect to Thunder's Gate login page
  await page.waitForURL('**/gate/signin**', {timeout: 30_000});

  await fillThunderLoginForm(page, credentials);

  // After successful auth, Thunder redirects to /callback, SDK exchanges code for tokens,
  // then CallbackPage navigates to /dashboard.
  await page.waitForURL('**/dashboard**', {timeout: 30_000});
  await page.waitForSelector(SELECTORS.dashboard.welcomeHeading, {timeout: 15_000});
}
