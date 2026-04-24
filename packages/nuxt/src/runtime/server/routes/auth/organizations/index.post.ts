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

import type {CreateOrganizationPayload, Organization} from '@asgardeo/node';
import {defineEventHandler, readBody, createError} from 'h3';
import AsgardeoNuxtClient from '../../../AsgardeoNuxtClient';
import {verifyAndRehydrateSession} from '../../../utils/serverSession';
import {useRuntimeConfig} from '#imports';

/**
 * POST /api/auth/organizations
 *
 * Creates a new sub-organisation under the authenticated user's root organisation.
 *
 * Request body: {@link CreateOrganizationPayload}
 * Response: {@link Organization}
 *
 * Mirrors `createOrganization` server action in the Next.js SDK.
 */
export default defineEventHandler(async (event): Promise<Organization> => {
  const config = useRuntimeConfig();
  const sessionSecret = config.asgardeo?.sessionSecret;

  const session = await verifyAndRehydrateSession(event, sessionSecret);
  if (!session) {
    throw createError({statusCode: 401, statusMessage: 'Unauthorized: Invalid or expired session.'});
  }

  let payload: CreateOrganizationPayload;
  try {
    payload = await readBody<CreateOrganizationPayload>(event);
  } catch {
    throw createError({statusCode: 400, statusMessage: 'Invalid request body.'});
  }

  try {
    const client = AsgardeoNuxtClient.getInstance();
    return await client.createOrganization(payload, session.sessionId);
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create organisation: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
});
