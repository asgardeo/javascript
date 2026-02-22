import {test, expect} from '../../../../fixtures/base.fixture';
import {performAngularSignIn, performAngularSignOut} from '../../../../helpers/angular/auth-helpers';
import {ANGULAR_SELECTORS} from '../../../../helpers/angular/selectors';

test.describe('Sign-Out Flow', () => {
  test.beforeEach(async ({page}) => {
    await performAngularSignIn(page);
  });

  test('should sign out and redirect to the landing page', async ({page}) => {
    await expect(page.locator(ANGULAR_SELECTORS.dashboard.welcomeHeading)).toContainText('Welcome back');

    await performAngularSignOut(page);

    await expect(
      page.getByRole('banner').getByRole('button', {name: ANGULAR_SELECTORS.landing.signInButtonText}),
    ).toBeVisible({timeout: 10_000});
  });

  test('should not be able to access protected routes after sign out', async ({page}) => {
    await expect(page.locator(ANGULAR_SELECTORS.dashboard.welcomeHeading)).toContainText('Welcome back');

    await performAngularSignOut(page);

    await page.goto('/dashboard');

    // Angular's authGuard redirects unauthenticated users to / (landing page)
    await page.waitForURL(/localhost:\d+\/(\?.*)?$/, {timeout: 30_000});
  });
});
