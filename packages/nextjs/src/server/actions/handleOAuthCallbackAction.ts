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

import {IdToken} from '@asgardeo/node';
import {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import {cookies} from 'next/headers';
import AsgardeoNextClient from '../../AsgardeoNextClient';
import {AsgardeoNextConfig} from '../../models/config';
import logger from '../../utils/logger';
import SessionManager from '../../utils/SessionManager';

/**
 * Server action to handle OAuth callback with authorization code.
 * This action processes the authorization code received from the OAuth provider
 * and exchanges it for tokens to complete the authentication flow.
 *
 * @param code - Authorization code from OAuth provider
 * @param state - State parameter from OAuth provider for CSRF protection
 * @param sessionState - Session state parameter from OAuth provider
 * @returns Promise that resolves with success status and optional error message
 */
const handleOAuthCallbackAction = async (
  code: string,
  state: string,
  sessionState?: string,
): Promise<{
  error?: string;
  redirectUrl?: string;
  success: boolean;
}> => {
  try {
    if (!code || !state) {
      return {
        error: 'Missing required OAuth parameters: code and state are required',
        success: false,
      };
    }

    const asgardeoClient: AsgardeoNextClient = AsgardeoNextClient.getInstance();

    if (!asgardeoClient.isInitialized) {
      return {
        error: 'Asgardeo client is not initialized',
        success: false,
      };
    }

    const cookieStore: ReadonlyRequestCookies = await cookies();
    let sessionId: string | undefined;

    const tempSessionToken: string | undefined = cookieStore.get(SessionManager.getTempSessionCookieName())?.value;

    if (tempSessionToken) {
      try {
        const tempSession: {sessionId: string} = await SessionManager.verifyTempSession(tempSessionToken);
        sessionId = tempSession.sessionId;
      } catch {
        logger.error(
          '[handleOAuthCallbackAction] Invalid temporary session token, falling back to session ID from cookies.',
        );
      }
    }

    if (!sessionId) {
      logger.error('[handleOAuthCallbackAction] No session ID found in cookies or temporary session token.');

      return {
        error: 'No session found. Please start the authentication flow again.',
        success: false,
      };
    }

    // Exchange the authorization code for tokens
    const signInResult: Record<string, unknown> = await asgardeoClient.signIn(
      {
        code,
        session_state: sessionState,
        state,
      } as any,
      {},
      sessionId,
    );

    if (signInResult) {
      try {
        const idToken: IdToken = await asgardeoClient.getDecodedIdToken(
          sessionId,
          (signInResult['id_token'] || signInResult['idToken']) as string,
        );
        const accessToken: string = (signInResult['accessToken'] || signInResult['access_token']) as string;
        const userIdFromToken: string = (idToken.sub || signInResult['sub'] || sessionId) as string;
        const scopes: string = signInResult['scope'] as string;
        const organizationId: string | undefined = (idToken['user_org'] || idToken['organization_id']) as
          | string
          | undefined;

        const sessionToken: string = await SessionManager.createSessionToken(
          accessToken,
          userIdFromToken,
          sessionId,
          scopes,
          organizationId,
        );

        cookieStore.set(SessionManager.getSessionCookieName(), sessionToken, SessionManager.getSessionCookieOptions());

        cookieStore.delete(SessionManager.getTempSessionCookieName());
      } catch (error) {
        logger.error(
          `[handleOAuthCallbackAction] Failed to create JWT session, continuing with legacy session:
          ${typeof error === 'string' ? error : JSON.stringify(error)}`,
        );
      }
    }

    const config: AsgardeoNextConfig = await asgardeoClient.getConfiguration();
    const afterSignInUrl: string = config.afterSignInUrl || '/';

    return {
      redirectUrl: afterSignInUrl,
      success: true,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Authentication failed',
      success: false,
    };
  }
};

export default handleOAuthCallbackAction;
