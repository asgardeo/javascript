import {test, expect} from '../../../../fixtures/base.fixture';
import {performSignIn} from '../../../../helpers/auth-helpers';
import {SELECTORS} from '../../../../helpers/selectors';
import {IS_SELECTORS} from '../../../../helpers/is/selectors';

test.describe('Sign-In Flow', () => {
  test('should redirect to the IS login page from /signin', async ({page}) => {
    await page.goto('/signin');

    await page.waitForURL('**/authenticationendpoint/**', {timeout: 30_000});
    await expect(page.locator(IS_SELECTORS.login.usernameInput)).toBeVisible();
    await expect(page.locator(IS_SELECTORS.login.passwordInput)).toBeVisible();
  });

  test('should successfully sign in with valid credentials and redirect to dashboard', async ({page}) => {
    await performSignIn(page);

    await expect(page).toHaveURL(/\/dashboard/);

    const heading = page.locator(SELECTORS.dashboard.welcomeHeading);

    await expect(heading).toContainText('Welcome back');
  });

  test('should redirect unauthenticated users from /dashboard to the IS login page', async ({page}) => {
    await page.goto('/dashboard');

    await page.waitForURL('**/authenticationendpoint/**', {timeout: 30_000});
  });
});
