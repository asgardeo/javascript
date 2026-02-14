import {test, expect} from '../../../fixtures/base.fixture';
import {performSignIn} from '../../../helpers/auth-helpers';
import {SELECTORS} from '../../../helpers/selectors';
import {THUNDER_SELECTORS} from '../../../helpers/thunder/selectors';

test.describe('Sign-In Flow', () => {
  test('should redirect to the Thunder Gate login page from /signin', async ({page}) => {
    await page.goto('/signin');

    await page.waitForURL('**/gate/signin**', {timeout: 30_000});
    await expect(page.locator(THUNDER_SELECTORS.gate.usernameInput)).toBeVisible();
    await expect(page.locator(THUNDER_SELECTORS.gate.passwordInput)).toBeVisible();
    await expect(page.getByRole('button', {name: THUNDER_SELECTORS.gate.submitButtonText})).toBeVisible();
  });

  test('should successfully sign in with valid credentials and redirect to dashboard', async ({page}) => {
    await performSignIn(page);

    await expect(page).toHaveURL(/\/dashboard/);

    const heading = page.locator(SELECTORS.dashboard.welcomeHeading);

    await expect(heading).toContainText('Welcome back');
  });

  test('should redirect unauthenticated users from /dashboard to the Thunder Gate login page', async ({page}) => {
    await page.goto('/dashboard');

    await page.waitForURL('**/gate/signin**', {timeout: 30_000});
  });
});
