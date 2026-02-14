import {test, expect} from '../../../fixtures/base.fixture';
import {performEmbeddedSignIn} from '../../../helpers/auth-helpers';
import {SELECTORS} from '../../../helpers/selectors';

test.describe('Embedded Sign-In Flow', () => {
  test('should render the embedded <SignIn /> component with form fields', async ({page}) => {
    await page.goto('/signin');

    // Wait for the SDK's <SignIn /> component to initialize and render form fields
    await page.waitForSelector(SELECTORS.embeddedSignIn.container, {timeout: 30_000});

    await expect(page.locator(SELECTORS.embeddedSignIn.usernameInput)).toBeVisible();
    await expect(page.locator(SELECTORS.embeddedSignIn.passwordInput)).toBeVisible();
    await expect(page.locator(SELECTORS.embeddedSignIn.submitButton)).toBeVisible();
  });

  test('should successfully sign in with valid credentials via embedded component', async ({page}) => {
    await performEmbeddedSignIn(page);

    await expect(page).toHaveURL(/\/dashboard/);

    const heading = page.locator(SELECTORS.dashboard.welcomeHeading);

    await expect(heading).toContainText('Welcome back');
  });
});
