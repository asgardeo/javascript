/**
 * Shared e2e test configuration constants.
 *
 * IDP-specific configuration lives in setup/is/constants.ts and setup/thunder/constants.ts.
 */

/**
 * Framework-specific sample app configurations.
 *
 * Each entry describes the sample app for a given SDK framework:
 * routing paths, pnpm workspace filter, and env file location.
 */
export const SAMPLE_APPS = {
  react: {
    url: process.env.SAMPLE_APP_URL ?? 'https://localhost:5173',
    afterSignInPath: '/dashboard',
    afterSignOutPath: '/',
    signInPath: '/signin',
    signUpPath: '/signup',
    pnpmFilter: '@asgardeo/teamspace-react',
    envDir: 'teamspace-react',
  },
  angular: {
    url: process.env.SAMPLE_APP_URL ?? 'https://localhost:5173',
    afterSignInPath: '/dashboard',
    afterSignOutPath: '/',
    signInPath: '/',
    signUpPath: '/signup',
    pnpmFilter: '@asgardeo/teamspace-angular',
    envDir: 'teamspace-angular',
  },
} as const;

export type SampleAppTarget = keyof typeof SAMPLE_APPS;

/** Backwards-compatible alias — resolves to the active framework's config. */
export const SAMPLE_APP = SAMPLE_APPS.react;

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

export function getSampleAppTarget(): SampleAppTarget {
  const target = process.env.SAMPLE_APP_TARGET ?? 'react';

  if (!(target in SAMPLE_APPS)) {
    throw new Error(
      `Invalid SAMPLE_APP_TARGET: "${target}". Must be one of: ${Object.keys(SAMPLE_APPS).join(', ')}`,
    );
  }

  return target as SampleAppTarget;
}

export function getSampleApp() {
  return SAMPLE_APPS[getSampleAppTarget()];
}
