/**
 * Launch script: runs IDP setup (writes .env) then starts the Vite dev server.
 *
 * This ensures the .env is written BEFORE Vite reads it, avoiding the race
 * condition between Playwright's webServer and globalSetup.
 */

import {spawn} from 'child_process';
import {writeFileSync} from 'fs';
import path from 'path';
import {getIdpTarget, getSampleApp, getSampleAppTarget} from './constants';
import {IS_CONFIG} from './is/constants';
import {THUNDER_CONFIG} from './thunder/constants';
import {waitForIdp} from './wait-for-idp';
import {registerIsApp} from './is/app-registration';
import {getThunderAppClientId} from './thunder/app-registration';
import {provisionIsTestUser} from './is/user-provisioning';
import {provisionThunderTestUser} from './thunder/user-provisioning';

function writeSampleAppEnv(vars: Record<string, string>): void {
  const sampleApp = getSampleApp();
  const envPath = path.resolve(__dirname, `../../samples/${sampleApp.envDir}/.env`);
  const content = Object.entries(vars)
    .map(([key, value]) => `${key}='${value}'`)
    .join('\n');

  writeFileSync(envPath, content + '\n');
  console.log(`[E2E] Wrote .env to ${envPath}`);
}

async function setup(): Promise<void> {
  const idpTarget = getIdpTarget();
  const appTarget = getSampleAppTarget();
  const sampleApp = getSampleApp();
  const signInMode = process.env.SIGN_IN_MODE ?? 'redirect';

  console.log(`\n[E2E Setup] App: ${appTarget}, IDP: ${idpTarget}, sign-in mode: ${signInMode}\n`);

  if (idpTarget === 'is') {
    const {baseUrl, healthCheckPath} = IS_CONFIG;

    await waitForIdp(`${baseUrl}${healthCheckPath}`);

    const {clientId} = await registerIsApp();

    await provisionIsTestUser();

    const envVars: Record<string, string> = {
      VITE_ASGARDEO_BASE_URL: baseUrl,
      VITE_ASGARDEO_CLIENT_ID: clientId,
      VITE_ASGARDEO_AFTER_SIGN_IN_URL: `${sampleApp.url}${sampleApp.afterSignInPath}`,
      VITE_ASGARDEO_AFTER_SIGN_OUT_URL: `${sampleApp.url}${sampleApp.afterSignOutPath}`,
      VITE_ASGARDEO_SIGN_UP_URL: `${sampleApp.url}${sampleApp.signUpPath}`,
    };

    // Only set signInUrl for embedded mode — its presence tells the app to render <SignIn /> inline
    if (signInMode === 'embedded') {
      envVars.VITE_ASGARDEO_SIGN_IN_URL = `${sampleApp.url}${sampleApp.signInPath}`;
    }

    writeSampleAppEnv(envVars);
  } else {
    const {baseUrl, healthCheckPath} = THUNDER_CONFIG;

    await waitForIdp(`${baseUrl}${healthCheckPath}`);

    const {clientId, applicationId} = await getThunderAppClientId();

    await provisionThunderTestUser();

    const envVars: Record<string, string> = {
      VITE_ASGARDEO_BASE_URL: baseUrl,
      VITE_ASGARDEO_CLIENT_ID: clientId,
      VITE_ASGARDEO_PLATFORM: 'AsgardeoV2',
      VITE_ASGARDEO_AFTER_SIGN_IN_URL: `${sampleApp.url}${sampleApp.afterSignInPath}`,
      VITE_ASGARDEO_AFTER_SIGN_OUT_URL: `${sampleApp.url}${sampleApp.afterSignOutPath}`,
      VITE_ASGARDEO_SIGN_UP_URL: `${sampleApp.url}${sampleApp.signUpPath}`,
    };

    // Only set signInUrl for embedded mode — its presence tells the app to render <SignIn /> inline
    if (signInMode === 'embedded') {
      envVars.VITE_ASGARDEO_SIGN_IN_URL = `${sampleApp.url}${sampleApp.signInPath}`;
    }

    if (applicationId) {
      envVars.VITE_ASGARDEO_APPLICATION_ID = applicationId;
    }

    writeSampleAppEnv(envVars);
  }

  console.log('\n[E2E Setup] Complete. Starting Vite dev server...\n');
}

async function main(): Promise<void> {
  await setup();

  // Start Vite dev server — this replaces the current process
  const sampleApp = getSampleApp();
  const repoRoot = path.resolve(__dirname, '../..');
  const child = spawn('pnpm', ['--filter', sampleApp.pnpmFilter, 'dev'], {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: true,
  });

  child.on('error', (err) => {
    console.error('[E2E] Failed to start Vite dev server:', err);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  // Forward signals to child
  process.on('SIGTERM', () => child.kill('SIGTERM'));
  process.on('SIGINT', () => child.kill('SIGINT'));
}

main().catch((err) => {
  console.error('[E2E] Setup failed:', err);
  process.exit(1);
});
