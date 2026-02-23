/**
 * Get the pre-configured Thunder application's client ID and internal application ID.
 *
 * Thunder's setup.sh bootstrap creates a "React SDK Sample" app with a known
 * client_id during the 3-stage Docker init (db-init -> setup -> server).
 * We use this pre-created app rather than trying to register a new one,
 * since the Thunder management APIs require JWT Bearer auth.
 *
 * The internal application ID (UUID) is needed for the embedded <SignIn /> component
 * which calls /flow/execute with {applicationId, flowType}. We retrieve it by
 * querying Thunder's SQLite database via docker exec.
 */

import {execSync} from 'child_process';
import {SAMPLE_APP} from '../constants';
import {THUNDER_CONFIG} from './constants';

const CONTAINER = 'asgardeo-e2e-thunder';
const DB_PATH = '/opt/thunder/repository/database/thunderdb.db';

function thunderSqlite(sql: string): string {
  return execSync(`docker exec ${CONTAINER} sqlite3 ${DB_PATH} "${sql}"`, {
    encoding: 'utf-8',
  }).trim();
}

export async function getThunderAppClientId(): Promise<{clientId: string; applicationId?: string}> {
  const clientId = THUNDER_CONFIG.preConfiguredClientId;

  console.log(`[E2E] Using pre-configured Thunder app: clientId=${clientId}`);

  // Retrieve the internal application ID from Thunder's SQLite database.
  // The /flow/execute API requires the internal UUID, not the client_id.
  let applicationId: string | undefined;

  try {
    const result = thunderSqlite("SELECT APP_ID FROM APPLICATION WHERE APP_NAME='React SDK Sample'");

    if (result) {
      applicationId = result;
      console.log(`[E2E] Thunder application ID: ${applicationId}`);
    }
  } catch {
    console.warn('[E2E] Could not retrieve Thunder application ID from database');
  }

  // Patch the pre-configured app to ensure:
  // 1. allowed_user_types includes "Person" (admin user is Person type)
  // 2. The callback URL is in redirect_uris
  // 3. The token issuer matches the OIDC discovery issuer
  try {
    const appJson = thunderSqlite(
      `SELECT APP_JSON FROM APPLICATION WHERE APP_NAME='React SDK Sample'`,
    );

    if (appJson) {
      const appConfig = JSON.parse(appJson);
      const userTypes: string[] = appConfig.allowed_user_types || [];

      if (!userTypes.includes('Person')) {
        userTypes.push('Person');
        appConfig.allowed_user_types = userTypes;
        const updatedAppJson = JSON.stringify(appConfig);

        execSync(
          `docker exec -i ${CONTAINER} sh -c 'cat > /tmp/app_config.json'`,
          {input: updatedAppJson, encoding: 'utf-8'},
        );
        thunderSqlite(
          `UPDATE APPLICATION SET APP_JSON=readfile('/tmp/app_config.json') WHERE APP_NAME='React SDK Sample'`,
        );
        console.log(`[E2E] Thunder app config updated (allowed_user_types includes Person)`);
      }
    }
  } catch (err) {
    console.warn('[E2E] Could not update Thunder app config:', err);
  }

  const callbackUrl = `${SAMPLE_APP.url}${SAMPLE_APP.afterSignInPath}`;
  const correctIssuer = THUNDER_CONFIG.baseUrl;

  try {
    const configJson = thunderSqlite(
      `SELECT OAUTH_CONFIG_JSON FROM APP_OAUTH_INBOUND_CONFIG WHERE CLIENT_ID='${clientId}'`,
    );

    if (configJson) {
      const config = JSON.parse(configJson);
      let needsUpdate = false;

      // Add callback URL if missing
      const redirectUris: string[] = config.redirect_uris || [];

      if (!redirectUris.includes(callbackUrl)) {
        redirectUris.push(callbackUrl);
        config.redirect_uris = redirectUris;
        needsUpdate = true;
      }

      // Fix token issuer to match OIDC discovery (required for ID token validation)
      if (config.token?.issuer !== correctIssuer) {
        config.token.issuer = correctIssuer;
        needsUpdate = true;
      }

      if (needsUpdate) {
        const updatedJson = JSON.stringify(config);

        // Write JSON to a temp file inside the container to avoid shell escaping issues,
        // then use readfile() in the SQLite UPDATE.
        execSync(
          `docker exec -i ${CONTAINER} sh -c 'cat > /tmp/oauth_config.json'`,
          {input: updatedJson, encoding: 'utf-8'},
        );
        thunderSqlite(
          `UPDATE APP_OAUTH_INBOUND_CONFIG SET OAUTH_CONFIG_JSON=readfile('/tmp/oauth_config.json') WHERE CLIENT_ID='${clientId}'`,
        );
        console.log(`[E2E] Thunder app OAuth config updated (redirect_uris, token issuer)`);
      }
    }
  } catch (err) {
    console.warn('[E2E] Could not update Thunder app OAuth config:', err);
  }

  return {clientId, applicationId};
}
