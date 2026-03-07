/**
 * Selectors for the Angular sample app (teamspace-angular).
 *
 * Angular uses the same CSS class names as the React SDK where possible,
 * but some text casing and element structure differs.
 */

export const ANGULAR_SELECTORS = {
  landing: {
    signInButtonText: 'Sign In',
  },
  header: {
    userDropdownTrigger: '.asgardeo-user-dropdown__trigger',
    signOutButtonText: 'Sign Out',
  },
  dashboard: {
    welcomeHeading: 'h1',
  },
  profile: {
    heading: 'h1',
    backToDashboard: 'Back to dashboard',
  },
} as const;
