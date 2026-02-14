/**
 * IS-specific authentication helpers for e2e tests.
 */

import {type Page} from '@playwright/test';
import {SAMPLE_APP} from '../../setup/constants';
import {SELECTORS} from '../selectors';
import {IS_SELECTORS} from './selectors';

/**
 * Performs sign-in via the redirect-based flow for WSO2 IS.
 *
 * 1. Navigate to /signin → app calls signIn() → browser redirects to IS authentication endpoint
 * 2. Fill username/password on the IS login page
 * 3. Submit → IS redirects back to /callback with auth code
 * 4. SDK exchanges code for tokens → CallbackPage navigates to /dashboard
 */
export async function performIsSignIn(page: Page, credentials: {username: string; password: string}): Promise<void> {
  await page.goto(SAMPLE_APP.signInPath);

  // Wait for redirect to IS's authentication endpoint
  await page.waitForURL('**/authenticationendpoint/**', {timeout: 30_000});

  // Wait for the IS login form to render
  await page.waitForSelector(IS_SELECTORS.login.usernameInput, {timeout: 15_000});

  await page.locator(IS_SELECTORS.login.usernameInput).fill(credentials.username);
  await page.locator(IS_SELECTORS.login.passwordInput).fill(credentials.password);
  await page.locator(IS_SELECTORS.login.signInButton).click();

  // After successful auth, IS redirects to /callback, SDK exchanges code for tokens,
  // then CallbackPage navigates to /dashboard.
  await page.waitForURL('**/dashboard**', {timeout: 30_000});
  await page.waitForSelector(SELECTORS.dashboard.welcomeHeading, {timeout: 15_000});
}

/**
 * Handle the IS logout consent page ("Are you sure you want to logout?").
 */
export async function handleIsLogoutConsent(page: Page): Promise<void> {
  await page.waitForURL('**/oauth2_logout_consent**', {timeout: 15_000});
  await page.getByText(IS_SELECTORS.logout.consentYesButton, {exact: true}).click();
}
