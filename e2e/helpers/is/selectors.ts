/**
 * Selectors for WSO2 IS login and logout pages.
 */

export const IS_SELECTORS = {
  /** Selectors for WSO2 IS authentication endpoint (redirect-based flow) */
  login: {
    usernameInput: '#usernameUserInput',
    passwordInput: '#password',
    signInButton: '[data-testid="login-page-continue-login-button"]',
  },
  /** Selectors for WSO2 IS logout consent page */
  logout: {
    consentYesButton: 'Yes',
  },
} as const;
