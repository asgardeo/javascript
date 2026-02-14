/**
 * Shared selectors for SDK components used in e2e tests.
 *
 * IDP-specific selectors live in helpers/is/selectors.ts and helpers/thunder/selectors.ts.
 */

export const SELECTORS = {
  /** Selectors for the SDK's embedded <SignIn /> component */
  embeddedSignIn: {
    container: '[data-testid="asgardeo-signin"]',
    usernameInput: '[data-testid="asgardeo-signin-username"]',
    passwordInput: '[data-testid="asgardeo-signin-password"]',
    submitButton: '[data-testid="asgardeo-signin-submit"]',
  },
  dashboard: {
    welcomeHeading: 'h1',
  },
  profile: {
    heading: 'h1',
    backToDashboard: 'Back to dashboard',
  },
  header: {
    userDropdownTrigger: '[data-testid="asgardeo-user-dropdown-trigger"]',
    signInText: 'Sign in',
    signOutText: 'Sign out',
  },
} as const;
