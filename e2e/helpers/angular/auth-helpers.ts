/**
 * Angular-specific authentication helpers for e2e tests.
 *
 * The Angular sample app triggers sign-in from the landing page (/)
 * by clicking the "Sign In" button, which redirects to the IDP.
 * This differs from React which has a dedicated /signin route.
 */

import {type Page} from '@playwright/test';
import {getIdpTarget} from '../../setup/constants';
import {getSignInCredentials} from '../auth-helpers';
import {fillIsLoginForm, handleIsLogoutConsent} from '../is/auth-helpers';
import {fillThunderLoginForm} from '../thunder/auth-helpers';
import {ANGULAR_SELECTORS} from './selectors';

/**
 * Performs sign-in for the Angular sample app via redirect-based OAuth2.
 *
 * 1. Navigate to / (landing page)
 * 2. Click "Sign In" button → app calls authService.signIn() → redirects to IDP
 * 3. Fill IDP login form and submit
 * 4. IDP redirects to /callback → SDK exchanges code for tokens → navigates to /dashboard
 */
export async function performAngularSignIn(page: Page): Promise<void> {
  const idpTarget = getIdpTarget();
  const credentials = getSignInCredentials();

  await page.goto('/');

  // Click the "Sign In" button in the header (landing page has two — header + hero)
  await page.getByRole('banner').getByRole('button', {name: ANGULAR_SELECTORS.landing.signInButtonText}).click();

  if (idpTarget === 'is') {
    await page.waitForURL('**/authenticationendpoint/**', {timeout: 30_000});
    await fillIsLoginForm(page, credentials);
  } else {
    await page.waitForURL('**/gate/signin**', {timeout: 30_000});
    await fillThunderLoginForm(page, credentials);
  }

  await page.waitForURL('**/dashboard**', {timeout: 30_000});
  await page.waitForSelector(ANGULAR_SELECTORS.dashboard.welcomeHeading, {timeout: 15_000});
}

/**
 * Performs sign-out for the Angular sample app.
 *
 * Clicks the user dropdown trigger → "Sign Out" menu item.
 * For IS, also handles the logout consent page.
 */
export async function performAngularSignOut(page: Page): Promise<void> {
  await page.locator(ANGULAR_SELECTORS.header.userDropdownTrigger).click();
  await page.getByText(ANGULAR_SELECTORS.header.signOutButtonText).click();

  const idpTarget = getIdpTarget();

  if (idpTarget === 'is') {
    await handleIsLogoutConsent(page);
  }

  // Wait for redirect back to the landing page (may include ?state=sign_out_success)
  await page.waitForURL(/localhost:\d+\/(\?.*)?$/, {timeout: 15_000});
}
