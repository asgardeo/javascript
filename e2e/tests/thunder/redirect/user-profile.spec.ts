import {test, expect} from '../../../fixtures/base.fixture';
import {performSignIn} from '../../../helpers/auth-helpers';
import {SELECTORS} from '../../../helpers/selectors';

test.describe('User Profile', () => {
  test.beforeEach(async ({page}) => {
    await performSignIn(page);
  });

  test('should display the profile page with user information', async ({page}) => {
    await page.goto('/profile');

    await expect(page.locator(SELECTORS.profile.heading)).toContainText('Profile');

    await page.waitForLoadState('networkidle');
  });

  test('should navigate back to dashboard from profile', async ({page}) => {
    await page.goto('/profile');

    const backButton = page.getByText(SELECTORS.profile.backToDashboard);

    await expect(backButton).toBeVisible();
    await backButton.click();

    await expect(page).toHaveURL(/\/dashboard/);
  });
});
