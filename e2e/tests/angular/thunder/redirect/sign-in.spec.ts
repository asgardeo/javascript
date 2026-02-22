import {test, expect} from '../../../../fixtures/base.fixture';
import {performAngularSignIn} from '../../../../helpers/angular/auth-helpers';
import {ANGULAR_SELECTORS} from '../../../../helpers/angular/selectors';
import {THUNDER_SELECTORS} from '../../../../helpers/thunder/selectors';

test.describe('Sign-In Flow', () => {
  test('should redirect to the Thunder Gate login page when clicking Sign In', async ({page}) => {
    await page.goto('/');

    await page.getByRole('banner').getByRole('button', {name: ANGULAR_SELECTORS.landing.signInButtonText}).click();

    await page.waitForURL('**/gate/signin**', {timeout: 30_000});
    await expect(page.locator(THUNDER_SELECTORS.gate.usernameInput)).toBeVisible();
    await expect(page.locator(THUNDER_SELECTORS.gate.passwordInput)).toBeVisible();
    await expect(page.getByRole('button', {name: THUNDER_SELECTORS.gate.submitButtonText})).toBeVisible();
  });

  test('should successfully sign in with valid credentials and redirect to dashboard', async ({page}) => {
    await performAngularSignIn(page);

    await expect(page).toHaveURL(/\/dashboard/);

    const heading = page.locator(ANGULAR_SELECTORS.dashboard.welcomeHeading);

    await expect(heading).toContainText('Welcome back');
  });

  test('should redirect unauthenticated users from /dashboard to the landing page', async ({page}) => {
    await page.goto('/dashboard');

    // Angular's authGuard redirects unauthenticated users to / (landing page)
    await page.waitForURL(/localhost:\d+\/(\?.*)?$/, {timeout: 30_000});
  });
});
