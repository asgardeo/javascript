import {test, expect} from '../../../../fixtures/base.fixture';
import {performSignIn, performSignOut} from '../../../../helpers/auth-helpers';
import {SELECTORS} from '../../../../helpers/selectors';

test.describe('Sign-Out Flow', () => {
  test.beforeEach(async ({page}) => {
    await performSignIn(page);
  });

  test('should sign out and redirect to the landing page', async ({page}) => {
    await expect(page.locator(SELECTORS.dashboard.welcomeHeading)).toContainText('Welcome back');

    await performSignOut(page);

    await expect(page.getByText(SELECTORS.header.signInText)).toBeVisible({timeout: 10_000});
  });

  test('should not be able to access protected routes after sign out', async ({page}) => {
    await expect(page.locator(SELECTORS.dashboard.welcomeHeading)).toContainText('Welcome back');

    await performSignOut(page);

    await page.goto('/dashboard');

    // In redirect mode, ProtectedRoute redirects to /signin which triggers signIn() → IDP
    await page.waitForURL('**/authenticationendpoint/**', {timeout: 30_000});
  });
});
