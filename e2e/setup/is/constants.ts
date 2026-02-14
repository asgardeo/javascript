/**
 * WSO2 Identity Server configuration for e2e tests.
 */

export const IS_CONFIG = {
  baseUrl: process.env.IS_BASE_URL ?? 'https://localhost:9443',
  dcrEndpoint: '/api/identity/oauth2/dcr/v1.1/register',
  scim2UsersEndpoint: '/scim2/Users',
  adminUsername: 'admin',
  adminPassword: 'admin',
  healthCheckPath: '/carbon/admin/login.jsp',
} as const;
