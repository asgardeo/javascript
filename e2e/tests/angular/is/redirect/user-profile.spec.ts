import {test, expect} from '../../../../fixtures/base.fixture';
import {performAngularSignIn} from '../../../../helpers/angular/auth-helpers';
import {ANGULAR_SELECTORS} from '../../../../helpers/angular/selectors';

test.describe('User Profile', () => {
  test.beforeEach(async ({page}) => {
    await performAngularSignIn(page);
  });

  test('should display the profile page with user information', async ({page}) => {
    await page.goto('/profile');

    await expect(page.locator(ANGULAR_SELECTORS.profile.heading)).toContainText('Profile');

    await page.waitForLoadState('networkidle');
  });

  test('should navigate back to dashboard from profile', async ({page}) => {
    await page.goto('/profile');

    const backButton = page.getByText(ANGULAR_SELECTORS.profile.backToDashboard);

    await expect(backButton).toBeVisible();
    await backButton.click();

    await expect(page).toHaveURL(/\/dashboard/);
  });
});
