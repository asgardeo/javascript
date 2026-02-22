/**
 * Authentication helpers for e2e tests.
 *
 * This module provides IDP-agnostic public APIs that delegate to
 * IDP-specific implementations in helpers/is/ and helpers/thunder/.
 */

import {type Page} from '@playwright/test';
import {TEST_USER, getIdpTarget, getSampleApp} from '../setup/constants';
import {THUNDER_CONFIG} from '../setup/thunder/constants';
import {SELECTORS} from './selectors';
import {performIsSignIn, handleIsLogoutConsent} from './is/auth-helpers';
import {performThunderSignIn} from './thunder/auth-helpers';

/**
 * Returns the credentials to use for sign-in based on the IDP target.
 *
 * - IS: Uses the provisioned test user (e2e-test-user)
 * - Thunder: Uses the pre-created admin user (admin/admin)
 */
export function getSignInCredentials(): {username: string; password: string} {
  const idpTarget = getIdpTarget();

  if (idpTarget === 'thunder') {
    return {
      username: THUNDER_CONFIG.adminUsername,
      password: THUNDER_CONFIG.adminPassword,
    };
  }

  return {
    username: TEST_USER.username,
    password: TEST_USER.password,
  };
}

/**
 * Performs the full sign-in flow via redirect-based OAuth2.
 * Delegates to the appropriate IDP login page based on the IDP target:
 * - IS: WSO2 IS authentication endpoint
 * - Thunder: Thunder's Gate login page
 */
export async function performSignIn(page: Page): Promise<void> {
  const idpTarget = getIdpTarget();
  const credentials = getSignInCredentials();

  if (idpTarget === 'thunder') {
    await performThunderSignIn(page, credentials);
  } else {
    await performIsSignIn(page, credentials);
  }
}

/**
 * Performs sign-in via the embedded <SignIn /> component.
 *
 * 1. Navigate to /signin → renders <SignIn /> inline (when VITE_ASGARDEO_SIGN_IN_MODE != 'redirect')
 * 2. SDK calls signIn({response_mode: 'direct'}) → IDP returns form fields
 * 3. Fill username/password in the SDK-rendered form
 * 4. Submit → SDK posts credentials directly to IDP
 * 5. On success, SDK redirects to /dashboard
 */
export async function performEmbeddedSignIn(page: Page): Promise<void> {
  const credentials = getSignInCredentials();
  const sampleApp = getSampleApp();

  await page.goto(sampleApp.signInPath);

  // Wait for the <SignIn /> component to load and render form fields from the IDP
  await page.waitForSelector(SELECTORS.embeddedSignIn.container, {timeout: 30_000});
  await page.waitForSelector(SELECTORS.embeddedSignIn.usernameInput, {timeout: 15_000});

  await page.locator(SELECTORS.embeddedSignIn.usernameInput).fill(credentials.username);
  await page.locator(SELECTORS.embeddedSignIn.passwordInput).fill(credentials.password);
  await page.locator(SELECTORS.embeddedSignIn.submitButton).click();

  // After successful embedded sign-in, SDK sets session and redirects to /dashboard
  await page.waitForURL('**/dashboard**', {timeout: 30_000});
  await page.waitForSelector(SELECTORS.dashboard.welcomeHeading, {timeout: 15_000});
}

/**
 * Performs sign-out by clicking the user dropdown → "Sign out".
 * For IS, also handles the logout consent page ("Are you sure you want to logout?").
 */
export async function performSignOut(page: Page): Promise<void> {
  await page.locator(SELECTORS.header.userDropdownTrigger).click();
  await page.getByText(SELECTORS.header.signOutText).click();

  const idpTarget = getIdpTarget();

  if (idpTarget === 'is') {
    // IS shows a logout consent page — click "Yes" to confirm
    await handleIsLogoutConsent(page);
  }

  // Wait for redirect back to the app's landing page (may include ?state=sign_out_success)
  await page.waitForURL(/localhost:\d+\/(\?.*)?$/, {timeout: 15_000});
}
