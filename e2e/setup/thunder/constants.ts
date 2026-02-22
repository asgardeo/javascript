/**
 * Asgardeo Thunder configuration for e2e tests.
 */

export const THUNDER_CONFIG = {
  baseUrl: process.env.THUNDER_BASE_URL ?? 'https://localhost:9090',
  healthCheckPath: '/health/readiness',
  adminUsername: 'admin',
  adminPassword: 'admin',
  // The React SDK Sample app is created by Thunder's bootstrap script
  // (02-sample-resources.sh) with this deterministic client_id.
  preConfiguredClientId: 'REACT_SDK_SAMPLE',
} as const;
