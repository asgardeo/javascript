/**
 * Shared e2e test configuration constants.
 *
 * IDP-specific configuration lives in setup/is/constants.ts and setup/thunder/constants.ts.
 */

export const SAMPLE_APP = {
  url: process.env.SAMPLE_APP_URL ?? 'https://localhost:5173',
  afterSignInPath: '/dashboard',
  afterSignOutPath: '/',
  signInPath: '/signin',
  signUpPath: '/signup',
} as const;

export const TEST_USER = {
  username: 'e2e-test-user',
  password: 'E2e@Test1234',
  email: 'e2e-test-user@test.local',
  firstName: 'E2E',
  lastName: 'TestUser',
} as const;

export type IdpTarget = 'is' | 'thunder';

export function getIdpTarget(): IdpTarget {
  const target = process.env.IDP_TARGET ?? 'is';

  if (target !== 'is' && target !== 'thunder') {
    throw new Error(`Invalid IDP_TARGET: "${target}". Must be "is" or "thunder".`);
  }

  return target;
}
