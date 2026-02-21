/**
 * OAuth2/OIDC application registration on WSO2 Identity Server.
 */

import {SAMPLE_APP} from '../constants';
import {basicAuth, insecureAgent} from '../http-utils';
import {IS_CONFIG} from './constants';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Register an OAuth2/OIDC application on WSO2 Identity Server via the DCR v1.1 API,
 * then configure CORS allowed origins and PKCE via the Application Management API.
 *
 * DCR alone does not set allowed origins or enable app-native auth, so we need a multi-step process:
 * 1. POST /api/identity/oauth2/dcr/v1.1/register → creates the app, returns clientId
 * 2. GET  /api/server/v1/applications → find the app ID by name
 * 3. PUT  /api/server/v1/applications/{id}/inbound-protocols/oidc → set allowedOrigins + PKCE
 * 4. PATCH /api/server/v1/applications/{id} → enable app-native authentication API
 */
export async function registerIsApp(): Promise<{clientId: string; clientSecret: string}> {
  const {baseUrl, dcrEndpoint, adminUsername, adminPassword} = IS_CONFIG;
  const authHeader = basicAuth(adminUsername, adminPassword);

  // Step 1: Register via DCR
  const dcrUrl = `${baseUrl}${dcrEndpoint}`;

  console.log(`[E2E] Registering OAuth app on IS via DCR: ${dcrUrl}`);

  const dcrBody = {
    client_name: 'asgardeo-e2e-test-app',
    grant_types: ['authorization_code', 'refresh_token'],
    redirect_uris: [`${SAMPLE_APP.url}${SAMPLE_APP.afterSignInPath}`],
    token_type_extension: 'JWT',
    application_type: 'web',
    ext_public_client: true,
    ext_pkce_mandatory: true,
  };

  const dcrResponse = await fetch(dcrUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(dcrBody),
    // @ts-expect-error -- Node fetch supports dispatcher via undici
    dispatcher: insecureAgent,
  });

  let clientId: string;
  let clientSecret: string;

  if (dcrResponse.ok) {
    const dcrData = (await dcrResponse.json()) as {client_id: string; client_secret: string};

    clientId = dcrData.client_id;
    clientSecret = dcrData.client_secret;
    console.log(`[E2E] IS app registered: clientId=${clientId}`);
  } else {
    const text = await dcrResponse.text();

    // Handle "already exists" — look up the existing app
    if (dcrResponse.status === 400 && text.includes('already exist')) {
      console.log('[E2E] IS app already exists, looking up existing app...');
      const existing = await lookupExistingIsApp(baseUrl, authHeader);

      clientId = existing.clientId;
      clientSecret = existing.clientSecret;
    } else {
      throw new Error(`[E2E] IS DCR failed (${dcrResponse.status}): ${text}`);
    }
  }

  // Step 2: Find the application ID via Application Management API
  const appsUrl = `${baseUrl}/api/server/v1/applications?limit=30`;
  const appsResponse = await fetch(appsUrl, {
    method: 'GET',
    headers: {Authorization: authHeader},
    // @ts-expect-error -- Node fetch supports dispatcher via undici
    dispatcher: insecureAgent,
  });

  if (!appsResponse.ok) {
    console.warn(`[E2E] Could not list IS applications (${appsResponse.status}), skipping CORS config`);

    return {clientId, clientSecret};
  }

  const appsData = (await appsResponse.json()) as {
    applications: Array<{id: string; name: string}>;
  };
  const app = appsData.applications.find((a) => a.name === 'asgardeo-e2e-test-app');

  if (!app) {
    console.warn('[E2E] Could not find app by name, skipping CORS config');

    return {clientId, clientSecret};
  }

  console.log(`[E2E] IS app ID: ${app.id}, configuring CORS origins and PKCE...`);

  // Step 3: GET current OIDC config, then PUT with allowedOrigins + PKCE
  const oidcUrl = `${baseUrl}/api/server/v1/applications/${app.id}/inbound-protocols/oidc`;
  const oidcGetResponse = await fetch(oidcUrl, {
    method: 'GET',
    headers: {Authorization: authHeader},
    // @ts-expect-error -- Node fetch supports dispatcher via undici
    dispatcher: insecureAgent,
  });

  if (!oidcGetResponse.ok) {
    console.warn(`[E2E] Could not get OIDC config (${oidcGetResponse.status}), skipping CORS config`);

    return {clientId, clientSecret};
  }

  const oidcConfig = (await oidcGetResponse.json()) as Record<string, unknown>;

  // Update the config with allowed origins, PKCE, and callback URLs (including post-logout).
  // IS requires a single regex pattern for multiple callback URLs.
  const afterSignInUrl = `${SAMPLE_APP.url}${SAMPLE_APP.afterSignInPath}`;
  const afterSignOutUrl = `${SAMPLE_APP.url}${SAMPLE_APP.afterSignOutPath}`;
  const callbackRegex = `regexp=(${escapeRegex(afterSignInUrl)}|${escapeRegex(afterSignOutUrl)})`;

  const updatedConfig = {
    ...oidcConfig,
    allowedOrigins: [SAMPLE_APP.url],
    callbackURLs: [callbackRegex],
    publicClient: true,
    pkce: {
      mandatory: true,
      supportPlainTransformAlgorithm: false,
    },
  };

  // Remove read-only fields that can't be sent in PUT
  delete (updatedConfig as Record<string, unknown>).state;

  const oidcPutResponse = await fetch(oidcUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(updatedConfig),
    // @ts-expect-error -- Node fetch supports dispatcher via undici
    dispatcher: insecureAgent,
  });

  if (!oidcPutResponse.ok) {
    const text = await oidcPutResponse.text();

    console.warn(`[E2E] Could not update OIDC config (${oidcPutResponse.status}): ${text}`);
  } else {
    console.log(`[E2E] IS app CORS origins and PKCE configured successfully`);
  }

  // Step 4: Enable app-native authentication API (required for embedded <SignIn /> component)
  const appUrl = `${baseUrl}/api/server/v1/applications/${app.id}`;
  const patchResponse = await fetch(appUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({
      advancedConfigurations: {
        enableAPIBasedAuthentication: true,
      },
    }),
    // @ts-expect-error -- Node fetch supports dispatcher via undici
    dispatcher: insecureAgent,
  });

  if (!patchResponse.ok) {
    const text = await patchResponse.text();

    console.warn(`[E2E] Could not enable app-native auth (${patchResponse.status}): ${text}`);
  } else {
    console.log(`[E2E] IS app-native authentication enabled`);
  }

  return {clientId, clientSecret};
}

/**
 * Look up an existing OAuth app by name from the IS Application Management API.
 */
async function lookupExistingIsApp(
  baseUrl: string,
  authHeader: string,
): Promise<{clientId: string; clientSecret: string}> {
  const appsUrl = `${baseUrl}/api/server/v1/applications?limit=30`;
  const appsResponse = await fetch(appsUrl, {
    method: 'GET',
    headers: {Authorization: authHeader},
    // @ts-expect-error -- Node fetch supports dispatcher via undici
    dispatcher: insecureAgent,
  });

  if (!appsResponse.ok) {
    throw new Error(`[E2E] Failed to list IS applications (${appsResponse.status})`);
  }

  const appsData = (await appsResponse.json()) as {
    applications: Array<{id: string; name: string}>;
  };
  const app = appsData.applications.find((a) => a.name === 'asgardeo-e2e-test-app');

  if (!app) {
    throw new Error('[E2E] Could not find existing app "asgardeo-e2e-test-app"');
  }

  const oidcUrl = `${baseUrl}/api/server/v1/applications/${app.id}/inbound-protocols/oidc`;
  const oidcResponse = await fetch(oidcUrl, {
    method: 'GET',
    headers: {Authorization: authHeader},
    // @ts-expect-error -- Node fetch supports dispatcher via undici
    dispatcher: insecureAgent,
  });

  if (!oidcResponse.ok) {
    throw new Error(`[E2E] Failed to get OIDC config for existing app (${oidcResponse.status})`);
  }

  const oidcData = (await oidcResponse.json()) as {clientId: string; clientSecret: string};

  console.log(`[E2E] Found existing IS app: clientId=${oidcData.clientId}`);

  return {clientId: oidcData.clientId, clientSecret: oidcData.clientSecret};
}
