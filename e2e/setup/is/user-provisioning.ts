/**
 * Test user provisioning for WSO2 Identity Server via SCIM2.
 */

import {TEST_USER} from '../constants';
import {basicAuth, insecureAgent} from '../http-utils';
import {IS_CONFIG} from './constants';

/**
 * Create a test user on WSO2 Identity Server via the SCIM2 Users API.
 *
 * POST https://localhost:9443/scim2/Users
 */
export async function provisionIsTestUser(): Promise<void> {
  const {baseUrl, scim2UsersEndpoint, adminUsername, adminPassword} = IS_CONFIG;
  const url = `${baseUrl}${scim2UsersEndpoint}`;

  console.log(`[E2E] Provisioning test user on IS: ${url}`);

  const scimUser = {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
    userName: TEST_USER.username,
    password: TEST_USER.password,
    name: {
      givenName: TEST_USER.firstName,
      familyName: TEST_USER.lastName,
    },
    emails: [{value: TEST_USER.email, primary: true}],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/scim+json',
      Authorization: basicAuth(adminUsername, adminPassword),
    },
    body: JSON.stringify(scimUser),
    // @ts-expect-error -- Node fetch supports dispatcher via undici
    dispatcher: insecureAgent,
  });

  // 201 Created = success, 409 Conflict = user already exists (both acceptable)
  if (!response.ok && response.status !== 409) {
    const text = await response.text();

    throw new Error(`[E2E] IS SCIM2 user creation failed (${response.status}): ${text}`);
  }

  console.log(`[E2E] IS test user provisioned: ${TEST_USER.username}`);
}
