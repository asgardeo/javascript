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

'use server';

import {Organization, AsgardeoAPIError, IdToken, TokenResponse} from '@asgardeo/node';
import {AsgardeoNextConfig} from '../../models/config';
import {DEFAULT_ACCESS_TOKEN_EXPIRY_SECONDS} from '../../utils/constants';
import {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import {cookies} from 'next/headers';
import getSessionId from './getSessionId';
import AsgardeoNextClient from '../../AsgardeoNextClient';
import logger from '../../utils/logger';
import SessionManager from '../../utils/SessionManager';

/**
 * Server action to switch organization.
 */
const switchOrganization = async (
  organization: Organization,
  sessionId: string | undefined,
): Promise<TokenResponse | Response> => {
  try {
    const cookieStore: ReadonlyRequestCookies = await cookies();
    const client: AsgardeoNextClient = AsgardeoNextClient.getInstance();
    const resolvedSessionId: string = sessionId ?? ((await getSessionId()) as string);
    const response: TokenResponse | Response = await client.switchOrganization(organization, resolvedSessionId);

    const {revalidatePath} = await import('next/cache');
    revalidatePath('/');

    if (response && (response as TokenResponse).accessToken) {
      const tokenResponse: TokenResponse = response as TokenResponse;
      const idToken: IdToken = await client.getDecodedIdToken(resolvedSessionId, tokenResponse.idToken);
      const userIdFromToken: string = idToken['sub'] as string;
      const organizationId: string | undefined = (idToken['user_org'] || idToken['organization_id']) as
        | string
        | undefined;
      const config: AsgardeoNextConfig = client.getConfiguration() as AsgardeoNextConfig;
      const sessionExpirySeconds: number = SessionManager.resolveSessionExpiry(config.sessionExpirySeconds);
      const expiresIn: number = tokenResponse.expiresIn ? parseInt(tokenResponse.expiresIn, 10) : DEFAULT_ACCESS_TOKEN_EXPIRY_SECONDS;

      const sessionToken: string = await SessionManager.createSessionToken(
        tokenResponse.accessToken,
        userIdFromToken,
        resolvedSessionId,
        tokenResponse.scope,
        expiresIn,
        tokenResponse.refreshToken ?? '',
        organizationId,
      );

      logger.debug('[switchOrganization] Session token created successfully.');

      cookieStore.set(SessionManager.getSessionCookieName(), sessionToken, SessionManager.getSessionCookieOptions(sessionExpirySeconds));
    }

    return response;
  } catch (error) {
    throw new AsgardeoAPIError(
      `Failed to switch the organizations: ${error instanceof Error ? error.message : String(JSON.stringify(error))}`,
      'switchOrganization-ServerActionError-001',
      'nextjs',
      error instanceof AsgardeoAPIError ? error.statusCode : undefined,
    );
  }
};

export default switchOrganization;
