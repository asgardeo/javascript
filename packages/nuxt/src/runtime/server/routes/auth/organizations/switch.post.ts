/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import type {IdToken, Organization, TokenResponse} from '@asgardeo/node';
import {defineEventHandler, setCookie, readBody, createError} from 'h3';
import AsgardeoNuxtClient from '../../../AsgardeoNuxtClient';
import {
  createSessionToken,
  getSessionCookieName,
  getSessionCookieOptions,
} from '../../../utils/session';
import {verifyAndRehydrateSession} from '../../../utils/serverSession';
import {useRuntimeConfig} from '#imports';

/**
 * POST /api/auth/organizations/switch
 *
 * Performs an `organization_switch` token exchange for the given organisation,
 * then re-issues the JWT session cookie so subsequent requests carry the new
 * organisation context.
 *
 * Request body: `{ organization: Organization }`
 *
 * Mirrors `switchOrganization` server action in the Next.js SDK.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const sessionSecret = config.asgardeo?.sessionSecret;

  const session = await verifyAndRehydrateSession(event, sessionSecret);
  if (!session) {
    throw createError({statusCode: 401, statusMessage: 'Unauthorized: Invalid or expired session.'});
  }
  const sessionId = session.sessionId;

  let organization: Organization;
  try {
    const body = await readBody<{organization: Organization}>(event);
    organization = body.organization;
  } catch {
    throw createError({statusCode: 400, statusMessage: 'Invalid request body.'});
  }

  if (!organization?.id) {
    throw createError({statusCode: 400, statusMessage: 'organization.id is required.'});
  }

  let tokenResponse: TokenResponse;
  try {
    const client = AsgardeoNuxtClient.getInstance();
    const response = await client.switchOrganization(organization, sessionId);
    tokenResponse = response as TokenResponse;
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: `Organisation switch failed: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // Re-issue the session cookie with the new token so subsequent SSR requests
  // pick up the switched organisation context — mirrors callback.get.ts.
  try {
    const client = AsgardeoNuxtClient.getInstance();
    const idToken: IdToken = await client.getDecodedIdToken(sessionId, tokenResponse.idToken);
    const userId = (idToken.sub || sessionId) as string;
    const accessToken = tokenResponse.accessToken;
    const scopes = tokenResponse.scope || '';
    const organizationId = (idToken['user_org'] || idToken['organization_id']) as string | undefined;
    const expiresInSeconds = parseInt(tokenResponse.expiresIn ?? '3600', 10);
    const accessTokenExpiresAt =
      Math.floor(Date.now() / 1000) + (Number.isFinite(expiresInSeconds) ? expiresInSeconds : 3600);

    const newSessionToken = await createSessionToken(
      {
        accessToken,
        userId,
        sessionId,
        scopes,
        organizationId,
        accessTokenExpiresAt,
        refreshToken: tokenResponse.refreshToken || undefined,
        idToken: tokenResponse.idToken || undefined,
      },
      sessionSecret,
    );

    setCookie(event, getSessionCookieName(), newSessionToken, getSessionCookieOptions());
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to establish new session after organisation switch: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  return {success: true};
});
