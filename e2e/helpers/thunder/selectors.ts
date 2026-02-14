/**
 * Selectors for Thunder's Gate login page.
 */

export const THUNDER_SELECTORS = {
  /** Selectors for Thunder's Gate login page (redirect-based flow) */
  gate: {
    usernameInput: '#username',
    passwordInput: '#password',
    submitButtonText: 'Sign In',
  },
} as const;
