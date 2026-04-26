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

import {EmbeddedSignInFlowStatus, generateSessionId, isEmpty} from '@asgardeo/node';
import {defineEventHandler, readBody, getCookie, setCookie, deleteCookie, createError} from 'h3';
import AsgardeoNuxtClient from '../../../AsgardeoNuxtClient';
import {
  issueSessionCookie,
  createTempSessionToken,
  verifyTempSessionToken,
  getTempSessionCookieName,
  getTempSessionCookieOptions,
} from '../../../utils/session';
import {useServerSession} from '../../../utils/serverSession';
import {useRuntimeConfig} from '#imports';

/**
 * POST /api/auth/signin
 *
 * Handles embedded (app-native) sign-in flow steps.
 *
 * Request body:
 * - `payload` — the embedded flow step payload (`EmbeddedSignInFlowHandleRequestPayload`).
 *   When omitted or `{}`, the flow is initialised and the authorize URL is returned.
 * - `request` — optional per-step config (e.g. `{ url }` override).
 *
 * Response shape:
 * ```json
 * { "data": { ... }, "success": true }
 * ```
 */
export default defineEventHandler(async event => {
  const config = useRuntimeConfig();
  const sessionSecret = config.asgardeo?.sessionSecret;
  const afterSignInUrl: string = ((config.public.asgardeo as any)?.afterSignInUrl as string | undefined) || '/';

  const client = AsgardeoNuxtClient.getInstance();

  // ── Resolve sessionId ─────────────────────────────────────────────────────
  // Priority: live session cookie → temp session cookie → new random id.
  let sessionId: string;

  const liveSession = await useServerSession(event);
  if (liveSession?.sessionId) {
    sessionId = liveSession.sessionId;
  } else {
    const tempCookie = getCookie(event, getTempSessionCookieName());
    if (tempCookie) {
      try {
        const tempSession = await verifyTempSessionToken(tempCookie, sessionSecret);
        sessionId = tempSession.sessionId;
      } catch {
        // Expired / tampered — mint a fresh one below.
        sessionId = generateSessionId();
      }
    } else {
      sessionId = generateSessionId();
    }

    // Persist the sessionId in a temp cookie so the callback can look it up.
    const tempToken = await createTempSessionToken(sessionId, sessionSecret);
    setCookie(event, getTempSessionCookieName(), tempToken, getTempSessionCookieOptions());
  }

  // ── Parse request body ────────────────────────────────────────────────────
  const body: {payload?: Record<string, unknown>; request?: Record<string, unknown>} = await readBody(event);
  const payload = body?.payload ?? {};
  const request = body?.request ?? {};

  // ── Initiate flow (no payload or empty payload) ────────────────────────────
  if (isEmpty(payload) || !('flowId' in payload)) {
    try {
      const signInUrl = await client.getAuthorizeRequestUrl(
        {client_secret: '{{clientSecret}}', response_mode: 'direct'},
        sessionId,
      );
      return {data: {signInUrl}, success: true};
    } catch (err: any) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to build authorize URL: ${err?.message ?? String(err)}`,
      });
    }
  }

  // ── Execute embedded flow step ─────────────────────────────────────────────
  let response: any;
  try {
    response = await client.signIn(payload, request, sessionId);
  } catch (err: any) {
    throw createError({
      statusCode: 502,
      statusMessage: `Embedded sign-in step failed: ${err?.message ?? String(err)}`,
    });
  }

  // ── Flow complete — exchange code for tokens and issue session cookie ───────
  if (response?.flowStatus === EmbeddedSignInFlowStatus.SuccessCompleted) {
    const authData = response.authData ?? {};
    const code: string = authData['code'];
    const state: string = authData['state'];
    const sessionState: string = authData['session_state'];

    if (!code) {
      throw createError({statusCode: 502, statusMessage: 'Authorization code missing from completed flow response.'});
    }

    let tokenResponse: any;
    try {
      tokenResponse = await client.signIn(
        {code, state, session_state: sessionState},
        {},
        sessionId,
      );
    } catch (err: any) {
      throw createError({
        statusCode: 502,
        statusMessage: `Token exchange failed after embedded flow: ${err?.message ?? String(err)}`,
      });
    }

    try {
      await issueSessionCookie(event, sessionId, tokenResponse, sessionSecret);
      deleteCookie(event, getTempSessionCookieName(), getTempSessionCookieOptions());
    } catch (err: any) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to establish session: ${err?.message ?? String(err)}`,
      });
    }

    return {data: {afterSignInUrl}, success: true};
  }

  // ── Flow incomplete — return step data to the client ──────────────────────
  return {data: response, success: true};
});
